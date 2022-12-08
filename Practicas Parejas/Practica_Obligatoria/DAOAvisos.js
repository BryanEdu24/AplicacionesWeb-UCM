class DAOAvisos {
    constructor(pool) {
        this.pool = pool;
    }

    insertTask(task,idUser ,callback){
        this.pool.getConnection(function(err, connection) {
            if (err)    callback(new Error("Error de conexión a la base de datos"));
            else {
                console.log(task);
                let sql= "INSERT INTO avisos(tipo, subtipo, categoria, observaciones, comentario, activo, asignado, eliminadoPor) VALUES (?,?,?,?,null,1,0,null)";
                connection.query(sql,[task.tipo, task.subtipo, task.categoria, task.observacion.toString()],
                function(err, taskInserted) {
                    connection.release();
                    if (err)    callback(new Error("Error a la hora de insertar el aviso"));
                    else    {
                        let sql = "INSERT INTO persona_aviso (idPersona, idAviso, cerrado) VALUES (?,?,0)";
                         connection.query(sql, [idUser,taskInserted.insertId],
                         function (err, result) {
                             if (err) {
                                 callback(new Error("Error a la hora de hacer la insercción en la tabla persona_aviso"));
                             } else {
                                 callback(null,taskInserted.insertId);
                             }
                         });
                    }
                });
            }
        });
    }

    misAvisos(idUser ,callback){
        this.pool.getConnection(function(err, connection) {
            if (err)    callback(new Error("Error de conexión a la base de datos"));
            else {
                console.log(idUser);
                let sql= 
                "SELECT DISTINCT U.nombre, A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado  FROM avisos A JOIN persona_aviso P ON P.idAviso = A.idAviso JOIN personas U ON U.id = P.idPersona WHERE p.idPersona = ? AND P.cerrado = 0" ;
                connection.query(sql,[idUser],
                function(err, tasks) {
                    connection.release();
                    if (err)    callback(new Error("Error a la hora de mostrar los avisos"));
                    else    {
                        callback(null, tasks);
                    }
                });
            }
        });
    }
}

module.exports = DAOAvisos;