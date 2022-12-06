"use strict"

class DAOTasks {
    constructor(pool) {
        this.pool = pool;
    }

    getAllTasks(email, callback) {
        this.pool.getConnection(function (err,connection){
            if (err) {
                callback(new Error("Error de conexión a la base de datos 1"));
            }
            else {
                const sql = "SELECT DISTINCT W.idTarea, W.textoTarea, T.hecho "
                + "FROM aw_tareas_usuarios U JOIN aw_tareas_user_tarea T ON U.idUser = T.idUser "
                + "JOIN aw_tareas_tareas W ON T.idTarea = W.idTarea "
                + "WHERE U.email = ?";
                connection.query( sql,
                    [email],
                    function(err, tasks) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos 2"));
                        }
                        else{
                            let i = 0;
                            tasks.forEach(function(task){
                                const sql = "SELECT DISTINCT E.texto"
                                + " FROM aw_tareas_etiquetas E JOIN aw_tareas_tareas_etiquetas L ON E.idEtiqueta = L.idEtiqueta "
                                + " WHERE L.idTarea = ?";
                                connection.query(sql,
                                    [task.idTarea],
                                    function(err, tags){
                                        if (err) {
                                            callback(new Error("Error de acceso a la base de datos a la hora de conseguir etiquetas"));
                                        }else{
                                            if(i === tasks.length-1) callback(null, tasks, tags);
                                            else i++;
                                        }
                                    });
                            });
                        }
                    });
            }
        });
    }

    insertTask(email, task, callback) {
        this.pool.getConnection(function (err,connection){
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                const sql = "SELECT U.idUser FROM aw_tareas_usuarios U " +
                "WHERE U.email = ? UNION " +
                "SELECT W.idTarea FROM aw_tareas_tareas W  " +
                "WHERE W.texto = ? ";
                connection.query( sql,
                    [email, task.texto],
                    function(err, taskNew) {
                       connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else if (taskNew.length === 2) {
                            callback(new Error("Ya existe la tarea"));
                        }else{
                            const sqlInsertTask = "INSERT INTO aw_tareas_tareas(texto)"+
                            " VALUES(?)";
                            connection.query( sqlInsertTask,
                                [task.texto],
                                function(err,TaskIn){
                                    if (err) {
                                        callback(new Error("Error de acceso a la base de datos a la hora de insertar en aw_tareas_tareas"));
                                    }else{ //Insertamos en la tabla user_tareas
                                        const sqlInsertUserTask = "INSERT INTO aw_tareas_user_tarea (idUser, idTarea, hecho)"+
                                        "VALUES (?, ?, ?)";
                                        connection.query(sqlInsertUserTask,
                                            [taskNew[0].idUser, TaskIn.insertId, task.hecho],
                                            function(err, TaskUser){
                                                if (err) {
                                                    callback(new Error("Error de acceso a la base de datos a la hora de insertar en aw_tareas_user_tarea"));
                                                } else {
                                                    console.log("Inserción de: ("+ taskNew[0].idUser +
                                                    ", "+ TaskIn.insertId + " ,"+
                                                    task.hecho +") completada.");
                                                    //Ahora se debe hacer la inserción de las etiquetas en la tabla etiquetas y luego en la relación tarea_etiquetas
                                                    let labels = task.etiquetas;
                                                    labels.forEach(label => {
                                                        //Comprobamos si existe la etiqueta
                                                        const sqlLabel= "SELECT idEtiqueta "+
                                                        "FROM aw_tareas_etiquetas "+
                                                        "WHERE texto = ?";
                                                        connection.query(sqlLabel,
                                                            [label.texto],
                                                            function(err, Etiqueta){
                                                                if (err) {
                                                                    callback(new Error("Error de acceso a la base de datos a la hora de comprobar si existe la etiqueta"));
                                                                } else if (Etiqueta.length !== 0) {

                                                                    callback(new Error("Ya existe la etiqueta: "+ label.texto +
                                                                    " en la tabla etiquetas con id: "+ Etiqueta[0].idEtiqueta));
                                                                    console.log("...Se procede a asociar la etiqueta existente...");
                                                                    const sqlInserIdTag = "INSERT INTO aw_tareas_tareas_etiquetas (idTarea, idEtiqueta)" +
                                                                    "VALUES (?, ?)";
                                                                    connection.query(sqlInserIdTag,
                                                                        [TaskIn.insertId, Etiqueta[0].idEtiqueta],
                                                                        function(err, it) {
                                                                            if (err) {
                                                                                callback(new Error("Error en bbdd a la hora de la inserción doble"));
                                                                            }
                                                                            else {
                                                                                console.log("Insercción de ("+TaskIn.insertId+ ", "+  Etiqueta[0].idEtiqueta +
                                                                                ") en la tabla tareas-etiquetas, realizado correctamente." );

                                                                            }
                                                                        });

                                                                } else {

                                                                    const sqlInsertLabel = "INSERT INTO aw_tareas_etiquetas (texto) "+
                                                                    "VALUES (?)";
                                                                    connection.query(sqlInsertLabel,
                                                                        [label.texto],
                                                                        function(err, tag) {
                                                                            if (err) {
                                                                                callback(new Error("Error en bbdd cuando queremos meter una etiqueta"));
                                                                            }else{
                                                                                console.log("Etiqueta: " + label.texto + " con id: "+tag.insertId +" insertada correctamente." );
                                                                                const sqlInserIdTag = "INSERT INTO aw_tareas_tareas_etiquetas (idTarea, idEtiqueta)" +
                                                                                "VALUES (?, ?)";
                                                                                connection.query(sqlInserIdTag,
                                                                                    [TaskIn.insertId, tag.insertId],
                                                                                    function(err, it) {
                                                                                        if (err) {
                                                                                            callback(new Error("Error en bbdd a la hora de la inserción doble"));
                                                                                        }
                                                                                        else {
                                                                                            console.log("Insercción de ("+TaskIn.insertId+ ", "+ tag.insertId +
                                                                                            ") en la tabla tareas-etiquetas, realizado correctamente." );
                                                                                        }
                                                                                    });
                                                                            }
                                                                        });
                                                                }
                                                            });
                                                    });
                                                    callback(null);
                                                }
                                            });
                                    }
                                });
                        }
                    });
            }
        });
    }

    markTaskDone(idTask, callback) {
        this.pool.getConnection(function (err,connection){
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                const sql = "UPDATE aw_tareas_user_tarea U SET hecho = 1 WHERE U.idTarea = ?";
                connection.query( sql,
                    [idTask],
                    function(err, tasks) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else{
                            callback(null);
                        }
                    });
            }
        });
    }

    deleteCompleted(email, callback) {
        this.pool.getConnection(function (err,connection){
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                const sql = "SELECT DISTINCT T.idTarea, U.idUser" +
                " FROM aw_tareas_usuarios U" +
                " JOIN aw_tareas_user_tarea T ON U.idUser = T.idUser" +
                " WHERE U.email = 'felipe.lotas@ucm.es' AND T.hecho = 1"
                connection.query( sql,
                    [email],
                    function(err, tasks) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos 1"));
                        }
                        else if (tasks.length === 0) {
                            callback(new Error("No hay tareas finalizadas para dicho usuario"));
                        }else{
                            tasks.forEach(task => {
                                const sqlusers = 'SELECT W.idUser' +
                                ' FROM aw_tareas_user_tarea W'+
                                ' WHERE W.idTarea = ?';
                                connection.query(sqlusers,
                                    [task.idTarea],
                                    function(err2,users) {
                                        //connection.release();
                                        if (err2){
                                            callback(new Error("Error de acceso a la base de datos 2"));
                                        }else if(users.length === 1){ //Como solo tiene un usario --> Hacemos borrado en cascada
                                            console.log("Un solo usuario vinculado a la tarea " + task.idTarea);
                                            console.log(users);
                                            const sqldeleteCascade = 'DELETE FROM aw_tareas_tareas '+
                                            'WHERE idTarea = ?';
                                            connection.query(sqldeleteCascade,
                                                [task.idTarea],
                                                function(err3, del1){
                                                    if (err3) {
                                                        callback(new Error("Error de acceso a la base de datos 3c"));
                                                    }
                                                    else{
                                                        console.log("Borrado en cascada de la tarea " + task.idTarea + " del usuario: "+ task.idUser);
                                                        callback(null);
                                                    }
                                                });
                                            callback(null);
                                        }else{ //Como son varios usuarios --> Solo borramos el idTarea de ese usuario
                                            console.log("Varios usuarios vinculados a la tarea " + task.idTarea + " que esta vinculada al usuario: "+ task.idUser);
                                            console.log(users);
                                            const sqldeleteOneUser = 'DELETE FROM aw_tareas_user_tarea '+
                                            'WHERE idTarea = ? AND idUser = ? AND hecho = 1; ';
                                            connection.query(sqldeleteOneUser,
                                                [task.idTarea, task.idUser],
                                                function(err3,del2){
                                                    if (err3) {
                                                        callback(new Error("Error de acceso a la base de datos 3u"));
                                                    }
                                                    else{
                                                        console.log("Tarea " + task.idTarea + " eliminada correctamente del usuario: "+ task.idUser);
                                                        callback(null);
                                                    }
                                                });
                                        }
                                    });
                                console.log(task.idTarea);
                            });
                        }
                    });
            }
        });
    }
}

module.exports = DAOTasks;