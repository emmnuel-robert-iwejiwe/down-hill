window.App = window.App || {};

App.createInitialState = function createInitialState() {
    const { car, fuel } = App.CONSTANTS;

    return {
        phase: "countdown",
        endTitle: "",
        width: window.innerWidth,
        height: window.innerHeight,
        countdownStartedAt: performance.now(),
        lastFrameTime: performance.now(),
        cameraX: 0,
        distance: 0,
        coins: 0,
        score: 0,
        fuel: fuel.max,
        speed: 0,
        wheelRotation: 0,
        suspensionCompression: 0,
        landingImpact: 0,
        crashTimer: 0,
        smokeTimer: 0,
        dustTimer: 0,
        airtime: 0,
        completedFlip: false,
        previousGrounded: false,
        input: {
            gas: false,
            brake: false
        },
        car: {
            x: car.startX,
            y: car.startY,
            width: car.width,
            height: car.height,
            velocityY: 0,
            angle: 0,
            angularVelocity: 0,
            grounded: false
        },
        terrain: [],
        coinsList: [],
        fuelCans: [],
        floatingTexts: [],
        particles: []
    };
};

App.resetRunState = function resetRunState(state) {
    const { car, fuel } = App.CONSTANTS;

    state.phase = "countdown";
    state.endTitle = "";
    state.countdownStartedAt = performance.now();
    state.lastFrameTime = performance.now();
    state.cameraX = 0;
    state.distance = 0;
    state.coins = 0;
    state.score = 0;
    state.fuel = fuel.max;
    state.speed = 0;
    state.wheelRotation = 0;
    state.suspensionCompression = 0;
    state.landingImpact = 0;
    state.crashTimer = 0;
    state.smokeTimer = 0;
    state.dustTimer = 0;
    state.airtime = 0;
    state.completedFlip = false;
    state.previousGrounded = false;
    state.input.gas = false;
    state.input.brake = false;
    state.car.x = car.startX;
    state.car.y = car.startY;
    state.car.velocityY = 0;
    state.car.angle = 0;
    state.car.angularVelocity = 0;
    state.car.grounded = false;
    state.floatingTexts.length = 0;
    state.particles.length = 0;
};
