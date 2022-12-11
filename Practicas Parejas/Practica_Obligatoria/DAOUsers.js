"use strict"

class DAOUsers {
    constructor(pool) {
        this.pool = pool;
    }

    isUserCorrect(email,password,callback){
        this.pool.getConnection(function (err,connection){
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query(" SELECT * FROM personas WHERE email = ? AND password = ? AND activo = 1" ,
                    [email,password], 
                    function(err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else{
                            if (rows.length === 0) {
                                callback(null, false, null); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, true, rows[0]);
                            } 
                        }
                    });
            }
        });
    }

    getUserImageName(idUser,callback){
        let nameFile;
        this.pool.getConnection(function(err,connection){
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT U.foto FROM personas AS U WHERE id = ? AND activo = 1" ,
                    [idUser],
                    function(err, img){
                        connection.release(); //devolver la conexión a pool
                        if(err){
                            callback(new Error("Error de acceso a la base de datos"));
                        }else{
                            if (img.length === 0) {
                                callback(new Error("No existe el usuario")); //no está el usuario con el password proporcionado
                            }
                            else {
                                nameFile = img;
                                callback(null, nameFile);
                            } 
                        }
                    }

                )
            }
        });
    }

    insertTec(usuario, callback) {
        this.pool.getConnection(function(err, connection) {
             if (err)    callback(new Error("Error de conexión a la base de datos"));
             else {
                 let sql =
                 "INSERT INTO personas(nombre, email, password, rol, numEmpleado, Foto, fecha, activo) VALUES (?, ?, ?, ?, ?, ?, ?,1)";
                 connection.query(sql, [usuario.nombre, usuario.correo,
                 usuario.contrasenia, usuario.opcion, usuario.numEmpleado, usuario.imagen, usuario.fecha],
                 function(err, resultUser) {
                     connection.release();
                     if (err)    callback(new Error("Error a la hora de hacer la insercción"));
                     else  {
                         let sql = "UPDATE numempleado_tecnico SET idTecnico= ? , asignado=1 WHERE numEmpleado=?";
                         connection.query(sql, [resultUser.insertId,usuario.numEmpleado ],
                         function (err, result) {
                             if (err) {
                                 callback(new Error("Error a la hora de hacer la insercción en la tabla numempleado_tecnico"));
                             } else {
                                 callback(null, resultUser.insertId);
                             }
                         });
                     }  
                 });
             }
         });
     }
    
    insertUser(usuario, callback) {
       this.pool.getConnection(function(err, connection) {
            if (err)    callback(new Error("Error de conexión a la base de datos"));
            else {
                let sql =
                "INSERT INTO personas(nombre, email, password, rol, numEmpleado, Foto, fecha, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)";
                connection.query(sql, [usuario.nombre, usuario.correo,
                usuario.contrasenia, usuario.opcion, usuario.numEmpleado, usuario.imagen, usuario.fecha],
                function(err, resultUser) {
                    connection.release();
                    if (err)    callback(new Error("Error a la hora de hacer la insercción"));
                    else  {
                        callback(null, resultUser.insertId);
                    }  
                });
            }
        });
    }

    checkEmployee(numEmployee, callback){
        this.pool.getConnection(function(err, connection) {
            if (err)    callback(new Error("Error de conexión a la base de datos"));
            else {
                let sql =
                "SELECT idTecnico FROM numempleado_tecnico WHERE numEmpleado = ? AND asignado = 1";
                connection.query(sql, [numEmployee],
                function(err, idTecnico) {
                    connection.release();
                    if (err)    callback(new Error("Error a la hora de comprobar el número de empleado"));
                    else    {
                        callback(null, idTecnico[0]);
                    }
                });
            }
        });
    }

    getAllUsers(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));                
            }
            else {
                let sql ="SELECT * FROM personas P WHERE P.activo = 1" ;
                connection.query(sql,
                function (err, user) {
                    connection.release();
                    if (err) {
                        callback(new Error("Error a la hora de mostrar todos los usuarios"))
                    }
                    else {
                        callback(null, user);
                    }
                });
            }
        });
    }

    getAllTecs(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));                
            }
            else {
                let sql ="SELECT * FROM personas P WHERE P.activo = 1 AND P.rol = 'PAS'" ;
                connection.query(sql,
                function (err, tecs) {
                    connection.release();
                    if (err) {
                        callback(new Error("Error a la hora de mostrar todos los usuarios"))
                    }
                    else {
                        callback(null, tecs);
                    }
                });
            }
        });
    }
    
}

module.exports = DAOUsers;