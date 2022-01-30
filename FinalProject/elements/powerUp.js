import * as THREE from "../libs/three.module.js";
import { GLTFLoader } from '../libs/GLTFLoader.js';

let x, y, z, scene, radio, tipo, jugador, variable;
let mesh, arriba, dead, material;

export default class powerUp
{
    constructor(scene,x,z,tipo,jugador)
    {
        this.jugador = jugador;
        this.x = x;
        this.y = 1;
        this.z = z;
        while(this.x < 2.5 && this.x > -2.5 && this.z > -2.5 && this.z < 2.5)
        {
            this.x = Math.floor(Math.random() * ((this.jugador.getTamano()/2) - 1)) * (Math.round(Math.random()) * 2 - 1);
            this.z = Math.floor(Math.random() * ((this.jugador.getTamano()/2) - 1)) * (Math.round(Math.random()) * 2 - 1);
        }
        this.scene = scene;
        this.radio = 0.5;
        this.tipo = tipo;
        this.variable = variable;
        this.arriba = 1;
        this.dead = false;

        const geometry = new THREE.SphereGeometry( this.radio, 15, 10);
        this.mesh = new THREE.Group();
        if(this.tipo ==  "RedTam" || this.tipo == "AgrTam")
        {
            this.cargarModelo(this.mesh, 'models/ChangeTamano.gltf');
        }
        else if(this.tipo == "InvMov" || this.tipo == "CenPlay")
        {
            this.cargarModelo(this.mesh, 'models/cactus.gltf');
        }
        else if(this.tipo == "AddLiv" || this.tipo == "invCon")
        {
            this.cargarModelo(this.mesh, 'models/pizzas.gltf');
        }
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.position.z = this.z;
        this.scene.add(this.mesh);
    }

    cargarModelo(game, url)
    {
        let loader = new GLTFLoader();
        loader.load( url, function ( gltf ) {

            let model = gltf.scene;
            model.scale.set(1,1,1);
            game.add( model );

        }, undefined, function ( e ) {
            console.error( e );
        } );
    }

    kill()
    {
        this.mesh.parent.remove(this.mesh);
    }

    isDead()
    {
        return this.dead;
    }

    update()
    {
        if(!this.dead)
        {
            if(this.mesh.position.y > 1.5)
            {
                this.mesh.position.y = 1.5;
                this.arriba = -1;
            }
            if(this.mesh.position.y < 0.5)
            {
                this.mesh.position.y = 0.5;
                this.arriba = 1;
            }
            this.mesh.position.y += 0.01 * this.arriba;
            this.mesh.rotation.y += 0.01;
            if(Math.sqrt(Math.pow(this.x - this.jugador.getPosX(),2) + Math.pow(this.z - this.jugador.getPosZ(),2)) < this.radio + this.jugador.cgetClision())
            {
                this.dead = true;
                this.mesh.parent.remove(this.mesh);
                if(this.tipo == "AgrTam")
                {
                    this.jugador.agrTam();
                }
                if(this.tipo == "RedTam")
                {
                    this.jugador.redTam();
                }
                if(this.tipo == "invCon")
                {
                    this.jugador.invCont();
                }
                if(this.tipo == "InvMov")
                {
                    this.jugador.invMov();
                }
                if(this.tipo == "AddLiv")
                {
                    this.jugador.addLive();
                }
                if(this.tipo == "CenPlay")
                {
                    this.jugador.cenPlay();
                }
            }
        }
    }
}