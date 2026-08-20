const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const distanceText = document.getElementById("distance");
const coinsText = document.getElementById("coins");
const fuelText = document.getElementById("fuel");

const gameOverScreen = document.getElementById("gameOver");
const finalDistance = document.getElementById("finalDistance");
const finalCoins = document.getElementById("finalCoins");

const gasButton = document.getElementById("gas");
const brakeButton = document.getElementById("brake");
const restartButton = document.getElementById("restart");

let width;
let height;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    width = canvas.width;
    height = canvas.height;
}

window.addEventListener("resize", resize);
resize();


// =========================
// GAME VARIABLES
// =========================

let gameRunning = true;

let cameraX = 0;

let distance = 0;
let coins = 0;
let fuel = 100;

let speed = 0;

let gravity = 0.45;
let acceleration = 0.08;

let gasPressed = false;
let brakePressed = false;


// =========================
// CAR
// =========================

const car = {
    x: 200,
    y: 300,

    width: 80,
    height: 35,

    velocityY: 0,

    angle: 0,
    angularVelocity: 0,

    grounded: false
};


// =========================
// TERRAIN
// =========================

const terrain = [];

const terrainStep = 40;

function generateTerrain() {

    terrain.length = 0;

    let y = height * 0.65;

    for (let x = 0; x < 20000; x += terrainStep) {

        y += Math.sin(x * 0.008) * 4;
        y += Math.sin(x * 0.021) * 2;

        y = Math.max(height * 0.35, Math.min(height * 0.82, y));

        terrain.push({
            x: x,
            y: y
        });
    }
}

generateTerrain();


// =========================
// GET TERRAIN HEIGHT
// =========================

function getGroundY(x) {

    const index = Math.floor(x / terrainStep);

    if (index < 0) {
        return height * 0.65;
    }

    if (index >= terrain.length - 1) {
        return height * 0.65;
    }

    const p1 = terrain[index];
    const p2 = terrain[index + 1];

    const amount = (x - p1.x) / terrainStep;

    return p1.y + (p2.y - p1.y) * amount;
}


// =========================
// TERRAIN ANGLE
// =========================

function getTerrainAngle(x) {

    const y1 = getGroundY(x - 10);
    const y2 = getGroundY(x + 10);

    return Math.atan2(y2 - y1, 20);
}


// =========================
// COINS
// =========================

const coinList = [];

function generateCoins() {

    coinList.length = 0;

    for (let x = 500; x < 19000; x += 350) {

        coinList.push({
            x: x,
            collected: false
        });
    }
}

generateCoins();


// =========================
// DRAW SKY
// =========================

function drawBackground() {

    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        height
    );

    gradient.addColorStop(0, "#55c7ff");
    gradient.addColorStop(1, "#dff8ff");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Sun
    ctx.fillStyle = "#ffd54f";

    ctx.beginPath();
    ctx.arc(
        width - 100,
        100,
        45,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// =========================
// DRAW TERRAIN
// =========================

function drawTerrain() {

    ctx.beginPath();

    ctx.moveTo(0, height);

    for (let i = 0; i < terrain.length; i++) {

        const point = terrain[i];

        const screenX = point.x - cameraX;

        if (screenX > width + 50) {
            break;
        }

        if (screenX >= -50) {

            ctx.lineTo(
                screenX,
                point.y
            );
        }
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    ctx.fillStyle = "#5cb85c";
    ctx.fill();

    // Ground line
    ctx.beginPath();

    for (let i = 0; i < terrain.length; i++) {

        const point = terrain[i];

        const screenX = point.x - cameraX;

        if (screenX >= -50 && screenX <= width + 50) {

            if (i === 0) {
                ctx.moveTo(screenX, point.y);
            } else {
                ctx.lineTo(screenX, point.y);
            }
        }
    }

    ctx.strokeStyle = "#27632a";
    ctx.lineWidth = 5;

    ctx.stroke();
}


// =========================
// DRAW COINS
// =========================

function drawCoins() {

    coinList.forEach(coin => {

        if (coin.collected) return;

        const screenX = coin.x - cameraX;

        if (screenX < -30 || screenX > width + 30) {
            return;
        }

        const groundY = getGroundY(coin.x);

        const coinY = groundY - 70;

        ctx.fillStyle = "#ffd700";

        ctx.beginPath();

        ctx.arc(
            screenX,
            coinY,
            13,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle = "#ff9800";
        ctx.lineWidth = 3;

        ctx.stroke();

        ctx.fillStyle = "#fff3a3";

        ctx.beginPath();

        ctx.arc(
            screenX - 4,
            coinY - 4,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}


// =========================
// DRAW CAR
// =========================

function drawCar() {

    const screenX = car.x - cameraX;

    ctx.save();

    ctx.translate(
        screenX,
        car.y
    );

    ctx.rotate(car.angle);

    // Body
    ctx.fillStyle = "#e53935";

    ctx.fillRect(
        -car.width / 2,
        -car.height / 2,
        car.width,
        car.height
    );

    // Roof
    ctx.fillStyle = "#b71c1c";

    ctx.beginPath();

    ctx.moveTo(-25, -18);
    ctx.lineTo(-10, -35);
    ctx.lineTo(25, -35);
    ctx.lineTo(35, -18);

    ctx.closePath();

    ctx.fill();

    // Windows
    ctx.fillStyle = "#9ee7ff";

    ctx.fillRect(
        -8,
        -30,
        15,
        11
    );

    ctx.fillRect(
        10,
        -30,
        12,
        11
    );

    // Wheels
    drawWheel(-27, 18);
    drawWheel(27, 18);

    ctx.restore();
}


function drawWheel(x, y) {

    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        12,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#aaa";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// =========================
// CAR PHYSICS
// =========================

function updateCar() {

    if (!gameRunning) return;

    // Acceleration
    if (gasPressed && fuel > 0) {

        speed += acceleration;

        fuel -= 0.025;
    }

    // Brake / reverse
    if (brakePressed) {

        speed -= acceleration * 1.4;
    }

    // Natural drag
    speed *= 0.995;

    // Limit speed
    speed = Math.max(
        -3,
        Math.min(speed, 9)
    );

    // Move car
    car.x += speed;

    // Gravity
    car.velocityY += gravity;

    car.y += car.velocityY;

    const groundY = getGroundY(car.x);

    const targetY =
        groundY - car.height / 2 - 15;

    // Ground collision
    if (car.y >= targetY) {

        car.y = targetY;

        car.velocityY = 0;

        car.grounded = true;

        const slope = getTerrainAngle(car.x);

        car.angle +=
            (slope - car.angle) * 0.15;

        car.angularVelocity = 0;

    } else {

        car.grounded = false;

        // Air rotation
        if (gasPressed) {
            car.angularVelocity += 0.002;
        }

        if (brakePressed) {
            car.angularVelocity -= 0.002;
        }

        car.angularVelocity *= 0.99;

        car.angle += car.angularVelocity;
    }

    // Camera follows car
    cameraX = car.x - width * 0.3;

    if (cameraX < 0) {
        cameraX = 0;
    }

    // Distance
    distance = Math.max(
        0,
        Math.floor(car.x / 10)
    );

    distanceText.textContent = distance;

    fuelText.textContent =
        Math.max(0, Math.floor(fuel));

    // Fuel empty
    if (fuel <= 0 && speed < 0.2) {

        endGame();
    }

    checkCoins();

    // Flip/crash detection
    if (Math.abs(car.angle) > Math.PI * 0.85) {

        endGame();
    }
}


// =========================
// COIN COLLECTION
// =========================

function checkCoins() {

    coinList.forEach(coin => {

        if (coin.collected) return;

        const groundY = getGroundY(coin.x);

        const coinY = groundY - 70;

        const dx = car.x - coin.x;
        const dy = car.y - coinY;

        const distanceToCoin =
            Math.sqrt(dx * dx + dy * dy);

        if (distanceToCoin < 50) {

            coin.collected = true;

            coins++;

            coinsText.textContent = coins;
        }
    });
}


// =========================
// GAME OVER
// =========================

function endGame() {

    if (!gameRunning) return;

    gameRunning = false;

    finalDistance.textContent = distance;
    finalCoins.textContent = coins;

    gameOverScreen.style.display = "flex";
}


// =========================
// RESTART
// =========================

function restartGame() {

    gameRunning = true;

    distance = 0;
    coins = 0;
    fuel = 100;

    speed = 0;

    cameraX = 0;

    car.x = 200;
    car.y = 300;

    car.velocityY = 0;

    car.angle = 0;
    car.angularVelocity = 0;

    coinList.forEach(
        coin => coin.collected = false
    );

    distanceText.textContent = "0";
    coinsText.textContent = "0";
    fuelText.textContent = "100";

    gameOverScreen.style.display = "none";
}


// =========================
// CONTROLS
// =========================

window.addEventListener("keydown", e => {

    if (e.key === "ArrowRight" || e.key === "d") {
        gasPressed = true;
    }

    if (e.key === "ArrowLeft" || e.key === "a") {
        brakePressed = true;
    }
});


window.addEventListener("keyup", e => {

    if (e.key === "ArrowRight" || e.key === "d") {
        gasPressed = false;
    }

    if (e.key === "ArrowLeft" || e.key === "a") {
        brakePressed = false;
    }
});


// Mobile controls

gasButton.addEventListener("pointerdown", () => {
    gasPressed = true;
});

gasButton.addEventListener("pointerup", () => {
    gasPressed = false;
});

gasButton.addEventListener("pointerleave", () => {
    gasPressed = false;
});


brakeButton.addEventListener("pointerdown", () => {
    brakePressed = true;
});

brakeButton.addEventListener("pointerup", () => {
    brakePressed = false;
});

brakeButton.addEventListener("pointerleave", () => {
    brakePressed = false;
});


restartButton.addEventListener(
    "click",
    restartGame
);


// =========================
// GAME LOOP
// =========================

function gameLoop() {

    updateCar();

    drawBackground();

    drawTerrain();

    drawCoins();

    drawCar();

    requestAnimationFrame(gameLoop);
}

gameLoop();