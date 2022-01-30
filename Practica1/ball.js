class ball
{
    constructor(x,y,radio,color,barLeft,barRight)
    {
        this.x = x;
        this.y = y;

        this.radio = radio;
        this.color = color;

        this.up = true;
        this.right = false;

        this.barLeft = barLeft;
        this.barRight = barRight;

        this.puntuacionL = 0;
        this.puntuacionR = 0;
    }

    jugador2()
    {
        let n = Math.random();
        if(n > 0.2){
            if(this. y > this.barRight.y){
                this.barRight.y += n *5;
            }
            if(this. y < this.barRight.y){
                this.barRight.y -= n*5;
            }
        }
        
    }

    update()
    {

        if(this.up) this.y -= 3;
        else this.y += 3;
        if(this.right) this.x += 3;
        else this.x -= 3;

        if(this.y < 0){
            this.y = 0;
            this.up = false;
        } 
        if(this.y > 300 - this.radio){
            this.y = 300 - this.radio;
            this.up = true;
        } 

        this.jugador2();

        if(this.barLeft.x < this.x - this.radio && this.x - this.radio < this.barLeft.x + this.barLeft.width && this.barLeft.y < this.y && this.y < this.barLeft.y + this.barLeft.height){
            this.x = this.barLeft.x + this.barLeft.width + this.radio + 1;
            this.right = true;
        } 
        if(this.x < 0){
            console.log("L:" + this.puntuacionL);
            this.puntuacionL += 1;
            this.x = 250;
            this.right = true;
        }

        if(this.x + this.radio > this.barRight.x && this.x + this.radio < this.barRight.x + this.barRight.width && this.barRight.y < this.y && this.y < this.barRight.y + this.barRight.height){
            this.x = this.barRight.x - this.radio - 1;
            this.right = false;
        }

        if(this.x > 500){
            console.log("R:" + this.puntuacionR);
            this.puntuacionR += 1;
            this.x = 250;
            this.right = false;
        }
        if(this.puntuacionR > 7 || this.puntuacionL > 7)
        {
            this.puntuacionR = 0;
            this.puntuacionL = 0;
        }
    }

    draw(contexto)
    {
        contexto.fillStyle = this.color;
        contexto.beginPath();
        contexto.arc(this.x,this.y,this.radio,0,Math.PI * 2);
        contexto.fill();
    }
}

export {ball};