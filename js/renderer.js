window.App = window.App || {};

App.createRenderer = function createRenderer(ctx) {
    const { colors, collision, car: carConfig, level } = App.CONSTANTS;
    const vehicle = App.assets.vehicle;

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

    function drawBackground(state) {
        const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
        gradient.addColorStop(0, colors.skyTop);
        gradient.addColorStop(1, colors.skyBottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, state.width, state.height);

        ctx.fillStyle = colors.sun;
        ctx.beginPath();
        ctx.arc(state.width - 100, 100, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
        drawCloud(state, 160 - state.cameraX * 0.12, 100, 1);
        drawCloud(state, 520 - state.cameraX * 0.1, 145, 0.8);
        drawCloud(state, 920 - state.cameraX * 0.08, 85, 1.1);
    }

    function drawCloud(state, x, y, scale) {
        const wrappedX = ((x % (state.width + 260)) + state.width + 260) % (state.width + 260) - 130;

        ctx.beginPath();
        ctx.arc(wrappedX, y, 24 * scale, 0, Math.PI * 2);
        ctx.arc(wrappedX + 28 * scale, y - 12 * scale, 28 * scale, 0, Math.PI * 2);
        ctx.arc(wrappedX + 62 * scale, y, 22 * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawTerrain(state) {
        ctx.beginPath();
        ctx.moveTo(0, state.height);

        state.terrain.forEach(point => {
            const screenX = point.x - state.cameraX;
            if (screenX >= -50 && screenX <= state.width + 50) {
                ctx.lineTo(screenX, point.y);
            }
        });

        ctx.lineTo(state.width, state.height);
        ctx.closePath();
        ctx.fillStyle = colors.terrainFill;
        ctx.fill();

        ctx.beginPath();
        state.terrain.forEach((point, index) => {
            const screenX = point.x - state.cameraX;
            if (screenX >= -50 && screenX <= state.width + 50) {
                if (index === 0 || screenX < -20) ctx.moveTo(screenX, point.y);
                else ctx.lineTo(screenX, point.y);
            }
        });

        ctx.strokeStyle = colors.terrainStroke;
        ctx.lineWidth = 5;
        ctx.stroke();
        drawFinishLine(state);
    }

    function drawFinishLine(state) {
        const finishWorldX = level.goalDistance * 10;
        const finishX = finishWorldX - state.cameraX;

        if (finishX < -80 || finishX > state.width + 80) return;

        const groundY = App.getGroundY(state, finishWorldX);
        ctx.fillStyle = "#222";
        ctx.fillRect(finishX - 4, groundY - 160, 8, 160);

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? "#fff" : "#111";
                ctx.fillRect(finishX + col * 18, groundY - 160 + row * 18, 18, 18);
            }
        }
    }

    function drawCoins(state) {
        state.coinsList.forEach(coin => {
            if (coin.collected) return;

            const screenX = coin.x - state.cameraX;
            if (screenX < -30 || screenX > state.width + 30) return;

            ctx.fillStyle = colors.coin;
            ctx.beginPath();
            ctx.arc(screenX, coin.y, 13, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = colors.coinStroke;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = colors.coinHighlight;
            ctx.beginPath();
            ctx.arc(screenX - 4, coin.y - 4, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawFuelCans(state) {
        state.fuelCans.forEach(can => {
            if (can.collected) return;

            const screenX = can.x - state.cameraX;
            if (screenX < -30 || screenX > state.width + 30) return;

            ctx.fillStyle = colors.fuelCan;
            ctx.fillRect(screenX - 14, can.y - 18, 28, 36);
            ctx.fillStyle = colors.fuelCanTop;
            ctx.fillRect(screenX - 8, can.y - 25, 18, 9);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("F", screenX, can.y + 2);
        });
    }

    function drawCar(state) {
        const car = state.car;
        const screenX = car.x - state.cameraX;

        ctx.save();
        ctx.translate(screenX, car.y);
        ctx.rotate(car.angle);

        if (App.vehicleImagesReady()) {
            const compression = state.suspensionCompression + state.landingImpact;
            const wheelDrop = -compression * 7;
            const bodyDrop = compression * 3;

            drawImage(getBodyImage(state), -86, -64 + bodyDrop, 172, 94);
            drawImage(vehicle.exhaustPipe, -96, -12 + bodyDrop, 40, 24);
            drawSuspension(-45, 8 + bodyDrop, -0.12, compression);
            drawSuspension(47, 8 + bodyDrop, 0.12, compression);
            drawDriverSprite(state);
            drawRotatingImage(vehicle.rearWheel, -45, 23 + wheelDrop, 52, 52, state.wheelRotation);
            drawRotatingImage(vehicle.frontWheel, 47, 23 + wheelDrop, 52, 52, state.wheelRotation);
            ctx.restore();
            return;
        }

        drawFallbackCar();
        ctx.restore();
    }

    function drawSuspension(centerX, centerY, rotation, compression) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.scale(1, Math.max(0.72, 1 - compression * 0.24));
        drawImage(vehicle.suspension, -9, -21, 18, 42);
        ctx.restore();
    }

    function getBodyImage(state) {
        if (state.phase === "gameOver" && state.endTitle === "CRASHED") return vehicle.bodyDamaged;
        if (Math.abs(state.car.angle) > collision.panicAngle && !state.car.grounded) return vehicle.bodyFlipped;
        return vehicle.body;
    }

    function drawDriverSprite(state) {
        const image = getDriverImage(state);
        const leanOffset = getDriverLeanOffset(state);
        drawImage(image, -35 + leanOffset.x, -85 + leanOffset.y, 76, 78);
    }

    function getDriverImage(state) {
        if (state.phase === "gameOver" || (!state.car.grounded && Math.abs(state.car.angle) > collision.panicAngle)) {
            return vehicle.driverPanic;
        }

        if (state.input.brake || state.speed < -0.4) return vehicle.driverLeanForward;
        if (state.input.gas || state.speed > 2.4) return vehicle.driverLeanBack;
        return vehicle.driverIdle;
    }

    function getDriverLeanOffset(state) {
        if (state.input.brake || state.speed < -0.4) return { x: 5, y: 3 };
        if (state.input.gas || state.speed > 2.4) return { x: -4, y: -1 };
        return { x: 0, y: 0 };
    }

    function drawParticles(state) {
        state.particles.forEach(particle => {
            const screenX = particle.x - state.cameraX;
            const alpha = Math.max(0, particle.life / particle.maxLife);

            if (particle.type === "smoke" && App.vehicleImagesReady()) {
                const image = alpha > 0.66 ? vehicle.smokeSmall : alpha > 0.33 ? vehicle.smokeMedium : vehicle.smokeLarge;
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

    function drawFloatingTexts(state) {
        state.floatingTexts.forEach(item => {
            const screenX = item.x - state.cameraX;
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

    function drawFallbackCar() {
        ctx.fillStyle = "#e53935";
        ctx.fillRect(-carConfig.width / 2, -carConfig.height / 2, carConfig.width, carConfig.height);
        ctx.fillStyle = "#b71c1c";
        ctx.beginPath();
        ctx.moveTo(-25, -18);
        ctx.lineTo(-10, -35);
        ctx.lineTo(25, -35);
        ctx.lineTo(35, -18);
        ctx.closePath();
        ctx.fill();
        drawFallbackWheel(-27, 18);
        drawFallbackWheel(27, 18);
    }

    function drawFallbackWheel(x, y) {
        ctx.fillStyle = "#111";
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#aaa";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawGame(state) {
        ctx.save();

        if (state.crashTimer > 0) {
            const shake = state.crashTimer * 0.22;
            ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
            state.crashTimer -= 1;
        }

        drawBackground(state);
        drawTerrain(state);
        drawParticles(state);
        drawCoins(state);
        drawFuelCans(state);
        drawCar(state);
        drawFloatingTexts(state);
        ctx.restore();
    }

    return { drawGame };
};
