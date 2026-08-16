---
file: README.md (top-down-tactical)
version: 1.49
author: Sam Cao
created: 2026-08-07
last_updated: 2026-08-16
description: Index and quickstart for the top-down-tactical project (game title TBD).
ai_update: Update last_updated and bump version in frontmatter (filename stays README.md). Append changelog at bottom.
---

# Top-Down Tactical (title TBD)

A top-down tactical game where you directly control the
point man — WASD to move, **Shift** to sprint, **Space** to steady, mouse to aim
and shoot, or a controller if you prefer — while commanding a 3-man AI squad — or a nine-man
rifle squad in two fireteams — through stacks, synchronized breaches, and hostage rescues. Fifteen
missions across five objective types — including a training shoot house and a
straight assault on a fortified position — three difficulty tiers, and best
grades saved per mission.

**Commanding:** you are #1, the squad is #2/#3/#4, and the whole squad layer is
on the right mouse button. Right-click an operator to select him (no selection
means the whole team). Right-click anywhere else to hold the wheel open — the
world drops to command time — then flick **↑ TAKE IT**, **→ BOUND**, **↓ HOLD**,
**← ON ME**, or release without flicking to send them there. Each slot names
what it will do to whatever is under your cursor before you commit, and the
plain release breaches the first closed door on the path, so pointing into a
room *is* ordering a breach. Middle mouse holds the grenade bag on the same
idiom: **↑ frag ↓ concussion ← flash → smoke**.

**Play:** open `top_down_tactical_v0.52.html` in a browser. Everything is one
self-contained file — no build, no dependencies.

**Art:** the 27-asset SVG sprite set lives inline in section S0 of the HTML,
between the `--- BEGIN SPRITES ---` / `--- END SPRITES ---` markers, so it can
be regenerated and swapped wholesale. Contract: `viewBox="0 0 64 64"`, pivot at
(32,32), authored facing **east (+X)**, faction color as a literal `#TEAMCOLOR`
token. Handedness is a **Y-flip** (`ctx.scale(1,-1)`), never an X-flip — sprites
face +X, so a unit's left and right lie on the Y axis.

**Test:** `tests/run.sh` — syntax check, headless smoke tests (map integrity,
pathing, breach pipeline, feints, wall charges, compliance statistics,
ballistics, the firing solution, player feedback, formation geometry, points of
domination, armor, suppression, throwables, shared vision, and the mission
picker), and sixteen assault-bot end-to-end playthroughs. The harness never
calls `render()`, so render-path and input work is verified separately in a
real browser with Playwright.

| File | What it is |
|---|---|
| `top_down_tactical_v0.52.html` | The game (single file, canvas 2D) |
| `top_down_tactical_prd_v1.2.md` | Product requirements — pillars, systems, deferred list |
| `tactical_research_v1.1.md` | Seven-chapter genre/doctrine research + synthesis (§7: formations) |
| `GOAL.md` | North-star goal and design pillars (`/goal` command reads this) |
| `BURNDOWN.md` | Ranked backlog + checkpoint ledger (`/burndown` command reads this) |
| `assets/` | Art pipeline — drop raw generations in `assets/incoming/<thread>/` |
| `index.html` | GitHub Pages entry point — redirects to the current build |
| `ART_PROMPTS_CARS_v1.1.md` | Cars thread — 12 vehicles, damage ladder, damage overlays |
| `ART_PROMPTS_EFFECTS_v1.1.md` | Effects thread — 9 sprite-sheet animations |
| `ART_PROMPTS_MAIN_v2.1.md` | Main art batch — everything except cars and effects |
| `ART_PROMPT_environment_v1.2.md` | Paste-ready prompts for generating top-down environment art with an image model |
| `ART_BRIEF_v1.2.md` | Self-contained art brief for an external pass — contract, assets, palette, and the mechanics the art serves |
| `art/` | Sprite contact sheet + an honest gameplay frame, the other half of the art brief |
| `improvement_plan_v1.1.md` | Ranked plan from the eight-agent audit-and-research study |
| `tests/` | Headless Node test harness |
| `tests/MEASUREMENTS.md` | Measured behaviour — fairness, lethality, bystanders, grading curve |

Repo slash commands: `/goal` (review or update the goal), `/burndown` (status
or update the ledger — format compatible with the token-burndown skill).

## CHANGELOG
- v1.0 (2026-08-07): Initial README.
- v1.1 (2026-08-11): Synced to v0.7 — sprite set v2, plan and measurements listed, test description updated.
- v1.2 (2026-08-11): Synced to v0.8 — playbook, wedge formation, body armor.
- v1.3 (2026-08-11): Synced to v0.9 — command wheel replaces the playbook and the key bindings it used, grenade bag, eight missions.
- v1.4 (2026-08-11): Synced to v0.12 — sprint on Shift, steady on Space, pause on Tab; armour costs sprint seconds, not speed.
- v1.5 (2026-08-12): Synced to v0.15 — beach landing and demolition, density option, charges off H, readable ammo, stutter-tap sprint fixed.
- v1.6 (2026-08-12): Synced to v0.16 — trigger discipline, squad veterancy, and the art brief for an outside graphical pass.
- v1.7 (2026-08-13): Synced to v0.17 — readability pass ported from the outside art work onto the current build.
- v1.8 (2026-08-13): Synced to v0.18 — full controller support with rumble.
- v1.9 (2026-08-13): Synced to v0.20 — 40mm grenadier and the nine-man rifle squad.
- v1.10 (2026-08-13): Synced to v0.21 — CS gas and the riot kit.
- v1.11 (2026-08-13): Synced to v0.22 — suppressors: LOUD or SUPPRESSED at the briefing, whole team.
- v1.12 (2026-08-13): Synced to v0.23 — casualties: downed state, tourniquets, retreat.
- v1.13 (2026-08-13): Synced to v0.24 — RAMADI ROW, THE TREELINE, THE STANDOFF; tree material; DMR glass.
- v1.14 (2026-08-13): Synced to v0.25 — sprite set v3: generated body plan with real arms and weapon silhouettes.
- v1.15 (2026-08-14): Synced to v0.26 — buddy aid (assign a medic) and the casualty drag.
- v1.16 (2026-08-14): Synced to v0.27 — minimap on M.
- v1.17 (2026-08-14): Synced to v0.28 — formations on V (wedge/column/line), research §7.
- v1.18 (2026-08-14): Synced to v0.29 — THE LONG WALK infil/exfil mission; environment-art prompt file.
- v1.19 (2026-08-14): Synced to v0.30 — FIELD TEST: ISR drone on U, kamikaze FPV on K.
- v1.20 (2026-08-14): Synced to v0.31 — FIELD TEST: enemy security cameras, shootable or snippable.
- v1.21 (2026-08-14): Synced to v0.32 — FIELD TEST: mortar fire missions on B, outdoor maps.
- v1.22 (2026-08-14): Synced to v0.33 — THE SPLIT and THE RANCH join the barricaded-suspect rotation.
- v1.23 (2026-08-14): Synced to v0.34 — THE PEEL on call sheet [5]: a fighting withdrawal.
- v1.24 (2026-08-14): Synced to v0.35 — emplaced M2s (mount/dismount, arc-clamped) and the QRF counterattack on THE PILLBOX.
- v1.25 (2026-08-14): Synced to v0.36 — BROKEN ARROW: you are the QRF; STABILIZE objective type.
- v1.26 (2026-08-14): Synced to v0.37 — the muzzle split: shoot from the barrel, see from the eye.
- v1.27 (2026-08-14): Synced to v0.38 — auto-assigned sectors of fire, drawn while commanding.
- v1.28 (2026-08-14): Synced to v0.39 — the chained contextual wheel: move -> gait -> arrival posture; operator ring with self-aid.
- v1.29 (2026-08-14): Synced to v0.40 — the persistent roster: recruits from rescues, recovery timers, ready-first deployment.
- v1.30 (2026-08-14): Synced to v0.41 — FLOOR TWO via stairs-as-map-swap; THE WALKUP; BETA chips in the picker.
- v1.31 (2026-08-14): Synced to v0.42 — ammo cycling on X; vehicle ring mounts.
- v1.32 (2026-08-14): Synced to v0.43 — elevated overwatch posts and the window vision rules.
- v1.33 (2026-08-14): Synced to v0.44 — the night-review fix batch (~20 confirmed bugs; formations moved to [Z]).
- v1.34 (2026-08-14): Environment art prompt to v1.1 — raster decision, GPT transparency workaround, buildings section.
- v1.35 (2026-08-14): Synced to v0.45 — playtest fixes: frozen squad vision cones, bleed clock on the body.
- v1.36 (2026-08-14): Synced to v0.46 — utility kits now name every grenade they carry.
- v1.37 (2026-08-15): Synced to v0.47 — first environment art integrated (vegetation batch 1); art prompt doc to v1.2.
- v1.38 (2026-08-15): Added ART_PROMPTS_ALL_BATCHES_v1.0.md — 66 paste-ready prompts for parallel generation.
- v1.39 (2026-08-15): Added batch 8 — sprite-sheet animation and the car damage ladder.
- v1.40 (2026-08-15): Art prompts split into three threads Sam runs in parallel — CARS, EFFECTS, MAIN.
- v1.41 (2026-08-15): Added index.html for GitHub Pages, with a test asserting it points at the build that exists.
- v1.42 (2026-08-15): Moved to its own repository (zillaness/TopDownTactical). art/ became assets/, with incoming/ for raw drops and source/ for processed masters.
- v1.43 (2026-08-15): Synced to v0.48 — BROKEN ARROW's exfil now counts the casualties on the tile, not just the point man.
- v1.44 (2026-08-15): Art prompts flipped to alpha-first (CARS v1.1, EFFECTS v1.1, MAIN v2.1) — GPT does real transparency now; magenta stays as the named fallback.
- v1.45 (2026-08-15): Dropped the genre-comparison clause from the outward-facing description — the game describes itself now.
- v1.46 (2026-08-16): Synced to v0.49 — vehicles take live damage across a four-rung ladder with real art; the engine block is the one thing you cannot shoot away.
- v1.47 (2026-08-16): Synced to v0.50 — vehicle damage is directional: a car shows which side you shot it from, and panels degrade unevenly to match.
- v1.48 (2026-08-16): Synced to v0.51 — props in all three tiers, one derived glyph table, ground textures, armoured bodies, and the breached-wall material bug.
- v1.49 (2026-08-16): Synced to v0.52 — vehicles and props draw above the fog so you can actually see them; panel van toned to the palette.
