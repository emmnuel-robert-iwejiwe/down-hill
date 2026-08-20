const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const distanceText = document.getElementById("distance");
const coinsText = document.getElementById("coins");
const scoreText = document.getElementById("score");
const fuelText = document.getElementById("fuel");
const goalText = document.getElementById("goal");

const countdownScreen = document.getElementById("countdown");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOver");
const endTitle = document.getElementById("endTitle");
const finalDistance = document.getElementById("finalDistance");
const finalCoins = document.getElementById("finalCoins");
const finalScore = document.getElementById("finalScore");

const gasButton = document.getElementById("gas");
const brakeButton = document.getElementById("brake");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resume");
const restartButton = document.getElementById("restart");

let width;
let height;

const GOAL_DISTANCE = 2000;
const TERRAIN_LENGTH = 26000;
const TERRAIN_STEP = 35;
const COUNTDOWN_SECONDS = 3;
const MAX_FUEL = 100;
const FUEL_CAN_AMOUNT = 30;

goalText.textContent = GOAL_DISTANCE;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    width = canvas.width;
    height = canvas.height;
}

window.addEventListener("resize", () => {
    resize();
    generateTerrain();
    positionItems();
});

resize();

let gameState = "countdown";
let countdownStartedAt = performance.now();
let lastFrameTime = performance.now();

let cameraX = 0;
let distance = 0;
let coins = 0;
let score = 0;
let fuel = MAX_FUEL;
let speed = 0;
let airtime = 0;
let completedFlip = false;
let previousGrounded = false;

let gasPressed = false;
let brakePressed = false;

const physics = {
    gravity: 0.45,
    acceleration: 0.08,
    drag: 0.995,
    maxReverseSpeed: -3,
    maxForwardSpeed: 9
};

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

const terrain = [];
const coinList = [];
const fuelCanList = [];
const floatingTexts = [];

function generateTerrain() {
    terrain.length = 0;

    let y = height * 0.65;

    for (let x = 0; x < TERRAIN_LENGTH; x += TERRAIN_STEP) {
        const rollingHills = Math.sin(x * 0.006) * 5;
        const smallBumps = Math.sin(x * 0.021) * 2.5;
        const roughPatch = Math.sin(x * 0.043) * 1.5;
        const ramp = Math.sin(Math.max(0, x - 3200) * 0.002) * 4;

        y += rollingHills + smallBumps + roughPatch + ramp;

        if (x > 6500 && x < 7200) {
            y -= 3.2;
        }

        if (x > 9800 && x < 10700) {
            y += 3.7;
        }

        if (x > 13500 && x < 14500) {
            y -= 4.4;
        }

        y = Math.max(height * 0.34, Math.min(height * 0.84, y));

        terrain.push({ x, y });
    }
}

function getGroundY(x) {
    const index = Math.floor(x / TERRAIN_STEP);

    if (index < 0 || index >= terrain.length - 1) {
        return height * 0.65;
    }

    const p1 = terrain[index];
    const p2 = terrain[index + 1];
    const amount = (x - p1.x) / TERRAIN_STEP;

    return p1.y + (p2.y - p1.y) * amount;
}

function getTerrainAngle(x) {
    const y1 = getGroundY(x - 10);
    const y2 = getGroundY(x + 10);

    return Math.atan2(y2 - y1, 20);
}

function positionItems() {
    coinList.length = 0;
    fuelCanList.length = 0;

    const patterns = [
        [-75, -35, 5, 45, 85],
        [-90, -50, -10, 35, 80, 125],
        [-50, 0, 50]
    ];

    for (let x = 500; x < GOAL_DISTANCE * 10 - 400; x += 650) {
        const pattern = patterns[Math.floor(x / 650) % patterns.length];

        pattern.forEach((offset, index) => {
            const coinX = x + offset;
            const lift = 58 + (index % 3) * 15;

            coinList.push({
                x: coinX,
                y: getGroundY(coinX) - lift,
                collected: false
            });
        });
    }

    for (let x = 1150; x < GOAL_DISTANCE * 10 - 300; x += 1850) {
        fuelCanList.push({
            x,
            y: getGroundY(x) - 65,
            collected: false
        });
    }
}

generateTerrain();
positionItems();

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#55c7ff");
    gradient.addColorStop(1, "#dff8ff");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffd54f";
    ctx.beginPath();
    ctx.arc(width - 100, 100, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    drawCloud(160 - cameraX * 0.12, 100, 1);
    drawCloud(520 - cameraX * 0.1, 145, 0.8);
    drawCloud(920 - cameraX * 0.08, 85, 1.1);
}

function drawCloud(x, y, scale) {
    const wrappedX = ((x % (width + 260)) + width + 260) % (width + 260) - 130;

    ctx.beginPath();
    ctx.arc(wrappedX, y, 24 * scale, 0, Math.PI * 2);
    ctx.arc(wrappedX + 28 * scale, y - 12 * scale, 28 * scale, 0, Math.PI * 2);
    ctx.arc(wrappedX + 62 * scale, y, 22 * scale, 0, Math.PI * 2);
    ctx.fill();
}

function drawTerrain() {
    ctx.beginPath();
    ctx.moveTo(0, height);

    terrain.forEach(point => {
        const screenX = point.x - cameraX;

        if (screenX >= -50 && screenX <= width + 50) {
            ctx.lineTo(screenX, point.y);
        }
    });

    ctx.lineTo(width, height);
    ctx.closePath();

    ctx.fillStyle = "#5cb85c";
    ctx.fill();

    ctx.beginPath();

    terrain.forEach((point, index) => {
        const screenX = point.x - cameraX;

        if (screenX >= -50 && screenX <= width + 50) {
            if (index === 0 || screenX < -20) {
                ctx.moveTo(screenX, point.y);
            } else {
                ctx.lineTo(screenX, point.y);
            }
        }
    });

    ctx.strokeStyle = "#27632a";
    ctx.lineWidth = 5;
    ctx.stroke();

    drawFinishLine();
}

function drawFinishLine() {
    const finishX = GOAL_DISTANCE * 10 - cameraX;

    if (finishX < -80 || finishX > width + 80) {
        return;
    }

    const groundY = getGroundY(GOAL_DISTANCE * 10);

    ctx.fillStyle = "#222";
    ctx.fillRect(finishX - 4, groundY - 160, 8, 160);

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? "#fff" : "#111";
            ctx.fillRect(finishX + col * 18, groundY - 160 + row * 18, 18, 18);
        }
    }
}

function drawCoins() {
    coinList.forEach(coin => {
        if (coin.collected) return;

        const screenX = coin.x - cameraX;

        if (screenX < -30 || screenX > width + 30) {
            return;
        }

        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(screenX, coin.y, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ff9800";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "#fff3a3";
        ctx.beginPath();
        ctx.arc(screenX - 4, coin.y - 4, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawFuelCans() {
    fuelCanList.forEach(can => {
        if (can.collected) return;

        const screenX = can.x - cameraX;

        if (screenX < -30 || screenX > width + 30) {
            return;
        }

        ctx.fillStyle = "#d32f2f";
        ctx.fillRect(screenX - 14, can.y - 18, 28, 36);

        ctx.fillStyle = "#f44336";
        ctx.fillRect(screenX - 8, can.y - 25, 18, 9);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("F", screenX, can.y + 2);
    });
}

function drawCar() {
    const screenX = car.x - cameraX;

    ctx.save();
    ctx.translate(screenX, car.y);
    ctx.rotate(car.angle);

    ctx.fillStyle = "#e53935";
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

    ctx.fillStyle = "#b71c1c";
    ctx.beginPath();
    ctx.moveTo(-25, -18);
    ctx.lineTo(-10, -35);
    ctx.lineTo(25, -35);
    ctx.lineTo(35, -18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#9ee7ff";
    ctx.fillRect(-8, -30, 15, 11);
    ctx.fillRect(10, -30, 12, 11);

    drawWheel(-27, 18);
    drawWheel(27, 18);

    ctx.restore();
}

function drawWheel(x, y) {
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#aaa";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
}

function updateCountdown(now) {
    if (gameState !== "countdown") {
        countdownScreen.style.display = "none";
        return;
    }

    const elapsed = (now - countdownStartedAt) / 1000;
    const remaining = Math.ceil(COUNTDOWN_SECONDS - elapsed);

    countdownScreen.style.display = "flex";
    countdownScreen.textContent = remaining > 0 ? remaining : "GO";

    if (elapsed >= COUNTDOWN_SECONDS + 0.6) {
        countdownScreen.style.display = "none";
        gameState = "running";
    }
}

function updateCar(dt) {
    if (gameState !== "running") return;

    if (gasPressed && fuel > 0) {
        speed += physics.acceleration * dt;
        fuel -= 0.025 * dt;
    }

    if (brakePressed) {
        speed -= physics.acceleration * 1.4 * dt;
    }

    const slope = getTerrainAngle(car.x);
    speed += Math.sin(slope) * 0.025 * dt;
    speed *= Math.pow(physics.drag, dt);
    speed = Math.max(physics.maxReverseSpeed, Math.min(speed, physics.maxForwardSpeed));

    car.x += speed * dt;
    car.velocityY += physics.gravity * dt;
    car.y += car.velocityY * dt;

    const groundY = getGroundY(car.x);
    const targetY = groundY - car.height / 2 - 15;

    previousGrounded = car.grounded;

    if (car.y >= targetY) {
        car.y = targetY;
        car.velocityY = 0;
        car.grounded = true;
        car.angle += (slope - car.angle) * 0.15 * dt;
        car.angularVelocity = 0;

        if (!previousGrounded) {
            awardLandingBonus();
        }
    } else {
        car.grounded = false;
        airtime += dt / 60;

        if (gasPressed) {
            car.angularVelocity += 0.002 * dt;
        }

        if (brakePressed) {
            car.angularVelocity -= 0.002 * dt;
        }

        car.angularVelocity *= Math.pow(0.99, dt);
        car.angle += car.angularVelocity * dt;

        if (Math.abs(car.angle) > Math.PI * 1.85) {
            completedFlip = true;
        }
    }

    cameraX = Math.max(0, car.x - width * 0.3);
    distance = Math.max(0, Math.floor(car.x / 10));
    score = Math.max(score, distance + coins * 25);

    updateHud();
    checkCoins();
    checkFuelCans();
    updateFloatingTexts(dt);

    if (distance >= GOAL_DISTANCE) {
        endGame("LEVEL COMPLETE");
    }

    if (fuel <= 0 && Math.abs(speed) < 0.2) {
        endGame("OUT OF FUEL");
    }

    if (Math.abs(car.angle) > Math.PI * 0.85 && car.grounded) {
        endGame("CRASHED");
    }
}

function awardLandingBonus() {
    if (airtime >= 0.7) {
        const bonus = Math.floor(airtime * 35);
        score += bonus;
        addFloatingText(`AIR +${bonus}`, car.x, car.y - 70);
    }

    if (completedFlip && Math.abs(car.angle) < Math.PI * 0.35) {
        score += 250;
        addFloatingText("FLIP +250", car.x, car.y - 95);
    }

    airtime = 0;
    completedFlip = false;
}

function checkCoins() {
    coinList.forEach(coin => {
        if (coin.collected) return;

        const dx = car.x - coin.x;
        const dy = car.y - coin.y;
        const distanceToCoin = Math.sqrt(dx * dx + dy * dy);

        if (distanceToCoin < 50) {
            coin.collected = true;
            coins++;
            score += 25;
            addFloatingText("+25", coin.x, coin.y - 18);
            updateHud();
        }
    });
}

function checkFuelCans() {
    fuelCanList.forEach(can => {
        if (can.collected) return;

        const dx = car.x - can.x;
        const dy = car.y - can.y;
        const distanceToCan = Math.sqrt(dx * dx + dy * dy);

        if (distanceToCan < 55) {
            can.collected = true;
            fuel = Math.min(MAX_FUEL, fuel + FUEL_CAN_AMOUNT);
            score += 75;
            addFloatingText("FUEL +75", can.x, can.y - 25);
            updateHud();
        }
    });
}

function addFloatingText(text, x, y) {
    floatingTexts.push({
        text,
        x,
        y,
        life: 70
    });
}

function updateFloatingTexts(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].y -= 0.45 * dt;
        floatingTexts[i].life -= dt;

        if (floatingTexts[i].life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

function drawFloatingTexts() {
    floatingTexts.forEach(item => {
        const screenX = item.x - cameraX;
        const alpha = Math.max(0, item.life / 70);

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.65})`;
        ctx.lineWidth = 4;
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(item.text, screenX, item.y);
        ctx.fillText(item.text, screenX, item.y);
    });
}

function updateHud() {
    distanceText.textContent = distance;
    coinsText.textContent = coins;
    scoreText.textContent = score;
    fuelText.textContent = Math.max(0, Math.floor(fuel));
}

function endGame(title) {
    if (gameState === "gameOver") return;

    gameState = "gameOver";
    gasPressed = false;
    brakePressed = false;

    endTitle.textContent = title;
    finalDistance.textContent = distance;
    finalCoins.textContent = coins;
    finalScore.textContent = score;

    countdownScreen.style.display = "none";
    pauseScreen.style.display = "none";
    gameOverScreen.style.display = "flex";
}

function pauseGame() {
    if (gameState !== "running") return;

    gameState = "paused";
    gasPressed = false;
    brakePressed = false;
    pauseScreen.style.display = "flex";
}

function resumeGame() {
    if (gameState !== "paused") return;

    gameState = "running";
    pauseScreen.style.display = "none";
    lastFrameTime = performance.now();
}

function restartGame() {
    gameState = "countdown";
    countdownStartedAt = performance.now();
    lastFrameTime = performance.now();

    distance = 0;
    coins = 0;
    score = 0;
    fuel = MAX_FUEL;
    speed = 0;
    cameraX = 0;
    airtime = 0;
    completedFlip = false;
    previousGrounded = false;

    car.x = 200;
    car.y = 300;
    car.velocityY = 0;
    car.angle = 0;
    car.angularVelocity = 0;
    car.grounded = false;

    generateTerrain();
    positionItems();
    floatingTexts.length = 0;

    updateHud();
    gameOverScreen.style.display = "none";
    pauseScreen.style.display = "none";
    countdownScreen.style.display = "flex";
}

window.addEventListener("keydown", event => {
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        gasPressed = true;
    }

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        brakePressed = true;
    }

    if (event.key.toLowerCase() === "p") {
        if (gameState === "paused") {
            resumeGame();
        } else {
            pauseGame();
        }
    }
});

window.addEventListener("keyup", event => {
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        gasPressed = false;
    }

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        brakePressed = false;
    }
});

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

pauseButton.addEventListener("click", () => {
    if (gameState === "paused") {
        resumeGame();
    } else {
        pauseGame();
    }
});

resumeButton.addEventListener("click", resumeGame);
restartButton.addEventListener("click", restartGame);

function drawGame() {
    drawBackground();
    drawTerrain();
    drawCoins();
    drawFuelCans();
    drawCar();
    drawFloatingTexts();
}

function gameLoop(now) {
    const frameDelta = Math.min(2, (now - lastFrameTime) / 16.67);
    lastFrameTime = now;

    updateCountdown(now);
    updateCar(frameDelta);
    drawGame();

    requestAnimationFrame(gameLoop);
}

updateHud();
requestAnimationFrame(gameLoop);
