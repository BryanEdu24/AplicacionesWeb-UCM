class DAOAvisos {
  constructor(pool) {
    this.pool = pool;
  }

  insertTask(task, idUser, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) callback(new Error("Error de conexión a la base de datos"));
      else {
        console.log(task);
        let sql =
          "INSERT INTO avisos(tipo, subtipo, categoria, observaciones, comentario, activo, asignado, eliminadoPor, nombreTecnico) VALUES (?,?,?,?,null,1,0,null,null)";
        connection.query(
          sql,
          [
            task.tipo,
            task.subtipo,
            task.categoria,
            task.observacion.toString(),
          ],
          function (err, taskInserted) {
            connection.release();
            if (err)
              callback(new Error("Error a la hora de insertar el aviso"));
            else {
              let sql =
                "INSERT INTO persona_aviso (idPersona, idAviso, cerrado, borrado) VALUES (?,?,0,0);";
              connection.query(
                sql,
                [idUser, taskInserted.insertId],
                function (err, result) {
                  if (err) {
                    callback(
                      new Error(
                        "Error a la hora de hacer la insercción en la tabla persona_aviso"
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

  insertTaskCongratulation(task, idUser, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err) callback(new Error("Error de conexión a la base de datos"));
      else {
        console.log(task);
        let sql =
          "INSERT INTO avisos(tipo, subtipo, categoria, observaciones, comentario, activo, asignado, eliminadoPor, nombreTecnico) VALUES (?,null,?,?,null,1,0,null,null)";
        connection.query(
          sql,
          [task.tipo, task.categoria, task.observacion.toString()],
          function (err, taskInserted) {
            connection.release();
            if (err)
              callback(
                new Error("Error a la hora de insertar el aviso felicitación")
              );
            else {
              let sql =
                "INSERT INTO persona_aviso (idPersona, idAviso, cerrado, borrado) VALUES (?,?,0,0);";
              connection.query(
                sql,
                [idUser, taskInserted.insertId],
                function (err, result) {
                  if (err) {
                    callback(
                      new Error(
                        "Error a la hora de hacer la insercción en la tabla persona_aviso"
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
          "SELECT DISTINCT U.nombre, A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado, A.nombreTecnico FROM avisos A JOIN persona_aviso P ON P.idAviso = A.idAviso JOIN personas U ON U.id = P.idPersona WHERE p.idPersona = ?  AND P.cerrado = 0";
        // "SELECT DISTINCT U.nombre, A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado  FROM avisos A JOIN persona_aviso P ON P.idAviso = A.idAviso JOIN personas U ON U.id = P.idPersona WHERE p.idPersona = ? AND P.cerrado = 0" ;
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

  // Mis Avisos de Tecnico
  allAvisos(callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(
          new Error("Error de conexión a la base de datos en Mis Avisos")
        );
      else {
        let sql =
          "SELECT * FROM avisos A JOIN persona_aviso P ON P.idAviso = A.idAviso WHERE P.cerrado = 0 ORDER BY a.idAviso";
        // "SELECT DISTINCT U.nombre, A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado  FROM avisos A JOIN persona_aviso P ON P.idAviso = A.idAviso JOIN personas U ON U.id = P.idPersona WHERE p.idPersona = ? AND P.cerrado = 0" ;
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
          "SELECT DISTINCT U.nombre, A.idAviso, A.tipo, A.subtipo, A.categoria, A.fecha, A.observaciones, A.comentario, A.asignado, A.nombreTecnico FROM avisos A JOIN persona_aviso P ON P.idAviso = A.idAviso JOIN personas U ON U.id = P.idPersona WHERE p.idPersona = ? AND P.cerrado = 1";
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

  getAviso(idAviso, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(new Error("Error de conexión a la base de datos en getAviso"));
      else {
        let sql = "SELECT * FROM avisos A WHERE A.idAviso = ?";
        connection.query(sql, [idAviso], function (err, task) {
          connection.release();
          if (err)
            callback(
              new Error("Error a la hora de mostrar historial de avisos")
            );
          else {
            callback(null, task[0]);
          }
        });
      }
    });
  }

  avisosPerfil(idUser, callback) {
    this.pool.getConnection(function (err, connection) {
      if (err)
        callback(new Error("Error de conexión a la base de datos en getAviso"));
      else {
        let sql =
          "SELECT COUNT(P.idAviso) FROM persona_aviso P WHERE P.idPersona = ?;";
        connection.query(sql, [idUser], function (err, countAvisos) {
          connection.release();
          if (err)
            callback(
              new Error("Error a la hora de conseguir el numero de avisos de un usuario")
            );
          else {
            let sql =
              "SELECT COUNT(A.idAviso) FROM avisos A " +
              " JOIN persona_aviso P ON P.idAviso = A.idAviso " +
              " JOIN personas U ON U.id = P.idPersona " +
              " WHERE p.idPersona = ? AND A.tipo = 'Sugerencia';";
            connection.query(sql, [idUser], function (err, countSug) {
              if (err)
                callback(
                  new Error("Error a la hora de conseguir el numero de sugerencias de un usuario")
                );
              else {
                let sql =
                  "SELECT COUNT(A.idAviso) FROM avisos A " +
                  " JOIN persona_aviso P ON P.idAviso = A.idAviso " +
                  " JOIN personas U ON U.id = P.idPersona " +
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
                      "SELECT COUNT(A.idAviso) FROM avisos A " +
                      " JOIN persona_aviso P ON P.idAviso = A.idAviso " +
                      " JOIN personas U ON U.id = P.idPersona " +
                      " WHERE p.idPersona = ? AND A.tipo = 'Felicitación';";
                    connection.query(sql, [idUser], function (err, countFeli) {
                      if (err)
                        callback(
                          new Error(
                            "Error a la hora de conseguir el numero de felicitaciones de un usuario"
                          )
                        );
                      else {
                        callback(null, countAvisos[0], countSug[0], countInci[0],countFeli[0]);
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
