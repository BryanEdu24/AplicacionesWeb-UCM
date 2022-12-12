"use strict"
$("#eliminarAvisoModal button[type=submit]").on("click", function(){
    let comTecnico = $("#comentarioBorrarAviso").val();
    console.log(comTecnico);
    let nameTecnico =  $("#nombreUserNavBar").text();
    console.log(nameTecnico);
    let idAviso =  $("#idAvisoModalBorrar").text();
    console.log(idAviso);
    $.ajax({
        type: "POST",
        url: "/borrarAviso",
        contentType: "application/json",
        data: JSON.stringify({ comTecnico: comTecnico, nameTecnico: nameTecnico, idAviso: idAviso  }),
        // En caso de éxito, mostrar el resultado
        // en el documento HTML
        success: function (data, textStatus, jqXHR) {
            console.log(textStatus);   
            location.reload()
            console.log("Aviso borrado exitosamente: "+ data.idAviso);                   
        },
        // En caso de error, mostrar el error producido
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Se ha producido un error: " + errorThrown);
        }
    });
});