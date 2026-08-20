window.App = window.App || {};

App.CONSTANTS = {
    level: {
        goalDistance: 2000,
        terrainLength: 26000,
        terrainStep: 35,
        countdownSeconds: 3
    },
    car: {
        startX: 200,
        startY: 300,
        width: 80,
        height: 35,
        rearWheelOffsetX: -43,
        frontWheelOffsetX: 45,
        wheelOffsetY: 23,
        bodyGroundOffset: 15
    },
    physics: {
        gravity: 0.45,
        acceleration: 0.08,
        brakeMultiplier: 1.4,
        drag: 0.995,
        maxReverseSpeed: -3,
        maxForwardSpeed: 9,
        slopeForce: 0.025,
        groundAngleFollow: 0.15,
        airRotateForce: 0.002,
        airRotateDrag: 0.99
    },
    fuel: {
        max: 100,
        burnRate: 0.025,
        canAmount: 30,
        emptyStopSpeed: 0.2
    },
    scoring: {
        coin: 25,
        fuelCan: 75,
        airtimeMultiplier: 35,
        flipBonus: 250
    },
    spawn: {
        firstCoinX: 500,
        coinSpacing: 650,
        coinEndPadding: 400,
        firstFuelX: 1150,
        fuelSpacing: 1850,
        fuelEndPadding: 300
    },
    collision: {
        coinRadius: 50,
        fuelRadius: 55,
        crashAngle: Math.PI * 0.85,
        panicAngle: Math.PI * 0.55,
        completedFlipAngle: Math.PI * 1.85
    },
    particles: {
        smokeLife: 55,
        dustLife: 34,
        crashDustCount: 22
    },
    colors: {
        skyTop: "#55c7ff",
        skyBottom: "#dff8ff",
        terrainFill: "#5cb85c",
        terrainStroke: "#27632a",
        sun: "#ffd54f",
        coin: "#ffd700",
        coinStroke: "#ff9800",
        coinHighlight: "#fff3a3",
        fuelCan: "#d32f2f",
        fuelCanTop: "#f44336"
    }
};
