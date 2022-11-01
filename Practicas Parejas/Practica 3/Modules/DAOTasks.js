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
                const sql = "SELECT * FROM aw_tareas_usuarios WHERE email = ? AND password = ?";
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
                const sql = "SELECT * FROM aw_tareas_usuarios WHERE email = ? AND password = ?";
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

}
    
module.exports = DAOTasks;