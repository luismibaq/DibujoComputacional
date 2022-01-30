import * as THREE from "../libs/three.module.js";
import { GLTFLoader } from '../libs/GLTFLoader.js';

let x,y,z;
let geometry, material, mesh, playerPrefab, tamano;
let movimientox, movimientoy, movimientoz, velocidad, vida, arrVida, daño;
let jugador, scene;
let meshR, meshH;
let posToX, posToZ, steps;

export default class npc
{
    constructor(x,y,z,scene,jugador)
    {
        
        this.x = x;
        this.y = y;
        this.z = z;
        this.vida = 3;
        this.jugador = jugador;
        this.scene = scene;
        this.url = 'models/npc.gltf';
        this.tamano = this.jugador.tamano;
        this.meshR = 0.4;
        this.meshH = 1.5;
        this.arrVida = [];
        this.posToX = this.getRandomIntPos();
        this.posToZ = this.getRandomIntPos();
        
        while(this.x < 2.5 && this.x > -2.5 && this.z > -2.5 && this.z < 2.5)
        {
            this.x = Math.floor(Math.random() * ((this.jugador.getTamano()/2) - 1)) * (Math.round(Math.random()) * 2 - 1);
            this.z = Math.floor(Math.random() * ((this.jugador.getTamano()/2) - 1)) * (Math.round(Math.random()) * 2 - 1);
        }

        this.playerPrefab = new THREE.Group();
        
        this.cargarModelo(this.playerPrefab, this.url);
        this.playerPrefab.position.set(this.x,this.y,this.z);
        scene.add(this.playerPrefab);
        this.changeVida(this.vida);
    }

    cargarModelo(game, url)
    {
        let loader = new GLTFLoader();
        loader.load( url, function ( gltf ) {

            let model = gltf.scene;
            model.scale.set(0.02,0.02,0.02);
            model.rotation.y = -1.5;
            game.add( model );

        }, undefined, function ( e ) {
            console.error( e );
        } );
    }

    changeVida(cant)
    {
        this.vida = cant;
        this.arrVida.forEach(mesh => mesh.parent.remove( mesh ));
        this.arrVida = [];
        for(let i = 0; i < cant; i ++)
        {
            let geometry = new THREE.BoxGeometry(0.25,0.25,0.25);
            let material = new THREE.MeshLambertMaterial({ color: 0xcc0000});
            let mesh = new THREE.Mesh(geometry,material);
            this.playerPrefab.add(mesh);
            mesh.position.y = 1.75;
            mesh.position.z = - ((this.vida * 0.25)/2) + 0.125  + (i * 0.25);
            this.arrVida.push(mesh);
        }
    }

    getRandomIntPos()
    {
        let x = Math.floor(Math.random() * ((this.jugador.getTamano()/2) - 1)) * (Math.round(Math.random()) * 2 - 1);
        return x;
    }

    isDead()
    {
        if(this.vida <= 0)
        {
            return true;
        }
        return false;
    }

    kill()
    {
        this.playerPrefab.parent.remove(this.playerPrefab);
    }

    chocar()
    {
        this.z += this.z - this.jugador.getPosZ();
        this.x += this.x - this.jugador.getPosX();
        if(this.jugador.getTam() == "")
        {
            this.changeVida(this.vida - 1);
        }
        if(this.jugador.getTam() == "grande")
        {
            this.changeVida(this.vida - 2);
        }
    }

    update()
    {
        if(this.x == this.posToX && this.z == this.posToZ)
        {
            this.posToX = this.getRandomIntPos();
            this.posToZ = this.getRandomIntPos();
        }
        if(this.x != this.posToX)
        {
            this.movimientox = this.posToX - this.x;
            if(Math.abs(this.movimientox) > 0.05)
            {
                this.movimientox = (this.movimientox / Math.abs(this.movimientox)) / 20;
            }
        }
        else
        {
            this.movimientox = 0;
        }

        if(this.z != this.posToZ)
        {
            this.movimientoz = this.posToZ - this.z;
            if(Math.abs(this.movimientoz) > 0.05)
            {
                this.movimientoz = (this.movimientoz / Math.abs(this.movimientoz)) / 20;
            }
        }
        else
        {
            this.movimientoz = 0;
        }
        

        if(Math.sqrt(Math.pow(this.x - this.jugador.getPosX(),2) + Math.pow(this.z - this.jugador.getPosZ(),2)) < this.meshR + this.jugador.cgetClision())
        {
            this.jugador.chocar(this.x,this.z);
            this.chocar();
        }
        if(this.movimientox > 0)
        {
            if(this.movimientoz > 0)
            {
                this.playerPrefab.rotation.y = (Math.PI * 3)/4;
            }
            else if(this.movimientoz < 0)
            {
                this.playerPrefab.rotation.y =  Math.PI * 5 / 4;
            }
            else
            {
                this.playerPrefab.rotation.y = Math.PI;
            }
        }
        else if(this.movimientox < 0)
        {
            if(this.movimientoz > 0)
            {
                this.playerPrefab.rotation.y = Math.PI/4;
            }
            else if(this.movimientoz < 0)
            {
                this.playerPrefab.rotation.y = Math.PI * 7 / 4;
            }
            else
            {
                this.playerPrefab.rotation.y = 0;
            }
        }
        else if(this.movimientoz > 0)
        {
            this.playerPrefab.rotation.y = Math.PI/2;
        }
        else if(this.movimientoz < 0)
        {
            this.playerPrefab.rotation.y = (Math.PI*3)/2;
        }

        // Limite del mapa
        if(this.x + this.movimientox + this.meshR> this.tamano/2)
        {
            this.x = (this.tamano/2) - this.meshR;
            this.movimientox = 0;
        }
        if(this.x + this.movimientox - this.meshR < -this.tamano/2)
        {
            this.x = -(this.tamano/2) + this.meshR;
            this.movimientox = 0;
        }
        if(this.z + this.movimientoz + this.meshR > this.tamano/2)
        {
            this.z = (this.tamano/2) - this.meshR;
            this.movimientoz = 0;
        }
        if(this.z + this.movimientoz - this.meshR < -this.tamano/2)
        {
            this.z = -(this.tamano/2) + this.meshR;
            this.movimientoz = 0;
        }

        // Mover el jugador
        this.x += this.movimientox;
        this.z += this.movimientoz;
        this.playerPrefab.position.set(this.x, this.y, this.z);
    }
}