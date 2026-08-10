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
- 04:0x ✅ U7 second mission "SAFEHOUSE ROW" (two buildings + alley), mission picker on menu, camera clamped to world — committed with this ledger line
- 04:1x ✅ U8 wall charges (H plant/H blow, wall becomes opening, LOS/pathing live-update, stun through breach) — committed with this ledger line
- 04:2x ✅ U9 feint surrender (20% of surrenders fake; re-arm in 2.5-5s unless cuffed) — committed with this ledger line
- 04:3x ✅ U10 PRD synced to v1.1 (shipped features moved into scope, controls table updated) — committed with this ledger line
- 04:4x ✅ U11 test harness into repo (tests/run.sh: smoke tests + 6 assault-bot playthroughs, both maps, 0 errors) — committed with this ledger line
- 05:0x ✅ U1a review fixes, AI/orders batch: patroller wander freeze, plan slot reindexing + dead-member pruning, executing-plan re-stack guard, Z recall plan removal, squaddie blocked-shot movement deadlock, taker double-move, shouter-attribution on failed surrender, goal/slot/entry wall-snapping, astar-null order completion, dead-player command lockout + fail-reason ordering, return-ROE engages under alarm — committed with this ledger line
- 05:2x ✅ U1b review fixes, render/geometry/input batch: intel overlays above fog, fx LOS-gating, ghost hostage color, seen-grid wall-face nudge, sweepAxis near-face resolution, closeDoor overlap check, bang bounce axis + wall-hug spawn, blur mouse clear, ~ select-all, menu keyboard access, Esc resume + Restart button, friendly fire on teammates/cuffed, HUD clamp, debrief civilian row, dead TUNE knobs removed, PRD v1.1.1 — committed with this ledger line
- 05:3x ✅ U12 in-world command state: selection rings on squaddies, move-order lines + destination markers (above fog) — committed with this ledger line
- 05:4x ✅ U13 squad auto-cuff in reach + elite enemy kind (120hp, fast react, surrender-resistant, magenta; guards Safehouse Row SE) — committed with this ledger line
- 05:5x ✅ U14 version bump → top_down_tactical_v0.2.html (full changelog) + project README.md — committed with this ledger line
- 06:0x ✅ review verdicts cross-checked: both CONFIRMED defects already fixed in U1a/U1b; REFUTED entries were verifiers observing the applied fixes — nothing new to apply
- 06:0x ✅ U15 difficulty selector (Rookie/Regular/Elite: reaction, execution timer, surrender odds) + best-grade persistence per map+difficulty via localStorage — committed with this ledger line
- 06:2x ✅ U16 third mission "THE PLANT" (inner secure room: locked door or wall-charge entry; elite + taker inside), map-3 tests + bot runs green — committed with this ledger line
- 06:3x ✅ U17 squad breach-charge economy (2/mission, dry falls back to kick, plan label shows count) + three-mission text sync — committed eb0b179
- 06:4x ✅ review workflow formally complete (15 agents, 0 errors): both CONFIRMED defects were already fixed in U1a/U1b; QA screenshots verified wall-charge breach + stun into the secure room on THE PLANT
- 06:5x ✅ U18 compliance statistics regression test — flashed 0.54 (~0.55), feint 0.25 (~0.20), outgunned 0.33 (~0.28), all in band — committed with this ledger line
- 07:0x ✅ U19 noise-radius rings for player-side emissions (stealth system made learnable) — committed with this ledger line
- 06:2x ℹ usage reading (Sam): Fable 35% used / 65% left. Observation for Phase 0: whole night so far (research workflow 374k + review workflow 1.22M subagent tokens + main loop) moved the meter only ~8 points from the 1am reading — consistent with subagent spend not billing to the Fable bucket. UNVERIFIED; Phase 0 still pending.
- 06:4x ✅ U20 squad voice barks (stacking/set/breaching/reloading/man-down/secured, rate-limited) — committed 98f25b9
- 07:0x ✅ U21 fourth mission "MARKET ROW" (three buildings, split hostages force squad splitting), map-4 tests + 12 bot runs green — committed b3624d0
- 07:1x ✅ U22 mission-picker wrap fix + final QA screenshots (menu, breach sequence, wall-charge entry) — committed f68a552
- (post-reset, Opus) ✅ U23 SVG sprite set integrated: 21 Codex-authored assets inlined at S0, tinted-canvas rasterizer, drawBody/drawDoor on sprites with circle fallback, handedness Y-flip wired, camera zoom (1.6, live [ ]) so the art reads. Game → v0.3.
- (Opus) ✅ U24 eye-offset corner mechanic: vis polygon + bullets originate at the shooting shoulder while enemies test the body centre; 10% left-handed; N re-shoulders at 0.5s + 2.3x spread — committed 0f2aabc
- (Opus) ✅ U25 breach blasts wound and kill: falloff damage from door and wall charges, LOS-shielded, attributed to the player's team for ROE scoring
- (Opus) ✅ U26 windows: transparent to sight and bullets, solid to bodies; grenades punch through and shatter them loudly; 10 placed across the four maps
- (Opus) ✅ U27 noise made legible: type-coloured expanding pulses for every significant sound, dashed for sounds you did not make, plus ?/! alert markers over enemies you can see
- (Opus) ✅ U28 mission framework: objectives are pluggable (rescue / neutralize / capture / eliminate / extract), HVT and extraction-zone tiles, objective-driven HUD and win-loss. Two new missions — FLIGHT 214 (aircraft assault, 4 hostages in a cabin, locked cockpit) and HIGH VALUE (capture the principal alive, walk him to the vehicle). Game → v0.4
- ▶ NEXT: remaining mission content on the now-existing framework — ship boarding, extreme rendition, assassination, compound infiltration (needs an `undetected` objective)
- (Opus) ✅ U29 ballistics: material system (concrete/brick/drywall/glass/sheet metal/engine), concealment vs cover separated, caliber+projectile penetration with damage loss and deflection, grazing ricochet along walls, spall wounding wall-huggers, glass first-shot deflection. Interior partitions auto-classified as drywall so every map gets materials for free
- (Opus) ✅ U30 ammunition: FMJ / HP / AP chosen at the briefing, plus buckshot and belt-fed squad loadouts; HUD shows the loaded round
- (Opus) ✅ U31 CHECK FIRE warning — the squad already refused unsafe shots via clearShot(); the player now gets a red crosshair and a ring on whoever is in the line. Added after bot testing showed the player had no equivalent of the discipline the AI already had
- ℹ correction: FLIGHT 214 was never reliably winnable by the test bot. An earlier claim that it was came from a single lucky run. Isolation testing (spall off / penetration off / both off) showed ballistics are NOT the cause — the bot simply fires down a packed tube with no fire discipline. Map fairness for a human is still unmeasured
- ▶ NEXT: cars as multi-tile props (sheet metal + engine block) and the extreme-rendition mission; ship boarding; assassination; compound infiltration with an `undetected` objective
- 08:00 ⏸ PAUSED on schedule — tokens reset; fresh quota untouched. Tree clean, branch fully pushed, no work in flight.

## Handoff

**Final — 8:00am PDT, 2026-08-07. Night closed on schedule.**

22 work units, 30 commits (1d5ac0a → f68a552), all pushed to
`claude/tactical-game-research-ner6e1`. Nothing uncommitted, no
workflows or subagents running at pause.

Done tonight: research doc df91a80 (6 chapters + synthesis), PRD e6d7ceb →
v1.1.1, playable game → `top_down_tactical_v0.2.html` — 4 missions (Compound,
Safehouse Row, The Plant, Market Row), 3 difficulties with saved best grades,
synthesized audio 8bc5836, slow-mo command time f0f16cc, squad ROE 56cd5b4,
mirror peek 29500f6, wall charges e2ca880, feint surrender fd1b557, elite
enemies b9d26dc, squad auto-cuff + voice barks 98f25b9, noise-radius rings
b1e277f, in-world order UI 8aea79e, Esc resume + input hygiene 61a056c.
15-agent adversarial review: all confirmed findings fixed across two batches
(9957396 AI/orders, 61a056c render/geometry/input) and re-verified. Test
harness 10e9b7f (`tests/run.sh`): smoke tests, compliance statistics 5688017,
12 bot playthroughs across all four maps — all green, zero errors.

In-flight at handoff: nothing.

Suggested next session starting points (PRD §6, ranked):
1. Playtest by a human (Sam) — tuning feedback loop; bot data says squad
   survivability and map-3 difficulty are the axes to watch.
2. Go Silent preset + slow-mo accessibility slider to full pause.
3. Non-lethal arsenal (taser/beanbag) — deepens the arrest game.
4. Game title decision — mechanics are proven; theming is unblocked.

Phase 0 (token-burndown skill): still pending — no live meter tonight.

## CHANGELOG
- v1.0 (2026-08-07): Initial backlog seeded at project start.
