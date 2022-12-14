function buscador(lupa) {
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