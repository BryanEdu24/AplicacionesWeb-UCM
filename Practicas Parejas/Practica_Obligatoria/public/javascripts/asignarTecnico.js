"use strict"
$(".asignarTecnicoModal button[type=submit]").on("click", function(){
    let nomTecnico = $("#seleccionTecnico option:selected").text();
    console.log(nomTecnico);
    let idAviso =  $("#idAvisoModal").text();
    console.log(idAviso);
    if (nomTecnico === "Técnicos disponibles..." || nomTecnico === "No hay tecnicos disponibles") {
        $("#falloAsignar").show();
    } else {
        $("#falloAsignar").hide();
        console.log("Puedes asignar");
        $.ajax({
            type: "POST",
            url: "/asignarAviso",
            contentType: "application/json",
            data: JSON.stringify({ nomTecnico: nomTecnico, idAviso: idAviso }),
            // En caso de éxito, mostrar el resultado
            // en el documento HTML
            success: function (data, textStatus, jqXHR) {
                console.log(textStatus);   
                location.reload()
                console.log("Asignado tecnico al aviso: "+ data.idAviso);                   
            },
            // En caso de error, mostrar el error producido
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Se ha producido un error: " + errorThrown);
            }
        });
    }
});
