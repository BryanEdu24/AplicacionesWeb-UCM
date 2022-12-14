function buscador2(lupa) {
    if (document.getElementById("checkboxUsers").checked) {
        console.log("Ha pulsado a usuarios");
        let varInput = $("#inputBuscador").val().trim().toLowerCase(); // Pillamos el valor del Input (trim para quitar espacios
        console.log("El mensaje de el buscar:" + varInput);
        $.ajax({
            type: "POST",
            url: "/busqUsers",
            contentType: "application/json",
            data: JSON.stringify({
            nombreUsuario: varInput,
            }),
            // En caso de éxito, mostrar el resultado
            // en el documento HTML
            success: function (data, textStatus, jqXHR) {
                console.log(textStatus);
                let Usuarios = data.Usuarios;
                let usuario = data.usuario;
                let i=0;
                let j = 0;
                let usersFinds = [];
                console.log("Tamaño usuarios: "+ (Usuarios.length-1));
                while (i < (Usuarios.length)) {
                    console.log(Usuarios[i]);
                    let usuarioBuscar = Usuarios[i].nombre.toLowerCase();
                    if (usuarioBuscar.includes(usuario) ) {
                        console.log("Se ha encontrado al usuario:" + usuarioBuscar);
                        usersFinds[j] = Usuarios[i].nombre + "<br>";
                        j++;
                    }else{
                        console.log("No se ha encontrado al usuario");
                    } 
                    i++;
                }
                $("#modalUsuariosEncontrados").modal('show');
                if (usersFinds.length === 0) {
                    $("#nombreFindModal").text("No se han encontrado usuarios");
                } else {
                    $("#nombreFindModal").html(usersFinds);
                }
            },
            // En caso de error, mostrar el error producido
            error: function (jqXHR, textStatus, errorThrown) {
            // alert("Se ha producido un error: " + errorThrown);
            },
        });
    }
    else{
        console.log("no ha pulsado usuarios");
        let varInput = $('#inputBuscador').val().trim().toLowerCase(); // Pillamos el valor del Input (trim para quitar espacios)
        $('#tablaTec').find('tr').each(i => { // Recorro la tabla por cada tr
            if (i === 0) {
                //Ignora caso de 
            }
            else {
                $('#tablaTec').find('tr').eq(i).show();
                if (($($('#tablaTec').find('tr').eq(i)).find('td').eq(3).html().toLowerCase()).includes(varInput)) { // Devuelve lo que hay dentro del td (2 por la posicion del texto) y comprobamos con includes si contiene lo de varInput
                    // Nada
                }
                else {
                    $('#tablaTec').find('tr').eq(i).hide();
                }
            }
        });
    }
    }