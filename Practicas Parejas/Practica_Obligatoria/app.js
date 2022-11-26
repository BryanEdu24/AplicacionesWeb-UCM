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
// Crear una instancia de DAOUsers
const daoU = new DAOUsers(pool);

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


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }))

app.use(middlewareSession);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/*
 * Middleware para gestionar los mensajes flash
 */
app.use(mensajeFlash);


app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/imageUser', imageUserRouter);

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
            response.locals.userEmail = request.body.correo;
            response.render("index", {
              correo: request.body.correo,
              contrasenia: request.body.contrasenia,
            });
          }else{
            response.status(500);
            response.setFlash("Usuario y/o contraseña incorrectos");
            response.redirect("/");
          }
        });
});

app.get("/logOut.html", (request, response) => {
  request.session.destroy();
  response.redirect("/");
});

app.get("/images/:id", (request, response) => {
  response.status(400);
  console.log("userEmail: " + request.params.id);
  let emailUser = request.params.id;
  daoU.getUserImageName(emailUser, function cb_getUserImageName (err, nameArchivo){
           if(err){
             console.log(err.message);
           }else if (nameArchivo[0].img === null) {
               response.sendFile(path.join(__dirname, 'public/images', 'usuarioAnonimo.png'));
               
           }else {
            let imagen =  nameArchivo[0].img;
            response.sendFile(path.join(__dirname, 'public/images', imagen));
           }
  }) 
});



app.listen(config.portS, function(err) {
  if (err) {
  console.log("ERROR al iniciar el servidor");
  }
  else {
  console.log(`Servidor arrancado en el puerto ${config.portS}`);
  }
 });

 //Naa no te preocupes, voy ahora a probarlo 
