window.App = window.App || {};

App.loadImage = function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image;
};

App.assets = {
    vehicle: {
        body: App.loadImage("assets/sprites/vehicle/bodies/car-body.png"),
        bodyDamaged: App.loadImage("assets/sprites/vehicle/bodies/car-body-damaged.png"),
        bodyFlipped: App.loadImage("assets/sprites/vehicle/bodies/car-body-flipped.png"),
        driverIdle: App.loadImage("assets/sprites/vehicle/drivers/driver-idle.png"),
        driverLeanBack: App.loadImage("assets/sprites/vehicle/drivers/driver-lean-back.png"),
        driverLeanForward: App.loadImage("assets/sprites/vehicle/drivers/driver-lean-forward.png"),
        driverPanic: App.loadImage("assets/sprites/vehicle/drivers/driver-panic.png"),
        frontWheel: App.loadImage("assets/sprites/vehicle/parts/front-wheel.png"),
        rearWheel: App.loadImage("assets/sprites/vehicle/parts/rear-wheel.png"),
        suspension: App.loadImage("assets/sprites/vehicle/parts/suspension.png"),
        exhaustPipe: App.loadImage("assets/sprites/vehicle/parts/exhaust-pipe.png"),
        smokeSmall: App.loadImage("assets/sprites/vehicle/effects/exhaust-smoke-small.png"),
        smokeMedium: App.loadImage("assets/sprites/vehicle/effects/exhaust-smoke-medium.png"),
        smokeLarge: App.loadImage("assets/sprites/vehicle/effects/exhaust-smoke-large.png")
    }
};

App.vehicleImagesReady = function vehicleImagesReady() {
    return Object.values(App.assets.vehicle).every(image => image.complete && image.naturalWidth > 0);
};
