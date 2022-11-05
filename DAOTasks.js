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
        let tasksDone;
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
                + "WHERE U.email = ? AND T.hecho = 1";
                connection.query( sql,
                    [email], 
                    function(err, tasks) {
                        //connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else{
                           
                           
                        }   
                    });
            }
        });
    }

}
    
module.exports = DAOTasks;