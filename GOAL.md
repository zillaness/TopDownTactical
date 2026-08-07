---
file: GOAL.md (top-down-tactical)
version: 1.1
author: Sam Cao
created: 2026-08-07
last_updated: 2026-08-07
description: North-star goal and design pillars for the top-down tactical game (working project name "top-down-tactical"; game title TBD).
ai_update: Update last_updated and bump version in this frontmatter (filename stays GOAL.md). Append changelog at bottom. Read this before any design or scope decision on this project.
---

# Goal — Top-Down Tactical (game title TBD)

## The one-sentence goal

A top-down tactical game in the style of **Door Kickers 2: Task Force North** — squad planning, breaching, hostage rescue — except **you directly control one operator** (WASD to move, mouse to aim and shoot) while issuing orders to the rest of the squad in the same fight.

## Why this game

Door Kickers 2 is a puppeteer game: you plan, press play, and watch. SWAT 4 / Ready or Not put you in the stack but in first person. Nothing good exists in the middle — a top-down game where you are *in* the stack, pieing the door yourself, while your AI teammates hold the long hall because you told them to. The player is the point man, not the camera in the sky.

## Design pillars (test every feature against these)

1. **You are one of them.** Direct control is the default state, not a mode. Aiming, shooting, moving, and leaning feel good enough that the game would be playable with no squad at all.
2. **The squad is your force multiplier, not your escort.** Orders are fast to issue mid-fight (point-and-command + go-codes), teammates are competent enough to trust with a door.
3. **Doors are the game.** Every entry is a decision: kick, pick, charge, shotgun-breach, flashbang-first, two-door simultaneous entry on a go-code.
4. **Lethality cuts both ways.** Fights resolve in fractions of a second. Angles, cover, and surprise beat reflexes. Information (what's behind the door) is the scarcest resource.
5. **Restraint is scored.** Hostages, civilians, and surrendering suspects matter — the best run arrests more than it kills, Ready or Not / SWAT 4 style.

## Success criteria

The prototype works if a playtester says:
- "I stacked my guys on the back door, breached the front myself, and hit GO as I threw the bang."
- "I died because I rushed the door instead of pieing it."
- "My squad held that hallway exactly like I told them to."

It fails if the optimal play is to park the squad in a corner and solo the map, or to never touch WASD and play it like Door Kickers.

## Non-goals (for now)

- No multiplayer.
- No campaign meta-layer / squad progression until the core loop is proven.
- No 3D, no verticality. One floor per mission slice.
- Game title/theming decision is deliberately deferred — mechanics first.
- **No unique per-operator gadget kits (R6 Siege style) in the first build** — Sam's call, 2026-08-07. Squad members are interchangeable operators drawing from shared equipment. Operator kits are a future-build item; the Siege research informs general tactical design (breaching, counterplay, enemy/trap concepts) only.

## Deliverables

- `tactical_research_v1.x.md` — genre & doctrine research (Door Kickers 2, direct-control top-down shooters, real CQB/breaching, SWAT/hostage-rescue games, R6 Siege operators, hybrid control+command games).
- `top_down_tactical_prd_v1.x.md` — the PRD derived from research.
- `top_down_tactical_v0.x.html` — playable single-file prototype (repo house style).
- `BURNDOWN.md` — living ranked backlog + ledger (see `/burndown`).

## CHANGELOG
- v1.0 (2026-08-07): Initial goal document.
- v1.1 (2026-08-07): Added non-goal: no R6-style per-operator kits in first build (Sam's call); kits deferred to a future build.
