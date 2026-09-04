---
file: README.md (raycaster)
version: 1.0
author: Sam Cao
created: 2026-09-04
last_updated: 2026-09-04
description: Index and findings for the first-person raycaster proof of concept.
ai_update: Update last_updated and bump version in frontmatter (filename stays README.md). Append changelog at bottom.
---

# Raycaster POC

A Wolfenstein-style first-person shooter in one HTML file, carrying the
top-down-tactical weapon model into a first-person camera.

**This is an experiment that shares a repository with the game.** It shares no
code with it: nothing here imports from, reads, or modifies the tactical build,
and `GOAL.md` is untouched. The weapon constants were transcribed because they
are good numbers. Nothing here is a build direction, and it lives on its own
branch rather than on `main`.

**Play:** open `raycaster_poc_v1.0.html` in a browser, or `index.html`, which
redirects to the current build. Click to lock the mouse. No build, no
dependencies.

**Test:** `tests/run.sh` — 66 headless assertions covering the column solver,
fisheye correction, material penetration, the spread model, doors, collision,
line of sight, and the Pages pointer. The render path is verified separately by screenshot in a
real browser.

## What it does

Grid map, one DDA ray per screen column, walls as textured vertical strips,
enemies as billboards clipped per column against a z-buffer. Sliding doors.
Procedural per-material wall textures. Five weapons, eight ammunition types.

The weapon model is the interesting half:

| Mechanic | What it does |
|---|---|
| Spread cone | Assembled from movement, stance, recoil and turn rate. The reticle is the actual cone, projected through the focal length. |
| Turn bloom | Whipping the muzzle onto a contact opens the cone. A snapped shot is a worse shot than a pied one. |
| Recoil | Ramps while you hold the trigger, settles when you stop, capped per weapon. |
| Steady | Holding Space multiplies the cone by 0.6. |
| Penetration | Caliber against material resistance. Beat the resist and the round comes out the far side, weaker and crooked. |

## The finding worth keeping

Penetration is better in first person than it is from above. In a top-down
camera you can see both sides of a wall, so shooting through it is bookkeeping.
At eye level you cannot see what you are shooting at, so firing through drywall
is a decision made on sound and inference. The test suite pins the case that
makes it real: 5.56 FMJ (pen 26) kills a man through a drywall partition
(resist 5) that you have no line of sight through, and 5.56 HP (pen 4) fired
from the same spot at the same man does not reach him.

That is the mechanic that most repays a first-person camera, and it is the one
worth carrying forward if any of this goes further.

## What this does not answer

Feel. Mouselook responsiveness, movement weight, and whether a corner is
satisfying to pie cannot be judged from a screenshot, and were not judged.
Every visual claim above was verified by rendering frames in headless Chromium
and looking at them; every mechanical claim is pinned by a test. Feel is yours
to assess.

One deliberate divergence from the source tuning: this POC adds an acceleration
model (`TUNE.accel`, `TUNE.friction`). The source game assigns position
straight from speed, so movement is instant-on and instant-off. A fixed
overhead camera hides that completely. At eye level it reads as skating.

## Files

| File | What it is |
|---|---|
| `raycaster_poc_v1.0.html` | The whole thing (single file, canvas 2D) |
| `tests/run.sh` | Extract the script and run the assertions in Node |
| `index.html` | Pages entry point; redirects to the current build |
| `tests/tests.js` | 66 headless assertions |
| `tests/stubs.js` | DOM and canvas stubs; the render path is stubbed to no-ops |

## CHANGELOG
- v1.0 (2026-09-04): Initial POC.
