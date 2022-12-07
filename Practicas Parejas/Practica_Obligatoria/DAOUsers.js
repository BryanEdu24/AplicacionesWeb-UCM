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
                connection.query(" SELECT * FROM personas WHERE email = ? AND password = ?" ,
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
                connection.query("SELECT U.foto FROM personas AS U WHERE id = ?",
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

    insertUser(usuario, callback) {
       this.pool.getConnection(function(err, connection) {
            if (err)    callback(new Error("Error de conexión a la base de datos"));
            else {
                let sql =
                "INSERT INTO personas(nombre, email, password, rol, numEmpleado, Foto) VALUES (?, ?, ?, ?, ?, ?)";
                connection.query(sql, [usuario.nombre, usuario.correo,
                usuario.contrasenia, usuario.opcion, usuario.numEmpleado, usuario.imagen],
                function(err, result) {
                    connection.release();
                    if (err)    callback(new Error("Error a la hora de hacer la insercción"));
                    else    callback(null, result.insertId);
                });
            }
        });
        }
}

module.exports = DAOUsers;