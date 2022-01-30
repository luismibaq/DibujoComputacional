import {bar} from "./bar.js";
import {ball} from "./ball.js";

function update(contexto,barLeft, barRight,bola,contador)
{
    requestAnimationFrame(()=> update(contexto, barLeft,barRight,bola, contador));
    contador += 1;
    contexto.clearRect(0,0,500,300);
    contexto.font = "bold 80px sans-serif";
    
    contexto.fillText(bola.puntuacionR.toString(),202,70);
    contexto.fillText(bola.puntuacionL.toString(),255,70);
    contexto.strokeStyle = 'white';
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.moveTo(250,15);
    contexto.lineTo(250,70);
    contexto.stroke();

    barRight.update();
    barLeft.update();
    bola.update();

    bola.draw(contexto);
    barRight.draw(contexto);
    barLeft.draw(contexto);

    console.log(contador);
}

function main() 
{
    // Obtener el contexto
    const canvas = document.getElementById("htmlCanvas");
    if (!canvas) {
        console.log("Error al cargar el canvas");
        return;
    }
    const contexto = canvas.getContext("2d");
    
    let contador = 0;
    let barLeft = new bar(20,150,20,60,"white","w","s");
    let barRight = new bar(460,20,20,60,"white","o","l");
    let bola = new ball(250,150,10,"white",barLeft,barRight);
    
    update(contexto, barLeft,barRight,bola, contador);
}

main();