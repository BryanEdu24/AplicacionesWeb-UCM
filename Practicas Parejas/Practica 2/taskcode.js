"use strict";

let listaTareas = [
    {text: "Preparar prácticas AW", tags:["universidad","awt"]}
    , {text: "Mirar fechas congreso", done: true, tags:[]}
    , {text: "Ir al supermercado", tags: ["personal", "básico"]}
    , {text: "Jugar al fútbol", done: false, tags:["personal", "deportes"]}
    , {text: "Hablar con profesor", done: false, tags:["universidad", "tp2"]}
];

/*
Esta función devuelve un array con los textos de aquellas tareas de la lista de tareas tasks que no
estén finalizadas. Por ejemplo, la llamada:
getToDoTasks(listaTareas)
devuelve el siguiente array:
[ 'Preparar prácticas AW', 'Ir al supermercado', ‘Jugar al fútbol’, ‘Hablar con profesor’ ]
*/
function getToDoTasks(taskslist) {
	let result = taskslist.filter(function(tarea){
		return !tarea.done;
	});

    let pepe = taskslist.map(function(tarea) {
        return tarea.text;
    })
    return pepe;
}
console.log(getToDoTasks(listaTareas));


/*
Esta función devuelve un array que contiene las tareas del array tasks que contengan, en su lista
de etiquetas, la etiqueta pasada como segundo parámetro.
 */
/*
function findByTag(taskslist, tag){

}
*/

/*
Función getToDoTasks(tasks)


Función findByTag(tasks, tag)


Función findByTags(tasks, tags)
Esta función devuelve un array que contiene aquellas tareas del array tasks que contengan al
menos una etiqueta que coincida con una de las del array tags pasado como segundo parámetro.

Función countDone(tasks)
Esta función devuelve el número de tareas completadas en el array de tareas tasks pasado como
parámetro.
Por ejemplo, la llamada:
countDone(listaTareas)
devuelve 1.

Función createTask(texto)
Esta función recibe un texto intercalado con etiquetas, cada una de ellas formada por una serie de
caracteres alfanuméricos precedidos por el signo @ . Esta función debe devolver un objeto tarea
con su array de etiquetas extraídas de la cadena texto. Por otra parte, el atributo text de la tarea
resultante no debe contener las etiquetas de la cadena de entrada ni espacios en blanco de más.
*/