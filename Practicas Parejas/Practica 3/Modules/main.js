"use strict";
const mysql = require("mysql");
const config = require("./config");
const DAOUsers = require("./DAOUsers");
const DAOTasks = require("./DAOTasks");

// Crear el pool de conexiones

const pool = mysql.createPool({
 host: config.host,
 user: config.user,
 password: config.password,
 database: config.database
});
let daoUser = new DAOUsers(pool);
let daoTask = new DAOTasks(pool);

// Definición de las funciones callback

// Funciones callback de DAOUsers

function cb_isUserCorrect(err, result){
    if (err) {
    console.log(err.message);
    } else if (result) {
    console.log("Usuario y contraseña correctos");
    } else {
    console.log("Usuario y/o contraseña incorrectos");
    }
}

function cb_getUserImageName(err, nameArchivo){
    if (err) {
    console.log(err.message);
    } else {
        console.log("Nombre Fichero: " + nameArchivo[0].img);
    }
}


// Funciones callback de DATasks

function cb_getAllTasks(err, tags){
    if (err) {
    console.log(err.message);
    } else {
        console.log("Etiquetas asociadas: \n");
        console.log(tags);
    }
}

function cb_insertTask(err){
    if (err) {
    console.log(err.message);
    } else{
        console.log("Tarea insertada correctamente");
    } 

}

function cb_markTaskDone(err){
    if (err) {
    console.log(err.message);
    } else{
        console.log("Tarea marcada como realizada");
    }
}

function cb_deleteCompleted(err){
    if (err) {
    console.log(err.message);
    }
}

var task = {
    texto: 'profe',
    hecho: 1,
    etiquetas: [{texto: 'Universidad'}, {texto: 'TP'}, {texto: 'Nueva'}]
};

// Uso de los métodos de las clases DAOUsers y DAOTasks
//daoUser.isUserCorrect('felipe.lotas@ucm.es','Fel',cb_isUserCorrect);
//daoUser.getUserImageName('felipe.lotas@ucm.es', cb_getUserImageName);
//daoTask.markTaskDone('1', cb_markTaskDone);
//daoTask.deleteCompleted('aitor.tilla@ucm.es', cb_deleteCompleted);
//daoTask.insertTask('aitor.tilla@ucm.es',task,cb_insertTask);
//daoTask.getAllTasks('aitor.tilla@ucm.es',cb_getAllTasks);