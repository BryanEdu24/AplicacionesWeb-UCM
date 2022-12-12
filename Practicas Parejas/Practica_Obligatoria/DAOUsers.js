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
          " SELECT * FROM personas WHERE email = ? AND password = ? AND activo = 1",
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
          "SELECT U.foto FROM personas AS U WHERE id = ? AND activo = 1",
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
          "INSERT INTO personas(nombre, email, password, rol, numEmpleado, Foto, fecha, activo) VALUES (?, ?, ?, ?, ?, ?, ?,1)";
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
                "UPDATE numempleado_tecnico SET idTecnico= ? , asignado=1 WHERE numEmpleado=?";
              connection.query(
                sql,
                [resultUser.insertId, usuario.numEmpleado],
                function (err, result) {
                  if (err) {
                    callback(
                      new Error(
                        "Error a la hora de hacer la insercción en la tabla numempleado_tecnico"
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
          "INSERT INTO personas(nombre, email, password, rol, numEmpleado, Foto, fecha, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)";
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
          "SELECT idTecnico FROM numempleado_tecnico WHERE numEmpleado = ? AND asignado = 1";
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
        let sql = "SELECT * FROM personas P WHERE P.activo = 1";
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
          "SELECT * FROM personas P WHERE P.activo = 1 AND P.rol = 'PAS'";
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
        let sql = "UPDATE personas P SET P.activo = 0 WHERE P.id = ?";
        connection.query(sql, [idUser], function (err, idUserDeleted) {
          connection.release();
          if (err) {
            callback(
              new Error("Error a la hora de eliminar en tabla personas")
            );
          } else {
            console.log("Entra en update persona_Aviso");
            let sql =
              "UPDATE persona_aviso SET cerrado = 1 , borrado = 1 WHERE idPersona=?;";
            connection.query(sql, [idUser], function (err, idUserDeleted) {
              if (err) {
                callback(
                  new Error("Error a la hora de elimar en persona_aviso")
                );
              } else {
                console.log("Entra en seleccionar todos los avisos");
                let sql =
                  "SELECT * FROM persona_aviso P WHERE P.borrado = 1 AND P.cerrado = 1 AND P.idPersona = ?";
                connection.query(sql, [idUser], function (err, avisos) {
                  if (err) {
                    callback(
                      new Error("Error a la hora de elimar en persona_aviso")
                    );
                  } else {
                    let i = 0;
                    avisos.forEach(function (aviso) {
                        console.log("Entra en forEach de todos los avisos");
                      let sql =
                        "UPDATE avisos A SET A.activo = 0, A.eliminadoPor = ? , A.creadoPor = 'Usuario Eliminado' WHERE A.idAviso = ? ";
                      connection.query(
                        sql,
                        [nameTec, aviso.idAviso],
                        function (err, avisosAfectados) {
                          if (err) {
                            callback(
                              new Error(
                                "Error de acceso a la base de datos a la hora de eliminar avisos de un usuario en avisos"
                              )
                            );
                          } else {
                            if (i === avisos.length - 1) {
                              callback(null);
                            } else {
                                i++;
                                console.log("Borra tecnico_aviso de un borrado de usuario: " + aviso.idAviso);

                              let sql =
                                "UPDATE tecnico_aviso T SET T.cerrado = 1 WHERE T.idAviso = ?";
                              connection.query(
                                sql,
                                [aviso.idAviso],
                                function (err, avisosAfectados) {
                                  if (err) {
                                    callback(
                                      new Error(
                                        "Error de acceso a la base de datos a la hora de eliminar avisos de un usuario en tecnico-avisos"
                                      )
                                    );
                                  } 
                                }
                              );
                            }
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
        let sql = "UPDATE personas P SET P.activo = 0 WHERE P.id = ?";
        connection.query(sql, [idTec], function (err, idUserDeleted) {
          connection.release();
          if (err) {
            callback(
              new Error(
                "Error a la hora de eliminar en tabla personas al tecnico"
              )
            );
          } else {
            let sql =
              "UPDATE tecnico_aviso T SET T.cerrado = 1 WHERE T.idTecnico = ?";
            connection.query(sql, [idTec], function (err, idUserDeleted) {
              if (err) {
                callback(
                  new Error(
                    "Error a la hora de elimar en tecnico_aviso al tecnico"
                  )
                );
              } else {
                let sql =
                  "SELECT * FROM tecnico_aviso T WHERE T.cerrado = 1 AND T.idTecnico = ?";
                connection.query(sql, [idTec], function (err, avisos) {
                  if (err) {
                    callback(
                      new Error("Error a la hora de conseguir los avisos del tecnico en tecnico-aviso")
                    );
                  } else {
                    let i = 0;
                    avisos.forEach(function (aviso) {
                      const sql =
                        "UPDATE avisos A SET A.activo = 0, A.eliminadoPor = ? , A.nombreTecnico = 'Tecnico Eliminado' WHERE A.idAviso = ? ";
                      connection.query(
                        sql,
                        [nameTec, aviso.idAviso],
                        function (err, avisosAfectados) {
                          if (err) {
                            callback(
                              new Error(
                                "Error de acceso a la base de datos a la hora de eliminar avisos de un tecnico en avisos"
                              )
                            );
                          } else {
                            if (i === avisos.length - 1) {
                              callback(null, avisosAfectados);
                            } else {
                                let sql =
                                  "UPDATE persona_aviso T SET T.cerrado = 1 AND T.borrado = 1 WHERE T.idAviso = ?";
                                connection.query(
                                  sql,
                                  [aviso.idAviso],
                                  function (err, avisosAfectados) {
                                    if (err) {
                                      callback(
                                        new Error(
                                          "Error de acceso a la base de datos a la hora de eliminar avisos de un tecnico en persona-avisos"
                                        )
                                      );
                                    } else {
                                        i++;
                                    }
                                  }
                                );
                              }
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
