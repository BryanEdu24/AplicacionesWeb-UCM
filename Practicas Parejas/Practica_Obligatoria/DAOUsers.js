"use strict";

class DAOUsers {
  constructor(pool) {
    this.pool = pool;
  }

  isUserCorrect(email, password, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) {
        callback(new Error("Error de conexión a la base de datos"));
      } else {
        connection.query(
          " SELECT * FROM  ucm_aw_cau_usu_usuarios WHERE email = ? AND password = ? AND activo = 1",
          [email, password],
          function (err, rows) {
            connection.release(); // devolver al pool la conexión
            if (err) {
              callback(new Error("Error de acceso a la base de datos"));
            } else {
              if (rows.length === 0) {
                callback(null, false, null); //no está el usuario con el password proporcionado
              } else {
                callback(null, true, rows[0]);
              }
            }
          }
        );
      }
    });
  }

  getUserImageName(idUser, callback) {
    let nameFile;
    this.pool.getConnection(function (err, connection) {
      if (err) {
        callback(new Error("Error de conexión a la base de datos"));
      } else {
        connection.query(
          "SELECT U.foto FROM  ucm_aw_cau_usu_usuarios AS U WHERE id = ? AND activo = 1",
          [idUser],
          function (err, img) {
            connection.release(); //devolver la conexión a pool
            if (err) {
              callback(new Error("Error de acceso a la base de datos"));
            } else {
              if (img.length === 0) {
                callback(new Error("No existe el usuario")); //no está el usuario con el password proporcionado
              } else {
                nameFile = img;
                callback(null, nameFile);
              }
            }
          }
        );
      }
    });
  }

  insertTec(usuario, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) callback(new Error("Error de conexión a la base de datos"));
      else {
        let sql =
          "INSERT INTO  ucm_aw_cau_usu_usuarios(nombre, email, password, rol, numEmpleado, Foto, fecha, activo) VALUES (?, ?, ?, ?, ?, ?, ?,1)";
        connection.query(
          sql,
          [
            usuario.nombre,
            usuario.correo,
            usuario.contrasenia,
            usuario.opcion,
            usuario.numEmpleado,
            usuario.imagen,
            usuario.fecha,
          ],
          function (err, resultUser) {
            connection.release();
            if (err)
              callback(new Error("Error a la hora de hacer la insercción"));
            else {
              let sql =
                "UPDATE ucm_aw_cau_nte_numempleado_tecnico SET idTecnico= ? , asignado=1 WHERE numEmpleado=?";
              connection.query(
                sql,
                [resultUser.insertId, usuario.numEmpleado],
                function (err, result) {
                  if (err) {
                    callback(
                      new Error(
                        "Error a la hora de hacer la insercción en la tabla ucm_aw_cau_nte_numempleado_tecnico"
                      )
                    );
                  } else {
                    callback(null, resultUser.insertId);
                  }
                }
              );
            }
          }
        );
      }
    });
  }

  insertUser(usuario, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) callback(new Error("Error de conexión a la base de datos"));
      else {
        let sql =
          "INSERT INTO  ucm_aw_cau_usu_usuarios(nombre, email, password, rol, numEmpleado, Foto, fecha, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)";
        connection.query(
          sql,
          [
            usuario.nombre,
            usuario.correo,
            usuario.contrasenia,
            usuario.opcion,
            usuario.numEmpleado,
            usuario.imagen,
            usuario.fecha,
          ],
          function (err, resultUser) {
            connection.release();
            if (err)
              callback(new Error("Error a la hora de hacer la insercción"));
            else {
              callback(null, resultUser.insertId);
            }
          }
        );
      }
    });
  }

  checkEmployee(numEmployee, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) callback(new Error("Error de conexión a la base de datos"));
      else {
        let sql =
          "SELECT idTecnico FROM ucm_aw_cau_nte_numempleado_tecnico WHERE numEmpleado = ? AND asignado = 1";
        connection.query(sql, [numEmployee], function (err, idTecnico) {
          connection.release();
          if (err)
            callback(
              new Error("Error a la hora de comprobar el número de empleado")
            );
          else {
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
      } else {
        let sql = "SELECT * FROM  ucm_aw_cau_usu_usuarios P WHERE P.activo = 1";
        connection.query(sql, function (err, user) {
          connection.release();
          if (err) {
            callback(
              new Error("Error a la hora de mostrar todos los usuarios")
            );
          } else {
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
      } else {
        let sql =
          "SELECT * FROM  ucm_aw_cau_usu_usuarios P WHERE P.activo = 1 AND P.rol = 'PAS'";
        connection.query(sql, function (err, tecs) {
          connection.release();
          if (err) {
            callback(
              new Error("Error a la hora de mostrar todos los usuarios")
            );
          } else {
            callback(null, tecs);
          }
        });
      }
    });
  }

  deleteUser(idUser, nameTec, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) {
        callback(new Error("Error de conexión a la base de datos"));
      } else {
        let sql = "UPDATE  ucm_aw_cau_usu_usuarios P SET P.activo = 0 WHERE P.id = ?";
        connection.query(sql, [idUser], function (err, idUserDeleted) {
          connection.release();
          if (err) {
            callback(
              new Error(
                "Error a la hora de eliminar en tabla  ucm_aw_cau_usu_usuarios al usuario"
              )
            );
          } else {
            console.log("Ha borrado al usuario en  ucm_aw_cau_usu_usuarios ");
            let sql =
              "UPDATE  ucm_aw_cau_usa_usuario_avisos SET cerrado = 1 , borrado = 1 WHERE idPersona=?;";
            connection.query(sql, [idUser], function (err, idUserDeleted) {
              if (err) {
                callback(
                  new Error(
                    "Error a la hora de eliminar los avisos del usuario en  ucm_aw_cau_usa_usuario_avisos"
                  )
                );
              } else {
                console.log("Ha cerrado y borrado los avisos en  ucm_aw_cau_usa_usuario_avisos");
                let sql =
                  "SELECT * FROM  ucm_aw_cau_usa_usuario_avisos P WHERE P.borrado = 1 AND P.cerrado = 1 AND P.idPersona = ?";
                connection.query(sql, [idUser], function (err, avisos) {
                  if (err) {
                    callback(
                      new Error(
                        "Error a la hora de conseguir los avisos eliminados del usuario en  ucm_aw_cau_usa_usuario_avisos"
                      )
                    );
                  } else {
                    console.log(
                      "Ha conseguido los avisos eliminados va a hacer el forEach de todos los avisos"
                    );
                    console.log(avisos);
                    let i = 0;
                    avisos.forEach(function (aviso) {
                      let sql =
                        "UPDATE ucm_aw_cau_avi_avisos A SET A.activo = 0, A.eliminadoPor = ? , A.creadoPor = 'Usuario Eliminado' WHERE A.idAviso = ? ";
                      connection.query(
                        sql,
                        [nameTec, aviso.idAviso],
                        function (err, avisosAfectados) {
                          if (err) {
                            callback(
                              new Error(
                                "Error de acceso a la base de datos a la hora de eliminar avisos de un usuario en la tabla ucm_aw_cau_avi_avisos "
                              )
                            );
                          } else {
                            console.log(
                              "Ha actualizado los datos de la tabla ucm_aw_cau_avi_avisos  del aviso: " +
                                aviso.idAviso
                            );
                            let sql =
                              "UPDATE  ucm_aw_cau_tea_tecnico_aviso T SET T.cerrado = 1 WHERE T.idAviso = ?";
                            connection.query(
                              sql,
                              [aviso.idAviso],
                              function (err, avisosAfectados) {
                                if (err) {
                                  callback(
                                    new Error(
                                      "Error de acceso a la base de datos a la hora de eliminar avisos de un usuario en ucm_aw_cau_tea_tecnico_aviso"
                                    )
                                  );
                                }else{
                                  if (i === avisos.length - 1) {
                                    console.log("Ha cerrado el aviso del tecnico con idAviso: "+ aviso.idAviso);
                                    callback(null);
                                  }else i++;
                                }
                              }
                            );
                          }
                        }
                      );
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  deleteUserTec(idTec, nameTec, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) {
        callback(new Error("Error de conexión a la base de datos"));
      } else {
        let sql = "UPDATE  ucm_aw_cau_usu_usuarios P SET P.activo = 0 WHERE P.id = ?";
        connection.query(sql, [idTec], function (err, idUserDeleted) {
          connection.release();
          if (err) {
            callback(
              new Error(
                "Error a la hora de eliminar en tabla  ucm_aw_cau_usu_usuarios al tecnico"
              )
            );
          } else {
            let sql =
              "UPDATE  ucm_aw_cau_tea_tecnico_aviso T SET T.cerrado = 1 WHERE T.idTecnico = ?";
            connection.query(sql, [idTec], function (err, idUserDeleted) {
              if (err) {
                callback(
                  new Error(
                    "Error a la hora de elimar en  ucm_aw_cau_tea_tecnico_aviso al tecnico"
                  )
                );
              } else {
                let sql =
                  "SELECT * FROM  ucm_aw_cau_tea_tecnico_aviso T WHERE T.cerrado = 1 AND T.idTecnico = ?";
                connection.query(sql, [idTec], function (err, avisos) {
                  if (err) {
                    callback(
                      new Error(
                        "Error a la hora de conseguir los avisos del tecnico en ucm_aw_cau_tea_tecnico_aviso"
                      )
                    );
                  } else {
                    let i = 0;
                    avisos.forEach(function (aviso) {
                      const sql =
                        "UPDATE ucm_aw_cau_avi_avisos  A SET A.activo = 0, A.eliminadoPor = ? , A.nombreTecnico = 'Tecnico Eliminado' WHERE A.idAviso = ? ";
                      connection.query(
                        sql,
                        [nameTec, aviso.idAviso],
                        function (err, avisosAfectados) {
                          if (err) {
                            callback(
                              new Error(
                                "Error de acceso a la base de datos a la hora de eliminar avisos de un tecnico en ucm_aw_cau_avi_avisos "
                              )
                            );
                          } else {
                            let sql =
                              "UPDATE  ucm_aw_cau_usa_usuario_avisos T SET T.cerrado = 1 AND T.borrado = 1 WHERE T.idAviso = ?";
                            connection.query(
                              sql,
                              [aviso.idAviso],
                              function (err, avisosAfectados) {
                                if (err) {
                                  callback(
                                    new Error(
                                      "Error de acceso a la base de datos a la hora de eliminar avisos de un tecnico en ucm_aw_cau_usa_usuario_avisos"
                                    )
                                  );
                                } else {
                                  if (i === avisos.length - 1) {
                                    callback(null, avisosAfectados);
                                  } else i++;
                                }
                              }
                            );
                          }
                        }
                      );
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
}

module.exports = DAOUsers;
