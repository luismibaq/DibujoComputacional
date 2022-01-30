import * as THREE from "./libs/three.module.js";
import escenario from './elements/escenario.js';
import jugador from './elements/player.js';

// update
let container, clock,  mixer, menu;
// camara
let camera, width, height; 
let scene, renderer;
// rotar camara
let camaraRotar;
// GUI
let guiGroup, winGroup, lossGroup;
let buttons = [];
let mutedo;
// prefabs
let escenarioPrefab, jugadorPrefab;
// controles
let w, a, s, d, p, salto;
// jugadores
let jugadores, numJugadores;
//Audio
let sound;

init();
animate();

function init() {
    // powerUpReset
    jugadores = 2;

    // web gl cambas
    const canvas = document.getElementById("webglcanvas");

    // camara
    camaraRotar = new THREE.Group();
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 150 );
    camera.position.set(10, 10, 10);
    camaraRotar.add(camera);

    // escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xe0e0e0 );

    // reloj
    clock = new THREE.Clock();

    // objetos
    jugadorPrefab = new jugador(scene,'models/amongBlack.gltf',50);
    escenarioPrefab = new escenario(0,0,0,scene,jugadorPrefab);

    // menu de inicio
    menu = "startScreen";

    // GUI
    guiGroup = new THREE.Group();
    winGroup = new THREE.Group();
    lossGroup = new THREE.Group();
    createGUI(guiGroup);
    scene.add(guiGroup);
    scene.add(winGroup);
    scene.add(lossGroup);
    mutedo = false;

    // eventos del juego
    window.addEventListener("keydown", (event) => {
        let key = event.key.toLowerCase();
        if(menu == "ganaste" || menu == 'perdiste')
        {
            menu == "startScreen";
        }
        if(key == "w" && menu == "gameScreen")
        {
            w = true;
        }
        if(key == "s" && menu == "gameScreen")
        {
            s = true;
        }
        if(key == "d" && menu == "gameScreen")
        {
            d = true;
        }
        if(key == "a" && menu == "gameScreen")
        {
            a = true;
        }
        if(key == "p" && menu == "gameScreen")
        {
            p = !p;
            if(p)
            {
                escenarioPrefab.ponerPared();
                sound.pause();
            }
            else
            {
                escenarioPrefab.quitarPared();
                camaraRotar.rotation.y = 0;
                camera.position.set(10, 10, 10);
                sound.play();
            }
            camera.position.x = 20;
            camera.position.z = 20;
            camera.position.y = 40;
        }
        if(key == "escape")
        {
            menu = "startScreen"; 
            escenarioPrefab.ponerPared();
            camera.position.set(10, 10, 10);
            p = false;
            w = false;
            a = false;
            s = false;
            d = false;
            jugadorPrefab.restart();
            escenarioPrefab.restart();
            camaraRotar.rotation.y = 0;
            createGUI(guiGroup);
        }
        if(key == " " && menu == "gameScreen")
        {
            salto = true;
        }
        if(key == "q" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongBlack.gltf');
        }
        if(key == "w" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongBlue.gltf');
        }
        if(key == "e" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongLightPink.gltf');
        }
        if(key == "a" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongOrange.gltf');
        }
        if(key == "s" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongPink.gltf');
        }
        if(key == "d" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongPrism.gltf');
        }
        if(key == "z" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongRed.gltf');
        }
        if(key == "x" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongYellow.gltf');
        }
        if(key == "c" && menu == "startScreen")
        {
            jugadorPrefab.reCargarModelo('models/amongGreen.gltf');
        }
        if(key == "+" && menu == "startScreen")
        {
            if(jugadores < 10)
            {
                jugadores += 1;
                createGUI(guiGroup);
            }
        }
        if(key == "-" && menu == "startScreen")
        {
            if(jugadores > 2)
            {
                jugadores -= 1;
                createGUI(guiGroup);
            }
        }
        if(key == "p" && menu == "startScreen")
        {
            escenarioPrefab.quitarPared();
            escenarioPrefab.addJugadores(jugadores);
            menu = "gameScreen";
            camaraRotar.position.set(0,0,0);
            camaraRotar.rotation.y = 0;
            w = false;
            a = false;
            s = false;
            d = false;
            p = false;
            camera.position.set(0, 10, 0);
            jugadorPrefab.changeVida(5);
            destroyGUI();
        }
        if(key == "m")
        {
            mutedo = !mutedo;
            if(mutedo){
                sound.setVolume(0.0);
            }else{
                sound.setVolume(0.5);
            }
            
            if(menu == 'startScreen'){
                createGUI(guiGroup);
            }
        }
    });

    window.addEventListener("keyup", (event) => {
        let key = event.key.toLowerCase();
        if(key == "w")
        {
            w = false;
        }
        if(key == "s")
        {
            s = false;
        }
        if(key == "d")
        {
            d = false;
        }
        if(key == "a")
        {
            a = false;
        }
    });

    // luces
    let light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    light.position.set( 0, 20, 0 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 20, 10 );
    scene.add( light );

    // renderizado
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize(canvas.width, canvas.height);
    renderer.outputEncoding = THREE.sRGBEncoding;

    //Audio
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( './sounds/song.ogg', function( buffer ) {
	    sound.setBuffer( buffer );
	    sound.setLoop( true );
	    sound.setVolume( 0.5 );
	    sound.play();
    });
}

function createGUI(group)
{
    destroyGUI()
    let geometry = new THREE.BoxGeometry(1,1,1);
    let material = new THREE.MeshLambertMaterial({ color: 0xcc008b});
    let mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"S",0,0);
    mesh.position.set(0, 0.5, 0);
    buttons.push(mesh);
    group.add(mesh);

    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshLambertMaterial({ color: 0x0700cc});
    mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"W",0,0);
    mesh.position.set(2, 0.5, 0);
    buttons.push(mesh);
    group.add(mesh);

    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshLambertMaterial({ color: 0xde59ff});
    mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"E",0,0);
    mesh.position.set(2, 0.5, 2);
    buttons.push(mesh);
    group.add(mesh);

    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshLambertMaterial({ color: 0x000000});
    mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"Q",0,0);
    mesh.position.set(2, 0.5, -2);
    buttons.push(mesh);
    group.add(mesh);

    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshLambertMaterial({ color: 0xcc0000});
    mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"Z",0,0);
    mesh.position.set(-2, 0.5, -2);
    buttons.push(mesh);
    group.add(mesh);

    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshLambertMaterial({ color: 0x00ff00});
    mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"C",0,0);
    mesh.position.set(-2, 0.5, 2);
    buttons.push(mesh);
    group.add(mesh);

    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshLambertMaterial({ color: 0xcca700});
    mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"X",0,0);
    mesh.position.set(-2, 0.5, 0);
    buttons.push(mesh);
    group.add(mesh);

    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshLambertMaterial({ color: 0xcc2d00});
    mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"A",0,0);
    mesh.position.set(0, 0.5, -2);
    buttons.push(mesh);
    group.add(mesh);

    geometry = new THREE.BoxGeometry(1,1,1);
    material = new THREE.MeshLambertMaterial({ color: 0x140733});
    mesh = new THREE.Mesh(geometry,material);
    loadText(mesh,"D",0,0);
    mesh.position.set(0, 0.5, 2);
    buttons.push(mesh);
    group.add(mesh);

    
    let options = new THREE.Group();
    options.position.set(0,0,0);
    loadTextOpt(options,"Play",-0.7,4.5,0);
    if(mutedo)
    {
    loadTextOpt(options,"un",-1.55,5.5,0);
    }
    loadTextOpt(options,"Mute",-0.8,5.5,0);
    loadTextOpt(options,"+",1,5.5,0);
    loadTextOpt(options,"-",1.2,4.3,0);
    loadTextOpt(options,jugadores.toString(),1, 4.8, 0);
    buttons.push(options);

    buttons.forEach(mesh => mesh.rotation.y = camaraRotar.rotation.y + 0.8);

    group.add(options);
    
}

function createGUIWinLoss(text,group)
{   
    destroyGUI()
    let options = new THREE.Group();
    camera.position.set(10, 10, 0);
    options.position.set(0,0,0);
    loadTextOpt(options,text,-1.5,4.5,0);
    options.rotation.y = camaraRotar.rotation.y + Math.PI/2;
    buttons.push(options);
    group.add(options);
}

function loadTextOpt(group,text,x,y,z)
{
    let loader = new THREE.FontLoader();

    loader.load( 'fonts/helvetiker_bold.typeface.json', function ( font ) {

        let textGeo = new THREE.TextGeometry( text, {

            font: font,

            size: 0.5,
            height: 0.1,
            curveSegments: 1,

            bevelThickness: 0.1,
            bevelSize: 0.01,
            bevelEnabled: true

        } );

        let textMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );

        let mesh = new THREE.Mesh( textGeo, textMaterial );
        mesh.position.set(x, y, z );
        mesh.rotation.x = -0.26;
        mesh.rotation.z = 0;

        group.add( mesh );

    } );
}

function loadText(group,text,x,z)
{
    let loader = new THREE.FontLoader();

    loader.load( 'fonts/helvetiker_bold.typeface.json', function ( font ) {

        let textGeo = new THREE.TextGeometry( text, {

            font: font,

            size: 0.5,
            height: 0.1,
            curveSegments: 1,

            bevelThickness: 0.1,
            bevelSize: 0.01,
            bevelEnabled: true

        } );

        let textMaterial = new THREE.MeshPhongMaterial( { color: 0x111111 } );

        let mesh = new THREE.Mesh( textGeo, textMaterial );
        mesh.position.set(x, 0.5, z );
        mesh.rotation.x = -1.5;

        group.add( mesh );

    } );
}

function updateGUI()
{
    buttons.forEach(mesh => mesh.rotation.y += 0.005);
}

function destroyGUI()
{
    buttons.forEach(mesh => mesh.parent.remove( mesh ));
    buttons = [];
}

function animate() 
{
    switch(menu) {
        case 'startScreen':
            camaraRotar.rotation.y += 0.005;
            camera.lookAt( new THREE.Vector3( 0, 1, 0 ) );
            updateGUI()
            break;

        case 'gameScreen':
            if(p)
            {
                camaraRotar.rotation.y += 0.005;
                camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
            }
            else
            {
                if(w)
                {
                    jugadorPrefab.moverx(-0.1);
                    if(s)
                    {
                        jugadorPrefab.moverx(0);
                    }
                }
                else if(s)
                {
                    jugadorPrefab.moverx(0.1);
                    if(w)
                    {
                        jugadorPrefab.moverx(0);
                    }
                }
                else
                {
                    jugadorPrefab.moverx(0);
                }
                if(a)
                {
                    jugadorPrefab.moverz(0.1);
                    if(d)
                    {
                        jugadorPrefab.moverz(0);
                    }
                }
                else if(d)
                {
                    jugadorPrefab.moverz(-0.1);
                    if(a)
                    {
                        jugadorPrefab.moverz(0);
                    }
                }
                else
                {
                    jugadorPrefab.moverz(0);
                }
                jugadorPrefab.update();
                escenarioPrefab.update();
                camera.position.x = jugadorPrefab.getPosX() + 15;
                camera.position.z = jugadorPrefab.getPosZ();
                
                camera.position.y = 10;
                camera.lookAt( new THREE.Vector3(jugadorPrefab.getPosX(), jugadorPrefab.getPosY(), jugadorPrefab.getPosZ()));
                if(jugadorPrefab.muerto())
                {
                    menu = "perdiste"
                    createGUIWinLoss("Perdiste",lossGroup);
                    escenarioPrefab.ponerPared();
                    jugadorPrefab.playerPrefab.position.set(0,1,0);
                }
                if(escenarioPrefab.getJugadores() == 0)
                {
                    menu = "ganaste"
                    createGUIWinLoss("Ganaste",winGroup);
                    escenarioPrefab.ponerPared();
                    jugadorPrefab.playerPrefab.position.set(0,1,0);
                }
            }
            break;
    
        case 'ganaste':
            console.log("ganaste");
            camaraRotar.rotation.y += 0.005;
            camera.lookAt(new THREE.Vector3(0,1,0));
            updateGUI();
            break;
        
        case 'perdiste':
            console.log("perdiste");
            camaraRotar.rotation.y += 0.005;
            camera.lookAt(new THREE.Vector3(0,1,0));
            updateGUI();
            break;
            
    }
    
    let dt = clock.getDelta();

    if ( mixer ) mixer.update( dt );

    requestAnimationFrame( animate );

    renderer.render( scene, camera );

    console.log

}