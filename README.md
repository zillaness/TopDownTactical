---
file: README.md (top-down-tactical)
version: 1.1
author: Sam Cao
created: 2026-08-07
last_updated: 2026-08-11
description: Index and quickstart for the top-down-tactical project (game title TBD).
ai_update: Update last_updated and bump version in frontmatter (filename stays README.md). Append changelog at bottom.
---

# Top-Down Tactical (title TBD)

A top-down Door Kickers 2-style tactical game where you directly control the
point man — WASD to move, mouse to aim and shoot — while commanding a 3-man AI
squad through stacks, synchronized breaches, and hostage rescues. Six
missions across four objective types, three difficulty tiers, best grades
saved per mission.

**Play:** open `top_down_tactical_v0.7.html` in a browser. Everything is one
self-contained file — no build, no dependencies.

**Art:** the 27-asset SVG sprite set lives inline in section S0 of the HTML,
between the `--- BEGIN SPRITES ---` / `--- END SPRITES ---` markers, so it can
be regenerated and swapped wholesale. Contract: `viewBox="0 0 64 64"`, pivot at
(32,32), authored facing **east (+X)**, faction color as a literal `#TEAMCOLOR`
token. Handedness is a **Y-flip** (`ctx.scale(1,-1)`), never an X-flip — sprites
face +X, so a unit's left and right lie on the Y axis.

**Test:** `tests/run.sh` — syntax check, headless smoke tests (map integrity,
pathing, breach pipeline, feints, wall charges, compliance statistics,
ballistics, the firing solution, and player feedback), and sixteen assault-bot
end-to-end playthroughs across all six missions. The harness never calls
`render()`, so render-path work is verified separately in a real browser.

| File | What it is |
|---|---|
| `top_down_tactical_v0.7.html` | The game (single file, canvas 2D) |
| `top_down_tactical_prd_v1.1.1.md` | Product requirements — pillars, systems, deferred list |
| `tactical_research_v1.0.md` | Six-chapter genre/doctrine research + synthesis |
| `GOAL.md` | North-star goal and design pillars (`/goal` command reads this) |
| `BURNDOWN.md` | Ranked backlog + checkpoint ledger (`/burndown` command reads this) |
| `improvement_plan_v1.1.md` | Ranked plan from the eight-agent audit-and-research study |
| `tests/` | Headless Node test harness |
| `tests/MEASUREMENTS.md` | Measured behaviour — fairness, lethality, bystanders, grading curve |

Repo slash commands: `/goal` (review or update the goal), `/burndown` (status
or update the ledger — format compatible with the token-burndown skill).

## CHANGELOG
- v1.0 (2026-08-07): Initial README.
- v1.1 (2026-08-11): Synced to v0.7 — sprite set v2, plan and measurements listed, test description updated.
