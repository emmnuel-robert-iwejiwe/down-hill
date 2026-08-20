window.App = window.App || {};

App.generateTerrain = function generateTerrain(state) {
    const { level } = App.CONSTANTS;
    state.terrain.length = 0;

    let y = state.height * 0.65;

    for (let x = 0; x < level.terrainLength; x += level.terrainStep) {
        const rollingHills = Math.sin(x * 0.006) * 5;
        const smallBumps = Math.sin(x * 0.021) * 2.5;
        const roughPatch = Math.sin(x * 0.043) * 1.5;
        const ramp = Math.sin(Math.max(0, x - 3200) * 0.002) * 4;

        y += rollingHills + smallBumps + roughPatch + ramp;

        if (x > 6500 && x < 7200) y -= 3.2;
        if (x > 9800 && x < 10700) y += 3.7;
        if (x > 13500 && x < 14500) y -= 4.4;

        y = Math.max(state.height * 0.34, Math.min(state.height * 0.84, y));
        state.terrain.push({ x, y });
    }
};

App.getGroundY = function getGroundY(state, x) {
    const { level } = App.CONSTANTS;
    const index = Math.floor(x / level.terrainStep);

    if (index < 0 || index >= state.terrain.length - 1) {
        return state.height * 0.65;
    }

    const p1 = state.terrain[index];
    const p2 = state.terrain[index + 1];
    const amount = (x - p1.x) / level.terrainStep;

    return p1.y + (p2.y - p1.y) * amount;
};

App.getWheelContact = function getWheelContact(state) {
    const { car: carConfig } = App.CONSTANTS;
    const car = state.car;
    const rearX = car.x + carConfig.rearWheelOffsetX;
    const frontX = car.x + carConfig.frontWheelOffsetX;
    const rearY = App.getGroundY(state, rearX);
    const frontY = App.getGroundY(state, frontX);

    // The car rests on the higher wheel contact point and eases toward the
    // front/rear slope. This makes landings and hill alignment feel less floaty
    // than sampling terrain only under the vehicle center.
    return {
        rearX,
        frontX,
        rearY,
        frontY,
        centerY: Math.min(rearY, frontY) - car.height / 2 - carConfig.bodyGroundOffset,
        angle: Math.atan2(frontY - rearY, frontX - rearX)
    };
};
