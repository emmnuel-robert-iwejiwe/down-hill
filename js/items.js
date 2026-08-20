window.App = window.App || {};

App.positionItems = function positionItems(state) {
    const { level, spawn } = App.CONSTANTS;
    state.coinsList.length = 0;
    state.fuelCans.length = 0;

    const patterns = [
        [-75, -35, 5, 45, 85],
        [-90, -50, -10, 35, 80, 125],
        [-50, 0, 50]
    ];

    for (let x = spawn.firstCoinX; x < level.goalDistance * 10 - spawn.coinEndPadding; x += spawn.coinSpacing) {
        const pattern = patterns[Math.floor(x / spawn.coinSpacing) % patterns.length];

        pattern.forEach((offset, index) => {
            const coinX = x + offset;
            const lift = 58 + (index % 3) * 15;
            state.coinsList.push({
                x: coinX,
                y: App.getGroundY(state, coinX) - lift,
                collected: false
            });
        });
    }

    for (let x = spawn.firstFuelX; x < level.goalDistance * 10 - spawn.fuelEndPadding; x += spawn.fuelSpacing) {
        state.fuelCans.push({
            x,
            y: App.getGroundY(state, x) - 65,
            collected: false
        });
    }
};

App.checkCoins = function checkCoins(state, updateHud) {
    const { collision, scoring } = App.CONSTANTS;

    state.coinsList.forEach(coin => {
        if (coin.collected) return;

        const dx = state.car.x - coin.x;
        const dy = state.car.y - coin.y;

        if (Math.sqrt(dx * dx + dy * dy) < collision.coinRadius) {
            coin.collected = true;
            state.coins++;
            state.score += scoring.coin;
            App.addFloatingText(state, `+${scoring.coin}`, coin.x, coin.y - 18);
            updateHud();
        }
    });
};

App.checkFuelCans = function checkFuelCans(state, updateHud) {
    const { collision, fuel, scoring } = App.CONSTANTS;

    state.fuelCans.forEach(can => {
        if (can.collected) return;

        const dx = state.car.x - can.x;
        const dy = state.car.y - can.y;

        if (Math.sqrt(dx * dx + dy * dy) < collision.fuelRadius) {
            can.collected = true;
            state.fuel = Math.min(fuel.max, state.fuel + fuel.canAmount);
            state.score += scoring.fuelCan;
            App.addFloatingText(state, `FUEL +${scoring.fuelCan}`, can.x, can.y - 25);
            updateHud();
        }
    });
};

App.addFloatingText = function addFloatingText(state, text, x, y) {
    state.floatingTexts.push({ text, x, y, life: 70 });
};

App.updateFloatingTexts = function updateFloatingTexts(state, dt) {
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        state.floatingTexts[i].y -= 0.45 * dt;
        state.floatingTexts[i].life -= dt;

        if (state.floatingTexts[i].life <= 0) {
            state.floatingTexts.splice(i, 1);
        }
    }
};

App.addParticle = function addParticle(state, type, x, y, velocityX, velocityY, size, life) {
    state.particles.push({
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
};

App.emitExhaustSmoke = function emitExhaustSmoke(state, dt) {
    const { particles } = App.CONSTANTS;
    const car = state.car;

    if (!state.input.gas || state.fuel <= 0) return;

    state.smokeTimer -= dt;
    if (state.smokeTimer > 0) return;

    const exhaustX = car.x - 72 * Math.cos(car.angle) + 12 * Math.sin(car.angle);
    const exhaustY = car.y - 72 * Math.sin(car.angle) - 12 * Math.cos(car.angle);

    App.addParticle(
        state,
        "smoke",
        exhaustX,
        exhaustY,
        -0.8 - Math.random() * 0.7,
        -0.35 - Math.random() * 0.25,
        20 + Math.random() * 14,
        particles.smokeLife
    );

    state.smokeTimer = Math.max(3, 10 - Math.abs(state.speed));
};

App.emitWheelDust = function emitWheelDust(state, dt) {
    const { car: carConfig, particles } = App.CONSTANTS;
    const car = state.car;

    if (!car.grounded || Math.abs(state.speed) < 0.7) return;

    state.dustTimer -= dt;
    if (state.dustTimer > 0) return;

    const rearWheelX = car.x + carConfig.rearWheelOffsetX * Math.cos(car.angle) - carConfig.wheelOffsetY * Math.sin(car.angle);
    const rearWheelY = car.y + carConfig.rearWheelOffsetX * Math.sin(car.angle) + carConfig.wheelOffsetY * Math.cos(car.angle);

    App.addParticle(
        state,
        "dust",
        rearWheelX,
        rearWheelY + 8,
        -Math.sign(state.speed || 1) * (0.7 + Math.random() * 0.7),
        -0.25 - Math.random() * 0.4,
        11 + Math.random() * 10,
        particles.dustLife
    );

    state.dustTimer = Math.max(2, 8 - Math.abs(state.speed) * 0.6);
};

App.emitLandingDust = function emitLandingDust(state, impact) {
    const amount = Math.min(14, 4 + Math.floor(impact * 2));

    for (let i = 0; i < amount; i++) {
        App.addParticle(
            state,
            "dust",
            state.car.x - 40 + Math.random() * 80,
            state.car.y + 28,
            -1.4 + Math.random() * 2.8,
            -0.5 - Math.random() * 1.1,
            14 + Math.random() * 16,
            42 + Math.random() * 18
        );
    }
};

App.emitCrashDust = function emitCrashDust(state) {
    for (let i = 0; i < App.CONSTANTS.particles.crashDustCount; i++) {
        App.addParticle(
            state,
            "dust",
            state.car.x - 55 + Math.random() * 110,
            state.car.y + 5 + Math.random() * 40,
            -2.2 + Math.random() * 4.4,
            -1.5 - Math.random() * 1.6,
            16 + Math.random() * 24,
            55 + Math.random() * 25
        );
    }
};

App.updateParticles = function updateParticles(state, dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const particle = state.particles[i];

        particle.x += particle.velocityX * dt;
        particle.y += particle.velocityY * dt;
        particle.velocityY += particle.type === "dust" ? 0.018 * dt : -0.004 * dt;
        particle.life -= dt;

        if (particle.life <= 0) {
            state.particles.splice(i, 1);
        }
    }
};
