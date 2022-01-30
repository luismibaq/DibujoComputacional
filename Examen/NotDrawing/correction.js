const mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;


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


function createShader(gl, str, type)
{
    let shader = null;
    
    if (type == "fragment") 
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    else if (type == "vertex")
        shader = gl.createShader(gl.VERTEX_SHADER);
    else
        return null;

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
    }

    return shader;
}

function initShader(gl, vertexShaderSource, fragmentShaderSource)
{
    const vertexShader = createShader(gl, vertexShaderSource, "vertex");
    const fragmentShader = createShader(gl, fragmentShaderSource, "fragment");

    let shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("Could not initialise shaders");
    }

    return shaderProgram;
}

function initWebGL(canvas) 
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";

    try 
    {
        gl = canvas.getContext("webgl2");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
}

function initViewport(glCtx, canvas)
{
    glCtx.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

function draw(glCtx,shaderProgram, objs) 
{
    // clear the background (with black)
    glCtx.clearColor(0.1, 0.1, 0.1, 1.0);
    glCtx.enable(glCtx.DEPTH_TEST);
    glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);

    // set the shader to use
    glCtx.useProgram(shaderProgram);

    for(let obj of objs)
    {
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, obj.buffer);
        glCtx.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, glCtx.FLOAT, false, 0, 0);

        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, obj.colorBuffer);
        glCtx.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, glCtx.FLOAT, false, 0, 0);
        
        glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, obj.indices);

        glCtx.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        glCtx.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        glCtx.drawElements(obj.primtype, obj.nIndices, glCtx.UNSIGNED_SHORT, 0);
    }
}


function update(gl, shaderProgram, objs)
{
    requestAnimationFrame(()=> update(gl, shaderProgram, objs));

    draw(gl,shaderProgram, objs);
}

function createTriangle(glCtx, translation)
{

    let vertexBuffer = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        0, 1, 0,
        -1, -1, 0,
        1, -1, 0
    ];
        
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(verts), glCtx.STATIC_DRAW);

    
    let colorBuffer = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, colorBuffer);
    // Color data
    let faceColors = [
        [1, 0, 0, 1],
        [0, 1, 0, 1],
        [0, 0, 1, 1]
    ];
    let vertexColors = [];
    faceColors.forEach(color =>{
        for (let j=0; j < 1; j++)
            vertexColors.push(...color);
    });
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(vertexColors), glCtx.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let triangleIndexBuffer = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, triangleIndexBuffer);

    let triangleIndices = [0, 1, 2]

    glCtx.bufferData(glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleIndices), glCtx.STATIC_DRAW);
    
    let triangle = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:triangleIndexBuffer,
            vertSize:3, nVerts: 3, colorSize:4, nColors: 23, nIndices: triangleIndices.length,
            primtype:glCtx.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(triangle.modelViewMatrix, triangle.modelViewMatrix, translation);
    
    return triangle;
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

function main()
{
    const canvas = document.getElementById("webGLCanvas");
    const glCtx = initWebGL(canvas);

    initViewport(glCtx, canvas);
    initGL(canvas);

    let triangle = createTriangle(glCtx,  [0, 0, 0]);

    const shaderProgram = initShader(glCtx, vertexShaderSource, fragmentShaderSource);

    bindShaderAttributes(glCtx, shaderProgram);

    update(glCtx, shaderProgram, [triangle]);
}

main();