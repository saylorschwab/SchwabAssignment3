//author: Saylor Schwab
//date: Febr 23, 2021
//description: this program shows the cycle of the sun on a horizon
//proposed points (10 out of 10): I have a WebGL program that utilizes animation and more than 2 colors, 
// there is a working button to change the direction of the cycle, there is a slider to change how fast
// the sun is spinning, there is a menu that has both of the previous items in it, and I have 2 
// different vertex shaders.

"use strict";

// set up all the variables
var canvas;
var gl;

var theta = 0.5;
var thetaLoc;

var direction = true;
var speed = 0.1;

var dx = 0.0;
var dxLoc;
var dy = 0.0;
var dyLoc;

var goingRight = true;
var goingUp = true;

var vertices;
var verticesTriangle;
var program;
var programTriangle;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );


    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.4, .6, .8, 1.0);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // for the sun
    vertices = [
        vec2(0, .25),
        vec2(-.25, 0),
        vec2(.25, 0),
        vec2(0, -.25)
    ];

    // for the grass
    verticesTriangle = [
        vec2(-1, -.5),
        vec2(1, -.5),
        vec2(1, -1),
        vec2(-1, -.5),
        vec2(-1, -1),
        vec2(1, -1)
    ];

    // establish shaders and uniform variables
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    thetaLoc = gl.getUniformLocation(program, "uTheta");
    programTriangle = initShaders(gl, "vertex-shader-still", "fragment-shader-still");
    dxLoc = gl.getUniformLocation(program, "udx");
    dyLoc = gl.getUniformLocation(program, "udy");

    // Initialize event handler (button)
    document.getElementById("Direction").onclick = function() {
        console.log("pressed button");
        direction = !direction;
    }

    // Initialize event handler (slider)
    document.getElementById("slider").onchange = function(event) {
        speed = parseFloat(event.target.value);
        console.log("slider!!!", speed);
    }

    // Initialize event handler (menu)
    document.getElementById("Controls").onclick = function(event) {
        switch(event.target.index) {
            case 0:
                direction = !direction;
                break;
            case 1:
                speed += .1;
        }
    }

    // Use keys to change direction (d) and rotation speed (f and s)
    window.onkeydown = function(event) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
            case 'D': //direction
            case 'd':
                direction = !direction;
                break;
            case 'F': //faster
            case 'f':
                speed += .1;
                break;
            case 'S': //slower
            case 's':
                speed -= .1;
                break;
        }
    }

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta -= speed;

    // set limits on how high in the sky the sun can go before coming back down
    if (direction == true) {
        if (dy > 1.2){
            goingUp = !goingUp;
        }
    
        if (goingRight){
            dx += .0075;
        }
        else {
            dx -= .01;
        }
    
        if (goingUp){
            dy += .01;
        }
        else {
            dy -= .01;
        }
    }
    else {
        if (dy > 1.2){
            goingUp = !goingUp;
        }
    
        if (goingRight){
            dx -= .0075;
        }
        else {
            dx += .01;
        }
    
        if (goingUp){
            dy -= .01;
        }
        else {
            dy += .01;
        }
    }

    gl.useProgram(program);

    // Load the data
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate shader variables with our data bufferData
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Rotation
    theta -= speed;
    gl.uniform1f(thetaLoc, theta);

    // Draw it!
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);

    gl.uniform1f(dyLoc, dy);
    gl.uniform1f(dxLoc, dx);

    // Draw the grass!
    // switch to the Triangle shaders
    gl.useProgram(programTriangle);

    // Load te data
    var bufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesTriangle), gl.STATIC_DRAW);

    // Associate shader variables with our data bufferData
    var positionLoc2 = gl.getAttribLocation(programTriangle, "aPosition");
    gl.vertexAttribPointer(positionLoc2, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc2);

    // Draw it!
    gl.drawArrays(gl.TRIANGLES, 0, verticesTriangle.length);

    requestAnimationFrame(render);
}
