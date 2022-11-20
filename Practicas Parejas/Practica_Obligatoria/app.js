const config = require("./config");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/procesar_post.html", (request, response) => {
      console.log(request.body);
      response.render("index", {
        correo: request.body.correo,
        contrasenia: request.body.contrasenia
      });
      response.end();
});


app.listen(config.port, function(err) {
  if (err) {
  console.log("ERROR al iniciar el servidor");
  }
  else {
  console.log(`Servidor arrancado en el puerto ${config.port}`);
  }
 });

