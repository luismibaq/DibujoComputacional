class bar
{
    constructor(x,y,width, height, color, upKey, downKey)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.up = false;
        this.down = false;
        this.color = color;

        this.upKey = upKey;
        this.downKey = downKey;

        this.keyEvents();
    }

    update()
    {
        if(this.up) this.y -= 5;
        if(this.down) this.y += 5;

        if(this.y < 0) this.y = 0;
        if(this.y > 300 - this.height) this.y = 300 - this.height;
    }

    keyEvents()
    {
        document.addEventListener("keydown", event => {
            if(event.key == this.upKey) this.up = true;
            if(event.key  == this.downKey) this.down = true;
        });
        document.addEventListener("keyup", event => {
            if(event.key == this.upKey) this.up = false;
            if(event.key == this.downKey) this.down = false;
        });
    }

    draw(contexto)
    {
        contexto.fillStyle = this.color;
        contexto.fillRect(this.x, this.y, this.width, this.height);
    }
}

export {bar};