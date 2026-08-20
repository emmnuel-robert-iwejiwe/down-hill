# Hill Climb Asset Pack Plan

This file lists the complete asset pack needed before replacing the current canvas-drawn placeholder art.

## Recommended Asset Strategy

Use a mixed approach:

- Generate custom core game assets so the game has a consistent style.
- Download or license generic UI/audio assets only when they fit the style and license.
- Avoid pulling random sprites one by one from image search because the art style, scale, and licensing will be inconsistent.

## Best Source By Asset Type

| Asset Type | Recommended Source | Reason |
| --- | --- | --- |
| Player car sprites | Generate | Needs a consistent vehicle style and matching damage/crash states. |
| Driver sprites | Generate | Should match the car and animation frames. |
| Wheels/suspension/exhaust | Generate | Must visually fit the car body. |
| Vehicle animation frames | Generate | Needs consistent frame-to-frame shape and proportions. |
| Coins, gems, stars | Generate or use licensed pack | Easy to generate, but also common in asset stores. |
| Fuel and power-ups | Generate | Should match collectibles and game style. |
| Terrain tiles/sprites | Generate or use licensed pack | A tile pack can save time, but styles must match. |
| Background objects | Generate or use licensed pack | Can use generated art for consistency or licensed packs for speed. |
| Effects | Generate or use particle drawing in code | Dust, smoke, sparks, and speed lines may work better as canvas particles. |
| UI assets | Create in CSS/canvas first, then generate icons if needed | Keeps UI sharp and responsive. |
| Progression badges/icons | Generate or use licensed icon set | Needs consistent trophy/star/badge styling. |
| Audio | Download/license or create with sound tools | Audio generation is possible, but licensed SFX packs are often faster. |

## Player / Vehicle Sprites

- [x] Car body - main player vehicle
- [x] Car body damaged - damaged state
- [x] Car body flipped - optional crash state
- [x] Driver/person inside car
- [x] Driver idle
- [x] Driver leaning forward
- [x] Driver leaning backward
- [x] Driver reaction/crash frame
- [x] Front wheel
- [x] Rear wheel
- [x] Wheel rim
- [x] Suspension/shock absorber
- [x] Exhaust pipe
- [x] Exhaust smoke

Runtime files:

- `assets/sprites/vehicle/bodies/`
- `assets/sprites/vehicle/drivers/`
- `assets/sprites/vehicle/parts/`
- `assets/sprites/vehicle/effects/`

Implementation status:

- [x] Game uses separate grouped vehicle image files for the main player car.
- [x] Game uses the damaged vehicle sprite on crash.
- [x] Game uses layered body, driver, suspension, exhaust, and wheel rendering.
- [x] Wheels rotate based on driving speed.
- [x] Driver pose changes for idle, acceleration, braking, flips, and crash.
- [x] Suspension compresses on landing and rough driving.
- [x] Exhaust smoke and wheel dust particles are active.
- [x] Crash impact adds dust and screen shake.
- [x] Split runtime sprites into individual transparent PNG files.
- [ ] Regenerate car body, damaged body, flipped body, driver poses, suspension, exhaust, and smoke as true transparent standalone files. Current files work, but some came from generated sheets with baked-in dark backdrop.
- [x] Regenerate front and rear wheels as clean standalone full tire images.

## Vehicle Animation Sprites

- [ ] Driving frame 1
- [ ] Driving frame 2
- [ ] Driving frame 3
- [ ] Jumping
- [ ] Falling
- [ ] Landing
- [ ] Front-wheel landing
- [ ] Rear-wheel landing
- [ ] Flip clockwise
- [ ] Flip counter-clockwise
- [ ] Crash

## Collectibles

- [x] Coin
- [ ] Coin animation frame 1
- [ ] Coin animation frame 2
- [ ] Coin animation frame 3
- [ ] Coin pickup effect
- [ ] Coin burst particles
- [ ] Gold coin - +1
- [ ] Gem - +5 or +10
- [ ] Star - bonus

## Fuel / Energy

- [ ] Fuel can
- [ ] Fuel can animation
- [ ] Fuel pickup effect
- [ ] Empty fuel indicator
- [ ] Fuel bar

## Boost / Power-Ups

- [ ] Speed boost
- [ ] Nitro bottle
- [ ] Nitro flame
- [ ] Turbo icon
- [ ] Magnet power-up
- [ ] Shield
- [ ] Double-score power-up

## Terrain Sprites

- [ ] Grass
- [ ] Dirt
- [ ] Rock
- [ ] Sand
- [ ] Snow
- [ ] Ice
- [ ] Mud
- [ ] Asphalt
- [ ] Grass edge
- [ ] Dirt edge
- [ ] Rock edge
- [ ] Small hill
- [ ] Large hill
- [ ] Ramp
- [ ] Cliff
- [ ] Cave/tunnel

## Background Objects

- [ ] Tree
- [ ] Bush
- [ ] Rock
- [ ] Mountain
- [ ] Cloud
- [ ] Sun
- [ ] Moon
- [ ] Birds
- [ ] Wooden sign
- [ ] Fence
- [ ] House
- [ ] Windmill

## Effects

- [x] Dust cloud
- [x] Small dust
- [x] Large dust
- [x] Smoke
- [ ] Explosion
- [ ] Spark
- [ ] Fire
- [x] Crash debris
- [x] Landing particles
- [ ] Speed lines
- [ ] Coin sparkle

## UI Assets

- [ ] Play button
- [ ] Pause button
- [ ] Restart button
- [ ] Settings button
- [ ] Home button
- [ ] Coin counter
- [ ] Fuel bar
- [ ] Speedometer
- [ ] Distance counter
- [ ] Score counter
- [ ] Best-score badge
- [ ] Game-over panel
- [ ] Level-complete panel
- [ ] Next-level button

## Progression

- [ ] Level icon
- [ ] Locked level
- [ ] Unlocked level
- [ ] Star 1
- [ ] Star 2
- [ ] Star 3
- [ ] Trophy
- [ ] New record badge
- [ ] Achievement icon

## Audio Assets

- [ ] Engine idle
- [ ] Engine acceleration
- [ ] Brake
- [ ] Jump
- [ ] Landing
- [ ] Hard landing
- [ ] Coin pickup
- [ ] Fuel pickup
- [ ] Boost
- [ ] Crash
- [ ] Button click
- [ ] Game over
- [ ] Level complete
- [ ] Background music

## Suggested File Structure

```text
assets/
  sprites/
    vehicle/
    collectibles/
    fuel/
    powerups/
    terrain/
    background/
    effects/
    ui/
    progression/
  audio/
    sfx/
    music/
```

## Recommended First Asset Pack

Start small so the game can switch from placeholder drawing to real assets quickly:

- [x] Car body
- [x] Front wheel
- [x] Rear wheel
- [x] Driver idle
- [ ] Coin animation frames
- [ ] Fuel can
- [x] Dust cloud
- [ ] Grass/dirt terrain textures
- [ ] Tree
- [ ] Cloud
- [ ] Play, pause, restart, and settings icons
- [ ] Engine acceleration
- [ ] Coin pickup
- [ ] Fuel pickup
- [ ] Crash
- [ ] Button click

## Decision

Recommended decision: generate the first visual asset pack, then download/license audio from a game SFX library.

This gives us a consistent visual identity while avoiding spending too much time creating sound effects from scratch.

## Next Asset Flow

1. Regenerate the remaining vehicle body/driver/part files as true standalone transparent PNGs.
2. Generate collectibles next: coin frames, gem, star, pickup sparkle, and burst particles.
3. Generate fuel assets: fuel can, fuel pickup effect, empty indicator, and fuel bar.
4. Generate terrain/background art as separate packs.
5. Download or license audio after the visual style is stable.
