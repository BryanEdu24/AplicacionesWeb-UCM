function buscador2(lupa) {
  if (document.getElementById("checkboxUsers").checked) {
    let varInput = $("#inputBuscador").val().trim().toLowerCase(); // Pillamos el valor del Input (trim para quitar espacios
    console.log("El mensaje de el buscar:" + varInput);
      $.ajax({
        type: "POST",
        url: "/buscarUsuario",
        contentType: "application/json",
        data: JSON.stringify({
          nombreUsuario: varInput,
        }),
        // En caso de éxito, mostrar el resultado
        // en el documento HTML
        success: function (data, textStatus, jqXHR) {
          console.log(textStatus);
          location.reload();
          let usuarios = data.Users;
          console.log(usuarios);
          let encontrado = false;
          let i=0;
          while (!encontrado) {
            let usuarioBuscar = usuarios[i].nombre.toLowerCase();
            if (usuarioBuscar === varInput) {
                console.log("Se ha encontrado al usuario:" + usarioBuscar);
            }else i++;
          }
        },
        // En caso de error, mostrar el error producido
        error: function (jqXHR, textStatus, errorThrown) {
          alert("Se ha producido un error: " + errorThrown);
        },
      });
  }
}
