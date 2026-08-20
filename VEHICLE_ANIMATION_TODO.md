# Vehicle Sprite And Animation TODO

Goal: make the car feel more alive, readable, and responsive before building the rest of the asset pack.

## Current State

- [x] One generated vehicle sprite sheet exists.
- [x] Game renders the main car from grouped image files.
- [x] Game can show a damaged car sprite on crash.
- [x] Wheel rotation is animated.
- [x] Driver leaning is animated.
- [x] Suspension compression is animated.
- [x] Exhaust smoke is connected to acceleration.
- [x] Landing and crash states have dust and crash shake feedback.
- [ ] Several non-wheel vehicle assets still need true transparent standalone regeneration.

Current runtime sprite folders:

- `assets/sprites/vehicle/bodies/`
- `assets/sprites/vehicle/drivers/`
- `assets/sprites/vehicle/parts/`
- `assets/sprites/vehicle/effects/`

## Sprite Sheet Cleanup Needed

- [x] Create a cleaner transparent sheet with more even spacing between sprites.
- [x] Keep every sprite in a predictable grid cell.
- [x] Export at consistent scale.
- [x] Keep the car facing right in all normal driving frames.
- [x] Keep wheels, suspension, driver, and exhaust as separate usable pieces.
- [ ] Avoid baked-in background glow or shadows in final standalone body/driver/part files.
- [x] Add enough transparent padding so rotated sprites do not clip.
- [x] Replace cut wheel crops with clean standalone full wheel sprites.

## Needed Vehicle Sprite Parts

- [x] Main car body
- [x] Damaged car body
- [x] Flipped/crashed car body
- [x] Front wheel
- [x] Rear wheel
- [x] Wheel rim
- [x] Front suspension
- [x] Rear suspension
- [x] Exhaust pipe
- [x] Exhaust smoke puff small
- [x] Exhaust smoke puff medium
- [x] Exhaust smoke puff large
- [x] Driver idle
- [x] Driver leaning forward
- [x] Driver leaning backward
- [x] Driver panic/crash reaction

## Needed Animation Frames

- [x] Driving frame 1
- [x] Driving frame 2
- [x] Driving frame 3
- [x] Jumping
- [x] Falling
- [x] Landing
- [x] Front-wheel landing
- [x] Rear-wheel landing
- [x] Flip clockwise
- [x] Flip counter-clockwise
- [x] Crash frame 1
- [x] Crash frame 2
- [ ] Crash frame 3

Note: the full-frame animation concepts were generated, but the runtime currently uses layered procedural animation instead of these full car frames.

## Animation Behaviors To Add

- [x] Rotate wheels based on horizontal speed.
- [x] Spin wheels faster while accelerating.
- [x] Slow wheel spin while braking.
- [x] Show driver leaning forward when braking.
- [x] Show driver leaning backward when accelerating or climbing.
- [x] Show panic driver frame during flips or crash.
- [x] Compress suspension on landing.
- [ ] Compress front suspension independently on front-wheel impact.
- [ ] Compress rear suspension independently on rear-wheel impact.
- [x] Emit exhaust smoke while gas is pressed.
- [x] Emit dust from wheels when driving on terrain.
- [x] Emit bigger dust on hard landings.
- [x] Add small screen shake on hard crash.
- [x] Add score popup for airtime and flip bonuses near the car.

## Code Changes Needed

- [x] Add grouped sprite image files with named image references.
- [x] Replace the single full-car draw with layered drawing:
  - body
  - driver
  - suspension
  - wheels
  - exhaust
- [x] Track wheel rotation angle.
- [x] Track suspension compression amount.
- [x] Track car air state: grounded, jumping, falling, landing.
- [x] Track driver pose state.
- [x] Add particle system for smoke and dust.
- [x] Add crash animation timer.
- [x] Add landing impact strength.
- [ ] Add debug mode to show sprite crop boxes and car collision points.

## Physics Feel Needed For Animation

- [x] Detect front wheel ground height.
- [x] Detect rear wheel ground height.
- [x] Align car angle from front and rear wheel contact instead of only center terrain angle.
- [x] Use wheel contact points for landing feedback.
- [x] Add small bounce when suspension compresses.
- [ ] Improve crash logic so flips are allowed in air but punished on bad landing.

## Recommended Implementation Order

1. Regenerate remaining vehicle body, driver, suspension, exhaust, and smoke as standalone transparent PNGs.
2. Add independent front/rear suspension compression.
3. Improve crash detection so flips are allowed in air but punished on bad landing.
4. Add optional debug mode for crop boxes and wheel contact points.
5. Decide whether to keep layered animation only or add full-frame driving/jump/crash animations.
6. Move on to collectibles and fuel assets once vehicle assets are clean.

## Better Sprite Sheet Prompt

Use this when generating the improved sheet:

```text
Create a transparent-background 2D sprite atlas for a side-view hill climb racing game.

Style: polished cartoon mobile game art, clean black outlines, bright readable colors, consistent lighting, no text, no labels, no watermark.

Canvas layout: strict grid with equal-size cells and clear transparent padding. Every sprite must be isolated and fully visible.

Include:
- red off-road car body, side view, facing right
- damaged red off-road car body, side view, facing right
- flipped/crashed red off-road car body
- front wheel
- rear wheel
- wheel rim
- front suspension
- rear suspension
- exhaust pipe
- smoke puff small
- smoke puff medium
- smoke puff large
- driver idle
- driver leaning forward
- driver leaning backward
- driver panic/crash reaction
- driving frame 1
- driving frame 2
- driving frame 3
- jumping frame
- falling frame
- landing frame
- front-wheel landing frame
- rear-wheel landing frame
- clockwise flip frame
- counter-clockwise flip frame
- crash frame 1
- crash frame 2
- crash frame 3

Constraints:
- transparent background
- no scene background
- no terrain
- no UI
- no text
- all sprites same art style and scale
- normal car faces right
- each sprite centered in its own grid cell
```
