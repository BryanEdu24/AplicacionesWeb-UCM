class DAOAvisos {
  constructor(pool) {
    this.pool = pool;
  }

  completeTask(commentTec, idAviso, callback){
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en finalizar Aviso")
        );
      else {
        let sql =
          "UPDATE ucm_aw_cau_tea_tecnico_aviso   T SET T.cerrado = 1 WHERE t.idAviso = ? ";
        connection.query(sql,[idAviso], function (err, idAvisoUpdated) {
          connection.release();
          if (err) callback(new Error("Error a la hora de actualizar ucm_aw_cau_tea_tecnico_aviso  "));
          else {
            let sql =
              " UPDATE ucm_aw_cau_usa_usuario_avisos  P SET P.cerrado = 1 WHERE P.idAviso = ? ";
            connection.query(sql, [idAviso], function (err, idAvisoUpdated) {
              if (err)
                callback(new Error("Error a la hora de actualizar ucm_aw_cau_usa_usuario_avisos "));
              else {
                let sql =
                "UPDATE ucm_aw_cau_avi_avisos  A SET A.activo = 0, A.comentario= ? WHERE A.idAviso = ? " ;                connection.query(
                  sql,
                  [commentTec, idAviso],
                  function (err, idAvisoUpdated) {
                    if (err)
                      callback(
                        new Error("Error a la hora de actualizar ucm_aw_cau_avi_avisos ")
                      );
                    else {
                      callback(null, idAvisoUpdated);
                    }
                  }
                );
              }
            });
          }
        });
      }
    });
  }

  deleteTask(commentTec, nameTec, idAviso, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en eliminar un aviso")
        );
      else {
        let sql =
          " UPDATE ucm_aw_cau_tea_tecnico_aviso   T SET T.cerrado = 1 WHERE t.idAviso = ? ";
        connection.query(sql, [idAviso], function (err, idAvisoUpdated) {
          connection.release();
          if (err) callback(new Error("Error a la hora de actualizar ucm_aw_cau_tea_tecnico_aviso  "));
          else {
            let sql =
              " UPDATE ucm_aw_cau_usa_usuario_avisos P SET P.cerrado = 1, P.borrado = 1 WHERE P.idAviso = ? ";
            connection.query(sql, [idAviso], function (err, idAvisoUpdated) {
              if (err)
                callback(new Error("Error a la hora de actualizar ucm_aw_cau_usa_usuario_avisos "));
              else {
                let sql =
                "UPDATE ucm_aw_cau_avi_avisos  A SET A.activo = 0, A.eliminadoPor = ?, A.comentario= ? WHERE A.idAviso = ? " ;                
                connection.query(
                  sql,
                  [nameTec, commentTec, idAviso],
                  function (err, idAvisoUpdated) {
                    if (err)
                      callback(
                        new Error("Error a la hora de actualizar ucm_aw_cau_avi_avisos ")
                      );
                    else {
                      callback(null, idAvisoUpdated);
                    }
                  }
                );
              }
            });
          }
        });
      }
    });
  }

  asignarTectoTask(nameTec, idTask, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en asignar Tecnico al aviso")
        );
      else {
        let sql = "SELECT id FROM ucm_aw_cau_usu_usuarios WHERE nombre = ?";
        connection.query(sql, [nameTec], function (err, idTec) {
          connection.release();
          if (err)
            callback(
              new Error("Error a la hora de conseguir el id del usuario")
            );
          else {
            console.log(idTec[0].id);
            let sql =
              "INSERT INTO ucm_aw_cau_tea_tecnico_aviso   (idTecnico,idAviso,cerrado) VALUES(?,?,0);";
            connection.query(
              sql,
              [idTec[0].id, idTask],
              function (err, result) {
                if (err)
                  callback(
                    new Error("Error a la hora de insertar en ucm_aw_cau_tea_tecnico_aviso  ")
                  );
                else {
                  let sql =
                    "UPDATE ucm_aw_cau_avi_avisos  A SET A.asignado = 1, A.nombreTecnico = ? WHERE A.idAviso = ?";
                  connection.query(
                    sql,
                    [nameTec, idTask],
                    function (err, taskModificado) {
                      if (err)
                        callback(
                          new Error(
                            "Error a la hora de actualizar la tabla ucm_aw_cau_avi_avisos "
                          )
                        );
                      else {
                        callback(null, taskModificado.insertId);
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    });
  }

  insertTask(task, idUser, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) callback(new Error("Error de conexión a la base de datos"));
      else {
        let sql = "SELECT nombre FROM ucm_aw_cau_usu_usuarios  WHERE id = ?";
        connection.query(sql, [idUser], function (err, nameUser) {
          connection.release();
          if (err) {
            callback(
              new Error(
                "Error a la hora de hacer la insercción en la tabla ucm_aw_cau_usu_usuarios "
              )
            );
          } else {
            let sql =
              "INSERT INTO ucm_aw_cau_avi_avisos (tipo, subtipo, categoria, observaciones, comentario, activo, asignado, eliminadoPor, nombreTecnico, creadoPor) VALUES (?,?,?,?,null,1,0,null,null,?)";
            connection.query(
              sql,
              [
                task.tipo,
                task.subtipo,
                task.categoria,
                task.observacion.toString(),
                nameUser[0].nombre,
              ],
              function (err, taskInserted) {
                if (err)
                  callback(new Error("Error a la hora de insertar el aviso"));
                else {
                  let sql =
                    "INSERT INTO ucm_aw_cau_usa_usuario_avisos  (idPersona, idAviso, cerrado, borrado) VALUES (?,?,0,0);";
                  connection.query(
                    sql,
                    [idUser, taskInserted.insertId],
                    function (err, result) {
                      if (err) {
                        callback(
                          new Error(
                            "Error a la hora de hacer la insercción en la tabla ucm_aw_cau_usa_usuario_avisos "
                          )
                        );
                      } else {
                        callback(null, taskInserted.insertId);
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    });
  }

  insertTaskCongratulation(task, idUser, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) callback(new Error("Error de conexión a la base de datos"));
      else {
        let sql = "SELECT nombre FROM ucm_aw_cau_usu_usuarios  WHERE id = ?";
        connection.query(sql, [idUser], function (err, nameUser) {
          connection.release();
          if (err) {
            callback(
              new Error(
                "Error a la hora de hacer la insercción en la tabla ucm_aw_cau_usu_usuarios "
              )
            );
          } else {
            let sql =
              "INSERT INTO ucm_aw_cau_avi_avisos (tipo, subtipo, categoria, observaciones, comentario, activo, asignado, eliminadoPor, nombreTecnico, creadoPor) VALUES (?,null,?,?,null,1,0,null,null,?)";
            connection.query(
              sql,
              [
                task.tipo,
                task.categoria,
                task.observacion.toString(),
                nameUser[0].nombre,
              ],
              function (err, taskInserted) {
                if (err)
                  callback(
                    new Error(
                      "Error a la hora de insertar el aviso felicitación"
                    )
                  );
                else {
                  let sql =
                    "INSERT INTO ucm_aw_cau_usa_usuario_avisos   (idPersona, idAviso, cerrado, borrado) VALUES (?,?,0,0);";
                  connection.query(
                    sql,
                    [idUser, taskInserted.insertId],
                    function (err, result) {
                      if (err) {
                        callback(
                          new Error(
                            "Error a la hora de hacer la insercción en la tabla ucm_aw_cau_usa_usuario_avisos  "
                          )
                        );
                      } else {
                        callback(null, taskInserted.insertId);
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    });
  }

  // Mis Avisos de User
  misAvisos(idUser, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en Mis Avisos")
        );
      else {
        console.log(idUser);
        let sql =
          "SELECT DISTINCT U.nombre, A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado, A.nombreTecnico FROM ucm_aw_cau_avi_avisos  A JOIN ucm_aw_cau_usa_usuario_avisos   P ON P.idAviso = A.idAviso JOIN ucm_aw_cau_usu_usuarios  U ON U.id = P.idPersona WHERE p.idPersona = ?  AND P.cerrado = 0";
        connection.query(sql, [idUser], function (err, tasks) {
          connection.release();
          if (err) callback(new Error("Error a la hora de mostrar los avisos"));
          else {
            callback(null, tasks);
          }
        });
      }
    });
  }

  //Mis Avisos de Tecnico
  misAvisosTec(idTec, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en Mis Avisos para Tecnico")
        );
      else {
        console.log(idTec);
        let sql =
          "SELECT DISTINCT A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado, A.nombreTecnico FROM ucm_aw_cau_avi_avisos  A JOIN ucm_aw_cau_tea_tecnico_aviso   T ON T.idAviso = A.idAviso WHERE T.idTecnico = ?  AND T.cerrado = 0";
        connection.query(sql, [idTec], function (err, tasks) {
          connection.release();
          if (err) callback(new Error("Error a la hora de mostrar los avisos"));
          else {
            callback(null, tasks);
          }
        });
      }
    });
  }

  // Avisos Entrantes de Tecnico
  allAvisos(callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en Avisos Entrantes del Tecnico")
        );
      else {
        let sql =
          "SELECT * FROM ucm_aw_cau_avi_avisos  A JOIN ucm_aw_cau_usa_usuario_avisos   P ON P.idAviso = A.idAviso WHERE P.cerrado = 0 ORDER BY a.idAviso";
        connection.query(sql, function (err, tasks) {
          connection.release();
          if (err) callback(new Error("Error a la hora de mostrar los avisos"));
          else {
            callback(null, tasks);
          }
        });
      }
    });
  }

  // Historial de Avisos de User
  historialAvisos(idUser, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en Historial Avisos")
        );
      else {
        console.log(idUser);
        let sql =
          "SELECT DISTINCT U.nombre, A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado, A.nombreTecnico FROM ucm_aw_cau_avi_avisos  A JOIN ucm_aw_cau_usa_usuario_avisos   P ON P.idAviso = A.idAviso JOIN ucm_aw_cau_usu_usuarios U ON U.id = P.idPersona WHERE p.idPersona = ? AND P.cerrado = 1";
        connection.query(sql, [idUser], function (err, tasks) {
          connection.release();
          if (err)
            callback(
              new Error("Error a la hora de mostrar historial de avisos")
            );
          else {
            callback(null, tasks);
          }
        });
      }
    });
  }

  // Historial de Avisos de Tecnico
  historialAvisosTec(idTec, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en Historial Avisos de Tecnico")
        );
      else {
        let sql =
          "SELECT DISTINCT A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado, A.nombreTecnico, A.creadoPor FROM ucm_aw_cau_avi_avisos  A JOIN ucm_aw_cau_tea_tecnico_aviso   T ON T.idAviso = A.idAviso WHERE T.idTecnico = ? AND T.cerrado = 1";
        connection.query(sql, [idTec], function (err, tasks) {
          connection.release();
          if (err)
            callback(
              new Error("Error a la hora de mostrar historial de avisos")
            );
          else {
            callback(null, tasks);
          }
        });
      }
    });
  }

  //Conseguir un aviso para modal
  getAviso(idAviso, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(new Error("Error de conexión a la base de datos en getAviso"));
      else {
        let sql = "SELECT * FROM ucm_aw_cau_avi_avisos  A WHERE A.idAviso = ?";
        connection.query(sql, [idAviso], function (err, task) {
          connection.release();
          if (err)
            callback(
              new Error("Error a la hora de conseguir un aviso para el modal")
            );
          else {
            callback(null, task[0]);
          }
        });
      }
    });
  }

  //Avisos para perfil User
  avisosPerfil(idUser, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(new Error("Error de conexión a la base de datos en getAviso"));
      else {
        let sql =
          "SELECT COUNT(P.idAviso) FROM ucm_aw_cau_usa_usuario_avisos   P WHERE P.idPersona = ?;";
        connection.query(sql, [idUser], function (err, countAvisos) {
          connection.release();
          if (err)
            callback(
              new Error(
                "Error a la hora de conseguir el numero de avisos de un usuario"
              )
            );
          else {
            let sql =
              "SELECT COUNT(A.idAviso) FROM ucm_aw_cau_avi_avisos  A " +
              " JOIN ucm_aw_cau_usa_usuario_avisos   P ON P.idAviso = A.idAviso " +
              " WHERE p.idPersona = ? AND A.tipo = 'Sugerencia';";
            connection.query(sql, [idUser], function (err, countSug) {
              if (err)
                callback(
                  new Error(
                    "Error a la hora de conseguir el numero de sugerencias de un usuario"
                  )
                );
              else {
                let sql =
                  "SELECT COUNT(A.idAviso) FROM ucm_aw_cau_avi_avisos  A " +
                  " JOIN ucm_aw_cau_usa_usuario_avisos   P ON P.idAviso = A.idAviso " +
                  " WHERE p.idPersona = ? AND A.tipo = 'Incidencia';";
                connection.query(sql, [idUser], function (err, countInci) {
                  if (err)
                    callback(
                      new Error(
                        "Error a la hora de conseguir el numero de incidencias de un usuario"
                      )
                    );
                  else {
                    let sql =
                      "SELECT COUNT(A.idAviso) FROM ucm_aw_cau_avi_avisos  A " +
                      " JOIN ucm_aw_cau_usa_usuario_avisos   P ON P.idAviso = A.idAviso " +
                      " WHERE p.idPersona = ? AND A.tipo = 'Felicitación';";
                    connection.query(sql, [idUser], function (err, countFeli) {
                      if (err)
                        callback(
                          new Error(
                            "Error a la hora de conseguir el numero de felicitaciones de un usuario"
                          )
                        );
                      else {
                        callback(
                          null,
                          countAvisos[0],
                          countSug[0],
                          countInci[0],
                          countFeli[0]
                        );
                      }
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

  //Avisos para perfil Tecnico
  avisosPerfilTec(idTec, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(new Error("Error de conexión a la base de datos en numero de Avisos para perfil Tecnico"));
      else {
        let sql =
          "SELECT COUNT(T.idAviso) FROM ucm_aw_cau_tea_tecnico_aviso   T WHERE T.idTecnico = ?;";
        connection.query(sql, [idTec], function (err, countAvisos) {
          connection.release();
          if (err)
            callback(
              new Error(
                "Error a la hora de conseguir el numero de avisos de un tecnico "
              )
            );
          else {
            let sql =
              "SELECT COUNT(A.idAviso) FROM ucm_aw_cau_avi_avisos  A " +
              " JOIN ucm_aw_cau_tea_tecnico_aviso   T ON T.idAviso = A.idAviso " +
              " WHERE T.idTecnico = ? AND A.tipo = 'Sugerencia';";
            connection.query(sql, [idTec], function (err, countSug) {
              if (err)
                callback(
                  new Error(
                    "Error a la hora de conseguir el numero de sugerencias de un tecnico"
                  )
                );
              else {
                let sql =
                  "SELECT COUNT(A.idAviso) FROM ucm_aw_cau_avi_avisos  A " +
                  " JOIN ucm_aw_cau_tea_tecnico_aviso   T ON T.idAviso = A.idAviso " +
                  " WHERE T.idTecnico = ? AND A.tipo = 'Incidencia';";
                connection.query(sql, [idTec], function (err, countInci) {
                  if (err)
                    callback(
                      new Error(
                        "Error a la hora de conseguir el numero de incidencias de un tecnico"
                      )
                    );
                  else {
                    let sql =
                      "SELECT COUNT(A.idAviso) FROM ucm_aw_cau_avi_avisos  A " +
                      " JOIN ucm_aw_cau_tea_tecnico_aviso   T ON T.idAviso = A.idAviso " +
                      " WHERE T.idTecnico = ? AND A.tipo = 'Felicitación';";
                    connection.query(sql, [idTec], function (err, countFeli) {
                      if (err)
                        callback(
                          new Error(
                            "Error a la hora de conseguir el numero de felicitaciones de un tecnico"
                          )
                        );
                      else {
                        callback(
                          null,
                          countAvisos[0],
                          countSug[0],
                          countInci[0],
                          countFeli[0]
                        );
                      }
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

module.exports = DAOAvisos;
