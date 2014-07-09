// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     ||  
		function( callback ){
			return window.setTimeout(callback, 1000 / 60);
		};
})();

window.cancelRequestAnimFrame = ( function() {
	return window.cancelAnimationFrame          ||
		window.webkitCancelRequestAnimationFrame    ||
		window.mozCancelRequestAnimationFrame       ||
		window.oCancelRequestAnimationFrame     ||
		window.msCancelRequestAnimationFrame        ||
		clearTimeout
} )();


// Initialize canvas and required variables
var canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"), // Create canvas context
		W = window.innerWidth, // Window's width
		H = window.innerHeight, // Window's height
		particles = [], // Array containing particles
		ball = {}, // Ball object
		paddles = [2], // Array containing two paddles
		pointsLeft = 0, // Varialbe to store points
		pointsRight = 0,
		fps = 60, // Max FPS (frames per second)
		over = 0, // flag varialbe, cahnged when the game is over
		init, // variable to initialize animation
		paddleHit,
		throwGameLeft,
		throwGameRight;


// Set the canvas's height and width to full screen
canvas.width = W;
canvas.height = H;

// Function to paint canvas
function paintCanvas() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, W, H);
}

// Function for creating paddles
function Paddle(pos) {
	// Height and width
	this.h = 150;
	this.w = 10;
	
	// Paddle's position
	this.x = (pos == "left") ? 0 : W - this.w;

	this.y = (pos == "right") ? 0 : H - this.h;
	this.y = 0;

	this.pos = pos;
	
}

// Push two new paddles into the paddles[] array
paddles.push(new Paddle("left"));
paddles.push(new Paddle("right"));

// Ball object
ball = {
	x: 50,
	y: 50, 
	r: 5,
	c: "white",
	vx: 4,
	vy: 8,
	
	// Function for drawing ball on canvas
	draw: function() {
		ctx.beginPath();
		ctx.fillStyle = this.c;
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
		ctx.fill();
	}
};


// Draw everything on canvas
function draw() {
	paintCanvas();
	for(var i = 0; i < paddles.length; i++) {
		p = paddles[i];
		
		ctx.fillStyle = "white";
		ctx.fillRect(p.x, p.y, p.w, p.h);
	}
	
	ball.draw();
	update();
}


// Function to update positions, score and everything.
// Basically, the main game logic is defined here
function update() {
	
	// Update scores
	updateScore(); 
	
	// Move the ball
	ball.x += ball.vx;
	ball.y += ball.vy;

	// Move the paddles
	for (var i = 1; i < paddles.length; i++) {
		p = paddles[i];
		
		if (ball.vx > 0) {
			if (p.pos == "right") {
				speed = 7;
			}
			else {
				speed = 3;
			}
		}
		else {
			if (p.pos == "left") {
				speed = 7;
			}
			else {
				speed = 3;
			}
		}

		if (p.pos == "right" && throwGameRight) {
			speed = 1;
		}

		if (p.pos == "left" && throwGameLeft) {
			speed = 1;
		}


		centre = p.y + p.h/2;

		if (centre < ball.y + 10) {
			p.y += speed;
		}
		else if (centre > ball.y - 10) {
			p.y -= speed;
		}

		if (p.y < 0) {
			p.y = 0;
		}
		if (p.y + p.h > H) {
			p.y = H - p.h;
		}
	}
	
	// Collision with paddles
	p1 = paddles[1];
	p2 = paddles[2];
	
	// If the ball strikes with paddles,
	// invert the y-velocity vector of ball,
	// increment the points, play the collision sound,
	// save collision's position so that sparks can be
	// emitted from that position, set the flag variable,
	// and change the multiplier
	if(collides(ball, p1)) {
		collideAction(ball, p1);
	}
	
	
	else if(collides(ball, p2)) {
		collideAction(ball, p2);
	} 
	
	else {
		// Collide with walls, If the ball hits the top/bottom,
		// walls, run gameOver() function
		if (ball.x + ball.r > W) {
			ball.x = W - ball.r;
			gameOver();
		} 
		else if (ball.x < 0) {
			ball.x = ball.r;
			gameOver();
		}
		
		// If ball strikes the vertical walls, invert the 
		// x-velocity vector of ball
		if(ball.y + ball.r > H) {
			ball.vy = -ball.vy;
			ball.y = H - ball.r;
		}
		
		else if(ball.y -ball.r < 0) {
			ball.vy = -ball.vy;
			ball.y = ball.r;
		}
	}
}

//Function to check collision between ball and one of
//the paddles
function collides(b, p) {
	if (b.y + ball.r >= p.y && 
			b.y - ball.r <= p.y + p.h) {
		if(b.x >= (p.x - p.w) && p.x > 0){
			paddleHit = 1;
			return true;
		}
		
		else if(b.x <= p.w && p.x == 0) {
			paddleHit = 2;
			return true;
		}
		
		else return false;
	}
}

//Do this when collides == true
function collideAction(ball, p) {
	ball.vx = -ball.vx;
	
	if(paddleHit == 1) {
		ball.x = p.x - p.w;
		multiplier = -1;	
	}
	
	else if(paddleHit == 2) {
		ball.x = p.w + ball.r;
		multiplier = 1;	
	}
}

// Function for emitting particles
function emitParticles() { 
	for(var j = 0; j < particles.length; j++) {
		par = particles[j];
		
		ctx.beginPath(); 
		ctx.fillStyle = "white";
		if (par.radius > 0) {
			ctx.arc(par.x, par.y, par.radius, 0, Math.PI*2, false);
		}
		ctx.fill();	 
		
		par.x += par.vx; 
		par.y += par.vy; 
		
		// Reduce radius so that the particles die after a few seconds
		par.radius = Math.max(par.radius - 0.05, 0.0); 
		
	} 
}

// Function for updating score
function updateScore() {
	ctx.fillStlye = "white";
	ctx.font = "16px Arial, sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Left: " + pointsLeft + ", right: " + pointsRight, 20, 20 );
}

// Function to run when the game overs
function gameOver() {
	ctx.fillStlye = "white";
	ctx.font = "20px Arial, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("oops :(", W/2, H/2 + 25 );

	if (throwGameRight) {
		pointsLeft++;
	}
	
	if (throwGameLeft) {
		pointsRight++;
	}

	
	// Stop the Animation
	cancelRequestAnimFrame(init);

	throwGameLeft = throwGameRight = 0;
	setTimeout(animloop, 5000);
	ball.x = 50;
	ball.y = 50;
	ball.vx = 4;
	ball.vy = 8;
}

// Function for running the whole animation
function animloop() {
	init = requestAnimFrame(animloop);
	draw();
}

// Function to execute at startup
function startScreen() {
	draw();
}

function checkScores() {
	console.log("checking scores");
	$.getJSON("scores.json", function(data) {
		if (data.left > pointsLeft) {
			console.log("throwing game right");
			throwGameRight = 1;
		}
		else if (data.right > pointsRight) {
			console.log("throwing game left");
			throwGameLeft = 1;
		}
	});
}

// Show the start screen
startScreen();
animloop();
setInterval(checkScores, 5000);
