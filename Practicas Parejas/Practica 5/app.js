// app.js
const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const multer = require("multer");
const fs = require("fs");
const DAOUsers = require('./DAOUsers');

const MySQLStore = mysqlSession(session);
// Crear un servidor Express.js
const app = express();
// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const sessionStore = new MySQLStore(config.mysqlConfig);
const middlewareSession = session({
    saveUninitialized: false,
    secret: "awbueno",
    resave: false,
    store: sessionStore
});
// Crear una instancia de DAOUsers
const daoU = new DAOUsers(pool);
//Middleware mensajes flash
function mensajeFlash(request, response, next) {
    response.setFlash = (str) => {
        request.session.flashMessage = str;
    }
    response.locals.getandClearFlash = () => {
        let mensaje = request.session.flashMessage;
        delete request.session.flashMessage;
        return mensaje;
    }
    next();
};

//Middleware sesionCurrent
function accessControl(request, response, next) {
    console.log("Log en middleware: "+request.session.currentUser );
    if (request.session.currentUser) {
        console.log("El currentUser no es undefined: "+request.session.currentUser );
        response.locals.userEmail = request.session.currentUser;
        next();
    }else{
        console.log("El currentUser es undefined: "+request.session.currentUser );
        response.status(500);
        response.redirect("/");  
    }
};
// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);
//middleware static se añade a la página web
const ficheroEstaticos = path.join(__dirname, "public");
app.use(express.static(ficheroEstaticos));
app.use(express.urlencoded({extended: true}));
app.use(middlewareSession);
app.set("view engine", "ejs"); // Configuracion de ejs como motor de plantilas
const dirPlantilla = path.join(__dirname, "views");
app.set("views", dirPlantilla);
// Middleware para gestionar los mensajes flash
app.use(mensajeFlash);

var almacen = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'public', 'profile_imgs'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const multerFactory = multer({ storage: almacen });

let taskList,tagsList;
daoT.getAllTasks('felipe.lotas@ucm.es',function cb_getAllTasks(err, tasks,tags){
    if (err) {
    console.log(err.message);
    } else {
        taskList = tasks;
        tagsList = tags;
    }
});

//Abrir login
app.get('/', function (request,response,next){
    request.session.currentUser = undefined;
    console.log(request.session.currentUser);
    response.render('login');
});

/* Ruta para abrir la página tasks del usuario */
app.get("/tasks.html",accessControl ,function (req, response){
    console.log("Estamos en el get de tasks.html");
    response.status(200);
    response.render("tasks");
});

/* Para cerrar sesión */
app.get("/logOut.html", accessControl, (request, response) => {
    request.session.destroy();
    response.redirect("/");
});

//Post de iniciar sesión
app.post("/procesar_post.html", (request, response) => {
    daoU.isUserCorrect(request.body.correo,
      request.body.contrasenia, function cb_isUserCorrect(err, ok){
        if (err){
          console.log(err.message);
          response.setFlash("Error interno de acceso a la base de datos");
          response.redirect("/");
        }else if (ok){
          response.status(500);
          request.session.currentUser = request.body.correo;
          console.log("Log en post: "+request.session.currentUser );
        //   response.locals.userEmail = request.body.correo;
          response.redirect("/tasks.html");
        }else{
          response.status(500);
          response.setFlash("Usuario y/o contraseña incorrectos");
          response.redirect("/");
        }
      });
  });

/* Conseguir imagen del usuario por BD */
app.get("/profile_imgs/:email", (request, response) => {
    console.log("Email User: " + request.params.email);
    let emailUserBD = request.params.email;
        daoU.getUserImageName(emailUserBD, function cb_getUserImageName (err, nameArchivo){
        if(err){
          console.log(err.message);
        }else if (nameArchivo[0].img === null) {
            response.sendFile(path.join(__dirname, 'public/profile_imgs', 'usuarioAnonimo.png'));
        }else {
            response.sendFile(path.join(__dirname, 'public/profile_imgs', nameArchivo[0].img));
        }
      }) 
  });


// Arrancar el servidor
app.listen(config.port, function(err) {
 if (err) {
 console.log("ERROR al iniciar el servidor");
 }
 else {
 console.log(`Servidor arrancado en el puerto ${config.port}`);
 }
});
