window.App = window.App || {};

App.updateCar = function updateCar(state, dt, callbacks) {
    const { physics, fuel, collision, scoring, level } = App.CONSTANTS;
    const car = state.car;

    if (state.phase !== "running") {
        App.updateParticles(state, dt);
        return;
    }

    if (state.input.gas && state.fuel > 0) {
        state.speed += physics.acceleration * dt;
        state.fuel -= fuel.burnRate * dt;
    }

    if (state.input.brake) {
        state.speed -= physics.acceleration * physics.brakeMultiplier * dt;
    }

    // Slope force pushes the vehicle downhill and resists it uphill. The sign
    // comes from front/rear wheel contact, so climbs feel heavier and descents
    // naturally add speed.
    const contact = App.getWheelContact(state);
    state.speed += Math.sin(contact.angle) * physics.slopeForce * dt;
    state.speed *= Math.pow(physics.drag, dt);
    state.speed = Math.max(physics.maxReverseSpeed, Math.min(state.speed, physics.maxForwardSpeed));

    car.x += state.speed * dt;
    state.wheelRotation += state.speed * 0.11 * dt;
    car.velocityY += physics.gravity * dt;
    car.y += car.velocityY * dt;

    const nextContact = App.getWheelContact(state);
    const targetY = nextContact.centerY;
    state.previousGrounded = car.grounded;

    if (car.y >= targetY) {
        const impactStrength = Math.max(0, car.velocityY);

        // Collision response: snap to the terrain support height, kill vertical
        // velocity, and ease the chassis toward the wheel-contact slope. Impact
        // strength feeds suspension compression and landing dust.
        car.y = targetY;
        car.velocityY = 0;
        car.grounded = true;
        car.angle += (nextContact.angle - car.angle) * physics.groundAngleFollow * dt;
        car.angularVelocity = 0;
        state.suspensionCompression = Math.max(
            state.suspensionCompression,
            Math.min(1, Math.abs(state.speed) * 0.03 + impactStrength * 0.05)
        );

        if (!state.previousGrounded) {
            state.landingImpact = Math.min(1.2, impactStrength * 0.08);
            App.emitLandingDust(state, impactStrength);
            awardLandingBonus(state);
        }
    } else {
        car.grounded = false;
        state.airtime += dt / 60;

        // In the air, gas and brake become gentle rotation controls. This gives
        // the player flip control without snapping the vehicle rotation.
        if (state.input.gas) car.angularVelocity += physics.airRotateForce * dt;
        if (state.input.brake) car.angularVelocity -= physics.airRotateForce * dt;

        car.angularVelocity *= Math.pow(physics.airRotateDrag, dt);
        car.angle += car.angularVelocity * dt;

        if (Math.abs(car.angle) > collision.completedFlipAngle) {
            state.completedFlip = true;
        }
    }

    state.suspensionCompression *= Math.pow(0.9, dt);
    state.landingImpact *= Math.pow(0.82, dt);

    App.emitExhaustSmoke(state, dt);
    App.emitWheelDust(state, dt);
    App.updateParticles(state, dt);

    state.cameraX = Math.max(0, car.x - state.width * 0.3);
    state.distance = Math.max(0, Math.floor(car.x / 10));
    state.score = Math.max(state.score, state.distance + state.coins * scoring.coin);

    callbacks.updateHud();
    App.checkCoins(state, callbacks.updateHud);
    App.checkFuelCans(state, callbacks.updateHud);
    App.updateFloatingTexts(state, dt);

    if (state.distance >= level.goalDistance) {
        callbacks.endGame("LEVEL COMPLETE");
    }

    if (state.fuel <= 0 && Math.abs(state.speed) < fuel.emptyStopSpeed) {
        callbacks.endGame("OUT OF FUEL");
    }

    if (Math.abs(car.angle) > collision.crashAngle && car.grounded) {
        callbacks.endGame("CRASHED");
    }
};

function awardLandingBonus(state) {
    const { scoring } = App.CONSTANTS;

    if (state.airtime >= 0.7) {
        const bonus = Math.floor(state.airtime * scoring.airtimeMultiplier);
        state.score += bonus;
        App.addFloatingText(state, `AIR +${bonus}`, state.car.x, state.car.y - 70);
    }

    if (state.completedFlip && Math.abs(state.car.angle) < Math.PI * 0.35) {
        state.score += scoring.flipBonus;
        App.addFloatingText(state, `FLIP +${scoring.flipBonus}`, state.car.x, state.car.y - 95);
    }

    state.airtime = 0;
    state.completedFlip = false;
}
