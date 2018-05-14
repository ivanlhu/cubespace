// WebGL stuffs
var scene;
var camera;
var renderer;
var events = new Array();

// Initialize game ...
function startGame() {
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xffffff, 0.18);


	camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 100 );
	camera.lookAt(new THREE.Vector3(0,0,1));

	renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	render();
}

// Game Loop
var start_t = Date.now();
var end_t = start_t;
var paused = false;

var render = function () {
	requestAnimationFrame( render );

	renderer.render(scene, camera);
	
	start_t = end_t;
	end_t = Date.now();

	processEvents(end_t - start_t);
	update(end_t - start_t);
};

// Variable settings
var speed = 0.0025;
var t_rem = 0;
var spawn_inter = 20;

var camX = 0, camY = 0, maxSpeed = 0.05;

var colors = [0xff00ff, // Pink
              0xff0000, // Red
              0xff8000, // Orange
              0xffee00, // Yellow
              0x80ff00, // Lime
              0x00ff00, // Green
              0x00eeee, // Aqua
              0x0000ff, // Blue
              0x4b0082, // Indigo
              0x6600ff, // Purple
             ];

var materials = new Array();
for(i = 0; i < colors.length; i++)
    materials[i] = new THREE.LineBasicMaterial({color: colors[i]});

var transitionLength = 50;

// Update stuff
function update(t) {
	camera.position.z += speed * t * (1 + (0.08*Math.floor(camera.position.z / transitionLength)));
	camera.position.y += camY;
	camera.position.x += camX;

	camX = Math.max(-maxSpeed, Math.min(camX * 0.95, maxSpeed)); camY = Math.max(-maxSpeed, Math.min(camY * 0.95, maxSpeed));

    collision();
    
	cubeGen(t, materials[Math.floor(camera.position.z / (transitionLength * (1+(0.08*Math.floor(camera.position.z / transitionLength))))) % colors.length]);
	cleanup(t);
    
        canvas = document.getElementById("canvas");
}

function processEvents(t) {
	for(i = 0; i < events.length; i++)
	{
		if(events[i].keyCode === 38)  // Up
		{
			camY += 0.005 * t;
		}
		else if(events[i].keyCode === 37)  // Left
		{
			camX += 0.005 * t;
		}
		else if(events[i].keyCode === 39)  // Right
		{
			camX -= 0.005 * t;
		}
		else if(events[i].keyCode === 40)  // Down
		{
			camY -= 0.005 * t;
		}
	}
	events = [];
}


/// Functions for generating cubes
// Create cube
// TODO: eliminate magic numbers
function cube(x, y, z, mat) {
	var cube = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.7), mat);
	cube.position.set(x,y,z);
	return cube;
}

// Place cube in scene
function cubeGen(t, mat) {
	t_rem += 4000 * t * speed;
	for(i = 0; i < Math.floor(t_rem / spawn_inter); i++)
	{
		var c = new cube(camera.position.x + randPosition(), camera.position.y + randPosition(),
					     camera.position.z + (Math.random() * 0.06 * t) + 10, mat);
		scene.add(c);
	}
	t_rem = t_rem % spawn_inter;
}

// Test whether or not the camera location intersects a cube
function collisionTest() {
    for (i = 0; i < scene.children.length; i++)
    {       
        if(camera.position.x >= scene.children[i].position.x - 0.6
           && camera.position.x <= scene.children[i].position.x + 0.6
           && camera.position.y >= scene.children[i].position.y - 0.6
           && camera.position.y <= scene.children[i].position.y + 0.6
           && camera.position.z >= scene.children[i].position.z - 0.35
           && camera.position.z <= scene.children[i].position.z + 0.35)
            return true;  
    }
    return false;
}

// Respond to a collision when it occurs
function collision() {
    if(collisionTest())
    {
        alert("Game over! You traveled " + camera.position.z.toFixed(1) + " units.");
        clearCubes();
        //camera.position = new THREE.Vector3(0,0,0);
    }
}

// Delete useless cubes
function cleanup(t) {
	for(i = 0; i < scene.children.length; i++)
	{
		if(scene.children[i].position.z < camera.position.z - 1)
		{
			scene.remove(scene.children[i]);
		}
	}
}

// When game over
function clearCubes() {
    scene.children = [];
    camera.position.z = 0;
    camera.position.y = 0;
    camera.position.x = 0;
    end_t = Date.now();
}

// Place cube in random position
function randPosition() {
	return (Math.random() * 60) - 30;
}

/// Place keyboard events into queue to be processed
window.onkeydown = function(e) {
	events.push(e);
}
