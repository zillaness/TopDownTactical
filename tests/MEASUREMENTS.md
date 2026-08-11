---
file: MEASUREMENTS.md (top-down-tactical/tests)
version: 1.0
author: Sam Cao
created: 2026-08-11
last_updated: 2026-08-11
description: Measured behaviour of the v0.5 build — fairness, lethality, bystander casualties, the corner mechanic, and the grading curve. Evidence gathered by instrumented bot runs, not inference.
ai_update: Update last_updated and version. Re-run tests/telemetry.js and the scratch harnesses before trusting any figure here; note the build version measured.
---

# Measured behaviour — build v0.5

Everything here comes from instrumented runs of the actual build, not from
reading the code. Reproduce with `tests/telemetry.js`.

**The standing caveat: the driver is a scripted bot with no fire discipline,
no cornering behaviour, and no use of flashbangs, charges, the mirror, the
shoulder swap, or squad orders. It measures the simulation, not the game as
a human would play it. No human has played this build.**

## 1. Fairness — is the player killed from outside obtainable information?

120 runs, 318 rounds that hit the player.

| Measure | Value |
|---|---|
| Shooter off-screen when the round landed | **4%** |
| Player had no line of sight to the shooter | 3% |
| Hit range, median | 167px |
| Hit range, 90th percentile | 356px |
| Hit range, max | 623px |
| Viewport half-extent at zoom 1.6 | 400px wide, **250px tall** |

The earlier concern that enemy sight (up to 520px) exceeds the viewport is
real but far smaller in practice than in theory — interior geometry blocks
most long sightlines before they matter. The binding constraint is the
**vertical** half-extent of 250px against a 356px 90th-percentile engagement
range, so roughly the top decile of fights begin above or below the screen.

## 2. Lethality and mission difficulty

20 runs per mission, default loadout. Run-to-run variance is high; treat
these as coarse bands, not precise rates.

| Mission | Deaths | Clean wins | Avg time to death | First contact |
|---|---|---|---|---|
| SAFEHOUSE ROW | 2/20 | 12/20 | 13.1s | 3.3s |
| THE COMPOUND | 12/20 | 8/20 | 12.3s | 1.1s |
| THE PLANT | 14/20 | 4/20 | 13.2s | 0.9s |
| MARKET ROW | 15/20 | 2/20 | 16.6s | 3.7s |
| FLIGHT 214 | 2/20 | **0/20** | 3.4s | 0.9s |
| HIGH VALUE | 2/20 | **0/20** | 7.2s | 3.2s |

The two zero-win missions are bot-capability artifacts, not proven
difficulty: on FLIGHT 214 the bot kills hostages because it has no fire
discipline, and on HIGH VALUE it never cuffs the HVT because it has no
capture behaviour. Both are **unmeasured**, not impossible.

First contact at 0.9–1.1s on three maps means the player is fighting before
they have oriented.

## 3. Bystander casualties

Across 2847 player shots: 75 rounds struck hostages or civilians, 44 of them
fired by the player's own side.

- **28 of 75 (37%) arrived through a wall** — penetration is a major and
  working hazard.
- **0 of 75 came from a ricochet.** In 2847 shots, the ricochet mechanic has
  never once produced a consequence for a bystander. It fires correctly in
  isolation (17 of 20 grazing shots skip) but is, in play, decorative.

## 4. The corner mechanic — and a bug it was hiding

A/B across muzzle offsets initially showed the flagship mechanic making the
player monotonically *worse*: deaths doubled and clean wins halved with it on.

Isolating it on a stationary target dead ahead at 250px with spread zeroed:

| Muzzle offset | Hit rate (before fix) | Hit rate (after fix) |
|---|---|---|
| 0px | 100% | 100% |
| 6px (shipped) | 95% | 100% |
| 10px | **45%** | 100% |
| 14px | **40%** | 100% |

Cause: rounds spawned at the offset muzzle but travelled at the *body*-to-
target angle, so every shot ran parallel to the intended line, displaced
sideways by the offset. Fixed in `aimAngle()` (commit 82aec23); regression
test in `tests.js`.

After the fix the mechanic is roughly outcome-neutral under bot play — which
is expected, because the bot never deliberately pies a corner. **Whether the
corner game pays off for a deliberate human player is still untested.**

## 5. The grading curve contradicts the design

`GOAL.md` pillar 5 states restraint is scored and "the best run arrests more
than it kills." Measured against `computeGrade()`, 7 suspects, nothing else
going wrong:

| Outcome | Grade |
|---|---|
| Arrest 0, kill 7 | **B** |
| Arrest 1, kill 6 | A |
| Arrest 3, kill 4 | **S** |
| Arrest 7, kill 0 | S |

- Killing every suspect and touching nothing else still earns a **B**.
- S-rank arrives at **3 arrests out of 7** — 43% restraint.
- Executing a suspect who has surrendered, the game's gravest ROE violation,
  costs the same as losing an operator (both drop B to C) and is worth less
  than two arrests, so it can be earned back.

For comparison, the project's own research notes SWAT 4 requires 95/100 on
Elite and Ready or Not's S-rank requires arresting *every* suspect. The
current curve does not express the design's stated values.

## CHANGELOG
- v1.0 (2026-08-11): Initial measurements against build v0.5.
