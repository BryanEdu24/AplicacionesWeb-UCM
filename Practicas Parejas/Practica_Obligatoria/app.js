const config = require("./config");
const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");

const { check, validationResult } = require("express-validator");
const multer = require("multer");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const registerRouter = require('./routes/register')
const DAOUsers = require('./DAOUsers');
const { request } = require("http");
const { response } = require("express");

const MySQLStore = mysqlSession(session);
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

const checkContrasenias = (contrasenia, contrasenia2) => {
  if (contrasenia.equals(contrasenia2)) {
    return true;
  } else {
    return false;
  }
};

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
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(middlewareSession);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware para gestionar los mensajes flash
app.use(mensajeFlash);


app.use('/', indexRouter);
app.use('/users', usersRouter);



/* Post de iniciar sesión */
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


app.get("/uploads/:id", (request, response) => {
  response.status(400);
  console.log("userEmail: " + request.params.id);
  let emailUser = request.params.id;
  daoU.getUserImageName(emailUser, function cb_getUserImageName (err, nameArchivo){
           if(err){
             console.log(err.message);
           }else if (nameArchivo[0].img === null) {
               response.sendFile(path.join(__dirname, 'public/uploads', 'usuarioAnonimo.png'));
               
           }else {
            let imagen =  nameArchivo[0].img;
            response.sendFile(path.join(__dirname, 'public/uploads', imagen));
           }
  }) 
});

/* Para cerrar sesión */
app.get("/logOut.html", (request, response) => {
  request.session.destroy();
  response.redirect("/");
});

// app.use('/registerView.html', registerRouter);
/* Renderizar la página de registrarse */
app.get('/registerView.html', function(req, res, next) {
  res.render('registerView');
});

/* Carpeta de destino donde guardar imagenes */
var almacen = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});
const multerFactory = multer({ storage: almacen });

app.post("/procesar_formulario.html"
        , multerFactory.single('foto'), function(request, response) {
    let nombreFichero = null;
    if (request.file.filename) { // Si se ha subido un fichero
        console.log(`Nombre del fichero: ${request.file.originalname}` );
        console.log(`Nombre del fichero2: ${request.file.filename}` );
        console.log(`Fichero guardado en: ${request.file.path}`);
        console.log(`Tamaño: ${request.file.size}`);
        console.log(`Tipo de fichero: ${request.file.mimetype}`);
        nombreFichero = request.file.originalname;
    }
    response.render("infoForm", {
      correo: request.body.correo,
      contrasenia: request.body.contrasenia,
      nombre: request.body.NombreUsuario,
      opcion: request.body.opciones,
      tecnico: (request.body.tecnico === "ON" ? "SI­" : "No"),
      numEmpleado: request.body.numEmpleado
  });
    
});

/* Post del register */
app.post("/registerPost.html", 
  multerFactory.single('foto'),
  // El correo ha de ser una dirección de correo válida.
  check("correo","Dirección de correo no válida").isEmail(),
  // Comprobación de contraseña
  /* check("contrasenia","La contraseña no tiene entre 8 y 16 caracteres").isLength({ min: 8, max: 16 }),
  check("contrasenia", "Contraseña no contiene al menos un dígito").matches(/[0-9]+/),
  check("contrasenia", "Contraseña no contiene al menos una minuscula").matches(/[a-z]+/),
  check("contrasenia", "Contraseña no contiene al menos una mayuscula").matches(/[A-Z]+/),
  check("contrasenia", "Contraseña no contiene al menos un caracter no alfanumérico").matches(/[^a-zA-Z0-9]+/), */
/*check("numEmpleado", "Numero de empleado formato erroneo").matches(/\d{4}\-[a-z]{3}/), */
  (request, response) => {
  const errors = validationResult(request);
  if (errors.isEmpty()) {
      console.log("Todo correcto");
      console.log(request.body);

      if (request.file) {
        let imagen = request.file.buffer ;
      }
      if (request.file) {
        if (request.file.filename) { // Si se ha subido un fichero
          console.log(`Nombre del fichero: ${request.file.originalname}` );
          console.log(`Nombre del fichero2: ${request.file.filename}` );
          console.log(`Fichero guardado en: ${request.file.path}`);
          console.log(`Tamaño: ${request.file.size}`);
          console.log(`Tipo de fichero: ${request.file.mimetype}`);
        }
      }       
      response.render("infoForm", {
        correo: request.body.correo,
        contrasenia: request.body.contrasenia,
        nombre: request.body.NombreUsuario,
        opcion: request.body.opciones,
        tecnico: (request.body.tecnico === "ON" ? "SI­" : "No"),
        numEmpleado: request.body.numEmpleado
    });
  } else {
      console.log(request.body.contrasenia);
      console.log(request.body.contrasenia2);
      response.render("registerViewErrors", {errores: errors.array()});
  }
  response.end();
});

app.listen(config.portS, function(err) {
  if (err) {
  console.log("ERROR al iniciar el servidor");
  }
  else {
  console.log(`Servidor arrancado en el puerto ${config.portS}`);
  }
 });

