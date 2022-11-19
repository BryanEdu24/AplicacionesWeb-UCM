const config = require("./config");
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//las flash no pueden funcionar sin sesiones
/* function flashMiddleware(request, response, next){
  response.setFlash = function(msg){
    request.session.flashMsg = msg;
  };

  response.locals.getAndClearFlash = function(){
    let msg = request.session.flashMsg;
    delete request.session.flashMsg;
    return msg;
  };

  next();
}
 */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//las flash no pueden funcionar sin sesiones
/* app.use(flashMiddleware); */
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

/*
 * Middleware para la carga del atributo request.session 
 */
app.use(session({
  secret: "claveuser",
  resave: false,
  saveUninitialized: false
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*---------- MÉTODOS POST ----------*/
app.post("/loginView", (request, response) => {
  console.log("Entramos loggeado");
  try {
    if( request.body.usuario === ""){
      response.setFlash("No has especificado ninguna dato");
    }else{
      response.setFlash("Has especificado datos");
      let usuario = {
        correo: request.body.usuario.correo,
        contraseña: request.body.usuario.contraseña
      }
      console.log(usuario);
    }

  } catch(error) {
    response.render("index", {usuarios: usuario});
  }

});

app.listen(config.port, function(err) {
  if (err) {
  console.log("ERROR al iniciar el servidor");
  }
  else {
  console.log(`Servidor arrancado en el puerto ${config.port}`);
  }
 });

module.exports = app;
