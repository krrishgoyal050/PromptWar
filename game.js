/**
 * Space Dodger - Core Game Logic
 * Implements game loop, entities, local storage scoring, and state management.
 */

// --- CONFIGURATION ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 5;
const PLAYER_SIZE = 30;
const SPAWN_RATE_ASTEROID = 60; // Frames
const SPAWN_RATE_ORB = 200; // Frames

// --- STATE ---
const gameState = {
    isRunning: false,
    score: 0,
    gameOver: false,
    frames: 0,
    highScore: parseInt(localStorage.getItem('spaceDodger_highScore')) || 0,
    startTime: 0
};

// --- ENTITIES ---
class Player {
    constructor() {
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - 100;
        this.color = '#00f3ff';
        this.speed = PLAYER_SPEED;
        this.dx = 0;
        this.dy = 0;
    }

    update(input) {
        // Horizontal Movement
        if (input.keys['ArrowLeft']) this.dx = -this.speed;
        else if (input.keys['ArrowRight']) this.dx = this.speed;
        else this.dx = 0;

        // Vertical Movement
        if (input.keys['ArrowUp']) this.dy = -this.speed;
        else if (input.keys['ArrowDown']) this.dy = this.speed;
        else this.dy = 0;

        this.x += this.dx;
        this.y += this.dy;

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > CANVAS_HEIGHT) this.y = CANVAS_HEIGHT - this.height;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        // Draw a simple spaceship shape (triangle)
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 5);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Thruster glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Obstacle {
    constructor() {
        this.size = Math.random() * 30 + 20;
        this.x = Math.random() * (CANVAS_WIDTH - this.size);
        this.y = -this.size;
        this.speed = Math.random() * 3 + 2 + (gameState.score / 500); // Speed scales with score
        this.color = '#ff0055';
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speed;
        if (this.y > CANVAS_HEIGHT) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class Orb {
    constructor() {
        this.size = 15;
        this.x = Math.random() * (CANVAS_WIDTH - this.size);
        this.y = -this.size;
        this.speed = 3;
        this.color = '#00ff88';
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.speed;
        if (this.y > CANVAS_HEIGHT) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// --- MANAGERS ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let player = new Player();
let obstacles = [];
let orbs = [];
let animationId;

// Input Handling
const inputHandler = {
    keys: {},
    init() {
        window.addEventListener('keydown', e => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                this.keys[e.code] = true;
            }
            if (e.code === 'Enter' && gameState.gameOver) {
                resetGame();
            }
        });
        window.addEventListener('keyup', e => {
             if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                this.keys[e.code] = false;
            }
        });
    }
};

// --- CORE FUNCTIONS ---
function init() {
    inputHandler.init();
    updateUI();
    
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    document.getElementById('save-score-btn').addEventListener('click', handleExternalSave);
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    gameState.isRunning = true;
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.startTime = Date.now();
    player = new Player();
    obstacles = [];
    orbs = [];
    animate();
}

function resetGame() {
    startGame();
}

function checkCollisions() {
    // Player vs Obstacles
    for (let obs of obstacles) {
        if (
            player.x < obs.x + obs.size &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.size &&
            player.y + player.height > obs.y
        ) {
            handleGameOver();
        }
    }

    // Player vs Orbs
    for (let i = 0; i < orbs.length; i++) {
        let orb = orbs[i];
         if (
            player.x < orb.x + orb.size &&
            player.x + player.width > orb.x &&
            player.y < orb.y + orb.size &&
            player.y + player.height > orb.y
        ) {
            gameState.score += 100;
            orbs.splice(i, 1);
            i--;
        }
    }
}

function updateGame() {
    player.update(inputHandler);

    // Spawning
    gameState.frames++;
    if (gameState.frames % SPAWN_RATE_ASTEROID === 0) {
        obstacles.push(new Obstacle());
    }
    if (gameState.frames % SPAWN_RATE_ORB === 0) {
        orbs.push(new Orb());
    }

    // Updating Entities
    obstacles.forEach(o => o.update());
    orbs.forEach(o => o.update());

    // Cleanup
    obstacles = obstacles.filter(o => !o.markedForDeletion);
    orbs = orbs.filter(o => !o.markedForDeletion);

    // Survival Score
    if (gameState.frames % 60 === 0) {
        gameState.score += 10;
    }

    checkCollisions();
    updateUI();
}

function drawGame() {
    // Clear Canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Player
    player.draw(ctx);

    // Draw Entities
    obstacles.forEach(o => o.draw(ctx));
    orbs.forEach(o => o.draw(ctx));
}

function animate() {
    if (!gameState.isRunning) return;
    updateGame();
    drawGame();
    if (!gameState.gameOver) {
        animationId = requestAnimationFrame(animate);
    }
}

function handleGameOver() {
    gameState.isRunning = false;
    gameState.gameOver = true;
    cancelAnimationFrame(animationId);

    // High Score Logic
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('spaceDodger_highScore', gameState.highScore);
    }

    // UI Updates
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = gameState.score;
    updateUI();
}

function updateUI() {
    document.getElementById('current-score').innerText = gameState.score;
    document.getElementById('high-score').innerText = gameState.highScore;
}

// Integration Hook
async function handleExternalSave() {
    if (window.GameServices) {
        await window.GameServices.saveScore(gameState.score);
    } else {
        alert("Services not loaded.");
    }
}

// Start
init();
