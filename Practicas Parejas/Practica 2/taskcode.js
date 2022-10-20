"use strict";

let listaTareas = [
    {text: "Preparar prácticas AW", tags:["universidad","practica"]}
    , {text: "Mirar fechas congreso", done: true, tags:[]}
    , {text: "Ir al supermercado", tags: ["personal", "básico"]}
    , {text: "Jugar al fútbol", done: false, tags:["personal", "deportes"]}
    , {text: "Hablar con profesor", done: false, tags:["universidad", "tp2"]}
];

/* 1.
Esta función devuelve un array con los textos de aquellas tareas de la lista de tareas tasks que no
estén finalizadas.
*/
function getToDoTasks(taskslist) {
	/*let result = taskslist.filter(function(tarea){
		return !tarea.done;
	});

    let pepe = taskslist.map(function(tarea) {
        return tarea.text;
    })
    return pepe;*/
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
// console.log(getToDoTasks(listaTareas));


/* 2.
Esta función devuelve un array que contiene las tareas del array tasks que contengan, en su lista
de etiquetas, la etiqueta pasada como segundo parámetro.
*/+
function findByTag(taskslist, tag){
    let localed = taskslist.filter(function(tarea) {
        return tarea.tags.includes(tag);
	});

	return localed;
}
// console.log(findByTag(listaTareas, "personal"));

/* 3.
Esta función devuelve un array que contiene aquellas tareas del array tasks que contengan al
menos una etiqueta que coincida con una de las del array tags pasado como segundo parámetro.
*/
function findByTags(taskslist, tags) {
    let localed = taskslist.filter(function(tarea) {
		return tarea.tags.some(r => tarea.tags.includes(r));
	});

	return localed;
}
// console.log(findByTags(listaTareas, ["personal", "practica"]));

/* 4.
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
// console.log(countDone(listaTareas));

/* 5.
Esta función recibe un texto intercalado con etiquetas, cada una de ellas formada por una serie de
caracteres alfanuméricos precedidos por el signo @ . Esta función debe devolver un objeto tarea
con su array de etiquetas extraídas de la cadena texto. Por otra parte, el atributo text de la tarea
resultante no debe contener las etiquetas de la cadena de entrada ni espacios en blanco de más.
*/
function createTask(texto) {
	let newText = palabras.filter(function(array) {
		//
	});
}
console.log(createTask(texto));

/*
1-Función getToDoTasks(tasks)

2-Función findByTag(tasks, tag)

3-Función findByTags(tasks, tags)

4-Función countDone(tasks)

5-Función createTask(texto)
*/