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
let wheelRotation = 0;
let suspensionCompression = 0;
let landingImpact = 0;
let crashTimer = 0;
let smokeTimer = 0;
let dustTimer = 0;
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
const particles = [];

const vehicleImages = {
    body: loadVehicleImage("assets/sprites/vehicle/bodies/car-body.png"),
    bodyDamaged: loadVehicleImage("assets/sprites/vehicle/bodies/car-body-damaged.png"),
    bodyFlipped: loadVehicleImage("assets/sprites/vehicle/bodies/car-body-flipped.png"),
    driverIdle: loadVehicleImage("assets/sprites/vehicle/drivers/driver-idle.png"),
    driverLeanBack: loadVehicleImage("assets/sprites/vehicle/drivers/driver-lean-back.png"),
    driverLeanForward: loadVehicleImage("assets/sprites/vehicle/drivers/driver-lean-forward.png"),
    driverPanic: loadVehicleImage("assets/sprites/vehicle/drivers/driver-panic.png"),
    frontWheel: loadVehicleImage("assets/sprites/vehicle/parts/front-wheel.png"),
    rearWheel: loadVehicleImage("assets/sprites/vehicle/parts/rear-wheel.png"),
    suspension: loadVehicleImage("assets/sprites/vehicle/parts/suspension.png"),
    exhaustPipe: loadVehicleImage("assets/sprites/vehicle/parts/exhaust-pipe.png"),
    smokeSmall: loadVehicleImage("assets/sprites/vehicle/effects/exhaust-smoke-small.png"),
    smokeMedium: loadVehicleImage("assets/sprites/vehicle/effects/exhaust-smoke-medium.png"),
    smokeLarge: loadVehicleImage("assets/sprites/vehicle/effects/exhaust-smoke-large.png")
};

function loadVehicleImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

function vehicleImagesReady() {
    return Object.values(vehicleImages).every(image => image.complete && image.naturalWidth > 0);
}

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

function getWheelContact() {
    const rearX = car.x - 43;
    const frontX = car.x + 45;
    const rearY = getGroundY(rearX);
    const frontY = getGroundY(frontX);

    return {
        rearX,
        frontX,
        rearY,
        frontY,
        centerY: Math.min(rearY, frontY) - car.height / 2 - 15,
        angle: Math.atan2(frontY - rearY, frontX - rearX)
    };
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

    if (vehicleImagesReady()) {
        const compression = suspensionCompression + landingImpact;
        const wheelDrop = -compression * 7;
        const bodyDrop = compression * 3;

        drawImage(getBodyImage(), -86, -64 + bodyDrop, 172, 94);
        drawImage(vehicleImages.exhaustPipe, -96, -12 + bodyDrop, 40, 24);
        drawSuspension(-45, 8 + bodyDrop, -0.12, compression);
        drawSuspension(47, 8 + bodyDrop, 0.12, compression);
        drawDriverSprite();
        drawRotatingImage(vehicleImages.rearWheel, -45, 23 + wheelDrop, 52, 52, wheelRotation);
        drawRotatingImage(vehicleImages.frontWheel, 47, 23 + wheelDrop, 52, 52, wheelRotation);
        ctx.restore();
        return;
    }

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

function drawSuspension(centerX, centerY, rotation, compression) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.scale(1, Math.max(0.72, 1 - compression * 0.24));
    drawImage(vehicleImages.suspension, -9, -21, 18, 42);
    ctx.restore();
}

function getBodyImage() {
    if (gameState === "gameOver" && endTitle.textContent === "CRASHED") {
        return vehicleImages.bodyDamaged;
    }

    if (Math.abs(car.angle) > Math.PI * 0.55 && !car.grounded) {
        return vehicleImages.bodyFlipped;
    }

    return vehicleImages.body;
}

function drawDriverSprite() {
    const image = getDriverImage();
    const leanOffset = getDriverLeanOffset();

    drawImage(
        image,
        -35 + leanOffset.x,
        -85 + leanOffset.y,
        76,
        78
    );
}

function getDriverImage() {
    if (gameState === "gameOver" || (!car.grounded && Math.abs(car.angle) > Math.PI * 0.55)) {
        return vehicleImages.driverPanic;
    }

    if (brakePressed || speed < -0.4) {
        return vehicleImages.driverLeanForward;
    }

    if (gasPressed || speed > 2.4) {
        return vehicleImages.driverLeanBack;
    }

    return vehicleImages.driverIdle;
}

function getDriverLeanOffset() {
    if (brakePressed || speed < -0.4) {
        return { x: 5, y: 3 };
    }

    if (gasPressed || speed > 2.4) {
        return { x: -4, y: -1 };
    }

    return { x: 0, y: 0 };
}

function drawImage(image, x, y, drawWidth, drawHeight) {
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
}

function drawRotatingImage(image, centerX, centerY, drawWidth, drawHeight, rotation) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
}

function addParticle(type, x, y, velocityX, velocityY, size, life) {
    particles.push({
        type,
        x,
        y,
        velocityX,
        velocityY,
        size,
        life,
        maxLife: life,
        rotation: Math.random() * Math.PI * 2
    });
}

function emitExhaustSmoke(dt) {
    if (!gasPressed || fuel <= 0) return;

    smokeTimer -= dt;

    if (smokeTimer > 0) return;

    const exhaustX = car.x - 72 * Math.cos(car.angle) + 12 * Math.sin(car.angle);
    const exhaustY = car.y - 72 * Math.sin(car.angle) - 12 * Math.cos(car.angle);

    addParticle(
        "smoke",
        exhaustX,
        exhaustY,
        -0.8 - Math.random() * 0.7,
        -0.35 - Math.random() * 0.25,
        20 + Math.random() * 14,
        55
    );

    smokeTimer = Math.max(3, 10 - Math.abs(speed));
}

function emitWheelDust(dt) {
    if (!car.grounded || Math.abs(speed) < 0.7) return;

    dustTimer -= dt;

    if (dustTimer > 0) return;

    const rearWheelX = car.x - 43 * Math.cos(car.angle) - 23 * Math.sin(car.angle);
    const rearWheelY = car.y - 43 * Math.sin(car.angle) + 23 * Math.cos(car.angle);

    addParticle(
        "dust",
        rearWheelX,
        rearWheelY + 8,
        -Math.sign(speed || 1) * (0.7 + Math.random() * 0.7),
        -0.25 - Math.random() * 0.4,
        11 + Math.random() * 10,
        34
    );

    dustTimer = Math.max(2, 8 - Math.abs(speed) * 0.6);
}

function emitLandingDust(impact) {
    const amount = Math.min(14, 4 + Math.floor(impact * 2));

    for (let i = 0; i < amount; i++) {
        addParticle(
            "dust",
            car.x - 40 + Math.random() * 80,
            car.y + 28,
            -1.4 + Math.random() * 2.8,
            -0.5 - Math.random() * 1.1,
            14 + Math.random() * 16,
            42 + Math.random() * 18
        );
    }
}

function emitCrashDust() {
    for (let i = 0; i < 22; i++) {
        addParticle(
            "dust",
            car.x - 55 + Math.random() * 110,
            car.y + 5 + Math.random() * 40,
            -2.2 + Math.random() * 4.4,
            -1.5 - Math.random() * 1.6,
            16 + Math.random() * 24,
            55 + Math.random() * 25
        );
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.velocityX * dt;
        particle.y += particle.velocityY * dt;
        particle.velocityY += particle.type === "dust" ? 0.018 * dt : -0.004 * dt;
        particle.life -= dt;

        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(particle => {
        const screenX = particle.x - cameraX;
        const alpha = Math.max(0, particle.life / particle.maxLife);

        if (particle.type === "smoke" && vehicleImagesReady()) {
            const image = alpha > 0.66
                ? vehicleImages.smokeSmall
                : alpha > 0.33
                    ? vehicleImages.smokeMedium
                    : vehicleImages.smokeLarge;

            ctx.save();
            ctx.globalAlpha = alpha * 0.8;
            ctx.translate(screenX, particle.y);
            ctx.rotate(particle.rotation);
            drawImage(image, -particle.size / 2, -particle.size / 2, particle.size, particle.size);
            ctx.restore();
            return;
        }

        ctx.fillStyle = `rgba(118, 86, 55, ${alpha * 0.45})`;
        ctx.beginPath();
        ctx.arc(screenX, particle.y, particle.size * (1 - alpha * 0.25), 0, Math.PI * 2);
        ctx.fill();
    });
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
    if (gameState !== "running") {
        updateParticles(dt);
        return;
    }

    if (gasPressed && fuel > 0) {
        speed += physics.acceleration * dt;
        fuel -= 0.025 * dt;
    }

    if (brakePressed) {
        speed -= physics.acceleration * 1.4 * dt;
    }

    const contact = getWheelContact();
    speed += Math.sin(contact.angle) * 0.025 * dt;
    speed *= Math.pow(physics.drag, dt);
    speed = Math.max(physics.maxReverseSpeed, Math.min(speed, physics.maxForwardSpeed));

    car.x += speed * dt;
    wheelRotation += speed * 0.11 * dt;
    car.velocityY += physics.gravity * dt;
    car.y += car.velocityY * dt;

    const nextContact = getWheelContact();
    const targetY = nextContact.centerY;

    previousGrounded = car.grounded;

    if (car.y >= targetY) {
        const impactStrength = Math.max(0, car.velocityY);

        car.y = targetY;
        car.velocityY = 0;
        car.grounded = true;
        car.angle += (nextContact.angle - car.angle) * 0.15 * dt;
        car.angularVelocity = 0;
        suspensionCompression = Math.max(
            suspensionCompression,
            Math.min(1, Math.abs(speed) * 0.03 + impactStrength * 0.05)
        );

        if (!previousGrounded) {
            landingImpact = Math.min(1.2, impactStrength * 0.08);
            emitLandingDust(impactStrength);
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

    suspensionCompression *= Math.pow(0.9, dt);
    landingImpact *= Math.pow(0.82, dt);

    emitExhaustSmoke(dt);
    emitWheelDust(dt);
    updateParticles(dt);

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

    if (title === "CRASHED") {
        crashTimer = 36;
        landingImpact = 1.2;
        suspensionCompression = 1;
        emitCrashDust();
    }

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
    wheelRotation = 0;
    suspensionCompression = 0;
    landingImpact = 0;
    crashTimer = 0;
    smokeTimer = 0;
    dustTimer = 0;
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
    particles.length = 0;

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
    ctx.save();

    if (crashTimer > 0) {
        const shake = crashTimer * 0.22;
        ctx.translate(
            (Math.random() - 0.5) * shake,
            (Math.random() - 0.5) * shake
        );
        crashTimer -= 1;
    }

    drawBackground();
    drawTerrain();
    drawParticles();
    drawCoins();
    drawFuelCans();
    drawCar();
    drawFloatingTexts();

    ctx.restore();
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
