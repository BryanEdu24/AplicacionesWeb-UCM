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
                console.log(email);
                console.log(password);
                connection.query(" SELECT * FROM usuarios WHERE email = ? AND password = ?" ,
                    [email,password], 
                    function(err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            /* console.log(email);
                            console.log(password);
                            console.log(pool); */
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else{
                            if (rows.length === 0) {
                                
                                callback(null, false); //no está el usuario con el password proporcionado

                            }
                            else {
                                callback(null, true);
                            } 
                        }
                    });
            }
        });
    }

    getUserImageName(email,callback){
        let nameFile;
        this.pool.getConnection(function(err,connection){
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT U.img FROM ucm_cau AS U WHERE email = ?",
                    [email],
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
}

module.exports = DAOUsers;