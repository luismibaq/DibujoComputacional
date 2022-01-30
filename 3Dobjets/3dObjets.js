import * as shaderUtils from './shaderUtils.js'
const mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

const duration = 10000; // ms

let mov = 0;
let x = 0.005;

// in: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.

const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        in vec4 vertexColor;

        out vec4 color;

        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
            color = vertexColor;
        }`;

const fragmentShaderSource = `#version 300 es

        precision mediump float;
        in vec4 color;
        out vec4 fragColor;

        void main(void) {
        fragColor = color;
    }`;

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    const gl = initWebGL(canvas);
    initViewport(gl, canvas);
    initGL(canvas);
    
    let escutoide = createEscutoide(gl, [-6 , 0, -10], [1, 1, 0.2]);
    let dodecaedro = createDodecaedro(gl, [0, 0, -4], [-4, 1, 0.1]);
    let octaedro = createOctaedro(gl, [3.5, 0, -4], [0, 1, 0]);
    
    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource);
    bindShaderAttributes(gl, shaderProgram);

    update(gl, shaderProgram, [escutoide, dodecaedro, octaedro]);
}

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";
    try {
        gl = canvas.getContext("webgl2");
    } 
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    // mat4.orthoNO(projectionMatrix, -4, 4, -3.5, 3.5, 1, 100)
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

function createOctaedro(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Front face
        0,-1.5, 0,
        1, 0, 1,
        1, 0,-1,
       -1, 0,-1,
       -1, 0, 1,
        0, 1.5, 0
       ];

       let octaedroIndices = [
        0, 1, 2,      0, 1, 4,
        0, 2, 3,      0, 4, 3,
        5, 1, 2,      5, 1, 4,
        5, 2, 3,      5, 4, 3
    ];

       let tempI = [];
       let tempV = [];
       for(let cons = 0; cons < octaedroIndices.length; cons++){
           tempI.push(verts[(octaedroIndices[cons] * 3)]);
           tempI.push(verts[(octaedroIndices[cons] * 3) + 1]);
           tempI.push(verts[(octaedroIndices[cons] * 3) + 2]);
       }
       verts = tempI;
       for(let cons = 0; cons < tempI.length; cons++){
           tempV.push(cons);
       }
       octaedroIndices = tempV;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1]
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octaedroIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octaedroIndexBuffer);

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octaedroIndices), gl.STATIC_DRAW);
    
    let octaedro = {
            buffer: vertexBuffer, colorBuffer: colorBuffer, indices: octaedroIndexBuffer,
            vertSize: 3, nVerts: 18, colorSize: 4, nColors: 24, nIndices: 24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(octaedro.modelViewMatrix, octaedro.modelViewMatrix, translation);

    octaedro.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        if(mov >= 2){
            x = -x;
        }
        if(mov <= -2){
            x = -x;
        }
        mov += x;
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.translate(octaedro.modelViewMatrix, octaedro.modelViewMatrix, [0,x,0]);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return octaedro;
}

// Create the vertex, color and index data for a multi-colored cube
// Create the vertex, color and index data for a multi-colored cube
function createDodecaedro(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let lambda = (1 + Math.sqrt(5))/2;

    let verts = [
       // Cube
        1,1,1, //0
        1,1,-1, //1
        1,-1,1, //2
        1,-1,-1, //3
        -1,1,1,//4
        -1,1,-1,//5
        -1,-1,1,//6
        -1,-1,-1,//7
        //First plane Azul
        0,lambda,1/lambda,//8
        0,-lambda,1/lambda,//9
        0,-lambda,-1/lambda,//10
        0,lambda,-1/lambda,//11
        //Second plane Vert
        lambda,1/lambda,0,//12
        lambda,-(1/lambda),0,//13
        -lambda,1/lambda,0,//14
        -lambda,-(1/lambda),0,//15
        //Tirth plane Horizontal
        1/lambda,0,lambda,//16
        -1/lambda,0,lambda,//17
        -1/lambda,0,-lambda,//18
        1/lambda,0,-lambda,//19
       ];

       let dodecaedroIndices = [
        0,1,8, 0,1,12, 1,8,11,
        0,4,8, 0,4,16, 4,16,17,
        0,12,16, 16,12,13, 13,16,2,
        4,8,5, 5,8,11, 4,5,14,
        4,14,17, 14,17,6, 6,14,15,
        15,14,5, 15,5,7, 5,7,18,
        5,18,11, 18,11,1, 1,18,19,
        12,1,3, 12,3,13, 3,1,19,
        9,3,2, 2,3,13, 9,3,10,
        10,3,7, 3,7,18, 18,3,19,
        2,6,9, 2,6,16, 6,16,17,
        6,7,9, 9,7,10, 15,7,6
    ];

    let tempI = [];
    let tempV = [];
    for(let cons = 0; cons < dodecaedroIndices.length; cons++){
        tempI.push(verts[(dodecaedroIndices[cons] * 3)]);
        tempI.push(verts[(dodecaedroIndices[cons] * 3) + 1]);
        tempI.push(verts[(dodecaedroIndices[cons] * 3) + 2]);
    }
    verts = tempI;
    for(let cons = 0; cons < tempI.length; cons++){
        tempV.push(cons);
    }
    dodecaedroIndices = tempV;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1]
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 9; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodecaedroIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecaedroIndexBuffer);

    

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecaedroIndices), gl.STATIC_DRAW);
    
    let dodecaedro = {
            buffer: vertexBuffer, colorBuffer: colorBuffer, indices: dodecaedroIndexBuffer,
            vertSize: 3, nVerts: 60, colorSize: 4, nColors: 24, nIndices: 324,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(dodecaedro.modelViewMatrix, dodecaedro.modelViewMatrix, translation);

    dodecaedro.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecaedro;
}

function bindShaderAttributes(gl, shaderProgram)
{
    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function draw(gl, shaderProgram, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // set the shader to use
    gl.useProgram(shaderProgram);

    for(let i = 0; i< objs.length; i++)
    {
        let obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function update(gl, shaderProgram, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(()=> update(gl, shaderProgram, objs));

    draw(gl,shaderProgram, objs);

    objs.forEach(obj =>{
        obj.update();
    })
    // for(const obj of objs)
    //     obj.update();
    // for(let i = 0; i<objs.length; i++)
    //     objs[i].update();
}

// Create the vertex, color and index data for a multi-colored cube
function createEscutoide(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    let caras = [5,6,3,2,2,2,2,1];

    let verts = [
       // Front face
       0,2.0,0,
       Math.sin(0 * Math.PI / 180) * 1.5, 2.0,  Math.cos(0* Math.PI / 180) * 1.5,
       Math.sin(72* Math.PI / 180) * 1.5, 2.0,  Math.cos(72* Math.PI / 180) * 1.5,
       0,2.0,0,
       Math.sin(72* Math.PI / 180) * 1.5, 2.0,  Math.cos(72* Math.PI / 180) * 1.5,
       Math.sin(144* Math.PI / 180) * 1.5, 2.0,  Math.cos(144* Math.PI / 180) * 1.5,
       0,2.0,0,
       Math.sin(144* Math.PI / 180) * 1.5, 2.0,  Math.cos(144* Math.PI / 180) * 1.5,
       Math.sin(216* Math.PI / 180) * 1.5, 2.0,  Math.cos(216* Math.PI / 180) * 1.5,
       0,2.0,0,
       Math.sin(216* Math.PI / 180) * 1.5, 2.0,  Math.cos(216* Math.PI / 180) * 1.5,
       Math.sin(288* Math.PI / 180) * 1.5, 2.0,  Math.cos(288* Math.PI / 180) * 1.5,
       0,2.0,0,
       Math.sin(288* Math.PI / 180) * 1.5, 2.0,  Math.cos(288* Math.PI / 180) * 1.5,
       Math.sin(0* Math.PI / 180) * 1.5, 2.0,  Math.cos(0* Math.PI / 180) * 1.5,

       // Hexagono face
       0,-2.0,0,
       Math.sin(30* Math.PI / 180) * 1.5, -2.0,  Math.cos(30* Math.PI / 180) * 1.5,
       Math.sin(90* Math.PI / 180) * 1.5, -2.0,  Math.cos(90* Math.PI / 180) * 1.5,
       0,-2.0,0,
       Math.sin(90* Math.PI / 180) * 1.5, -2.0,  Math.cos(90* Math.PI / 180) * 1.5,
       Math.sin(150* Math.PI / 180) * 1.5, -2.0,  Math.cos(150* Math.PI / 180) * 1.5,
       0,-2.0,0,
       Math.sin(150* Math.PI / 180) * 1.5, -2.0,  Math.cos(150* Math.PI / 180) * 1.5,
       Math.sin(210* Math.PI / 180) * 1.5, -2.0,  Math.cos(210* Math.PI / 180) * 1.5,
       0,-2.0,0,
       Math.sin(210* Math.PI / 180) * 1.5, -2.0,  Math.cos(210* Math.PI / 180) * 1.5,
       Math.sin(270* Math.PI / 180) * 1.5, -2.0,  Math.cos(270* Math.PI / 180) * 1.5,
       0,-2.0,0,
       Math.sin(270* Math.PI / 180) * 1.5, -2.0,  Math.cos(270* Math.PI / 180) * 1.5,
       Math.sin(330* Math.PI / 180) * 1.5, -2.0,  Math.cos(330* Math.PI / 180) * 1.5,
       0,-2.0,0,
       Math.sin(330* Math.PI / 180) * 1.5, -2.0,  Math.cos(330* Math.PI / 180) * 1.5,
       Math.sin(30* Math.PI / 180) * 1.5, -2.0,  Math.cos(30* Math.PI / 180) * 1.5,
       
       // Cara 1
       Math.sin(0 * Math.PI / 180) * 1.5, 2.0,  Math.cos(0* Math.PI / 180) * 1.5,
       Math.sin(30* Math.PI / 180) * 1.5, -2.0,  Math.cos(30* Math.PI / 180) * 1.5,
       Math.sin(90* Math.PI / 180) * 1.5, -2.0,  Math.cos(90* Math.PI / 180) * 1.5,

       Math.sin(0 * Math.PI / 180) * 1.5, 2.0,  Math.cos(0* Math.PI / 180) * 1.5,
       Math.sin(72* Math.PI / 180) * 1.5, 2.0,  Math.cos(72* Math.PI / 180) * 1.5,
       Math.sin(90* Math.PI / 180) * 1.5, -2.0,  Math.cos(90* Math.PI / 180) * 1.5,
       
       Math.sin(0 * Math.PI / 180) * 1.5, 2.0,  Math.cos(0* Math.PI / 180) * 1.5,
       Math.sin(30* Math.PI / 180) * 1.5, -2.0,  Math.cos(30* Math.PI / 180) * 1.5,
       (Math.sin(0 * Math.PI / 180) * 1.5 + Math.sin(330* Math.PI / 180) * 1.5)/2, 0,  (Math.cos(0* Math.PI / 180) * 1.5 + Math.cos(330* Math.PI / 180) * 1.5)/2,
       
       // Cara 2
       Math.sin(72* Math.PI / 180) * 1.5, 2.0,  Math.cos(72* Math.PI / 180) * 1.5,
       Math.sin(144* Math.PI / 180) * 1.5, 2.0,  Math.cos(144* Math.PI / 180) * 1.5,
       Math.sin(90* Math.PI / 180) * 1.5, -2.0,  Math.cos(90* Math.PI / 180) * 1.5,

       Math.sin(90* Math.PI / 180) * 1.5, -2.0,  Math.cos(90* Math.PI / 180) * 1.5,
       Math.sin(150* Math.PI / 180) * 1.5, -2.0,  Math.cos(150* Math.PI / 180) * 1.5,
       Math.sin(144* Math.PI / 180) * 1.5, 2.0,  Math.cos(144* Math.PI / 180) * 1.5,
    
       // Cara 3
       Math.sin(150* Math.PI / 180) * 1.5, -2.0,  Math.cos(150* Math.PI / 180) * 1.5,
       Math.sin(210* Math.PI / 180) * 1.5, -2.0,  Math.cos(210* Math.PI / 180) * 1.5,
       Math.sin(144* Math.PI / 180) * 1.5, 2.0,  Math.cos(144* Math.PI / 180) * 1.5,

       Math.sin(144* Math.PI / 180) * 1.5, 2.0,  Math.cos(144* Math.PI / 180) * 1.5,
       Math.sin(216* Math.PI / 180) * 1.5, 2.0,  Math.cos(216* Math.PI / 180) * 1.5,
       Math.sin(210* Math.PI / 180) * 1.5, -2.0,  Math.cos(210* Math.PI / 180) * 1.5,

       // Cara 4
       Math.sin(210* Math.PI / 180) * 1.5, -2.0,  Math.cos(210* Math.PI / 180) * 1.5,
       Math.sin(270* Math.PI / 180) * 1.5, -2.0,  Math.cos(270* Math.PI / 180) * 1.5,
       Math.sin(216* Math.PI / 180) * 1.5, 2.0,  Math.cos(216* Math.PI / 180) * 1.5,

       Math.sin(216* Math.PI / 180) * 1.5, 2.0,  Math.cos(216* Math.PI / 180) * 1.5,
       Math.sin(288* Math.PI / 180) * 1.5, 2.0,  Math.cos(288* Math.PI / 180) * 1.5,
       Math.sin(270* Math.PI / 180) * 1.5, -2.0,  Math.cos(270* Math.PI / 180) * 1.5,

       // Cara 5
       Math.sin(270* Math.PI / 180) * 1.5, -2.0,  Math.cos(270* Math.PI / 180) * 1.5,
       Math.sin(330* Math.PI / 180) * 1.5, -2.0,  Math.cos(330* Math.PI / 180) * 1.5,
       Math.sin(288* Math.PI / 180) * 1.5, 2.0,  Math.cos(288* Math.PI / 180) * 1.5,

       Math.sin(288* Math.PI / 180) * 1.5, 2.0,  Math.cos(288* Math.PI / 180) * 1.5,
       Math.sin(0* Math.PI / 180) * 1.5, 2.0,  Math.cos(0* Math.PI / 180) * 1.5,
       Math.sin(330* Math.PI / 180) * 1.5, -2.0,  Math.cos(330* Math.PI / 180) * 1.5,

       // cara 6
       Math.sin(330* Math.PI / 180) * 1.5, -2.0,  Math.cos(330* Math.PI / 180) * 1.5,
       Math.sin(30* Math.PI / 180) * 1.5, -2.0,  Math.cos(30* Math.PI / 180) * 1.5,
       (Math.sin(0 * Math.PI / 180) * 1.5 + Math.sin(330* Math.PI / 180) * 1.5)/2, 0,  (Math.cos(0* Math.PI / 180) * 1.5 + Math.cos(330* Math.PI / 180) * 1.5)/2,
    ];

    let cubeIndices = [];

    for(let cos = 0; cos < verts.length; cos++){
        cubeIndices.push(cos);
    } 

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1],
        [Math.random(), Math.random(), Math.random(), 1]
    ];

    let tempF = [];

    for (let j=0; j < caras.length; j++){
        for (let i=0; i < caras[j]; i++){
            tempF.push(faceColors[j]);
        }
    }

    faceColors = tempF;
    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
    
    let cube = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:verts.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return cube;
}

main();