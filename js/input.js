window.App = window.App || {};

App.bindInput = function bindInput(state, controls) {
    window.addEventListener("keydown", event => {
        if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
            state.input.gas = true;
        }

        if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
            state.input.brake = true;
        }

        if (event.key.toLowerCase() === "p") {
            if (state.phase === "paused") controls.resumeGame();
            else controls.pauseGame();
        }
    });

    window.addEventListener("keyup", event => {
        if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
            state.input.gas = false;
        }

        if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
            state.input.brake = false;
        }
    });

    bindHoldButton(controls.gasButton, () => {
        state.input.gas = true;
    }, () => {
        state.input.gas = false;
    });

    bindHoldButton(controls.brakeButton, () => {
        state.input.brake = true;
    }, () => {
        state.input.brake = false;
    });

    controls.pauseButton.addEventListener("click", () => {
        if (state.phase === "paused") controls.resumeGame();
        else controls.pauseGame();
    });

    controls.resumeButton.addEventListener("click", controls.resumeGame);
    controls.restartButton.addEventListener("click", controls.restartGame);
};

function bindHoldButton(button, onPress, onRelease) {
    button.addEventListener("pointerdown", onPress);
    button.addEventListener("pointerup", onRelease);
    button.addEventListener("pointerleave", onRelease);
}
