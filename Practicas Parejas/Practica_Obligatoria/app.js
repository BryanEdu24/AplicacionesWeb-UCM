const config = require("./config");
const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const DAOUsers = require('./DAOUsers');
const { request } = require("http");
const { response } = require("express");

const app = express();
//pool de conexiones
const pool = mysql.createPool(config.mysqlConfig);
const sessionStore = new MySQLStore(config.mysqlConfig);
const middlewareSession = session({
  saveUninitialized: false,
  secret: "awbueno",
  resave: false,
  store: sessionStore
});
// Crear una instancia de DAOTasks
const daoU = new DAOUsers(pool);

app.use(middlewareSession);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/*
 * Middleware para gestionar los mensajes flash
 */
app.use((request, response, next) => {
  response.setFlash = (str) => {
      request.session.flashMessage = str;
  }
  response.locals.getFlash = () => {
      let mensaje = request.session.flashMessage;
      delete request.session.flashMessage;
      return mensaje;
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));



app.post("/procesar_post.html", (request, response) => {
      daoU.isUserCorrect(request.body.correo, 
        request.body.contrasenia, function (err, ok){
          if (err){
            response.status(500);
            response.setFlash("Error interno de acceso a la base de datos");
            response.redirect("/");
          }else if (ok){
            response.status(500);
            response.render("index", {
              correo: request.body.correo,
              contrasenia: request.body.contrasenia
            });
          }else{
            response.status(500);
            response.setFlash("Usuario y/o contraseña incorrectos");
            response.redirect("/");
          }
        });
});


app.listen(config.portS, function(err) {
  if (err) {
  console.log("ERROR al iniciar el servidor");
  }
  else {
  console.log(`Servidor arrancado en el puerto ${config.portS}`);
  }
 });

