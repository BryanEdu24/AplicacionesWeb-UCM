"use strict"
    $(document).ready(function() {
        // Cada vez que se pulse el botón de 'Enviar'
        $(".clickModalVisualizar").on("click", function() {
            // Obtener el valor contenido en el cuadro de texto. Ir al padre navego
            let valor = $($($(this).parents("tr")).find("td")).find("h1").eq(0).html();
            console.log($($($(this).parents("tr")).find("td")).find("h1").eq(0).html());
            // Realizar la petición al servidor
            // Método parametrizado
         $.ajax({
                type: "POST",
                url: "/modalAviso",
                contentType: "application/json",
                data: JSON.stringify({ idAviso: valor }),
                // En caso de éxito, mostrar el resultado
                // en el documento HTML
                success: function (data, textStatus, jqXHR) {
                    console.log(textStatus);
                    let taskDevuelto = data.taskModal;
                    console.log(taskDevuelto.tipo); 
                    $("#idAvisoModal").text(taskDevuelto.idAviso);
                    $("#tipoAvisoModal").text(taskDevuelto.tipo);
                    $("#fechaAvisoModal").text(taskDevuelto.fecha);
                    let observacionesFinal = taskDevuelto.observaciones.replace(/\n/g,'<br/>');
                    $("#observacionesAvisoModal").html(observacionesFinal);
                    $("#creadoPorModalAviso").text(taskDevuelto.creadoPor);

                    if (taskDevuelto.asignado === 1) {
                        if (taskDevuelto.eliminadoPor === null) {
                            let comentarioFinal = taskDevuelto.comentario.replace(/\n/g,'<br/>');
                            $("#comentarioAvisoModal").html(comentarioFinal);
                        } else {
                            let text = 'Este aviso ha sido eliminado por el técnico '+ 
                            taskDevuelto.eliminadoPor + `\n`;
                            let nuevoTexto = text.replace(/\n/g,'<br/>');
                            console.log(nuevoTexto);
                            let comentarioFinal = taskDevuelto.comentario.replace(/\n/g,'<br/>');
                            $("#comentarioAvisoModal").html(nuevoTexto + comentarioFinal);
                        }
                    }else{
                        $("#comentarioAvisoModal").text("Aún no tiene comentarios del técnico en este aviso");
                    }
                    $("#subtipoAvisoModal").text(taskDevuelto.subtipo);
                    $("#categoriaAvisoModal").text(taskDevuelto.categoria);
                    if (taskDevuelto.tipo ==='Felicitación' ) {
                        $("#subtipoAvisoModal").text(taskDevuelto.categoria);
                        $("#categoriaAvisoModal").hide();
                    }                   

                },
                // En caso de error, mostrar el error producido
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Se ha producido un error: " + errorThrown);
                }
            });
        }); 
    });
