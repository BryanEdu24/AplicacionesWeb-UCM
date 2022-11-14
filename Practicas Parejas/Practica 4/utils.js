"use strict";

let listaTareas = [
    {text: "Preparar prácticas AW", tags:["universidad","practica"]}
    , {text: "Mirar fechas congreso", done: true, tags:[]}
    , {text: "Ir al supermercado", tags: ["personal", "básico"]}
    , {text: "Jugar al fútbol", done: false, tags:["personal", "deportes"]}
    , {text: "Hablar con profesor", done: false, tags:["universidad", "tp2"]}
];

/* 1-Función getToDoTasks(tasks)
Esta función devuelve un array con los textos de aquellas tareas de la lista de tareas tasks que no
estén finalizadas.
*/
function getToDoTasks(taskslist) {
    let result = taskslist.map(function(tarea){
		if(!tarea.done){
			return tarea.text;
		}
	});

	let filtered = result.filter(function(tarea) {
		 return tarea !== undefined;
	});

	return filtered;
}
/* console.log("---------- 1. Función getToDoTasks ----------");
console.log(getToDoTasks(listaTareas), "\n"); */

/* 2-Función findByTag(tasks, tag)
Esta función devuelve un array que contiene las tareas del array tasks que contengan, en su lista
de etiquetas, la etiqueta pasada como segundo parámetro.
*/
function findByTag(taskslist, tag){
    let localed = taskslist.filter(function(tarea) {
        return tarea.tags.includes(tag);
	});

	return localed;
}
/* console.log("---------- 2. Función findByTag ----------");
console.log(findByTag(listaTareas, "personal"), "\n"); */

/* 3-Función findByTags(tasks, tags)
Esta función devuelve un array que contiene aquellas tareas del array tasks que contengan al
menos una etiqueta que coincida con una de las del array tags pasado como segundo parámetro.
*/
function findByTags(taskslist, tags) {
    let localed = taskslist.filter(function(tarea) {
		return tarea.tags.some(r => tarea.tags.includes(r));
	});

	return localed;
}
/* console.log("---------- 3. Función findByTags ----------");
console.log(findByTags(listaTareas, ["personal", "practica"]), "\n"); */

/* 4-Función countDone(tasks)
Esta función devuelve el número de tareas completadas en el array de tareas tasks pasado como
parámetro.
*/

function countDone(taskslist) {
	let result = taskslist.map(function(tarea){
		if(tarea.done){
			return tarea.text;
		}
	});

	let filtered = result.filter(function(tarea) {
		 return tarea !== undefined;
	});

   return filtered.reduce((ac,n) => ac+1, 0);
}

/* console.log("---------- 4. Función countDone ----------");
console.log(countDone(listaTareas), "\n"); */

/* 5-Función createTask(texto)
Esta función recibe un texto intercalado con etiquetas, cada una de ellas formada por una serie de
caracteres alfanuméricos precedidos por el signo @ . Esta función debe devolver un objeto tarea
con su array de etiquetas extraídas de la cadena texto. Por otra parte, el atributo text de la tarea
resultante no debe contener las etiquetas de la cadena de entrada ni espacios en blanco de más.
*/

function createTask(texto) {
	let tagsText = texto.match(/\@+\w+/g); // Array de tags
	let arrayTxtWords = texto.split(" "); // Array de palabras con @

	let textoFinal = arrayTxtWords.filter(item => item.startsWith("@") === false); // Array de solo texto

	tagsText = tagsText.map(function(tag){ // Array de tags sin @
		return tag.replace("@","");
	});

	return { text: textoFinal.join(" "), tags: tagsText };
}

/* console.log("---------- 5. Función createTask ----------");
console.log(createTask("Ir al medico @personal @salud"), "\n"); */

//CALLBACKS // Funciones callback de DATasks

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


module.exports = {
	getToDoTasks: getToDoTasks,
	findByTag: findByTag,
	findByTags: findByTags,
	countDone: countDone,
	createTask: createTask,
	cb_getAllTasks: cb_getAllTasks,
	cb_deleteCompleted: cb_deleteCompleted,
	cb_insertTask: cb_insertTask,
	cb_markTaskDone: cb_markTaskDone
}