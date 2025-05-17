const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const maxWidth = 400;
    const maxHeight = 600;
    const viewportWidth = Math.min(window.innerWidth * 0.9, maxWidth);
    const viewportHeight = Math.min(window.innerHeight * 0.7, maxHeight);
    canvas.width = viewportWidth;
    canvas.height = viewportHeight;
    ball.x = viewportWidth / 2;
    ball.y = viewportHeight / 2;
    ball.radius = 20 * (viewportWidth / 400);
}

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let ball = { x: 200, y: 300, radius: 20, speedX: 2, speedY: 2, color: '#10b981', scale: 1 };
let gameRunning = false;
let gamePaused = false;
let animationFrameId;
let lastClickTime = 0;
const clickCooldown = 100;

const ballColors = [
    '#10b981', // Emerald green
    '#3b82f6', // Blue
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#8b5cf6' // Purple
];
let colorIndex = 0;

let particles = [];

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 3 + 1,
            color: color,
            speedX: (Math.random() - 0.5) * 4,
            speedY: (Math.random() - 0.5) * 4,
            life: 30
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        p.radius *= 0.95;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fill();
        ctx.closePath();
    });
    ctx.globalAlpha = 1;
}

let audioCtx;

function playTapSound() {
    if (!audioCtx) {
        audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScoreValue');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const gameplayButtons = document.getElementById('gameplay-buttons');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

highScoreElement.textContent = highScore;
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function startGame() {
    score = 0;
    scoreElement.textContent = score;
    resizeCanvas();
    colorIndex = 0;
    ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 20 * (canvas.width / 400),
        speedX: 2,
        speedY: 2,
        color: ballColors[colorIndex],
        scale: 1
    };
    particles = [];
    gameRunning = true;
    gamePaused = false;
    startButton.style.display = 'none';
    gameplayButtons.style.display = 'flex';
    pauseButton.textContent = 'Pause';
    gameOverScreen.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    gameLoop();
}

function pauseGame() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    pauseButton.textContent = gamePaused ? 'Resume' : 'Pause';
    if (!gamePaused) {
        gameLoop();
    } else {
        cancelAnimationFrame(animationFrameId);
    }
}

function stopGame() {
    if (!gameRunning) return;
    endGame();
}

function drawBall() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * ball.scale, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.shadowColor = ball.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.speedX = -ball.speedX;
    }
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }

    if (ball.scale > 1) {
        ball.scale -= 0.05;
        if (ball.scale < 1) ball.scale = 1;
    }
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawParticles();
    drawBall();
    updateBall();
    updateParticles();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;
    gamePaused = false;
    cancelAnimationFrame(animationFrameId);
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
    startButton.style.display = 'block';
    gameplayButtons.style.display = 'none';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function handleInput(e) {
    if (!gameRunning || gamePaused) return;
    const currentTime = Date.now();
    if (currentTime - lastClickTime < clickCooldown) return;
    lastClickTime = currentTime;

    let clickX, clickY;
    if (e.type === 'touchstart') {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        clickX = e.touches[0].clientX - rect.left;
        clickY = e.touches[0].clientY - rect.top;
    } else {
        const rect = canvas.getBoundingClientRect();
        clickX = e.clientX - rect.left;
        clickY = e.clientY - rect.top;
    }

    const hitRadius = ball.radius * 1.5;
    const dist = Math.sqrt((clickX - ball.x) ** 2 + (clickY - ball.y) ** 2);
    if (dist <= hitRadius) {
        score++;
        scoreElement.textContent = score;
        ball.speedX *= 1.03;
        ball.speedY *= 1.03;
        ball.scale = 1.2;
        colorIndex = (colorIndex + 1) % ballColors.length;
        ball.color = ballColors[colorIndex];
        createParticles(ball.x, ball.y, ball.color);
        playTapSound();
    } else {
        endGame();
    }
}

canvas.addEventListener('click', handleInput);
canvas.addEventListener('touchstart', handleInput);
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
stopButton.addEventListener('click', stopGame);
restartButton.addEventListener('click', startGame);