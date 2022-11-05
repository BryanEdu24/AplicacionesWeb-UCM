"use strict"

class DAOTasks {
    constructor(pool) { 
        this.pool = pool;
    }

    getAllTasks(email, callback) { 
        this.pool.getConnection(function (err,connection){
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                const sql = "SELECT DISTINCT W.idTarea, W.texto, T.hecho, E.texto "
                + "FROM aw_tareas_usuarios U JOIN aw_tareas_user_tarea T ON U.idUser = T.idUser " 
                + "JOIN aw_tareas_tareas W ON T.idTarea = W.idTarea "
                + "JOIN aw_tareas_tareas_etiquetas L ON W.idTarea = L.idTarea "
                + "JOIN aw_tareas_etiquetas E ON L.idEtiqueta = E.idEtiqueta "
                + "WHERE U.email = ?";
                connection.query( sql,
                    [email], 
                    function(err, tasks) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else{
                           callback(null,tasks);
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
            else { //Debemos hacer dos connection.query?
                const sql = "SELECT * FROM aw_tareas_usuarios WHERE email = ? AND password = ?";
                connection.query( sql,
                    [email], 
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
                const sql = "SELECT DISTINCT W.idTarea "
                + "FROM aw_tareas_usuarios U JOIN aw_tareas_user_tarea T ON U.idUser = T.idUser " 
                + "JOIN aw_tareas_tareas W ON T.idTarea = W.idTarea "
                + "JOIN aw_tareas_tareas_etiquetas L ON W.idTarea = L.idTarea "
                + "JOIN aw_tareas_etiquetas E ON L.idEtiqueta = E.idEtiqueta "
                + "WHERE U.email = ? AND T.hecho = 1;";
                connection.query( sql,
                    [email], 
                    function(err, tasks) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else{
                            tasks.forEach(task => {
                                const sqlusers = 'SELECT W.idUser' +
                                ' FROM aw_tareas_user_tarea W'+
                                ' WHERE W.idTarea = ? AND W.hecho = 1';
                                connection.query(sqlusers,
                                    [task.idTarea],
                                    function(err2,users) {
                                        //connection.release();
                                        if (err2){
                                            callback(new Error("Error de acceso a la base de datos"));
                                            // console.log("Error al realizar la consulta para contar los usuarios");
                                        }else if(users.length === 1){ //Como solo tiene un usario --> Hacemos borrado en cascada
                                            console.log(users);
                                            console.log("Un solo usuario vinculado a la tarea " + task.idTarea);
                                        }else{ //Como son varios usuarios --> Solo borramos el idTarea de ese usuario
                                            console.log(users);
                                            console.log("Varios usuarios vinculados a la tarea " + task.idTarea);
                                        }
                                    });
                                console.log(task.idTarea);  
                                callback(null);
                            });
                        }
                    });
            }
        });
    }

}
    
module.exports = DAOTasks;