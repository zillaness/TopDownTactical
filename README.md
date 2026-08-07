---
file: README.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-07
last_updated: 2026-08-07
description: Index and quickstart for the top-down-tactical project (game title TBD).
ai_update: Update last_updated and bump version in frontmatter (filename stays README.md). Append changelog at bottom.
---

# Top-Down Tactical (title TBD)

A top-down Door Kickers 2-style tactical game where you directly control the
point man — WASD to move, mouse to aim and shoot — while commanding a 3-man AI
squad through stacks, synchronized breaches, and hostage rescues. Four
missions, three difficulty tiers, best grades saved per mission.

**Play:** open `top_down_tactical_v0.2.html` in a browser. Everything is one
self-contained file — no build, no dependencies.

**Test:** `tests/run.sh` — syntax check, headless smoke tests (map integrity,
pathing, breach pipeline, feints, wall charges, compliance statistics), and
twelve assault-bot end-to-end playthroughs across all four missions.

| File | What it is |
|---|---|
| `top_down_tactical_v0.2.html` | The game (single file, canvas 2D) |
| `top_down_tactical_prd_v1.1.1.md` | Product requirements — pillars, systems, deferred list |
| `tactical_research_v1.0.md` | Six-chapter genre/doctrine research + synthesis |
| `GOAL.md` | North-star goal and design pillars (`/goal` command reads this) |
| `BURNDOWN.md` | Ranked backlog + checkpoint ledger (`/burndown` command reads this) |
| `tests/` | Headless Node test harness |

Repo slash commands: `/goal` (review or update the goal), `/burndown` (status
or update the ledger — format compatible with the token-burndown skill).

## CHANGELOG
- v1.0 (2026-08-07): Initial README.
