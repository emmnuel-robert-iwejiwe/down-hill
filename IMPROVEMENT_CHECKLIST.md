# Hill Climb Game Improvement Checklist

## What Exists Now

- A playable browser-based hill climbing game.
- Canvas rendering for the sky, sun, terrain, coins, and car.
- Layered vehicle image rendering for car body, driver, wheels, suspension, exhaust, and smoke.
- Keyboard controls with `ArrowLeft` / `ArrowRight` and `A` / `D`.
- Mobile touch controls for gas and brake.
- HUD showing distance, coins, score, fuel, and goal.
- Countdown, pause/resume, game-over, and level-complete flow.
- Terrain physics, gravity, front/rear wheel slope alignment, air rotation, coin pickup, fuel drain, fuel cans, crash detection, and finish goal.

## Best Next Improvements

### Gameplay

- [x] Add fuel cans on the track so the player can recover fuel.
- [x] Add a stronger win/goal condition, such as reaching 2,000m or finishing a level.
- [x] Add ramps, steeper hills, dips, and danger zones to make terrain less repetitive.
- [x] Add coin patterns instead of placing every coin at the same interval.
- [x] Add score bonuses for airtime, flips, long jumps, and smooth landings.
- [x] Add a countdown or ready state before the game starts.
- [x] Add pause and resume.

### Feel And Physics

- [ ] Tune acceleration, braking, drag, gravity, and max speed until driving feels more satisfying.
- [x] Add wheel rotation so the car visually responds to movement.
- [x] Make uphill driving slower and downhill driving faster.
- [x] Add suspension bounce when landing.
- [ ] Improve crash detection so only hard flips or head impacts end the run.

### Progression

- [ ] Add upgrades for engine, tires, suspension, fuel tank, and coin magnet.
- [ ] Save best distance and total coins with `localStorage`.
- [ ] Add multiple vehicles with different speed, grip, fuel, and stability.
- [ ] Add multiple stages, such as countryside, desert, snow, and moon.
- [ ] Add unlock prices for vehicles and levels.

### Visuals

- [x] Replace the rectangle car with a more detailed vehicle sprite or richer canvas drawing.
- [ ] Add parallax background layers like clouds, trees, mountains, or buildings.
- [ ] Add animated coin shine.
- [ ] Add fuel can, checkpoint, and finish-line visuals.
- [x] Add dust particles behind the wheels.
- [ ] Improve the HUD layout so it feels more like a finished mobile game.

### Audio

- [ ] Add engine sound that changes pitch with speed.
- [ ] Add coin pickup sound.
- [ ] Add crash sound.
- [ ] Add button click sound.
- [ ] Add background music with a mute toggle.

### Code Quality

- [x] Split `game.js` into smaller files, such as `car.js`, `terrain.js`, `items.js`, `input.js`, and `renderer.js`.
- [x] Use a single `gameState` object instead of many global variables.
- [x] Use elapsed frame time instead of assuming every animation frame has the same speed.
- [x] Add constants for physics values, colors, sizes, and spawn distances.
- [x] Regenerate terrain when restarting or moving into a new level.
- [x] Add comments around the more complex physics and collision logic.

### Polish

- [ ] Add a title/start screen.
- [ ] Add instructions for keyboard and touch controls.
- [ ] Add a best score display.
- [ ] Add responsive layout checks for small phones.
- [ ] Add a simple loading/error-safe state if the canvas cannot initialize.
- [ ] Add deployment instructions so the game can be shared.

## Recommended Build Order

1. Fix remaining vehicle asset quality, especially true transparent car body and driver files.
2. Improve crash detection so flips are allowed in air but bad landings crash.
3. Add best distance and total coins with `localStorage`.
4. Replace coin and fuel placeholders with real asset files and animation.
5. Add a title/start screen and better HUD styling.
6. Add upgrades and progression.
7. Add audio.
8. Continue splitting only when a feature creates a real new boundary, such as upgrades, audio, or menus.
