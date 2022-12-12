"use strict"
    $(document).ready(function() {
        // Cada vez que se pulse el botón de 'Enviar'
        $(".clickModalBorrar").on("click", function() {
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
                    if (taskDevuelto.tipo ==='Sugerencia' ) {
                        $("#subtipoAvisoModalBorrar").text(taskDevuelto.subtipo);
                        $("#subtipoAvisoModalBorrar").show();
                    }else if (taskDevuelto.tipo ==='Incidencia') {
                        $("#subtipoAvisoModalBorrar").text(taskDevuelto.subtipo);
                        $("#subtipoAvisoModalBorrar").show();
                    } else {
                        $("#subtipoAvisoModalBorrar").hide()
                    }
                    $("#idAvisoModalBorrar").text(taskDevuelto.idAviso);
                    $("#tipoAvisoModalBorrar").text(taskDevuelto.tipo);
                    $("#categoriaAvisoModalBorrar").text(taskDevuelto.categoria);
                    $("#fechaAvisoModalBorrar").text(taskDevuelto.fecha);
                    $("#observacionesAvisoModalBorrar").text(taskDevuelto.observaciones);
                    $("#creadoPorModalAvisoBorrar").text(taskDevuelto.creadoPor);
                },
                // En caso de error, mostrar el error producido
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Se ha producido un error: " + errorThrown);
                }
            });
        }); 
    });
