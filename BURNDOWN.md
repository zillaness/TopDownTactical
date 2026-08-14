---
file: BURNDOWN.md (top-down-tactical)
version: 1.0
author: Sam Cao
created: 2026-08-07
last_updated: 2026-08-12
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

## Burndown night — 2026-08-13 (no live meter; Phase 0 still pending)

Sam's mandate, verbatim: "implement anything tabled. Like other grenade types.
Also let's the option to be organized like a us military square with fireteams.
This would allow for longer engagements" + the 9-man rifle squad TO&E
(SL + two 4-man fireteams: TL, GRN with 40mm, AR with SAW, RFLM).

### Night queue (ranked)
1. ☑ v0.19 — 40mm underbarrel (M320) + GRENADIER squad role — impact-fused at 640px/s, arms at 170px, refuses impacts near protected people, 8s cooldown
   ▶ NEXT: v0.20 rifle squad
2. ☐ v0.20 — RIFLE SQUAD (9): two fireteams, formation, bound-by-team, HUD
3. ☐ v0.21 — CS gas grenade + RIOT kit (the "other grenade types" ask)
4. ☐ v0.22 — suppressors (tabled at v0.9 by Sam's call; the fight is losable now)

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
- (Opus) ✅ U32 briefing loadout: primary weapon (M4 / shotgun / MP5) with the ammunition list constrained to the weapon in hand, utility kits trading bangs against charges, squad templates assigning roles, and per-mission loadout advice
- (Opus) ✅ improvement study: 8 agents audited the build and researched the genre; 121 raw recommendations pruned to 38. Plan at improvement_plan_v1.0.md, measured evidence at tests/MEASUREMENTS.md
- (Opus) ✅ CRITICAL fixes found by the study: closeDoor() ReferenceError that froze the render loop (and the HUD prompted you into it); room flood fill leaking through windows; hostage securing gated on flood-fill room identity, unsatisfiable on FLIGHT 214; HIGH VALUE deploying a one-man squad; debrief dead end making 5 of 6 missions unreachable after one completion. Bot wins after: FLIGHT 214 0/20 -> 11/20, THE PLANT 4/20 -> 10/20
- (Opus) ✅ firing solution fixed: rounds were leaving the offset muzzle at the body-to-target angle, displacing every shot sideways — 45% hit rate at 10px offset on a stationary target with zero spread. Committed 82aec23
- (Opus) ✅ sprite set v2 integrated (27 assets): realistic helmets with NVG shrouds, top-plan weapons distinguishable by silhouette, correct two-handed arm geometry, dedicated enemy_hvt, five night variants held unused. Validated before swap — every weapon centreline at y=36 as specced, nothing out of bounds, no external refs. Game → v0.6
- (Opus) ✅ session 1 feedback batch (plan item 5 + theme A4 + theme D6), game → v0.7: full-screen wash and a centred FLASHED/STUNNED banner for the ~1s the controls are taken away, plus a tinnitus tone routed past the duck; directional damage arcs from the true inbound bearing (the honest answer to an off-screen shooter); spall now reports through the same channels as a hit instead of subtracting hp in silence; drawFx split into pre-fog / additive-emitter / overlay passes so a muzzle flash is no longer dimmed 86% by the fog painted over it; muzzle flash moved to eyePoint, which is the whole premise of the corner game; corpses tinted by side so the four categories computeGrade scores separately are four colours, with a 0.35s settle; player facing rate-limited to ~110ms for a 180° reversal while the firing solution still reads the true cursor (verified 0.0000px error). Five headless regressions added; render path verified in Chromium since the harness never calls render()
- (Opus) ✅ break the huddle, game → v0.8: follow replaced with a wedge (bearings 145/-145/180 off your facing, eased at 2.2 rad/s), squaddies cover flanks and rear on station, blocked men step off the firing line, acquisition gated on the same 160° cone that reports contacts, reload moved out of the threat branch. Measured on the same build, 24 runs each: squad share of team fire 3.6% → 17.7%, clearShot allowed 3.4% → 67.0%, median spacing 134 → 224px. Isolated the acquisition change to confirm the wedge is the cause (69.1% without the cone)
- (Opus) ✅ PLAYBOOK: [P] opens a wristband at command time, 1–5 calls a play. DYNAMIC ENTRY (stack/bang/flood to points of domination read out of the room's flood fill, #4 on rear security), SLICE THE PIE (three angles outside, opened quietly once set), WEDGE, ANCHOR, COVER ME. You are #1, they are #2/#3/#4 and the plays assign by number. Verified on all 41 doors across six maps. Plays compose the existing order system, so per-man Door-Kickers-style waypoints can land on top later without a rewrite. Also wired TUNE.squadWalk (previously zero references) as quiet movement
- (Opus) ✅ BODY ARMOR: a plate is a material you wear — rating vs the round's penetration, on the same arithmetic as the walls. IIIA(14)/III(33)/IV(48) against the AMMO table; defeated plates still take 15% out of the round, holding plates pass 12% as backface, plates wear out (~5 rifle rounds for III), 22% of hits miss the plate, every tier costs move speed. Spall and blast route through it too. Enemies bare below ELITE; on ELITE the elite and taker wear IIIA, which makes HP go from 3.0 to 4.9 rounds-to-kill while FMJ barely moves. ⚠ III plate takes bot deaths 5/24 → 0/24 — this makes an already-unlosable fight easier and needs re-costing once session 2 lands
- (Opus) ✅ playtest batch 1 (Sam playing, v0.8): bystander deaths attributed with cause/place/side and listed in the debrief; mission briefing + floor plan derived from the map source (never hand-written, verified against parseLevel on all six maps); call sheet of three plays scripted at the briefing and called with 5/6/7; after-action review — lights on, fog lifted, line of fire drawn from muzzle to body, arrow keys step incidents
- (Opus) ✅ CONFIRMED Sam's hypothesis that noise was executing his hostages, and the cause was worse: game.alarm is a global flag ANY enemy sets, and the execution clock keyed off it — a guard outside started a countdown for a taker sealed in a back room. Measured: alarm started by noise in 16/25 runs, 91% of those alerts had no LOS to the sound, 30% crossed 2+ walls. Fixed both — sound now attenuates per barrier crossed (concrete 210 ... drywall 55, closed door 85), and the clock starts on the TAKER'S own awareness. Added enemyCallout() so enemies can tell each other: 195 callouts turned up 105 comrades over 24 runs, taker learned in 23/24, 17 of those because someone told him. Median 4.6s of grace the global flag was stealing
- (Opus) ✅ THE SHOOT HOUSE — training mission, no hostages, no bystanders, no clock. Five doors (one locked), 87 shoot-through partitions, brick cover, two windows. Renders first on the menu while keeping its MAPS index last so saved grades stay attached. Also fixed validateMap rejecting the four material glyphs (= - % @) parseLevel has always supported, so no map could declare its own materials
- (Opus) ✅ BOUND (playbook [6]): bounding overwatch to the cursor. Team splits into two elements, one moves a 130px leg while the other holds and watches the ground being crossed, swapping on arrival. Measured over 840 frames of travel: 0 frames with nobody covering, 7 element swaps
- ⏸ DEFERRED by Sam's own call: suppressors and stealth tuning. "It is hard to tune the stealth aspect when we do not even have core combat and gameplay mechanics" — agreed, and the improvement plan says the same thing from the other direction. Design kept: suppressor trades noise radius and muzzle flash against a longer weapon (slower traverse, and the muzzle breaks a corner earlier than your eye does). Revisit after the fight is losable
- (Opus) ✅ **v0.9** — twelve units shipped against Sam actually playing it: the command wheel (whole squad on RMB, P/1-7/B/T/X/Z deleted), grenade bag on MMB (frag/concussion/smoke), shared squad vision + remembered layout + last-known contacts + snake cam, suppression + base of fire, SAW + DMR + sidearm, bounding that scores legs on cover, THE SHOOT HOUSE + THE PILLBOX, briefing + floor plan, after-action review, bystander death attribution, noise attenuation and the executioner-clock fix
- ℹ **process failure, owned:** those twelve commits all shipped under the v0.8 filename. The file's own ai_update header says to bump and rename per change and I did not — I ended each playtest turn on commit+push and skipped the version pass. Added a headless test asserting filename == header == title == menu == newest changelog entry, and that the changelog is monotonic. It cannot catch "forgot to bump" (nothing automated can) but it catches every way the records disagree. Bump per feature batch from here
- (Opus) ✅ **v0.10** doorways, from Sam's playtest: grenades thread an opening instead of bouncing off the jamb (38% failure → 0%), and walking through a door drifts you onto its centreline (square 60%→100%, 18° off 8%→100%, 32° off left at 32% on purpose — hanging up on a frame is realistic, being unable to find the door is not). Version-consistency test extended to compare versions as tuples, since parseFloat calls 0.10 older than 0.9
- (Opus) ✅ **v0.11** pace + lethality, from Sam playing: duel harness confirmed 30/30 cells at 100% player win (ELITE at 512px left you on 95hp). Player 148→196px/s, squad 140→208, turn limit 110ms→60ms. Enemies move in combat (was 0.0px across 600 combat frames), awareness accumulates instead of resetting on every re-peek, shooters lead, watching-the-door reaction, turn bloom, enemy hp up so a man outlives his own reaction clock. DIFFICULTIES rebuilt on lead/cone/sight/hp/armour. Base cones tightened 55% with movement penalties untouched, so planted shooting is 11-38x tighter than running. Maps: FIRST NATIONAL and DOWNTOWN EXCHANGE
- ⚠ **the bot is a bad oracle for this and I over-corrected against it twice.** It never takes cover and now charges 33% faster, so it reads 15/20 deaths on REGULAR where a human should do far better. Two real bugs surfaced while tuning: a repositioning enemy bypassed the burst rhythm and fired continuously, and the blocked-shot sidestep was moving the element that was supposed to be holding still during a bound (19% of travel frames uncovered → 0%). Final numbers need Sam's hands, not more bot runs
- ▶ NEXT: **STOP CODING — play all six missions on REGULAR and write down every sentence you say out loud.** That playtest is the deliverable of session 1, not more code. Session 2 (make the fight losable) is entirely justified by a harness that aims perfectly and never takes cover
- (Opus) ✅ **v0.12–0.14** sprint/steady gaits, enemy density option, THE LANDING + SEAWALL (74x42 beach, demolition objective), wall charges off H onto the cursor, readable ammo readout
- ⚠ **CONFIRMED by adversarial review, and it falsified my own v0.12 commit message.** I wrote that the sprint tank "cannot be stutter-tapped." It could. Wind regenerated the instant the key came up and the blown lockout only armed at exactly zero, so any duty cycle below regen/(drain+regen) = 0.355 never emptied the tank — tapping SHIFT at ~10Hz held 234px/s against the 196px/s honest jog, a permanent 19.4% bonus identical at IIIA, III and IV. With ARMOR.speed flat at 1.00 that made IV HEAVY free for anyone who taps, which is the exact imbalance I told Sam I would rather he heard from me than discovered. **v0.15** gates regen behind 0.6s of not spending it, which inverts it: IV HEAVY holds 233.6px/s, best of thirteen tap patterns 224.8px/s. Regression test sweeps every duty cycle at all three tiers
- ℹ **review coverage is incomplete:** 15 of the 49 agents in that review died on "monthly spend limit" mid-run, so a slice of findings was never adjudicated. Unverified titles worth re-checking by hand: sprint as a free disengage from a fight, the squad never regaining formation behind a sprinting player, and the menu claiming you cannot shoot while sprinting — I checked that one by hand, it was true, the code only adds an 11° penalty (17° total cone) and never blocks the trigger, so the help text now says what actually happens
- ▶ SUPERSEDED: cars as multi-tile props (sheet metal + engine block) and the extreme-rendition mission; ship boarding; assassination; compound infiltration with an `undetected` objective
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
