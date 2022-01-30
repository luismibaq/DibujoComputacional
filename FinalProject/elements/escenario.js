import * as THREE from "../libs/three.module.js";
import powerUp from './powerUp.js';
import npc from './npc.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';


let x, y, z, scene;
let geometry, material, mesh, escenarioPrefab, powerGroup,p;
let jugador;
let powerUps, spownRate;
let arrJugadores, cantJugadores;
let nombresPowerUps;
let arrNPC;
let pared;

export default class escenario
{
    constructor(x,y,z,scene,jugador)
    {
        this.nombresPowerUps = ["CenPlay","AddLiv","AgrTam","RedTam","invCon","InvMov"];
        this.powerUps = {array : []};
        this.jugador = jugador;
        this.x = x;
        this.y = y;
        this.z = z;
        this.scene = scene;
        this.spownRate = 0;
        this.arrNPC = [];
        this.escenarioPrefab = new THREE.Group();
        
        // suelo
        const textureUrl = "../textures/grass.jpg";
        const texture = new THREE.TextureLoader().load(textureUrl);
        geometry = new THREE.BoxGeometry(this.jugador.getTamano(),0.5,this.jugador.getTamano());
        material = new THREE.MeshLambertMaterial({ map: texture});
        mesh = new THREE.Mesh(geometry,material);
        mesh.position.set(this.x,this.y -0.25,this.z);
        this.escenarioPrefab.add(mesh);
        
        // paredes
        const TEXTUREURL = "../textures/metal.jpg";
        const texture1 = new THREE.TextureLoader().load(TEXTUREURL);
        geometry = new THREE.BoxGeometry(this.jugador.getTamano(),20,0);
        material = new THREE.MeshLambertMaterial({ map: texture1});
        mesh = new THREE.Mesh(geometry,material);
        mesh.position.set(0,10,this.jugador.getTamano()/2);
        this.escenarioPrefab.add(mesh);

        const textureurl = "../textures/metal.jpg";
        const texture2 = new THREE.TextureLoader().load(textureurl);
        geometry = new THREE.BoxGeometry(this.jugador.getTamano(),20,0);
        material = new THREE.MeshLambertMaterial({ map: texture2});
        mesh = new THREE.Mesh(geometry,material);
        mesh.position.set(0,10,-this.jugador.getTamano()/2);
        this.escenarioPrefab.add(mesh);

        const TextureUrl = "../textures/metal.jpg";
        const texture3 = new THREE.TextureLoader().load(TextureUrl);
        geometry = new THREE.BoxGeometry(0,20,this.jugador.getTamano());
        material = new THREE.MeshLambertMaterial({ map: texture3});
        mesh = new THREE.Mesh(geometry,material);
        mesh.position.set(-this.jugador.getTamano()/2,10,0);
        this.escenarioPrefab.add(mesh);

        this.ponerPared();

        this.scene.add(this.escenarioPrefab);

        this.powerGroup = new THREE.Group();
        this.scene.add(this.powerGroup);
        this.newPowerUp(this.jugador.getTamano()/10);
    }

    quitarPared()
    {
        this.pared.parent.remove(this.pared);
    }

    ponerPared()
    {
        try
        {
            this.quitarPared();
        }
        catch{}
        const TextureUrl = "../textures/metal.jpg";
        const texture3 = new THREE.TextureLoader().load(TextureUrl);
        geometry = new THREE.BoxGeometry(0,20,this.jugador.getTamano());
        material = new THREE.MeshLambertMaterial({ map: texture3});
        this.pared = new THREE.Mesh(geometry,material);
        this.pared.position.set(this.jugador.getTamano()/2,10,0);
        this.escenarioPrefab.add(this.pared);
    }

    restart()
    {
        this.powerUps.array.forEach(element => element.kill()); 
        this.powerUps.array = [];      
        this.newPowerUp(this.jugador.getTamano()/10);
        this.arrNPC.forEach(element => element.kill());
        this.arrNPC = [];
        this.ponerPared();
    }

    getJugadores()
    {
        return this.cantJugadores;
    }

    addJugadores(j)
    {
        this.cantJugadores = j;
        for(let i = 0; i < this.cantJugadores; i++)
        {
            this.arrNPC.push(new npc(this.getRandomIntPos(), 0 ,this.getRandomIntPos(),this.scene,this.jugador));
        }
    }

    getRandomInt(max)
    {
        let x = Math.floor(Math.random() * max);
        return x;
    }

    getRandomIntPos()
    {
        
        let x = Math.floor(Math.random() * ((this.jugador.getTamano()/2) - 1)) * (Math.round(Math.random()) * 2 - 1);
        return x;
    }

    newPowerUp(times)
    {
        for(let step = 0; step < times; step++)
        {
            this.p = new powerUp(this.powerGroup,this.getRandomIntPos(),this.getRandomIntPos(),this.nombresPowerUps[this.getRandomInt(this.nombresPowerUps.length)],this.jugador);
            this.powerUps.array.push(this.p);
        }
    }

    createNPC(cant)
    {
        for(let i = 0; i < cant; i++)
        {
            let j = new npc(getRandomIntPos(), 0, getRandomIntPos(),this.scene,this.jugador);
        }
    }
    
    update()
    {
        this.powerUps.array.forEach(element => {
            if(element.isDead()){
                const index = this.powerUps.array.indexOf(element);
                if (index > -1) {
                    this.powerUps.array.splice(index, 1);
                }
            }
        });
        this.arrNPC.forEach(element => {
            if(element.isDead()){
                const index = this.arrNPC.indexOf(element);
                if (index > -1) {
                    this.arrNPC.splice(index, 1);
                }
                this.cantJugadores -= 1;
                element.kill();
            }
        });
        this.spownRate += 1;
        if(this.spownRate > 100)
        {
            this.spownRate = 0;
            this.newPowerUp(1);
        }
        this.powerUps.array.forEach(element => element.update());
        this.arrNPC.forEach(element => element.update());
    }
}