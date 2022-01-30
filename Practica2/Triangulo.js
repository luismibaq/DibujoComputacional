class Triangulo {
    constructor(x1, x2, y1, y2, z1, z2, color, padre, contexto) {
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.z1 = z1;
        this.z2 = z2;

        this.contexto = contexto;

        this.hijos = [];
        this.padre = padre;

        this.color = color;
    }

    dibujar() {
        this.contexto.fillStyle = this.color;
        this.contexto.beginPath();
        this.contexto.moveTo(this.x1, this.x2);
        this.contexto.lineTo(this.y1, this.y2);
        this.contexto.lineTo(this.z1, this.z2);
        this.contexto.fill();
    }

    crearHijos(n) {
        if (n > 0) {
            let white = new Triangulo((this.y1 + this.z1) / 2, (this.y2 + this.z2) / 2, (this.x1 + this.y1) / 2, (this.x2 + this.y2) / 2, (this.x1 + this.z1) / 2, (this.x2 + this.z2) / 2, "white", this, this.contexto);
            white.dibujar();
            let T1 = new Triangulo(this.x1, this.x2, (this.x1 + this.y1) / 2, (this.x2 + this.y2) / 2, (this.x1 + this.z1) / 2, (this.x2 + this.z2) / 2, "white", this, this.contexto);
            T1.crearHijos(n - 1);
            let T2 = new Triangulo(this.y1, this.y2, (this.y1 + this.z1) / 2, (this.y2 + this.z2) / 2, (this.y1 + this.x1) / 2, (this.y2 + this.x2) / 2, "white", this, this.contexto);
            T2.crearHijos(n - 1);
            let T3 = new Triangulo(this.z1, this.z2, (this.y1 + this.z1) / 2, (this.y2 + this.z2) / 2, (this.z1 + this.x1) / 2, (this.z2 + this.x2) / 2, "white", this, this.contexto);
            T3.crearHijos(n - 1);
            this.hijos = [T1,T2,T3];
        }

    }
}
export { Triangulo };