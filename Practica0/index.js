function main() {
    // Obtener el contexto

    const canvas = document.getElementById("htmlCanvas");
    if (!canvas) {
        console.log("Error al cargar el canvas");
        return;
    }
    const contexto = canvas.getContext("2d");

    //Mandar a llamar las funciones del api

    const width = canvas.width, height = canvas.height;
    const w = 100, h = 100;
    const x = (width - w) / 2, y = (height - h) / 2;

    drawRect(contexto, "green", x, y, w, h);
    drawRect(contexto, "rgba(50,100,255,0.5)", x - 50, y - 50, w, h);
}

function drawRect(contexto, color, x, y, w, h) {
    contexto.fillStyle = color;
    contexto.fillRect(x, y, w, h);
}
main();