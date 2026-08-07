---
file: BURNDOWN.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-07
last_updated: 2026-08-07
description: Living ranked backlog and checkpoint ledger for the top-down-tactical project, compatible with the token-burndown skill's ledger format.
ai_update: Update last_updated in this frontmatter (filename stays BURNDOWN.md). Keep the ▶ NEXT line current at all times. Append ✅ ledger lines with commit hashes as units finish; never delete finished lines. Bump version only on structural changes to this file.
---

# Burndown — top-down-tactical

Ranked queue of work units for this project. Every unit is small,
partial-completable, and committed on completion — the same discipline
as a token-burndown night, so `/burndown` and the token-burndown skill
can both drive this file.

## Backlog (ranked, highest value-per-token first)

1. ☐ Genre & doctrine research doc (`tactical_research_v1.0.md`)
2. ☐ PRD (`top_down_tactical_prd_v1.0.md`)
3. ☐ Prototype v0.1: player operator — WASD move, mouse aim, shoot, walls, line-of-sight
4. ☐ Prototype v0.1: enemies with vision, reaction time, and lethal return fire
5. ☐ Prototype v0.1: doors (kick/open), breach interactions, flashbangs
6. ☐ Prototype v0.1: squad AI — follow, hold, move-to, stack-on-door, breach-on-GO
7. ☐ Prototype v0.1: hostage rescue objective + mission end states + restraint scoring
8. ☐ Prototype v0.1: HUD (squad status, ammo, order UI), pause-to-command
9. ☐ Playtest pass: tune lethality, enemy reaction, squad competence
10. ☐ Backlog after v0.1: more maps, operator kits (R6-style), suspect compliance/arrests, sound propagation, marksman/breacher classes, go-code multi-door sync breach, drone/mirror recon, non-lethal loadouts, campaign structure

## Ledger

- 2026-08-07 ℹ usage reading (Sam): Fable 27% used / 73% left — full headroom, no ladder action
- 2026-08-07 ℹ scope call (Sam): no R6-style operator kits in first build → moved to future-build backlog
- 2026-08-07 ▶ NEXT: research workflow running (6 agents); then write research doc

## Handoff

(filled at session end — done list, in-flight state, suggested next starting point)

## CHANGELOG
- v1.0 (2026-08-07): Initial backlog seeded at project start.
