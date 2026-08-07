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

## Burndown night — 2026-08-07 (reset 8:00am PDT / 15:00 UTC)

- Started ~3:00am PDT. Last meter reading (Sam, ~1:15am): Fable 27% used.
- Stop triggers: primary 8:00am (trig_01LHwvk8gkyiUkZuVAj2zEGc),
  failsafe 8:12am (trig_01RAGrpt2oHF2M2Wiw7tmmnJ). Pause at 8am — do not
  burn post-reset quota.
- Ladder: claude-fable-5 → claude-opus-5 → claude-sonnet-5 → claude-haiku-4-5.
  Sam asleep → reactive protocol on limit errors (commit, ledger NEXT,
  /model line posted, subagent redispatch).
- Phase 0 usage-mechanics experiments: **pending** — no live meter tonight;
  normal burndown per skill rule.

### Night queue (ranked)

- U1 ◐ Apply confirmed findings from adversarial review workflow (in flight)
- U2 ☐ In-browser verification: run the game in Chromium/Playwright, screenshot menu + gameplay, fix render bugs
- U3 ☐ Audio: WebAudio SFX (shots, kick, breach, bang, shout, surrender) — no external assets
- U4 ☐ Slow-mo command mode (~15% timescale while ordering) with Space full-pause kept
- U5 ☐ Squad ROE toggle: hold fire / return fire / weapons free
- U6 ☐ Door peek (mirror/pole cam): reveal room through a closed door, limited uses
- U7 ☐ Second mission map + mission select on menu
- U8 ☐ Wall charges (breach through walls, edit connectivity)
- U9 ☐ Suspect feint-surrender + re-arm
- U10 ☐ Menu/debrief polish, difficulty as score threshold

## Backlog (ranked, highest value-per-token first)

1. ☑ Genre & doctrine research doc (`tactical_research_v1.0.md`)
2. ☑ PRD (`top_down_tactical_prd_v1.0.md`)
3. ☑ Prototype v0.1: player operator — WASD move, mouse aim, shoot, walls, line-of-sight
4. ☑ Prototype v0.1: enemies with vision, reaction time, and lethal return fire
5. ☑ Prototype v0.1: doors (kick/open), breach interactions, flashbangs
6. ☑ Prototype v0.1: squad AI — follow, hold, move-to, stack-on-door, breach-on-GO
7. ☑ Prototype v0.1: hostage rescue objective + mission end states + restraint scoring
8. ☑ Prototype v0.1: HUD (squad status, ammo, order UI), pause-to-command
9. ◐ Review/playtest pass: adversarial review workflow + confirmed fixes (in progress)
10. ☐ Future builds (ranked in PRD §6): slow-mo command mode, squad ROE toggle, intel gear (mirror/drone/lockpicks), wall charges, non-lethal arsenal, feint-surrender, operator kits (Sam: not first build), ballistic penetration, more maps/multi-floor, campaign layer

## Ledger

- 2026-08-07 ℹ usage reading (Sam): Fable 27% used / 73% left — full headroom, no ladder action
- 2026-08-07 ℹ scope call (Sam): no R6-style operator kits in first build → moved to future-build backlog
- 2026-08-07 ✅ project scaffold (GOAL.md, BURNDOWN.md, /goal, /burndown) — committed 1d5ac0a
- 2026-08-07 ✅ prototype v0.1 core (12 sections, smoke-tested) — committed 06495a0
- 2026-08-07 ✅ research doc, 6-chapter sweep + synthesis — committed df91a80
- 2026-08-07 ✅ PRD v1.0 — committed e6d7ceb
- 03:1x ✅ U2 browser verification via Playwright + fixed fx pruning & seen-grid gaps — committed d5addd8
- 03:2x ✅ U3 synthesized WebAudio SFX (shot/kick/breach/bang/shout/hit/thud/door/click/surrender, distance+pan) — committed with this ledger line
- 03:3x ✅ U4 slow-mo command mode (hold Tab → 15% timescale, banner, menu row) — committed with this ledger line
- 03:4x ✅ U5 squad ROE toggle (V cycles hold/return/free; return-fire default; entry = weapons free; HUD shows ROE) — committed with this ledger line
- 03:5x ✅ U6 mirror-under-door peek (Q marks contacts in the room behind a closed door, 4s) — committed with this ledger line
- ▶ NEXT: U7 second mission map + mission select; review-workflow findings fold in as U1 when it lands

## Handoff

(filled at session end — done list, in-flight state, suggested next starting point)

## CHANGELOG
- v1.0 (2026-08-07): Initial backlog seeded at project start.
