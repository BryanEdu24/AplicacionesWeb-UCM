function buscador2(lupa) {
    if (document.getElementById("checkboxUsers").checked) {
        let varInput = $('#inputBuscador').val().trim().toLowerCase(); // Pillamos el valor del Input (trim para quitar espacios
        console.log("El mensaje de el buscar:" + varInput);
        $('#tablaTec').find('tr').each(i => { // Recorro la tabla por cada tr
            if (i === 0) {
                //Ignora caso de 
            }
            else {
                $('#tablaTec').find('tr').eq(i).show();
                console.log($('#tablaTec').find('tr').eq(i).show());
                if (($($('#tablaTec').find('tr').eq(i)).find('td').eq(2).html().toLowerCase()).includes(varInput)) { // Devuelve lo que hay dentro del td (2 por la posicion de los usuarios) y comprobamos con includes si contiene lo de varInput
                    // Nada
                }
                else {
                    $('#tablaTec').find('tr').eq(i).hide();
                }
            }
        });
    }
}