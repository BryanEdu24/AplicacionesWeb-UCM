// app.js
const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
// Crear un servidor Express.js
const app = express();
// Crear un pool de conexiones a la base de datos de MySQL
// const pool = mysql.createPool(config.mysqlConfig);
// Crear una instancia de DAOTasks
// const daoT = new DAOTasks(pool);
//middleware static se 2añade a la página web
// const ficheroEstaticos = path.join(__dirname, "public");
// app.use(express.static(ficheroEstaticos));

//ejs
app.set("view engine", "ejs"); // Configuracion de ejs como motor de plantilas

/* //Definimos directorio de plantillas:
const dirPlantilla = path.join(__dirname, "views");
app.set("views", dirPlantilla); */


/* var usuarios = ["Elver Galarga", "Elver Gotas", "Mari Flor"]; */

app.get("/", function (request, reponse) {
    // reponse.status(200);
    reponse.render("prueba");
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
