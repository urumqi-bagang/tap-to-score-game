const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let ball = { x: 200, y: 300, radius: 20, speedX: 2, speedY: 2 };
let gameRunning = false;
let animationFrameId;
let lastClickTime = 0;
const clickCooldown = 100; // 100ms cooldown to prevent rapid clicks

const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScoreValue');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

highScoreElement.textContent = highScore;

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
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
}

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    updateBall();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function startGame() {
    score = 0;
    scoreElement.textContent = score;
    ball = { x: 200, y: 300, radius: 20, speedX: 2, speedY: 2 };
    gameRunning = true;
    startButton.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function handleInput(e) {
    if (!gameRunning) return;
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

    // Increase hitbox by 50% (1.5x radius)
    const hitRadius = ball.radius * 1.5;
    const dist = Math.sqrt((clickX - ball.x) ** 2 + (clickY - ball.y) ** 2);
    if (dist <= hitRadius) {
        score++;
        scoreElement.textContent = score;
        // Reduce speed increase to 3% for better control
        ball.speedX *= 1.03;
        ball.speedY *= 1.03;
    } else {
        endGame();
    }
}

canvas.addEventListener('click', handleInput);
canvas.addEventListener('touchstart', handleInput);

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
