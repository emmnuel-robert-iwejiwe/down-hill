const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dom = {
    distanceText: document.getElementById("distance"),
    coinsText: document.getElementById("coins"),
    scoreText: document.getElementById("score"),
    fuelText: document.getElementById("fuel"),
    goalText: document.getElementById("goal"),
    countdownScreen: document.getElementById("countdown"),
    pauseScreen: document.getElementById("pauseScreen"),
    gameOverScreen: document.getElementById("gameOver"),
    endTitle: document.getElementById("endTitle"),
    finalDistance: document.getElementById("finalDistance"),
    finalCoins: document.getElementById("finalCoins"),
    finalScore: document.getElementById("finalScore"),
    gasButton: document.getElementById("gas"),
    brakeButton: document.getElementById("brake"),
    pauseButton: document.getElementById("pauseButton"),
    resumeButton: document.getElementById("resume"),
    restartButton: document.getElementById("restart")
};

const gameState = App.createInitialState();
const renderer = App.createRenderer(ctx);

dom.goalText.textContent = App.CONSTANTS.level.goalDistance;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.width = canvas.width;
    gameState.height = canvas.height;
}

function updateHud() {
    dom.distanceText.textContent = gameState.distance;
    dom.coinsText.textContent = gameState.coins;
    dom.scoreText.textContent = gameState.score;
    dom.fuelText.textContent = Math.max(0, Math.floor(gameState.fuel));
}

function updateCountdown(now) {
    if (gameState.phase !== "countdown") {
        dom.countdownScreen.style.display = "none";
        return;
    }

    const elapsed = (now - gameState.countdownStartedAt) / 1000;
    const remaining = Math.ceil(App.CONSTANTS.level.countdownSeconds - elapsed);

    dom.countdownScreen.style.display = "flex";
    dom.countdownScreen.textContent = remaining > 0 ? remaining : "GO";

    if (elapsed >= App.CONSTANTS.level.countdownSeconds + 0.6) {
        dom.countdownScreen.style.display = "none";
        gameState.phase = "running";
    }
}

function endGame(title) {
    if (gameState.phase === "gameOver") return;

    gameState.phase = "gameOver";
    gameState.endTitle = title;
    gameState.input.gas = false;
    gameState.input.brake = false;

    if (title === "CRASHED") {
        gameState.crashTimer = 36;
        gameState.landingImpact = 1.2;
        gameState.suspensionCompression = 1;
        App.emitCrashDust(gameState);
    }

    dom.endTitle.textContent = title;
    dom.finalDistance.textContent = gameState.distance;
    dom.finalCoins.textContent = gameState.coins;
    dom.finalScore.textContent = gameState.score;
    dom.countdownScreen.style.display = "none";
    dom.pauseScreen.style.display = "none";
    dom.gameOverScreen.style.display = "flex";
}

function pauseGame() {
    if (gameState.phase !== "running") return;

    gameState.phase = "paused";
    gameState.input.gas = false;
    gameState.input.brake = false;
    dom.pauseScreen.style.display = "flex";
}

function resumeGame() {
    if (gameState.phase !== "paused") return;

    gameState.phase = "running";
    dom.pauseScreen.style.display = "none";
    gameState.lastFrameTime = performance.now();
}

function restartGame() {
    App.resetRunState(gameState);
    App.generateTerrain(gameState);
    App.positionItems(gameState);
    updateHud();
    dom.gameOverScreen.style.display = "none";
    dom.pauseScreen.style.display = "none";
    dom.countdownScreen.style.display = "flex";
}

function gameLoop(now) {
    const frameDelta = Math.min(2, (now - gameState.lastFrameTime) / 16.67);
    gameState.lastFrameTime = now;

    updateCountdown(now);
    App.updateCar(gameState, frameDelta, { updateHud, endGame });
    renderer.drawGame(gameState);
    requestAnimationFrame(gameLoop);
}

window.addEventListener("resize", () => {
    resize();
    App.generateTerrain(gameState);
    App.positionItems(gameState);
});

resize();
App.generateTerrain(gameState);
App.positionItems(gameState);
App.bindInput(gameState, {
    gasButton: dom.gasButton,
    brakeButton: dom.brakeButton,
    pauseButton: dom.pauseButton,
    resumeButton: dom.resumeButton,
    restartButton: dom.restartButton,
    pauseGame,
    resumeGame,
    restartGame
});
updateHud();
requestAnimationFrame(gameLoop);
