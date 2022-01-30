import * as THREE from "./three.module.js"
import {addMouseHandler} from "./sceneHandlers.js"

let renderer = null, scene = null, camera = null;

const duration = 5000; // ms
let currentTime = Date.now();

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

/**
 * Runs the update loop: updates the objects in the scene
 */
function update()
{
    requestAnimationFrame(function() { update(); });
    
    // Render the scene
    renderer.render( scene, camera );
}

/**
 * Creates a basic scene with lights, a camera, and 3 objects
 * @param {canvas} canvas The canvas element to render on
 */
function createScene(canvas)
{   
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);
    const light = new THREE.DirectionalLight( 0xffffff, 1.0);
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    const textureUrl = "./images/ash_uvgrid01.jpg";
    const texture = new THREE.TextureLoader().load(textureUrl);
    const material = new THREE.MeshPhongMaterial({ map: texture });

    //Hombro
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let Hombro = new THREE.Mesh(geometry, material);
    Hombro.position.set(0, 1.5, -1);

    // Bicep
    let groupBicep = new THREE.Object3D;
    Hombro.add(groupBicep);
    groupBicep.position.set(1.5,0,0);

    geometry = new THREE.BoxGeometry(1, 2, 1);
    let bicep = new THREE.Mesh(geometry, material);
    groupBicep.add(bicep);
    bicep.position.set(0, -0.5, 0);

    //Articulación
    geometry = new THREE.BoxGeometry(.5, .5, .5);
    let Articulacion = new THREE.Mesh(geometry, material);
    Hombro.add(Articulacion)
    Articulacion.position.set(0.75, 0, 0);

    // Antebrazo
    let groupAntebrazo = new THREE.Object3D;
    groupBicep.add(groupAntebrazo);
    groupAntebrazo.position.set(0,-1.9,0);

    geometry = new THREE.BoxGeometry(0.8, 2, 0.8);
    let antebrazo = new THREE.Mesh(geometry, material);
    groupAntebrazo.add(antebrazo);
    antebrazo.position.set(0, -0.5, 0);

    // Muñeca
    let groupMuñeca = new THREE.Object3D;
    groupAntebrazo.add(groupMuñeca);
    groupMuñeca.position.set(0,-1.5,0);

    geometry = new THREE.BoxGeometry(1, 1, 0.5);
    let muñeca = new THREE.Mesh(geometry, material);
    groupMuñeca.add(muñeca);
    muñeca.position.set(0, -0.5, 0);

    // Now add the group to our scene
    scene.add( Hombro );

    // add mouse handling so we can rotate the scene
    addMouseHandler(canvas, Hombro);
    Hombro.updateMatrixWorld();
}

main();