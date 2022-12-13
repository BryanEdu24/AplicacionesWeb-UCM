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
                    console.log(taskDevuelto); 

                    $("#idAvisoModal").text(taskDevuelto.idAviso);
                    $("#tipoAvisoModal").text(taskDevuelto.tipo);
                    $("#fechaAvisoModal").text(taskDevuelto.fecha);
                    let observacionesFinal = taskDevuelto.observaciones.replace(/\n/g,'<br/>');
                    $("#observacionesAvisoModal").html(observacionesFinal);
                    $("#creadoPorModalAviso").text(taskDevuelto.creadoPor); 
                    if (taskDevuelto.tipo ==='Felicitación' ) {
                        $("#subtipoAvisoModal").text("Tipo de Felicitación");
                        $("#categoriaAvisoModal").text(taskDevuelto.categoria);
                    }  else{
                        $("#subtipoAvisoModal").text(taskDevuelto.subtipo);
                        $("#categoriaAvisoModal").text(taskDevuelto.categoria); 
                    }      
                },
                // En caso de error, mostrar el error producido
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Se ha producido un error: " + errorThrown);
                }
            });
        }); 
    });
