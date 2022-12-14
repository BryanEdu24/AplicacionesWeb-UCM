const config = require("./config");
const express = require("express");
const path = require("path");
const mysql = require("mysql");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const moment = require("moment");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const registerRouter = require("./routes/register");
const DAOUsers = require("./DAOUsers");
const DAOAvisos = require("./DAOAvisos");
const { request } = require("http");
const { response } = require("express");
const { log } = require("console");

const MySQLStore = mysqlSession(session);
const app = express();
//pool de conexiones
const pool = mysql.createPool(config.mysqlConfig);
const sessionStore = new MySQLStore(config.mysqlConfig);
const middlewareSession = session({
  saveUninitialized: false,
  secret: "awbueno",
  resave: false,
  store: sessionStore,
});
// Crear una instancia de DAOUsers
const daoU = new DAOUsers(pool);
const daoA = new DAOAvisos(pool);

//Middleware sesionCurrent
function accessControl(request, response, next) {
  console.log("Log en middleware: " + request.session.currentUser);
  if (request.session.currentUser) {
    console.log(
      "El currentUser no es undefined: " + request.session.currentUser
    );
    let usuario = request.session.User;
    let fecha = moment(usuario.fecha);
    let fechaSpain = fecha.format("DD-MM-YYYY HH:mm:ss");
    console.log(fechaSpain);
    response.locals.userEmail = request.session.currentUser;
    response.locals.nameUser = usuario.nombre;
    response.locals.idUser = usuario.id;
    response.locals.rol = usuario.rol;
    response.locals.date = fechaSpain;
    response.locals.password = usuario.password;
    next();
  } else {
    console.log("El currentUser es undefined: " + request.session.currentUser);
    response.status(500);
    response.redirect("/");
  }
}

function mensajeFlash(request, response, next) {
  response.setFlash = (str) => {
    request.session.flashMessage = str;
  };
  response.locals.getandClearFlash = () => {
    let mensaje = request.session.flashMessage;
    delete request.session.flashMessage;
    return mensaje;
  };
  next();
}

/* Middleware error */
function middleware404(request,response){
  response.status(404);
  response.redirect("error404");
}

const multerFactory = multer({ storage: multer.memoryStorage() });

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewareSession);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware para gestionar los mensajes flash
app.use(mensajeFlash);

app.use("/", indexRouter);
app.use("/users", usersRouter);

/* Post de iniciar sesión */
app.post("/procesar_post.html", (request, response) => {
  daoU.isUserCorrect(
    request.body.correo,
    request.body.contrasenia,
    function cb_isUserCorrect(err, ok, user) {
      if (err) {
        console.log(err.message);
        response.setFlash("Error interno de acceso a la base de datos");
        response.redirect("/");
      } else if (ok) {
        request.session.currentUser = request.body.correo;
        request.session.User = user;
        if (user.rol === "PAS") {
          response.redirect("/mainViewTec1.html");
        } else {
          response.redirect("/mainViewUser1.html");
        }
      } else {
        console.log(err.message);
        response.status(400);
        response.setFlash("Usuario y/o contraseña incorrectos");
        response.redirect("/");
      }
    }
  );
});

/* Para cerrar sesión */
app.get("/logOut.html", (request, response) => {
  request.session.destroy();
  response.redirect("/");
});

/* Post del register */
app.post(
  "/registerPost.html",
  multerFactory.single("foto"),
  // Comprobación de contraseña
  check("contrasenia","La contraseña no tiene entre 8 y 16 caracteres.").isLength({ min: 8, max: 16 }),
  check("contrasenia", "La contraseña no contiene al menos un dígito.").matches(/[0-9]+/),
  check("contrasenia", "La contraseña no contiene al menos una minuscula.").matches(/[a-z]+/),
  check("contrasenia", "La contraseña no contiene al menos una mayuscula.").matches(/[A-Z]+/),
  check("contrasenia", "La contraseña no contiene al menos un caracter no alfanumérico.").matches(/[^a-zA-Z0-9]+/),
  check("numEmpleado", "El formato de numero de empleado no es el correcto").custom(function (value, { req }) {
    return (
      req.body.tecnico !== "ON" ||
      (req.body.tecnico === "ON" && /[0-9]{4}[-][a-zA-Z]{3}/.test(value)) // Si cumple formato
    );
  }),
  (request, response) => {
    const errors = validationResult(request);
    if (errors.isEmpty()) {
      let usuario = {
        correo: request.body.correo,
        contrasenia: request.body.contrasenia,
        nombre: request.body.NombreUsuario,
        opcion: request.body.opciones,
        tecnico: request.body.tecnico === "ON" ? "tecnico­" : "usuario",
        numEmpleado: null,
        imagen: null,
      };

      if (request.body.numEmpleado != undefined) {
        daoU.checkEmployee(request.body.numEmpleado, function (err, idTec) {
          if (err) {
            errores = [{ msg: err.message }];
            response.render("registerViewErrors", { errores: errores });
          } else if (idTec != null) {
            errores = [
              { msg: "Este numero de empleado ya tiene asignado un tecnico" },
            ];
            response.render("registerViewErrors", { errores: errores });
          } else {
            usuario.numEmpleado = request.body.numEmpleado;
            console.log(usuario);
            if (request.file) {
              usuario.imagen = request.file.buffer;
            }

            daoU.insertTec(usuario, function(err, repeat, newId) {
              if (!err) {
                if(repeat){
                  errores = [
                    { msg: "Este correo ya esta asignado a un usuario" },
                  ];
                  response.render("registerViewErrors", { errores: errores });
                }else{
                  usuario.id = newId;
                  response.redirect("/");
                  console.log("Tecnico ingresado correctamente"); 
                }
              }else{
                console.log(err.message);
                response.end();
              }
          });
          }
        });
      } else {
        console.log(usuario);
        if (request.file) {
          usuario.imagen = request.file.buffer;
        }
        daoU.insertUser(usuario, function(err, repeat, newId) {
          if (!err) {
            if(repeat){
              errores = [
                { msg: "Este correo ya esta asignado a un usuario" },
              ];
              response.render("registerViewErrors", { errores: errores });
            }else{
              usuario.id = newId;
              response.redirect("/");
              console.log("usuario ingresado correctamente"); 
            }
          }else{
            console.log(err.message);
            response.end();
          }
      });
      }
    } else {
      response.render("registerViewErrors", { errores: errors.array() });
    }
  }
);

/* Post a la hora de crear un nuevo aviso */
app.post("/post_nuevo_aviso.html", accessControl, (request, response) => {
  console.log(request.body);
  let idUsuario = response.locals.idUser;
  let aviso = {
    tipo: request.body.tipoAviso,
    subtipo: request.body.subtipoAviso,
    categoria: null,
    observacion: request.body.observacionUsuario,
  };
  if (aviso.tipo === "Felicitación") {
    aviso.categoria = request.body.categoriaFelicitacion;
    daoA.insertTaskCongratulation(aviso, idUsuario, function (err, newIdTask) {
      if (!err) {
        response.redirect("/mainViewUser1.html");
        console.log("Aviso de felicitación ingresado correctamente");
      } else {
        console.log(err.message);
        response.status(400);
        response.end();
      }
    });
  } else {
    request.body.categoriaAviso.forEach((categoria) => {
      if (categoria != "opt0") {
        aviso.categoria = categoria;
      }
    });
    daoA.insertTask(aviso, idUsuario, function (err, newIdTask) {
      if (!err) {
        response.redirect("/mainViewUser1.html");
        console.log("Aviso ingresado correctamente");
      } else {
        console.log(err.message);
        response.end();
      }
    });
  }
});

/* Post para modal en vistaUsuario */
app.post("/modalAviso", (request, response) => {
  let idAviso = request.body.idAviso;
  let aviso = null;
  let fecha = null;
  let fechaSpain = null;
  daoA.getAviso(idAviso, function (err, task) {
    if (!err) {
      aviso = task;
      fecha = moment(aviso.fecha);
      fechaSpain = fecha.format("DD-MM-YYYY");
      aviso.fecha = fechaSpain;
      console.log(aviso);
      response.json({ taskModal: aviso });
    } else {
      console.log(err.message);
      response.status(400);
      response.end();
    }
  });
});

/* Post para modal Avisos en Perfil */
app.post("/modalAvisosPerfilUser", (request, response) => {
  let idUser = request.body.idUser;
  let rol = request.body.rol;
  let aviso = null;
  let fecha = null;
  let fechaSpain = null;
  if (rol === "PAS") {
    daoA.avisosPerfilTec(
      idUser,
      function (err, totalAvisos, nSuge, nInci, nFeli) {
        if (!err) {
          response.json({
            totalAvisos: totalAvisos,
            nSuge: nSuge,
            nInci: nInci,
            nFeli: nFeli,
          });
        } else {
          console.log(err.message);
          response.status(400);
          response.end();
        }
      }
    );
  } else {
    daoA.avisosPerfil(idUser, function (err, totalAvisos, nSuge, nInci, nFeli) {
      if (!err) {
        response.json({
          totalAvisos: totalAvisos,
          nSuge: nSuge,
          nInci: nInci,
          nFeli: nFeli,
        });
      } else {
        console.log(err.message);
        response.status(400);
        response.end();
      }
    });
  }
});

/* Post para asignar un aviso a un tecnico */
app.post("/asignarAviso", (request, response) => {
  let nomTecnico = request.body.nomTecnico;
  let idAviso = request.body.idAviso;
  daoA.asignarTectoTask(nomTecnico,idAviso, function (err, idAviso) {
    if (!err) {
      console.log(idAviso);
      response.json({ idAviso: idAviso });
    } else {
      console.log(err.message);
      response.status(400);
      response.end();
    }
  });
});

/* Post para borrar un aviso */
app.post("/borrarAviso", (request, response) => {
  let commentTec = request.body.comTecnico;
  let nomTecnico = request.body.nameTecnico;
  let idAviso = request.body.idAviso;
  daoA.deleteTask(commentTec,nomTecnico,idAviso, function (err, idAviso) {
    if (!err) {
      console.log(idAviso);
      response.json({ idAviso: idAviso });
    } else {
      console.log(err.message);
      response.status(400);
      response.end();
    }
  });
});

/* Post para finalizar un aviso */
app.post("/finalizarAviso", (request, response) => {
  let commentTec = request.body.comTecnico;
  let idAviso = request.body.idAviso;
  daoA.completeTask(commentTec,idAviso, function (err, idAviso) {
    if (!err) {
      console.log(idAviso);
      response.json({ idAviso: idAviso });
    } else {
      console.log(err.message);
      response.status(400);
      response.end();
    }
  });
});

/* Post para borrar usuarios */
app.post("/borrarUser", (request, response) => {
  let idUserDeleted = request.body.idUserDeleted;
  let rolUser = request.body.rolUser;
  let nameTec = request.body.nameTec;
console.log(idUserDeleted);
console.log(rolUser);
console.log(nameTec);

  if (rolUser === 'PAS') {
    daoU.deleteUserTec(idUserDeleted,nameTec, function (err) {
      if (!err) {
        let correct = true;
        response.json({ correct: correct });
      } else {
        console.log(err.message);
        response.status(400);
        response.end();
      }
    });
  } else {
    console.log("Va a borrar un usuario");
    daoU.deleteUser(idUserDeleted,nameTec, function (err) {
      if (!err) {
        let correct = true;
        response.json({ correct: correct });
      } else {
        console.log(err.message);
        response.status(400);
        response.end();
      }
    });
  }
});

/* Conseguir imagen del usuario por BD */
app.get("/images/:id", (request, response) => {
  console.log("id User: " + request.params.id);
  let idUser = Number(request.params.id);
  if (isNaN(idUser)) {
    response.status(400);
    response.end("Petición incorrecta");
  } else {
    daoU.getUserImageName(
      idUser,
      function cb_getUserImageName(err, nameArchivo) {
        if (err) {
          console.log(err.message);
        } else if (nameArchivo[0].foto === null) {
          response.sendFile(
            path.join(__dirname, "public/images", "usuarioAnonimo.png")
          );
        } else {
          response.end(nameArchivo[0].foto);
        }
      }
    );
  }
});

/* GET para mis avisos de usuario */
app.get("/mainViewUser1.html", accessControl, (request, response) => {
  let idUsuario = response.locals.idUser;
  let fecha = null;
  let fechaSpain = null;
  daoA.misAvisos(idUsuario, function (err, Avisos) {
    if (!err) {
      Avisos.forEach((aviso) => {
        fecha = moment(aviso.fecha);
        fechaSpain = fecha.format("DD-MM-YYYY");
        aviso.fecha = fechaSpain;
      });
      response.render("mainViewUser1", { Avisos: Avisos });
    } else console.log(err.message);
  });
});

/* GET para historial de avisos de usuario */
app.get("/mainViewUser2.html", accessControl, (request, response) => {
  let idUsuario = response.locals.idUser;
  let fecha = null;
  let fechaSpain = null;
  daoA.historialAvisos(idUsuario, function (err, Avisos) {
    if (!err) {
      Avisos.forEach((aviso) => {
        fecha = moment(aviso.fecha);
        fechaSpain = fecha.format("DD-MM-YYYY");
        aviso.fecha = fechaSpain;
      });
      response.render("mainViewUser2", { Avisos: Avisos });
    } else console.log(err.message);
  });
});

/* GET para asignar y borrar avisos  (TECNICO)*/
app.get("/mainViewTec1.html", accessControl, (request, response) => {
  daoA.allAvisos(function (err, Avisos) {
    if (!err) {
      Avisos.forEach((aviso) => {
        fecha = moment(aviso.fecha);
        fechaSpain = fecha.format("DD-MM-YYYY");
        aviso.fecha = fechaSpain;
      });
      daoU.getAllTecs(function (err, Tecs) {
        if(!err){
          response.render("mainViewTec1", { Avisos: Avisos, Tecs: Tecs });
        }else{
          console.log(err.message);
        }
      })
    } else console.log(err.message);
  });
});

/* GET para finalizar y borrar avisos  (TECNICO)*/
app.get("/mainViewTec2.html", accessControl, (request, response) => {
  let idTecnico = response.locals.idUser;
  daoA.misAvisosTec(idTecnico, function (err, Avisos) {
    if (!err) {
      Avisos.forEach((aviso) => {
        fecha = moment(aviso.fecha);
        fechaSpain = fecha.format("DD-MM-YYYY");
        aviso.fecha = fechaSpain;
      });
      response.render("mainViewTec2", { Avisos: Avisos });
    } else console.log(err.message);
  });
});

/* GET para historial de avisos  (TECNICO)*/
app.get("/mainViewTec3.html", accessControl, (request, response) => {
  let idUsuario = response.locals.idUser;
  let fecha = null;
  let fechaSpain = null;
  daoA.historialAvisosTec(idUsuario, function (err, Avisos) {
    if (!err) {
      Avisos.forEach((aviso) => {
        fecha = moment(aviso.fecha);
        fechaSpain = fecha.format("DD-MM-YYYY");
        aviso.fecha = fechaSpain;
      });
      response.render("mainViewTec3", { Avisos: Avisos });
    } else console.log(err.message);
  });
});

/* GET para gestión de usuarioss  (TECNICO)*/
app.get("/mainViewTec4.html", accessControl, (request, response) => {
  daoU.getAllUsers(function (err, Usuarios) {
    if (!err) {
      Usuarios.forEach((usuario) => {
        fecha = moment(usuario.fecha);
        fechaSpain = fecha.format("DD-MM-YYYY");
        usuario.fecha = fechaSpain;
      });
      response.render("mainViewTec4", { Usuarios: Usuarios });
    } else console.log(err.message);
  });
});

/* Middleware 404 */
app.use(middleware404);

app.listen(config.portS, function (err) {
  if (err) {
    console.log("ERROR al iniciar el servidor");
  } else {
    console.log(`Servidor arrancado en el puerto ${config.portS}`);
  }
});