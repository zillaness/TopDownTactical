---
file: tactical_research_v1.1.md
version: 1.1
author: Sam Cao
created: 2026-08-07
last_updated: 2026-08-14
description: Genre and doctrine research for the top-down-tactical project — Door Kickers 2, direct-control top-down shooters, real CQB/breaching doctrine, SWAT/hostage-rescue games, R6 Siege operator design, and direct-control+squad-command hybrids — with a synthesis of what this game takes, defers, and rejects.
ai_update: Update last_updated and version. Rename file to match. Append changelog at bottom.
---

# Tactical Research — Top-Down Tactical (title TBD)

Six deep-dive chapters researched 2026-08-07 (parallel web research), preceded by
a synthesis of what this project takes from each. The game this feeds:
**a Door Kickers 2-style top-down tactical game where you directly control the
point man (WASD + mouse aim/shoot) while commanding the rest of the squad.**

---

## 0. Synthesis — what we take, defer, and reject

### The design gap (why this game should exist)

No shipped game combines all three of: (a) top-down WASD+mouse operator
control, (b) multi-man (3+) AI squad ordering, (c) Door Kickers-grade
planning/go-codes (ch. 6). Police Stories proves (a) plus ordering but caps at
one partner. Aliens: Dark Descent proves squad-command tension but removes
direct aim. Freedom Fighters and Republic Commando prove the command grammar
and hero-feel but in 3rd/1st person. Door Kickers owns planning but has no
operator — and its own community threads ask for direct single-unit control.
That gap is exactly Sam's pitch.

### Locked into v0.x (already in the prototype or next patch)

1. **You are the point man; orders ride the verbs you already have.** Cursor =
   aim + camera-lead + order target (ch. 2 §1, ch. 6 §2). RMB orders on
   ground/doors, number-key selection, one GO key for synchronized breaches
   (DK2 go-codes, ch. 1 §2; real execute cadence, ch. 3 §7).
2. **High lethality + cheap retry.** 1–3 rounds kill on both sides; instant
   restart (HM/Police Stories/DK2 consensus, ch. 1 §1, ch. 2 §5). Fairness
   stack: enemy reaction delays (~0.4–0.85s), visible awareness escalation, and
   information tools — never enemy fire from outside obtainable information
   (HM2's failure, ch. 2 §6).
3. **Doors as first-class objects.** Open / kick / charge, each with distinct
   noise-speed-lethality (ch. 1 §5; breach selection logic, ch. 3 §1).
   Flashbang-then-enter as the signature squad move ("breach — bang — clear",
   ch. 3 §5). Charge stuns through the doorway like DK2's ~4 m breach kill
   zone, toned to stun for our restraint scoring.
4. **Stack → READY → GO.** Squad stacks slots beside the frame (never in front
   of the door — fatal funnel, ch. 3 §2), reports ready, executes on one key;
   multiple stacked doors execute simultaneously (multi-point breach, ch. 3 §7).
5. **LOS masking + noise propagation as a pair** (ch. 2 rule 5): visibility
   polygon fog for the player, per-action noise radii (shot ≫ kick > steps),
   enemies investigate last-heard-position, not player position (Intravenous
   model, ch. 2 §7).
6. **Restraint is scored** (SWAT 4 / Police Stories / RoN, ch. 4 §1): shout
   compliance rolls against morale, flash/outnumbered/last-man modifiers,
   cuffing, civilians and hostages as score-critical, surrendered-suspect kills
   punished. Score-as-difficulty is the long-term difficulty knob.
7. **Executioner pressure, not a generic clock** (DK2's executioner + R6 1998
   hostage executions, ch. 1 §6, ch. 4 §4): the hostage-taker moves on
   hostages once alerted; the countdown pauses while he's suppressed, flashed,
   or fighting. Urgency comes from the threat, and the player can buy time by
   attacking it.
8. **Squad competence by construction** (ch. 6 §4): teammates check friendly
   lines before firing (muzzle discipline, ch. 3 §8), path around the player,
   fast reaction times with capped effectiveness so the player stays the hero
   (aimbot-with-damage-governor pattern), and legible states over clever
   states — "he will hold that corner until GO" beats smart-but-opaque.

### Deferred (explicit future-build backlog, in rough priority order)

- **Tactical slow-mo command mode** — Dark Descent's slow-mo-while-ordering
  (~15% timescale) with an accessibility slider to full pause; our v0.1 space
  pause is the placeholder (ch. 6 §8 recommended stack).
- **Fire-discipline / ROE toggle per squad** — hold / return / free (ch. 6 §5),
  plus Go Silent for synchronized stealth takedowns (ch. 1 §2).
- **Lockpicks, breaching shotgun, mirror/pole camera, drone recon** — the
  DK2/Police Stories intel-purchase economy (ch. 1 §4, ch. 3 §6, ch. 5 §4).
- **Wall charges** — "the level designer's walls are only suggestions"
  (DK2's headline feature, ch. 1 §4) + Siege's connectivity-graph editing
  (ch. 5 §5); pairs with enemy pre-fortification for replayability.
- **Non-lethal arsenal** — taser/beanbag/pepperball with the SWAT 4 balance
  warning: no LTL that hard-stops reliably at all ranges (ch. 4 §3).
- **Operator kits, R6-style** — one verb + one constraint per operator, small
  roster with maximal kit contrast, silhouette-readable props (ch. 5 §2, §9).
  **Sam's call 2026-08-07: not in the first build.** The Siege research still
  shapes enemy design (jammer/trap/anchor/roamer archetypes, ch. 5 §3) and the
  soft/hard breach ladder (ch. 5 §6).
- **Suspect feint-surrender + re-arm** (Police Stories/RoN, ch. 4 §2) — makes
  cuffing tense; needs animation/telegraph work to read fairly.
- **Ballistic penetration through doors/thin walls** — DK2's #2 community
  request, declined by its devs (ch. 1 §12) — a real differentiation lever.
- **Multi-floor with readable cutaway UI** — DK2's #1 structural request.
- **Campaign layer:** named squadmates, injuries persisting across missions,
  RoN-style stress/therapy as the conduct accumulator (ch. 4 §9).
- **Plan-then-play:** pre-mission waypoint plans with go-codes you then join
  as the point man (classic R6, ch. 4 §6) — the full DK2 inheritance.

### Rejected (with reasons)

- **Superhot-style time-moves-when-you-move** — punishes the direct-control
  layer we exist to celebrate (ch. 6 §8).
- **Character switching as a core verb** — undermines "I am THIS operator";
  possession-as-fallback on player death is the only variant worth revisiting
  (ch. 6 §3).
- **Full-map architectural omniscience (DK2 style)** — we are the point man,
  not the ceiling camera; you see what you see, the squad reports contacts
  (ghost pings). Keeps recon gear meaningful later.
- **HUD countdown urgency everywhere** — alarm-escalation and audio-telegraphed
  probabilistic executions beat generic timers (ch. 4 §4); the one visible
  countdown we keep is the executioner's, because DK2 proves that specific
  timer creates correct play (rush vs. stealth decision).
- **One-shot player death** — Police Stories' 1–2 hits is right for a game
  about procedure; pure HM one-tap forces route-memorization, which fights
  squad play. We sit at "2–4 rounds, no regen."

---

# Chapter 1: Door Kickers 2: Task Force North

*(research agent report, 2026-08-07)*

# Door Kickers 2: Task Force North — Deep Design Research
*(KillHouse Games; Early Access Nov 2020 → v1.0 on Feb 10, 2025; ~$24.99; "Overwhelmingly Positive" — ~95–96% of ~8,000 Steam reviews; 90+ handcrafted missions, 4-player online co-op, full editor + Workshop/Nexus modding.)*

---

## 1. Core Gameplay Loop & Why It Feels Good

- **Loop:** Read the map → pause → draw movement paths and set waypoint actions for each trooper → sync squads with go-codes → unpause and watch → re-pause and adapt when contact breaks the plan → mission ends in minutes → instant restart or replay viewer.
- **Real-time with pause-at-will.** No turns, no hexes, no action points, no command cooldowns — "freeform planning." You can play it two ways, and both are fully supported: (a) *plan-then-execute* — author the entire mission while paused (breaches, go-codes, sync-ups, wait-until-clear orders) and press play to watch it unfold; (b) *improvisational RTS* — issue orders live and pause only when things go sideways.
- **Missions are short** (30 seconds to ~10 minutes), lethality is high (1–3 rounds kill), restarts are instant, and on restart the game offers to **keep your previous plan** so you iterate on the plan rather than re-doing everything. This plan-iteration loop is the core compulsion: fail → tweak two waypoints → replay.
- **Why it feels good (per reviews):** the earned "tactical genius" high when a simultaneous multi-door breach with synced flashbangs clears a room with 0 casualties; and, equally, when the "gloriously unpredictable, largely believable AI sticks a spanner into that clockwork" and you must improvise. Reviewers call it a modernized original-Rainbow-Six planning fantasy; "enjoy it for five minutes, an hour, or four years."
- **Aftermath feedback:** an automatic **replay system** (last mission replay auto-saved, viewable/scrubbable; files shareable from `%LocalAppData%\KillHouseGames\DoorKickers2\replays`, though no built-in video export — DK1 had one).

## 2. The Planning System

- **Path drawing:** select trooper, drag to draw a free route of unlimited length; waypoints are droppable/editable anywhere along it.
- **Facing control:** two arrow types — **dark blue arrows "lock" facing**: the trooper turns their vision cone to stay fixed on that point while moving (crab-walking/strafing around it); **light blue arrows** = strafe/move without turning the cone. Tuning facing at each waypoint so troopers never walk "blind" into a room is the core skill.
- **Waypoint actions:** open/kick/pick/charge door, throw grenade through a point, deploy spy camera, toggle stance, wait, fire on point, etc., all queueable at specific waypoints.
- **Go-codes:** waypoints can be gated behind go-codes so multiple troopers/squads hold and then execute simultaneously (classic A/B personal codes plus shared X/Y codes in co-op; a known co-op bug is that personal A/B codes don't fire for teammates — only X/Y are common to both players).
- **Hold/timing orders:** "wait-until-clear" style orders and pauses at waypoints for sequencing without go-codes.
- **Go Silent / Go Loud behavior switch:** toggled at a specific waypoint via the waypoint menu, or **Shift+F** to toggle the whole team. Go Silent = hold fire unless directly threatened / until ordered, enabling synchronized simultaneous takedowns that don't trip the alarm.
- **Pause is unlimited and free**; there's no plan-quality score — the plan is just a means. Single-player persists your drawn plan across restarts (asks to save); co-op notably does **not** (a top community complaint).
- **Co-op:** up to 4 players share the same planning space and can draw lines for communication; each controls their own troopers.

## 3. Unit Classes / Factions

Three playable units, deliberately asymmetric in tools, doctrine, and playstyle:

**US Army Rangers** (default; loud, armored, direct action) — 4 classes:
- **Assault** — the versatile baseline; SMGs, shotguns, assault rifles (M4A1 etc.); grenades and breaching kit.
- **Support (Machine Gunner)** — only class with LMGs (suppressive fire role); best parked in overwatch "machinegun nests" covering open ground.
- **Marksman** — DMRs (community-favorite: **M110 with 3.5–10x scope**); long-range precision; long aim times up close.
- **Grenadier** — assaulter with **underbarrel 40mm launcher** (most primaries can mount it); lobbing indirect 40mm at range; tradeoffs: heavier → worse mobility, slower grenade prep than assaulters.

**CIA** (small-team stealth/infiltration; no assault class) — 2 classes:
- **Black Ops** — paramilitary; max **2 per squad**; start disguised under a **poncho** (blend into crowd) but reveal is **one-way** — once weapon is out they can't re-conceal; can wear helmets and **mount NVGs**; suppressed MP7 with subsonic rounds is the archetype.
- **Undercover** — full concealment (blue icon; enemies ignore them until weapon drawn); **can re-conceal after revealing**, unlike Black Ops; light gear, pistols/concealable SMGs, weak in prolonged loud fights; concealment-rig gear reduces the concealment penalty of carried pistols. Spy-camera-heavy playstyle.

**Nowheraki SWAT** (local partner force; mass over quality) — 4 classes:
- **Leader** — one per squad; **only** SWAT class with sniper rifles or grenade launchers.
- **Assault** — jack-of-all-trades merging DK1 classes: rifles, LMGs, SMGs, **ballistic shields**, breaching tools.
- **Sapper** — the breacher: up to **3 wall-breach charges or 5 door charges**; charges hit harder than Ranger equivalents but with **more collateral risk to hostages**.
- **Militia** — numerous cheap riflemen; poor training, poor armor, mostly no helmets; expect casualties.
- Faction identity: deploy **more troopers** per mission than Rangers, shields, big explosives — but fragile individuals and collateral-prone.

## 4. Equipment

- **Flashbang** — non-lethal; blinds + deafens everyone in a **~3 m blast radius** (affects your own troopers too).
- **Stinger** — less-lethal rubber-ball grenade, **~4 m radius**; pain/stun without hostage-killing risk.
- **Frag grenade** — lethal, wide kill radius, big collateral/hostage risk; also triggers alarm.
- **Slap charge** — small adhesive door explosive; small forward blast; fast dynamic entry.
- **Breaching charge (door)** — kills anyone within **~4 m behind the door**; comes **2 per utility-pouch slot**.
- **Wall breach charge** — large adhesive explosive that blows a man-sized hole in a **wall**, creating brand-new entry points (a headline DK2 feature); large forward blast, serious hostage/collateral danger (especially Sapper versions).
- **Breaching shotgun** — breaches doors *and* metal gates; quick to swap to/from; **4 breach charges** of ammo; audible at ~**25 m**.
- **Dynamic hammer** — one-hit door smash (SWAT-flavored manual breach).
- **Lockpicks** — silent-ish manual pick ~**8–10 s**; **lockpick gun/machine** ~**3–4 s** but noisier. Notoriously *not* available to Rangers (community pain point for stealth challenges).
- **Spy camera** — pole camera; in DK2 usable **anywhere, not just under doors** (corners too); while paused, marks seen enemies highlighted red for planning.
- **Recon drone** — aerial drone recon for outdoor/compound intel (added alongside NVGs, LMGs, wall charges as DK2's new-toys list).
- **Ballistic shields** (SWAT only) — shield + pistol (later also MP5K) + flashbangs; heavy riot shield variant for Assault/Sapper covers a smaller area but stops **most rounds including AP**, wider FOV; bullets can still leak through/hit legs; **shield-mounted light makes you visible at night**; multiple shield tiers (up to Level IV) rebalanced over patches.
- **Night vision goggles** — enable night ops ("own the night"); NVG sight range was nerfed by **20 m** in a late-2024 balance pass; mounts on helmets (hence Black Ops helmet niche).
- **Armor system:** plate carriers + helmets with 6 parameters — 3 defensive (**coverage %** = chance the hit strikes armor and is fully negated; **piercing-protection level** vs ammo AP level; durability), 2 mobility (move-speed modifier %, agility), 1 concealment. Examples: Ranger SAPI/ESAPI ≈ **40% frontal stop chance**; Level IV "raid" plates = smaller plate = lower coverage than full Level IV; extended Level III = larger coverage, lower rating; high-cut helmet = zero mobility penalty.
- **Ammo types:** AP (defeats armor level ≤ its rating), hollow points (e.g., 147gr JHP — better soft-target damage, worse vs armor), subsonic (stealth, ~8 m audible with suppressed platforms).
- Utility gear competes for limited pouch slots — loadout weight trades against speed.

## 5. Door / Breach Interactions

Doors are first-class tactical objects; each interaction is a waypoint order with distinct noise/speed/lethality:
- **Open quietly** (slow, silent), **kick** (fast, loud, no equipment needed), **peek/stack** (troopers stack both sides of a doorway and slice the pie).
- **Lockpick / lockpick gun** for locked doors (silent vs faster-but-louder).
- **Slap charge** (fast, small blast), **breaching charge** (kills through ~4 m), **wall charge** (make your own door), **breaching shotgun** (doors + gates), **dynamic hammer** (one hit).
- Charges double as weapons: detonation kills/stuns defenders stacked behind the door — timing breach + flashbang + entry on one go-code is the game's signature move.
- Loud breaches (explosives, shotgun, kicks heard nearby) feed the alarm system; lockpicks/quiet opens keep stealth alive.
- **Bullets do NOT penetrate doors or walls in vanilla** (frequently requested; devs said doors won't become penetrable) — a concrete differentiation opportunity for your game.

## 6. Enemy AI, Alarms, Executions

- **Alert triggers:** enemies alarm after ~**2 seconds** of: seeing a trooper, seeing someone die, surviving being shot, or witnessing an explosion's results. Explosions, flashbangs, gunfire, and door/wall breaches are global "loud" events; once the alarm is up, the whole map goes weapons-free, enemies reposition, ambush doorways, and some maps spawn/activate **QRF reinforcements**.
- **Sound model:** nearly everything emits noise with a radius — door opens, suppressed shots, bodies dropping. Community-datamined ranges: most (even suppressed) rifles audible ~**40–60 m**; **MP5SD / subsonic pistols ~8 m**. Enemies hearing something *investigate* rather than instantly alarm. (Quirk: enemies watching a buddy die to suppressed fire sometimes don't alarm — cheesable.)
- **Combat behaviors:** take cover, crouch, **blind-fire from cover while reloading/suppressed** (controversial — see §12), bunker on objectives, and at 1.0 the AI got smarter about **flanking and coordinated maneuvers** instead of the old "lemming rush."
- **Enemy roster (escalating):** Rebel Recruits → Grunt Insurgents → Blackhead Militants → Machinegunners (RPK/PKM suppression) → Rocket (RPG) insurgents → Veteran Insurgents (body armor, grenades) → Sniper Insurgents → **Foreign Advisors** (elite, effectively enemy Rangers) → **Emirs** (HVTs) → Private Security / QRF heavy troops.
- **Fanatics:** **Suicide Bombers** (white robes, charge on sight, detonate in tight spaces) and **True Believers** (AK fighters who self-detonate when badly wounded or when you close distance) — both punish tight stacks and melee-range play.
- **Executioners & hostage kills:** hostage missions can include an Executioner who starts executing when he **sees a trooper, sees a dead body, or a preset timer expires**; a visible countdown (~**30–60 s** scaled to map size) appears above the hostage; timer at zero = mission failed. Noise alone doesn't trigger him — visual evidence does — so the counterplay is suppressed weapons, avoiding corpses in his sightline, wall-charging directly into the hostage room, or a synced simultaneous takedown.
- Civilians/friendly NPCs (hostages, VIPs) exist and can be killed by your explosives/fire — mission-failing or score-tanking.

## 7. Mission Types

- **Clear hostiles** (search & destroy — kill or arrest all).
- **Hostage rescue** (± executioner timer variant "stop the execution").
- **HVT missions** — arrest-and-extract the HVT, or arrest + optional full clear; some allow kill-or-capture.
- **Bomb defusal** — timer on a bomb somewhere in the level; defuse + clear before zero.
- **VIP cover/rescue/escort** and friendly-protection missions.
- **Intel gathering / stealth infiltration** — get in, grab intel/target, ideally **undetected** (stealth is a per-mission challenge/achievement rather than a separate mode).
- Structure: **90+ single missions** (each with 1–3 stars + extra challenges: speed, no injuries, undetected, ironman), **handcrafted campaigns** (mandatory + optional missions), **procedurally generated "Tour of Duty"** mini-campaigns (Northern Belt / Shrine District: survive **7 in-game days**, one generated hit per day — HVT snatches, hostage grabs — with a light management layer), plus a **random mission generator**.

## 8. Line of Sight / Fog of War / Concealment vs Cover

- **Architectural omniscience, actor fog:** you always see the full floor plan (top-down 3D), but interiors/enemies are fogged until a trooper's **vision cone** (hover to view, blue) sweeps them. Troopers only engage inside their cone.
- **Contact uncertainty:** beyond reliable ID range, detected-but-unidentified contacts render as **"?" markers** — you know *something* is there, not what.
- **Spy camera / drone** reveal and (paused) highlight enemies for planning, making intel itself a resource.
- **Darkness model (night ops):** sight ranges collapse at night (red zone = can't see); **light sources locally illuminate** — a trooper standing near a light gets a **red-eye icon** meaning enemies can see *him* even if he can't see them; NVGs restore range (post-nerf, not to daytime levels); shield-light gives your position away. Custom maps even wire lights to fuse boxes.
- **Concealment (social stealth)** is separate from cover: CIA disguise system (poncho/undercover) makes agents read as civilians until weapon-draw; gear carried adds concealment penalties.
- **Cover (ballistic):** low obstacles grant a flat interception chance — community consensus: **any cover stops ~50% of incoming bullets** regardless of cover type; **crouching** behind cover raises protection to near-total and also protects against grenade blasts. Walls are absolute (no penetration). Enemies exploit the same rules (including crouch-blind-fire).

## 9. Shooting Model

- Fully stat-driven, graphed in-UI over **1–50 m** range bands; three headline stats per weapon (modified by optic, suppressor, ammo, trooper level, doctrine):
  - **Aim speed** — time from spotting an enemy to firing (displayed as speed: higher = faster). Optics chiefly buy aim time; CQB optics (M68 red dot) cut both min and max aim time so your man shoots first.
  - **Accuracy** — % where **100 = spread about one target-width (~1 m) at reference range**; 50% doubles spread; 400% quarters it. Accuracy above 100 still matters because it buffers debuffs (moving, suppression).
  - **Crit chance** — per-range chance of instant-kill quality hits; scopes boost it at range.
- Also modeled: **burst/auto fire** with per-burst cooldowns (doctrine choices govern whether troops use full-auto/burst and how well), movement/stance penalties, suppressor tradeoffs, and ammo AP vs armor-coverage rolls (see §4 armor math).
- **Suppression/pinning:** sustained fire suppresses; v1.0 added an explicit **"Pinned" state** that halts movement under heavy fire (LMGs excel at applying it; players grumble it can trigger from a few stray rounds in the open — see §12). Enemies suppressed behind cover blind-fire inaccurately.
- **No wall/door penetration**; explosives are the only through-cover damage.
- Damage is wound-based and swingy: torso hits can be stopped by plates (coverage roll), limb hits wound and degrade, head hits kill — armor makes the difference between "injured, out 4 days" and KIA.

## 10. Map / Level Design Conventions

- **Top-down 3D architectural view** of Middle-East-flavored (fictional "Nowheraki") compounds: walled courtyards, flat-roofed houses, markets, workshops, caves, oil rigs, urban blocks — mixing outdoor approach terrain with dense interiors.
- **Single-plane geometry:** effectively one floor per map (no stairs/multi-story in vanilla — a persistent fan request; modders fake second floors with spawner objects). This keeps the entire tactical problem readable in one screen.
- **Multi-entry philosophy:** every serious map offers several doors, windows, gates, and wall-charge-able surfaces plus 2+ **deployment zones** at the map edge; the "right answer" is usually multi-axis simultaneous entry, and wall charges mean the level designer's walls are only suggestions.
- Interior design leans on **door-and-corner puzzles**: L-shaped rooms, deadly fatal funnels, courtyards covered by machine-gun positions, hostage rooms placed deep so stealth-vs-speed becomes the decision.
- **Editor & modding as content engine:** full in-game mission/level editor (buildings, illumination, enemy placement + behavior scripting, game modes) publishing straight to Steam Workshop; mods can add whole custom squads with their own weapons/gear/appearance. Huge Workshop map ecosystem is a big part of longevity.

## 11. Scoring, Permadeath, Progression

- **Per-mission:** up to **3 stars** (completion + challenge criteria like speed, zero injuries) plus named challenges (Undetected, Ironman, etc.). Stars gate nothing directly but feed campaign totals.
- **Trooper level:** XP per successful mission (none on fail/abort); troopers level up, improving stats; level-ups generate **Doctrine points**.
- **Doctrine tree:** per-unit tree, configured per-squad; deliberately **cannot be maxed** — permanent build choices (e.g., fire-discipline styles, class buffs, extra gear slots).
- **Battle Honors:** premium meta-currency for exclusive gear (AP ammo, elite items) and individual trooper upgrades; earned ~**1 per 7 campaign stars**, from campaign wins, and from Tour-of-Duty random events; roughly 1–2 per campaign (2–4 on Iron Man, which doubles rewards). **Not shared between squads** (grind complaint, §12).
- **Campaign persistence:** injuries persist across the campaign calendar (wounded troopers out for days, usable early at reduced condition); roster is finite (~20), so attrition is strategic.
- **Permadeath tiers:** normal campaigns = KIA sits out until campaign end; optional **Permadeath / No-Restart modifiers**; **Iron Man** = both at once for double rewards.
- v1.0 launch **reset EA veterans' progression** (warned in advance, still stung).

## 12. What Fans Praise & What They Criticize (design opportunities)

**Praised (Steam 95–96% positive, r/doorkickers consensus):**
- The plan→execute→watch-it-work loop; "feel like a tactical genius" moments that are earned, not scripted.
- Believable, unpredictable AI at 1.0 (flanks, repositions) that generates stories.
- Instant restarts + kept plans = frictionless iteration; short missions = "one more go."
- Asymmetric factions that genuinely change playstyle (Rangers loud / CIA sneaky / SWAT horde-with-shields).
- Wall charges and multi-entry freedom; night ops + NVG; 4-player co-op planning; editor/Workshop longevity; fair price.

**Criticized — the pain-point list a new game could attack:**
1. **No vertical space.** Single-floor maps only; stairs/multi-story is the #1 structural request (DK1 had multi-floor).
2. **No ballistic penetration** through doors/walls/thin cover — explosives are the only through-surface play; devs declined to add it.
3. **Progression grind & gating:** Battle Honors trickle (1–2 per campaign), not shared across squads, locking basics like AP ammo behind repetitive Tour-of-Duty replays.
4. **Loadout/plan QoL:** can't save multiple loadout presets per squad (stealth kit vs breach kit); can't store multiple alternative mission plans; co-op doesn't persist plans across restarts at all.
5. **Co-op rough edges:** personal go-codes (A/B) broken for teammates (only shared X/Y work); no plan save; desyncs.
6. **All-or-nothing failure:** no mid-mission checkpoint or partial restart (DK1 let you restart from a point); on big maps a 9-minute plan dies to one RNG round.
7. **Suppression/pinning feel:** v1.0 "Pinned" state can trigger from trivial fire in open ground; enemy **crouch-blind-fire** reads as unfair (they become unshootable behind cover while still landing accurate "blind" shots; your troopers stop engaging them).
8. **Perception gaps:** enemies (and friendlies) don't react to doors opening nearby; suppressed-kill witnesses sometimes don't alarm — stealth logic is cheesable and opaque.
9. **Class balance:** Support and Marksman feel niche vs Assault-spam in CQB-dominated maps; weapons within a class feel stat-samey, unlock excitement is low.
10. **Stealth tooling asymmetry:** Rangers lack lockpicks yet get "Undetected" challenges — tool availability vs challenge design mismatch.
11. **Difficulty on-ramp:** harsh even in tutorials; RNG one-shot deaths punish permadeath campaigns in ways that feel arbitrary to newcomers.
12. **Campaign strategic layer is thin:** Tour of Duty's management layer (7 days, pick-a-hit) is liked but shallow; fans want more meaningful between-mission strategy; 1.0's progression wipe and no replay-video export are lesser gripes.

**Differentiators worth stealing/fixing in a new game:** multi-floor with readable cutaway UI; ballistic wall/door penetration with material model; saveable plan library + loadout presets; deterministic-ish "why did he die" kill cams; suppression with clear UI states; noise-propagation visualization; shared/co-op plan persistence; account-wide progression; optional mid-plan checkpoints.

Sources: [KillHouse — DK2 page](https://inthekillhouse.com/doorkickers2/) · [KillHouse — 1.0 release announcement](https://inthekillhouse.com/door-kickers-2-task-force-north-release-announcement/) · [Wikipedia — DK2](https://en.wikipedia.org/wiki/Door_Kickers_2:_Task_Force_North) · [PCGamesN 1.0 launch](https://www.pcgamesn.com/door-kickers-2/steam-1-0-launch) · [Steam store page](https://store.steampowered.com/app/1239080/Door_Kickers_2_Task_Force_North/) · [Steam guide: Door Kicking 101](https://steamcommunity.com/sharedfiles/filedetails/?id=3426423113) · [Steam guide: Rangers Doctrine (v1.07)](https://steamcommunity.com/sharedfiles/filedetails/?id=3442650842) · [Steam guide: Nowheraki SWAT](https://steamcommunity.com/sharedfiles/filedetails/?id=2796777764) · [Steam guide: Dummy's Guide to the CIA](https://steamcommunity.com/sharedfiles/filedetails/?id=2611806579) · [Steam guide: Weapon Guide v1.12](https://steamcommunity.com/sharedfiles/filedetails/?id=3274961810) · [Steam guide: Map Editor Guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2658647468) · [Fandom wiki: Assault](https://doorkickers.fandom.com/wiki/Assault_(Door_Kickers_2)) · [Fandom: Support](https://doorkickers.fandom.com/wiki/Support) · [Fandom: Grenadier](https://doorkickers.fandom.com/wiki/Grenadier) · [Fandom: Black Ops](https://doorkickers.fandom.com/wiki/Black_Ops) · [Fandom: Undercover](https://doorkickers.fandom.com/wiki/Undercover) · [Fandom: Nowheraki SWAT](https://doorkickers.fandom.com/wiki/Nowheraki_SWAT) · [Fandom: Leader](https://doorkickers.fandom.com/wiki/Leader_(Nowheraki_SWAT)) · [Fandom: Sapper](https://doorkickers.fandom.com/wiki/Sapper) · [Fandom: Breaching Charge](https://doorkickers.fandom.com/wiki/Breaching_Charge) · [Fandom: Flashbang](https://doorkickers.fandom.com/wiki/Flashbang) · [Fandom: Stinger](https://doorkickers.fandom.com/wiki/Stinger) · [Fandom: Spy Camera](https://doorkickers.fandom.com/wiki/Spy_Camera) · [Fandom: Lockpicking](https://doorkickers.fandom.com/wiki/Lockpicking) · [Fandom: Manual breach](https://doorkickers.fandom.com/wiki/Manual_breach) · [Fandom: Go Silent](https://doorkickers.fandom.com/wiki/Go_Silent) · [Fandom: Scenarios](https://doorkickers.fandom.com/wiki/Scenarios) · [Fandom: Campaigns](https://doorkickers.fandom.com/wiki/Campaigns) · [Fandom: Enemies of the Game](https://doorkickers.fandom.com/wiki/Enemies_of_the_Game) · [Fandom: Scopes](https://doorkickers.fandom.com/wiki/Scopes) · [GameRant: Beginner Tips](https://gamerant.com/door-kickers-2-beginner-tips-tricks/) · [GameRant: Battle Honors](https://gamerant.com/door-kickers-2-task-force-north-how-earn-battle-honors/) · [TheGamer: Beginner Tips](https://www.thegamer.com/door-kickers-2-beginner-tips/) · [Slyther Games tips](https://www.slythergames.com/2020/11/05/10-best-door-kickers-2-tips-and-tricks/) · [TV Tropes: Door Kickers](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/DoorKickers) · [NamuWiki: DK2 CIA](https://en.namu.wiki/w/Door%20Kickers%202:%20Task%20Force%20North/CIA) · [NamuWiki: DK2 Missions](https://en.namu.wiki/w/Door%20Kickers%202:%20Task%20Force%20North/%EC%9E%84%EB%AC%B4) · [Thinky Games review](https://thinkygames.com/reviews/door-kickers-2-task-force-north-a-true-tactical-treat/) · [Strategy & Wargaming review](https://strategyandwargaming.com/2021/01/23/door-kickers-2-review-a-classic-in-the-making/) · [Tally-Ho Corner review pt.1](https://tallyhocorner.com/2025/02/door-kickers-2-review-part-1/) · [Tally-Ho Corner pt.2 (campaign)](https://tallyhocorner.com/2025/02/door-kickers-2-review-part-2/) · [Entertainium review](https://entertainium.co/2025/02/24/door-kickers-2-review/) · [Jump Dash Roll review](https://www.jumpdashroll.com/article/door-kickers-2-task-force-north-review/) · [Boiling Steam review](https://boilingsteam.com/door-kickers-2-review/) · [Co-Optimus co-op info](https://www.co-optimus.com/game/7435/pc/door-kickers-2-task-force-north.html) · [Speedrun.com stats guide](https://www.speedrun.com/door_kickers_2__task_force_north/guides/pzwsj) · Steam community discussions: [ammo/stats datamine](https://steamcommunity.com/app/1239080/discussions/0/2972902451440492810/), [weapon stats](https://steamcommunity.com/app/1239080/discussions/0/4768721849824020956/), [accuracy above 100](https://steamcommunity.com/app/1239080/discussions/0/603026099853651442/), [cover mechanics](https://steamcommunity.com/app/1239080/discussions/0/3043859512574465297/), [pinned mechanic](https://steamcommunity.com/app/1239080/discussions/0/3079880700819270254), [blind-fire complaint](https://steamcommunity.com/app/1239080/discussions/0/3725071921948430988/), [executioner AI](https://steamcommunity.com/app/1239080/discussions/0/3785876382862068801/), [stealth mode](https://steamcommunity.com/app/1239080/discussions/0/550107357479187408/), [Battle Honors gating](https://steamcommunity.com/app/1239080/discussions/0/783166243925434333/), [penetration request](https://steamcommunity.com/app/1239080/discussions/0/3812907489631110958/), [helmets](https://steamcommunity.com/app/1239080/discussions/0/3196993949760882132/), [replay files](https://steamcommunity.com/app/1239080/discussions/0/4679778856510550057/), [co-op go-codes](https://steamcommunity.com/app/248610/discussions/0/1489992080508510904/), [multi-floor editor workaround](https://steamcommunity.com/sharedfiles/filedetails/?id=2844518124)

---

# Chapter 2: Direct-Control Top-Down Shooters

*(research agent report, 2026-08-07)*

# Top-Down Shooter Research: WASD+Mouse Combat Design Reference

Focus set: Hotline Miami 1/2, SYNTHETIK, Police Stories, RUINER, Enter the Gungeon, Nuclear Throne, Intravenous 1/2, Darkwood, Teleglitch, Brigador, Running With Rifles (RWR).

---

## 0. Quick Comparison Matrix

| Game | Control scheme | Camera | Projectile model | TTK (player) | LOS occlusion | Sound as mechanic | Dodge/defense |
|---|---|---|---|---|---|---|---|
| Hotline Miami 1/2 | WASD + mouse, body faces cursor | Weighted midpoint player↔cursor + Shift-look extend | Very fast projectiles | 1 hit (both sides) | None (full room visibility; camera is the limiter) | Gunshots aggro nearby enemies | None — die/restart |
| SYNTHETIK | WASD + mouse | Follow w/ slight cursor bias | Fast projectiles, headshot zones | HP+shield+armor pool | None | No | Dash w/ cooldown |
| Police Stories | WASD + mouse, partner orders on RMB | Follow, modest cursor lean | Fast projectiles | 1–2 hits (both sides) | Yes — vision masked to LOS, black outside | Gunshots alert; suppressor item | Armor, flash/smoke, procedure |
| RUINER | WASD + mouse (or twin-stick) | Tight follow | Mixed hitscan-feel + visible projectiles | Health + energy shield | None | No | Dash (chainable ×3, 60% DR during), energy shield dome |
| Enter the Gungeon | WASD + mouse (or twin-stick) | Follow + slight offset toward crosshair | Slow bullet-hell projectiles | Hearts (half-heart hits) | None | No | Dodge roll (i-frames first half of ~0.7 s), blanks, table flips |
| Nuclear Throne | WASD + mouse | Follow + cursor offset | Visible projectiles w/ travel | Small HP pool (~8–10) | None | No | None — pure movement |
| Intravenous 1/2 | WASD + mouse, stance keys, camera-extend key | Follow + player-directed pan toward cursor | Effectively instant (realistic ballistics, wall penetration) | 1–3 hits, realistic | Yes — visibility polygon + light model | Full propagation model: dB-style radii, surfaces, suppressors | Crouch/prone, cover, slow-mo (adrenaline) |
| Darkwood | WASD + mouse, hold-RMB to aim | Follow; vision cone toward cursor | Melee arcs + slow deliberate guns | Low HP, very lethal nights | Yes — hard vision cone; outside cone not rendered | Noise attracts; hearing > seeing at night | Sprint w/ stamina, barricades |
| Teleglitch | WASD + mouse | Per-room zoom, jittery handheld feel | Physical projectiles, scarce ammo | Tiny HP pool | Yes — tall black 3D walls occlude naturally | Gunfire pulls monsters from off-screen | Charged knife lunge, kiting |
| Brigador | Tank-relative (RELATIVE) or twin-stick (ABSOLUTE) hull + independent mouse turret | Isometric follow | Ballistic/energy projectiles, arcs | Directional armor pool | No masking; destructible sightlines | Footstep/engine noise on stealth vehicles | Facing management, speed |
| Running With Rifles | WASD + mouse, big cursor camera-lead | Follow pushed far toward cursor | Ballistic projectiles | 1 bullet (all but rare elites) | Soft — foliage/cover concealment, no hard mask | Gunfire draws AI attention; suppression | Prone/crouch, hard cover, vaulting |

---

## 1. Control Schemes

**Twin-stick vs WASD+mouse.** Every game in this set is WASD+mouse first (except Brigador's optional relative mode). The mouse's absolute pointing is what enables high-lethality design: HM/Police Stories/Intravenous demand pixel-precise first shots that stick aim can't deliver. Gungeon and RUINER support twin-stick with heavy controller aim-assist; NT/HM play far worse on pads. Design rule that falls out: **the faster the TTK, the more the game must be built around mouse precision; HP-pool bullet-hells (Gungeon) tolerate twin-stick.**

**Character facing.** In all WASD+mouse games here, the avatar's facing is slaved to the cursor, decoupled from movement vector — strafing and backpedal-while-shooting are free (Nuclear Throne explicitly designs around this: aiming independent of movement makes strafing the core skill). Exceptions: Brigador (hull facing is keyboard-controlled and matters for armor; turret follows mouse; "E" slowly aligns hull to aim) and Darkwood (facing = the vision cone itself, so "aiming" and "seeing" are the same resource).

**Camera follow vs mouse-lean / camera offset toward cursor.** This is the signature top-down problem: weapon range exceeds screen radius. Solutions observed:
- **Hotline Miami — weighted midpoint + Shift-look.** Camera rests between player and cursor (camera distance and cursor distance tuned separately). Holding **Shift** (LT on pad) pushes the camera hard toward the cursor to scout ahead. Critical detail: cursor position is interpreted **relative to the character, not the screen**, and the shift-look view re-anchors around the cursor. Known failure modes (from community threads): shift-look can push the player fully off-screen, and dragging the cursor across the character can snap the camera disconcertingly. HM2's much larger levels + longer enemy sightlines made shift-look nearly mandatory and exposed the scheme's limits — a cautionary lesson: **camera-extend range must be tuned against enemy engagement range.**
- **Intravenous** — camera pans toward cursor with a dedicated look/camera-extend control, effectively a top-down "shoulder cam"; combined with corner peeking and stance, it's the stealth version of shift-look. Holding aim steadies the weapon (tighter spread) — the top-down analog of ADS without literal zoom.
- **Running With Rifles** — the most aggressive default cursor-lead: camera is pushed generously toward the cursor at all times, because rifles engage at 1.5+ screen lengths. Works because TTK is 1 bullet and information is everything.
- **Nuclear Throne / Enter the Gungeon** — small constant offset toward crosshair (Vlambeer's "camera position between player and cursor" juice rule). Enough to feel responsive, not enough to become a scouting tool.
- **SYNTHETIK / RUINER / Police Stories** — mostly straight follow with mild bias; engagement ranges kept within one screen.
- **Aim-down-sights zoom** — true zoom is rare in top-down. The genre's substitutes are (a) camera-extend keys (HM Shift, IV look key, RWR cursor lead), (b) accuracy-on-hold-aim (Intravenous, Darkwood's RMB raise-weapon which slows you), (c) stance-based accuracy (RWR prone). Brigador zooms the iso camera but it's presentation, not aim. Design takeaway: **treat "ADS" as an information trade (see farther, move slower / narrower awareness) rather than an FOV change.**

**Vehicle/relative controls (Brigador).** Offers RELATIVE (W = hull-forward, A/D rotate) and ABSOLUTE (screen-relative, twin-stick-like) schemes per vehicle class (tank/mech vs anti-grav). The devs justify relative controls because **facing carries mechanics** (directional armor modifiers) — if orientation matters, screen-relative movement erodes player control over it.

**Squad/partner command overlays on the same scheme.** RWR: RMB on ground orders squadmates to a position; double-tap RMB = charge without taking cover; RMB on the map sets far waypoints; squad size scales with XP (1 per 1000 XP, cap 10). Police Stories: hold RMB on a door/point to open a partner-order menu (breach, flashbang-and-clear, move, hold), releasing to confirm — orders and aiming share the mouse without a separate UI mode. Both prove that a single cursor can carry aim + command if orders are context-sensitive on hold/release.

---

## 2. Aiming Models

**Hitscan vs projectiles.**
- *Effectively instant:* Intravenous (realistic ballistics, instantaneous at game scale, with **caliber-based wall penetration**), Police Stories, RWR (ballistic but very fast), Hotline Miami (projectiles so fast they read as hitscan — but throwable weapons arc).
- *Visible fast projectiles:* SYNTHETIK, Nuclear Throne, Teleglitch, Brigador (with per-weapon velocity, arcs, and travel-time lead requirements).
- *Slow, dodgeable projectiles:* Enter the Gungeon — deliberately slow bullets are the fairness mechanism of the whole game; enemy volleys are patterns, not raycasts. Rule: **enemy accuracy should be inversely proportional to player durability.** One-shot games (HM) give enemies near-perfect aim but delayed triggers; HP games (Gungeon) give enemies constant fire but slow bullets.

**Spread / bloom.**
- SYNTHETIK is the genre's most complete model: dynamic crosshair bloom driven by **movement and sustained fire**; a per-weapon **Control** stat governs recoil recovery speed; moving while shooting is punished, creating a stutter-step fire rhythm. Weapons also **jam** and build **heat**, and support attachments + swappable ammo types.
- Nuclear Throne: fixed per-weapon spread arcs (shotgun pellets randomized within a cone); no bloom simulation — spread is a weapon identity, not a state. (Vlambeer-scale note: "no random spread" was considered a feel virtue.)
- RWR: stance + movement + burst-length driven accuracy; firing short bursts and going prone tightens groups substantially.
- Intravenous: recoil accumulation, stance, and attachments (compensators, lasers) modify spread; holding aim steadies.
- Hotline Miami: essentially zero spread for player (some for automatics), instant snap — precision is positioning, not ballistics.

**Recoil.** SYNTHETIK: per-shot crosshair displacement the player must manage (top-down CS-style). Intravenous: climb + settle. Vlambeer-style "recoil" is instead **kickback applied to the player body and camera** (NT physically shoves you backwards per shot — doubles as movement tech) — juice recoil rather than accuracy recoil.

**Headshots in top-down.** SYNTHETIK introduced headshot multipliers to the perspective — precise cursor placement on the enemy sprite's head region yields bonus damage, importing FPS aim skill into 2D. Worth stealing only if projectiles are fast and enemies are large enough.

**Aim cones.** Darkwood replaces the crosshair with the **vision cone**: you can only attack what you can see, and raising your weapon (hold RMB) slows movement and commits your facing. The cone is the aiming model — turning toward a threat un-sees another direction.

**Laser sights.** Intravenous and SYNTHETIK offer laser attachments as literal aim lines (tighter spread / visible pointing line); SYNTHETIK enemies telegraph their own shots with laser lines — a fairness device in a fast game. Police Stories keeps aim readable with short aim-line/flashlight cues.

**Crosshair design.** Minimal dot/cross in HM/NT (spread is irrelevant); dynamic expanding circle in SYNTHETIK (bloom is the information); Gungeon uses a small crosshair plus generous controller magnetism; RWR's cursor doubles as the camera-lead control. Rule: **the crosshair should visualize whatever accuracy state actually exists — and nothing else.**

---

## 3. Movement Feel

- **Hotline Miami:** near-instant acceleration, single fast speed, no sprint, no stamina. Movement is trustworthy and twitch-perfect because death is instant; any inertia would read as unfair. Doors slam open into enemies; movement itself is a weapon.
- **Nuclear Throne:** instant, fast, small collision box; per-shot weapon kickback perturbs position; strafing (aim decoupled from movement) is the core dance. No dodge — the absence forces positional play.
- **Enter the Gungeon:** moderate walk; **dodge roll** (~0.7 s total; damage-immune during first half, vulnerable second half; jumps pits; puts out fires) — explicitly Dark Souls + Ikaruga inspired, and the second mechanic ever added, before anything else but shooting; every attack pattern in the game was authored against it. Plus flippable tables (instant cover creation) and **blanks** (screen-clear panic button).
- **SYNTHETIK:** dash on cooldown; the accuracy-vs-movement penalty makes the core loop *move → plant → fire → dash out*.
- **RUINER:** sprint + **dash**: hold to enter slow-mo and chain up to 3 dash waypoints (Multidash), 60% damage reduction while dashing, upgradable Dash Strike damage-on-path. Dash is repositioning, defense, and offense in one resource (energy shared with shield).
- **Intravenous:** walk/run/sprint speed tiers + crouch (+prone in IV2); **speed = noise**, so movement rate is a stealth dial, not just a travel dial; corner peeks; adrenaline slow-mo for gunfight bursts.
- **Darkwood:** deliberate, weighty; sprint on stamina; hold-to-aim slows you; movement decisions are lighting decisions (your cone comes with you).
- **Teleglitch:** cramped corridors, slight momentum, per-room camera zoom and a nervous shaky camera; charged melee lunge as ammo-free option.
- **Brigador:** vehicle mass, acceleration curves, turn rates; mechs strafe, tanks don't; movement is loadout.
- **RWR:** sprint, crouch, **prone** (most accurate, hardest to hit, slow to turn — the classic trade), vaulting low walls; low walls that force standing to fire are noted by players as death traps (head exposed). Walk-vs-run noise matters in its stealth-adjacent moments; Intravenous and Darkwood make it a first-class mechanic.

**Acceleration philosophy:** the whole genre uses near-instant acceleration (≤ ~3 frames to full speed) for the player; inertia appears only where it *is* the fantasy (Brigador's vehicles). Enemies, not physics, provide the difficulty.

---

## 4. Line-of-Sight Rendering

**Techniques (implementation-level):**
- **Visibility polygon via ray casting to segment endpoints** — cast rays at every wall vertex ±ε offset rays to catch edges behind corners, sort hits by angle, triangle-fan the polygon; canonical write-ups: Nicky Case's *Sight & Light* and Red Blob Games' *2D Visibility* (sweep-line algorithm, ports to many languages). This is the standard for smooth polygon-wall games (Intravenous, Police Stories, Monaco-style reveals).
- **Recursive shadowcasting on grids** — RogueBasin FOV family; right fit for tile-based games.
- **Teleglitch's trick:** no visibility math at all — walls are **tall black 3D prisms** viewed top-down; perspective projection makes them naturally occlude everything behind them, and the occlusion shifts parallax-style as you move. Cheap, atmospheric, and gives walls physical presence.
- **Darkwood:** hard **directional cone** toward the cursor (wider by day, narrow at night) + light sources; everything outside the cone is not merely darkened — enemies/objects outside it are **not rendered** (world visuals bleed to noise/darkness), so audio becomes the rear-facing sense. Turning to check a sound un-sees what you were watching: the renderer *is* the horror mechanic.
- **Intravenous:** visibility polygon combined with a **light model** — player visibility to AI depends on illumination (light meter on HUD), shadows are hiding places, lights are shootable; night vision goggles trade visibility for a look.
- **Police Stories:** LOS-masked view (unseen interior space is black), which makes the **borescope** (peek under doors) and slow door-cracking meaningful equipment.
- **No occlusion at all:** HM (you see whole floors — the game is a readable puzzle board; the *camera*, via shift-look, is the information limit), NT, Gungeon, SYNTHETIK, RUINER (arena games: information hiding would only add unfairness at their speed), Brigador (instead: destructible buildings physically remove sightline blockers).

**Design rule extracted:** LOS masking belongs to games where **information is the resource** (stealth/tactics: IV, Police Stories, Darkwood, Teleglitch); arena/action games deliberately keep full visibility and put the challenge in execution. Hybrid: HM shows everything but only within a camera you must actively steer.

---

## 5. Time-to-Kill Philosophy

**One-shot-kill camp (HM, Police Stories, RWR, near-1 Teleglitch/Intravenous):**
- Hotline Miami: every weapon kills in one hit, both directions. Consequences: play becomes **plan → execute → fail → instant restart** (restart is frame-instant, penalty is time only; floors are short by design). The game becomes a spatial puzzle with an execution test; mastery is route-building. Instant restart is *not optional* — it's the mechanism that converts unfair-feeling deaths into iteration.
- Police Stories: 1–2 shots kill you; no regen; this is what makes *procedure* (announce, borescope, breach angles, flashbang first) genuinely optimal instead of role-play.
- RWR: one bullet kills everyone but rare elites — cover, prone, and burst discipline emerge organically from that single number; player deaths are cheap (respawn as another soldier), which is its version of HM's instant restart.
- Behavioral effect (consistent across all): high lethality shifts skill expression from *reaction* to *anticipation* — corner discipline, pre-aiming, door control, pattern memory; it also makes stealth/cover mechanics self-enforcing.
- Every one-shot game pairs lethality with a **cheap failure loop** (instant restart, fast respawn, generous checkpoints in Police Stories). Lethality without cheap failure = quit.

**HP-pool camp (Gungeon, NT, SYNTHETIK, RUINER, Brigador, Darkwood):**
- Gungeon: heart containers + i-frame roll + slow bullets → sustained dodging ballet; damage taken is a performance meter (flawless-room rewards).
- NT: tiny HP (start ~8) keeps threat high while allowing 1–2 mistakes; healing via level-up choice.
- SYNTHETIK: layered shield/armor/HP + plates; supports longer firefights where weapon-handling skill (reload timing, heat, recoil) is the test.
- RUINER: health + rechargeable energy pool feeding shield and dash — durability is an *active resource you spend*, not passive padding.
- Brigador: directional armor — durability depends on facing, merging TTK with the control scheme.
- Rule: **TTK determines what the player practices.** One-shot → routes and information; HP pool → sustained mechanical execution (dodging, recoil control, resource juggling).

---

## 6. Enemy Reaction Times & Fairness in High-Lethality Games

- **Hotline Miami:** enemies aim near-perfectly but fire after a short **reaction delay** — that delay window *is* the player's entire offensive budget; you win by acting inside enemy reaction time. Dennaton's own AI blog: essentially **one enemy behavior with variations** (random-walkers — always gun-armed, unpredictable, may change rooms — and patrollers that turn left at obstacles), and NPC states of Idle / Inspect / Attack / Knocked Down / Looking-for-Weapon / Dead. Crucial fairness stance from Dennis Wedin: enemies deliberately **don't** react to distant gunshots/bodies "because they would destroy the puzzles in the room" — AI realism was sacrificed to preserve solvability. Randomized micro-behavior injects variance so routes never replay identically.
- **HM2's cautionary tale:** larger open maps + window sightlines + enemies shooting from off-screen broke the HM1 fairness contract (community consensus + shift-look complaints). Lesson: **in a one-shot game, no enemy may kill the player from outside obtainable information.** Enemy range must be ≤ player's best camera reach.
- **Police Stories:** suspects have randomized aggression/compliance rolls — some drop weapons on the shout, some feign surrender and pick a gun back up, some fire instantly; enemy placement is partially randomized between attempts (anti-memorization, forces procedure). Fairness levers: entering with weapon trained beats their draw; flashbang/taser stuns are guaranteed reaction-time wins; the borescope converts unknowns to knowns before commitment.
- **Intravenous:** graduated awareness (suspicion → search → alert) with **visible awareness indicators** and difficulty-scaled reaction/perception — fairness through telegraphed escalation rather than delay.
- **SYNTHETIK:** enemy laser aim-lines and wind-up telegraphs replace reaction delay as the fairness device.
- **Gungeon:** enemy "reaction time" is irrelevant — slow projectiles mean every threat is dodgeable after the fact.
- General model: fairness in high-lethality top-downs = **(player information ≥ enemy lethal range) + (enemy commitment telegraphs) + (cheap retry)**. Pick at least two.

---

## 7. Sound Propagation as a Mechanic

- **Intravenous (genre best-in-class):** every action has a noise radius — footsteps scale with speed/stance/surface, gunshots are rated realistically loud, **suppressors reduce but never eliminate** (a suppressed 9mm still draws investigation of the shot's origin area); walls dampen propagation (community debate over how much exterior walls should muffle); throwable objects create deliberate distractions; the player's own emitted noise is shown on a HUD meter next to the light meter — noise is a first-class visible resource. AI investigates last-heard-position, not player position.
- **Hotline Miami:** guns alert enemies within a radius (crowds converge — sometimes desirable as a funnel-trap tactic), melee and thrown weapons are silent; the loud/quiet economy is the game's main tactical choice despite the simple AI (which intentionally ignores far-away shots per the dev quote above).
- **Police Stories:** gunfire alerts the map; suppressor equipment exists; shouting is *deliberate* noise — the compliance shout announces you.
- **Teleglitch:** firing draws monsters from adjacent areas — ammo scarcity + noise-aggro makes the silent knife the economy weapon.
- **Darkwood:** noise attracts; at night hearing substitutes for the vision you don't have — audio is the 360° sense the cone denies you.
- **RWR:** MG fire draws attention and suppresses.
- **Not a mechanic in:** NT, Gungeon, SYNTHETIK, RUINER (always-alert arena combat).
- Pattern: **sound mechanics only pay off where LOS is restricted** — noise is information the *enemy* gets; it only matters if the player is also information-limited.

---

## 8. Juice / Game-Feel

Canonical source: Jan Willem Nijman's (Vlambeer) *The Art of Screenshake* talk — the incremental checklist that turned a bland shooter demo into Nuclear Throne-feel. Techniques, as seen across the set:

- **Screen shake:** NT shakes per shot/explosion (explosions also spawn a dust ring + smoke); direction-aware shake (slightly opposite gunfire) reads as recoil. Gungeon/SYNTHETIK ship intensity sliders. Overdone shake destroys precision aim — HM keeps it minimal because one pixel = one death.
- **Hit pause / sleep frames:** a few frames of freeze on kill/impact (Vlambeer rule); RUINER leans on slow-mo bursts instead; Gungeon micro-pauses on player damage.
- **Muzzle flash + tracers:** big flashes and fat, visible bullets ("bigger bullets, faster bullets" — Vlambeer); SYNTHETIK adds tracers, shell ejection, damage numbers, and a distinct headshot ding as skill feedback.
- **Camera kick / gun kick:** camera nudges opposite fire; NT physically knocks the *player* back per shot (feel + emergent movement tech); camera lerp positioned between player and cursor.
- **Permanence:** corpses, blood decals, shell casings, debris that never despawn — HM's floors-as-scoreboard (the walk-back-through-the-carnage after clearing is a designed emotional beat); NT keeps corpses/casings; Brigador's permanence is **destroyed buildings** — the level itself is the decal.
- **Enemy death spectacle:** Vlambeer's "33% chance enemies explode harmlessly on death"; HM's melee executions and blood spray; SYNTHETIK dismemberment.
- **HM extras:** floating/slowly tilting camera and VHS color grade — juice as *tone* (queasiness), not just impact.
- **Restraint case:** Police Stories keeps juice modest on purpose — heavy shake/hitstop would fight its "calm professional under pressure" fantasy. Juice budget should match the power fantasy, not be maximized.

---

## 9. Police Stories Deep Dive — Realistic Procedure in a Fast Top-Down Shooter

- **Frame:** two-officer entry team (John + AI/co-op partner Rick), SWAT-style raids, top-down, LOS-masked view, 1–2-shot lethality both ways.
- **Compliance loop:** shout command ("get down!") → suspect AI rolls compliance → if refusing: **warning shot near them** or a **melee strike** (a single melee can force instant surrender) → kneeling suspects are **handcuffed** for max points. Escalation ladder is mechanized: shout → warning shot → non-lethal (taser/melee/flash) → lethal, and the scoring pays you to climb it slowly.
- **ROE scoring:** points for lawful neutralizations, arrests, securing evidence and drugs; penalties for shooting unarmed or surrendered suspects, civilian casualties, your or Rick's injuries/death. Mission-end **letter grade** (up to A+) gates progression/equipment — the scoreboard *is* the rules of engagement, making restraint the optimizing strategy rather than flavor.
- **Fairness under randomization:** suspect/civilian placements and behaviors are partially randomized per attempt, so memorization fails and *procedure* (slice the pie, borescope first, control doors) is the only transferable skill. Suspects can feign surrender and re-arm — you're forced to actually cuff, not just move on.
- **Equipment as procedure verbs:** flashbang (room-wide stun → rush and subdue), smoke (concealment), taser (guaranteed non-lethal stun), C4 breach (opens locked doors, stuns room), lockpick (silent entry, slower than kicking), **borescope** (see under doors before entry), magnum rounds, heavy armor. Community-consensus loadout: C4, smoke, flash, heavy armor, magnum, taser, borescope.
- **Partner as a system:** hold-RMB on a door to queue Rick's orders (breach-and-clear, flashbang-then-enter, hold, move) — one-mouse command grammar; Rick carries extra equipment; his safety is scored, so he's a liability you must protect, not a free asset.
- **Why it works at speed:** the game keeps HM-class responsiveness (instant WASD, cursor aim, fast doors) but redirects the lethality pressure into *information purchase* (borescope, cracked doors, shouts that reveal reactions) and *escalation choices*. It demonstrates that "realistic procedure" is implementable as: score-coded ROE + randomized compliance + non-lethal verbs that are mechanically stronger (stuns beat draws) + partner orders on the aim cursor.

---

## Distilled Design Takeaways

1. **Cursor = aim + camera + command.** The best schemes overload the mouse (HM shift-look, RWR camera-lead, Police Stories hold-RMB orders) instead of adding UI modes.
2. **Camera reach must equal or exceed enemy lethal range** (HM2's core failure).
3. **TTK selects the skill:** 1-shot → planning/information games with instant retry; HP pools → execution games with dodges and resource juggling.
4. **Fairness stack for lethal games:** telegraphs (delays/lasers/wind-ups) + visible awareness states + information tools + frictionless restart.
5. **LOS masking and sound propagation come as a pair** — implement both (visibility polygon + noise radii/suppressors) or neither.
6. **ADS in top-down = information trade,** not zoom: see farther / aim tighter in exchange for speed or peripheral awareness.
7. **Juice budget follows fantasy:** Vlambeer-max for arcade carnage, restrained for tactical professionalism.
8. **Make virtue the high score** (Police Stories): if you want restrained player behavior, pay for it in points and give non-lethal verbs a mechanical edge.

## Sources

- [Hotline Miami 2 shift-look discussion](https://steamcommunity.com/app/274170/discussions/0/617330406658577844/) · [Cursor/shift-look problems thread](https://steamcommunity.com/app/274170/discussions/0/618456760262971686/) · [How to play Hotline Miami (Steam guide)](https://steamcommunity.com/sharedfiles/filedetails/?id=2489652039) · [HM2 camera control threads](https://steamcommunity.com/app/274170/discussions/0/617329920710265775/)
- [Dennaton blog: Hotline Miami AI](http://dennaton.blogspot.com/2012/11/hotline-miami-ai.html) · [An analysis of the AI in Hotline Miami (Medium)](https://medium.com/@RodFernandez91/an-analysis-of-hotline-miami-ai-23c37dbcb156) · [Hotline Miami: Critical Analysis (Problem Machine)](https://problemmachine.wordpress.com/2012/11/12/hotline-miami/) · [Enemy Behaviour — Hotline Miami Wiki](https://hotlinemiami.fandom.com/wiki/Enemy_Behaviour)
- [SYNTHETIK: The Basics (wiki)](https://synthetik.fandom.com/wiki/The_Basics) · [The Weapon Systems in Synthetik (IndieDB)](https://www.indiedb.com/news/the-weapon-systems-in-synthetik) · [SYNTHETIK weapon features (official)](https://www.synthetikgame.com/weapons)
- [Police Stories on Steam](https://store.steampowered.com/app/539470/Police_Stories/) · [Police Stories review (GameGrin)](https://www.gamegrin.com/reviews/police-stories-review/) · [Police Stories equipment guide (Riotbits)](https://www.riotbits.com/police-stories-equipment-guide-and-how-to-use-them-28794/) · [Police Stories A+ guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1875019844) · [Big Boss Battle on Police Stories](https://bigbossbattle.com/police-stories/)
- [RUINER weapons & abilities](https://shapes.inc/fandom/ruiner/weapons-and-abilities) · [RUINER abilities guide (Steam)](https://steamcommunity.com/sharedfiles/filedetails/?id=1157839375) · [Game Informer RUINER tips](https://gameinformer.com/b/features/archive/2017/09/26/15-tips-to-help-you-brave-ruiners-madness.aspx)
- [Dodge Roll (Move) — Enter the Gungeon Wiki](https://enterthegungeon.fandom.com/wiki/Dodge_Roll_(Move)) · [Enter the Gungeon (Wikipedia)](https://en.wikipedia.org/wiki/Enter_the_Gungeon)
- [Vlambeer Scale on Vlambeer Games (Design Oriented)](https://designoriented.net/blog/2015/06/11/2015611vlambeer-scale-on-vlambeer-games/) · [JW Nijman — The Art of Screenshake](https://theengineeringofconsciousexperience.com/jan-willem-nijman-vlambeer-the-art-of-screenshake/) · [Explosions in Nuclear Throne (CONTROL500)](https://ctrl500.com/game-design/explosions-in-vlambeers-nuclear-throne/) · [Vlambeer co-founder on better action games (Game Developer)](https://www.gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games)
- [Intravenous: A Love Letter to Tactical Stealth Action (Medium)](https://medium.com/far-from-professional/intravenous-a-love-letter-to-tactical-stealth-action-44de7664bae8) · [Intravenous II review (KonNetwork)](https://thekonnetwork.com/2025/01/10/intravenous-ii-stealth-combat/) · [Intravenous weaponry/gameplay thread](https://steamcommunity.com/app/1486630/discussions/0/598514342850227676/) · [Intravenous suggestions thread (wall dampening)](https://steamcommunity.com/app/1486630/discussions/0/3053988173742352084/)
- [How Darkwood's visibility mechanics create a new kind of horror (Game Developer)](https://www.gamedeveloper.com/design/how-i-darkwood-i-s-visibility-mechanics-create-a-new-kind-of-horror) · [Darkwood and the Horror of the Top-Down View (Medium)](https://medium.com/@spencer2457/darkwood-and-the-horror-of-the-top-down-view-281a4b9c4c9f)
- [Teleglitch (TV Tropes)](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/Teleglitch) · [Teleglitch review (IndieGameReviewer)](https://indiegamereviewer.com/review-teleglitch-a-fast-paced-arcade-style-rogue-like-yes-it-is/) · [Teleglitch (Wikipedia)](https://en.wikipedia.org/wiki/Teleglitch)
- [Brigador Movement Options (wiki)](https://brigador.fandom.com/wiki/Movement_Options) · [Brigador tank controls discussions](https://steamcommunity.com/app/274500/discussions/0/483367798508522683/)
- [RWR Squad control (wiki)](https://runningwithrifles.fandom.com/wiki/Squad_control) · [RWR Manual (wiki)](https://runningwithrifles.fandom.com/wiki/Manual) · [RWR tactical guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1987859595) · [RWR review (WGB)](https://wolfsgamingblog.com/2015/04/14/running-with-rifles-review-rifle-is-love-rifle-is-life/)
- [Sight & Light (Nicky Case)](https://ncase.me/sight-and-light/) · [Red Blob Games: 2D Visibility](https://www.redblobgames.com/articles/visibility/) · [Field of Vision (RogueBasin)](https://www.roguebasin.com/index.php/Field_of_Vision) · [What the Hero Sees (Bob Nystrom)](https://journal.stuffwithstuff.com/2015/09/07/what-the-hero-sees/)

---

# Chapter 3: Real-World Tactical Breaching & CQB Doctrine

*(research agent report, 2026-08-07)*

# Tactical Breaching & CQB Doctrine — Research Brief for SWAT Game Design

Primary doctrine sources: US Army **FM 3-06.11 / ATP 3-06.11** (Combined Arms Operations in Urban Terrain), **Battle Drill 6** ("Enter Building/Clear Room", ARTEP 7-8), USMC **MCWP 3-35.3** (MOUT), **NTOA** (National Tactical Officers Association) SWAT Standards, and police trade publications (Police1, SWAT Magazine, Police and Security News). Cited inline below.

---

## 1. Breach Methods

Four canonical categories — mechanical, ballistic, explosive, thermal — selected by target construction, time available, threat level, and collateral/legal constraints ([Police and Security News](https://policeandsecuritynews.com/2024/01/24/fundamental-breaching-skills-for-swat-officerseugene-nielsen/), [Police1](https://www.police1.com/police-products/tactical/tactical-entry-tools/articles/breaching-which-option-is-best-for-your-team-93B5EuCp5IHv95c1/)).

### Mechanical
- **Tools:** one-/two-man battering ram (~30–50 lb, swung into the lock area), Halligan bar (pry/twist/gap — jammed between door and frame at the lock, then levered), sledgehammer, bolt cutters (padlocks, chain-link, hasps), pry bars, hydraulic/pneumatic spreaders ("rabbit tool" for inward doors), chainsaws.
- **Mechanics:** ram defeats **inward-opening** doors by shattering the jamb/strike plate; Halligan defeats **outward-opening** doors (ram is nearly useless against them — the frame absorbs the blow). Bolt cutters are silent-adjacent, good for stealth phases.
- **Selection:** default method; cheap, always available, no special authorization. Weaknesses: slow against reinforced doors, telegraphs entry after first hit, and the breacher stands *in front of the door* in the fatal funnel while working — highest exposure of any method.
- **Game-relevant failure:** multi-hit rams on reinforced doors = lost surprise; a failed first swing is a classic "compromise" trigger.

### Ballistic (shotgun breach)
- 12-gauge with **frangible breaching rounds** (compressed copper/zinc powder or clay — disintegrates after defeating the target, no overpenetration into the room) ([SWAT Magazine](https://www.swatmag.com/article/knock-knock-ballistic-breaching-with-shotguns/)).
- **Aim points:** lock side — muzzle at contact/near-contact distance (stand-off breaching muzzle attachments vent gas), aimed at a point **between the lock/handle and the frame**, angled ~45° downward and away from occupants to defeat the bolt. **Hinge breach:** 2–3 rounds per hinge, top-to-bottom, when the lock side is reinforced; hinge side is slower (more shots) but works on outward doors.
- **Selection:** fast, one-man, works when the ram fails; standard for wooden residential doors. Loud — instantly announces entry, so it's paired with immediate dynamic flow. Breacher then peels aside or falls to rear of stack (breaching shotgun is not the entry weapon).

### Explosive
- **Charge types:** det-cord strip charges, **strip charges** (e.g., Alford Strip — explosive tamped in water/clay, low fragmentation), **frame charges** (strip segments joined with corners/T-joints around the door perimeter — cuts the whole door out), **water charges / "Breacher's Boot"** (water tamping cushions and spreads force, dramatically lowering overpressure so the stack can stage closer) ([Alford](https://www.explosives.net/products/alford-strip/), [EBAD](https://ebad.com/products/modular-stick-charge-msc/), [JSOM overpressure study](https://jsomonline.org/wp-content/uploads/2024/02/2022456Kamimori.pdf)).
- **Selection:** fortified strongholds, steel doors, barricades, hostage rescue where a guaranteed **single-action instantaneous breach** is required — the door ceases to exist on initiation, which is the fastest possible transition from "closed" to "team inside" ([Police1](https://www.police1.com/police-products/tactical/tactical-entry-tools/articles/the-explosive-option-for-swat-teams-3J8XFPem3BGyXSU9/), [SWAT Magazine](https://www.swatmag.com/article/breach-justifying-explosive-breaching-program/)).
- **Constraints:** requires certified breachers, net-explosive-weight calculations for interior overpressure (occupant and officer safety stand-off distances), legal justification; fragments can be lethal within 5–15 ft. Teams stack on the wall *beside* the charge, never in front.
- Multiple explosive breaches can be initiated **simultaneously** at different entry points ([Police1](https://www.police1.com/police-products/tactical/tactical-entry-tools/articles/the-explosive-option-for-swat-teams-3J8XFPem3BGyXSU9/)).

### Thermal
- Exothermic torch/cutting rig burning through steel (security doors, bars, shipping containers, safes). Very slow, bright, produces smoke/molten slag — a **deliberate-phase** tool only, never dynamic. Niche but real ([Police1 breaching overview](https://www.police1.com/police-products/tactical/tactical-entry-tools/articles/breaching-which-option-is-best-for-your-team-93B5EuCp5IHv95c1/)).

### Selection logic (design table)
| Situation | Preferred breach |
|---|---|
| Standard residential inward door, warrant service | Ram / Halligan |
| Ram failed or metal-clad door, need speed | Shotgun (lock, then hinges) |
| Fortified door, hostage rescue, must be instantaneous | Explosive (strip/frame, water-tamped) |
| Outward door, stealth phase | Halligan gap-and-pry / bolt cutters |
| Steel bars, container, vault | Thermal or exothermic + mechanical follow-up |
| Always | **Primary + backup breacher/method staged**; a failed breach has an immediate alternate plan |

---

## 2. The Entry Stack

Standard element is a **4-man stack** tight against the wall on one or both sides of the door (FM 3-06.11 Ch.3; [Garmont role overview](https://garmonttactical.com/post/what-roles-are-in-a-swat-team-responsibilities-and-tactical-functions.html)):

- **#1 — Point man:** first through; owns the immediate threat and the door decision. In LE stacks often carries a ballistic shield. Never looks back; trusts the stack is behind him.
- **#2 — Cover/backup:** enters immediately behind #1, breaks the **opposite** direction, takes the other near corner. Statistically most exposed to reactive fire.
- **#3 — Breacher (repositions):** stack position varies; moves to the door on the "ready" call, executes the breach (ram/shotgun/charge), then peels aside and re-enters as **last man** or #3. Also commonly the flashbang thrower ("breach-bang-clear": #3 bangs through the opening the instant the door gives).
- **#4 — Rear security:** faces backward/outward covering the hallway and uncleared space behind the stack; last in, holds the door or the hallway. Prevents the team being flanked while committed to a room.
- **Team leader** is typically #2 or #3 — in the fight but positioned to direct; **not** point.
- **Ready signal flow:** rear man initiates a forward **squeeze/tap** ("squeeze up") passed man-to-man to #1 = "everyone behind you is ready." Hand signals are department-specific and deliberately non-public; common set: stop, freeze, advance, enemy spotted, numbers, door, rally ([Police1 hand signs](https://www.police1.com/archive/articles/practical-hand-signs-for-patrol-vX1QNcBOzfH8pFB3/)).
- **Flow rule:** the stack enters as a continuous chain — each man follows the man ahead within arm's reach, no gaps, no hesitation at the threshold. Direction of each man's break is dictated by the man ahead: **#1 goes where the door lets him, #2 goes opposite, #3 opposite #2, #4 opposite #3** (alternating flood), per FM 3-06.11 / [Battle Drill 6](https://www.boisestate.edu/sps-militaryscience/wp-content/uploads/sites/123/2014/04/building-clearroom.pdf).

---

## 3. Room-Clearing Techniques

### Fatal funnel
The doorway/threshold — the point where every defender's gun is naturally oriented and where the entrant is backlit, channelized, and slow. Doctrine: **minimum time in the funnel**; never stop in it; never engage from inside it if avoidable ([FM 3-06.11 Ch.3](https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/ch3.htm)).

### Slicing the pie (threshold evaluation)
Pre-entry technique: operator arcs around the door's apex in small angular increments (working roughly 45°→90°→135°→180°), exposing only muzzle/eye, clearing each slice of the room from *outside* before entering. Clears everything except the two **near corners** (the "hard corners" invisible from the door — these can only be cleared by entering). Used in deliberate/slow clears and by solo/short-handed elements ([UF PRO ITCQB](https://ufpro.com/int/blog/itcqb-one-man-room-clearing-tactics), [Special Tactics](https://www.specialtactics.me/blog/2017/3/5/debate-4-limited-penetration-vs-points-of-domination)).

### Limited penetration vs. deep entry (points of domination)
Two competing schools ([Special Tactics debate](https://www.specialtactics.me/blog/2017/3/5/debate-4-limited-penetration-vs-points-of-domination), [Iron Survival](https://ironsurvival.com/blog/cqb-limited-versus-deep-penetration)):
- **Limited penetration (Israeli/South African lineage):** pie the room from the threshold, enter only a step or two, dominate from near the door, don't commit deep. Safer against unknown depth; weaker if threats hold hard corners.
- **Deep entry / points of domination (US assault lineage, FM 3-06.11):** flood the room; each man runs the walls to a **point of domination** — positions (typically the four corners / spread along entry wall) giving unimpeded, interlocking fields of fire over the whole room. Movement stops **only after** clearing the door and reaching the point; engage on the move. #1 and #2 take/clear the near corners; #3 and #4 button in along the entry wall covering the far room, stopping short of #1/#2 ([FM 3-06.11 Ch.3](https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/ch3.htm)).
- Modern LE practice blends them: pie what you can from outside ("clear from the door what can be cleared from the door"), then commit only for the hard corners.

### Button-hook vs. cross entry
- **Button-hook:** entrant hooks tight around the doorframe into the **near corner** on his own side. Used when the stack is on the same side as his corner or the door swing dictates it.
- **Cross ("criss-cross"):** entrant drives diagonally across the threshold to the **far side**. Faster across the funnel, needs commitment.
- Standard 2-man entry pairs **one hook + one cross** so both near corners are covered within the first second; #1's actual path is dictated by the door (path of least resistance), and each following man goes opposite the man ahead ([FM 3-06.11 Ch.3](https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/ch3.htm)).
- **Priority of scan on entry:** immediate threat in the funnel → your hard corner → your sector sweeping back toward center, overlapping with your partner's sector.

---

## 4. Deliberate Clearing vs. Dynamic Assault

- **Dynamic entry:** speed, surprise, violence of action; knock-announce (or no-knock) → breach → bang → flood. Compresses suspect decision time below reaction threshold. Doctrine now reserves it for **hostage rescue and active shooter** — situations where a life is being lost *right now* ([Police1: dynamic vs deliberate](https://www.police1.com/swat/articles/dynamic-entry-versus-deliberate-entry-s86BB28VVWLfwJXW/), [Blue Sheepdog](https://www.bluesheepdog.com/2016/03/02/speed-surprise-violence-action/)).
- **Deliberate/methodical clear:** slow, angle-by-angle; pie everything, mirror/camera ahead, announce, move only with cover. Used for warrants, barricades, searches — anywhere time favors police. **NTOA has moved away from endorsing dynamic entry** outside hostage/active-shooter contexts (while still endorsing dynamic *movement* once contact forces it) ([Police1](https://www.police1.com/swat/articles/dynamic-entry-versus-deliberate-entry-s86BB28VVWLfwJXW/)).
- **Surround and call-out ("breach and hold"):** the now-dominant warrant model — contain, breach the door (or porch), and call subjects out to the team rather than going in at all; entry only if call-out fails ([FDLE research paper](https://www.fdle.state.fl.us/getContentAsset/473e081c-d3f7-4a88-913d-a9e5c62aca1c/73aabf56-e6e5-4330-95a3-5f2a270a1d2b/Cheshire-Lee-paper.pdf?language=en), [NTOA/LAPD barricade tips](https://www.police1.com/swat/articles/ntoa-14-barricaded-suspect-response-tips-from-lapd-swat-dpAJNiVQQLu3IVYf/)).
- **Design rule:** time works for SWAT when no one is being hurt (slow = safe); time works against SWAT when hostages are dying (fast = necessary). Teams also **shift gears mid-mission**: deliberate movement to the crisis point, dynamic once compromised or on the "execute."

---

## 5. Distraction Devices

### Flashbang / NFDD (noise-flash diversionary device)
- **Effects:** ~170–180 dB report, 6–8 million candela flash, mild overpressure → flash-blindness (seconds), tinnitus/disorientation, startle; disrupts the OODA loop for roughly **3–5 seconds** — exactly the window the team uses to cross the funnel ([Arms Unlimited](https://armsunlimited.com/blog/flashbangs-diversionary-devices-in-law-enforcement/), [OJP](https://www.ojp.gov/ncjrs/virtual-library/abstracts/flashsound-diversionary-devices)).
- **Fuze:** ~1.5–2 second delay. **"Banking"** = standard/safe deployment: look at the deployment area first (legal/moral obligation — no children, no fuel, not on a person), then throw immediately, letting the full delay run on the floor ([Police1 deployment tips](https://www.police1.com/police-products/wmd-equipment/ppe/articles/10-tips-for-flashbang-deployment-UH9FOXvQyyrsOari/), [Police1 safety](https://www.police1.com/officer-safety/articles/6-safety-considerations-for-flashbangs-bBqBroyFbvPiHGnD/)). Typical placement: just inside the threshold, bounced off a wall, or through a port/window.
- **"Cooking"** = holding after spoon release to burn part of the delay so the device detonates near-instantly on arrival (denies a suspect time to flee the blast or throw it back). High-risk, hand-injury-prone, restricted or forbidden by many policies — good as a risk/reward mechanic.
- **Hazards:** fire ignition (they are pyrotechnic), serious burns on contact, repeated same-day exposure limits for throwers; reusable-body vs. one-piece designs.
- Deployment call is often part of the breach cadence: "breach — **bang** — enter."

### CS gas (chemical agent)
- CS is an aerosolized crystalline irritant, not a true gas; delivered by **hot (pyrotechnic) grenades** (fire risk indoors — Waco lesson), **flameless tri-chamber grenades** (built for indoor barricades), ferret rounds (37/40 mm barricade-penetrating projectiles through windows), or cold aerosol ([Defense Technology](https://www.defense-technology.com/product/flameless-tri-chamber-cs-grenade/), [Trauma Clean AZ overview](https://traumacleanaz.com/what-is-cs-gas/)).
- **Doctrine:** not an entry tool — a **denial/extraction** tool. Gas is introduced sector-by-sector to shrink the suspect's usable space and drive him to a call-out, *before* any entry. Onset: seconds; effects: blepharospasm (involuntary eye closure), burning airways, disorientation. Determined/drugged suspects can fight through it. Team enters masked (comms and vision penalty — a real gameplay tradeoff).

### Sting-ball / blast ball
- Rubber-bodied grenade: blast + rubber pellets in all directions, sometimes with CS/OC payload; pain compliance over an area without (intended) lethality. Used in cells, riots, and rooms where a flashbang's fire risk or a suspect rush is expected ([Wikipedia: blast ball](https://en.wikipedia.org/wiki/Blast_ball), [Combat Operators](https://combatoperators.com/weapons/grenades/riot-control/)).

---

## 6. Door Mechanics

- **Inward-opening** (hinges hidden, residential front doors): ram/hydraulic spreader; the door itself briefly masks part of the room as it swings — #1 must clear behind the door. **Outward-opening** (hinges visible, commercial/storm doors): pry with Halligan or attack hinges; the open door creates cover/obstruction in the hallway. Doctrine requires the breacher to identify swing direction *before* selecting the tool (hinge visibility = outward) ([Police and Security News](https://policeandsecuritynews.com/2024/01/24/fundamental-breaching-skills-for-swat-officerseugene-nielsen/)).
- **Recon before touch:** under-door cameras and flexible **pole cameras** inspect the room from beneath the door or through gaps — revealing occupants, barricades, booby traps, and letting the team pick a breach plan rather than discovering the problem mid-breach; inspection mirrors on poles do the same for corners/stairwells at lower cost ([Police1 pole cameras](https://www.police1.com/police-products/technology/pole-cameras/articles/next-gen-pole-cameras-bring-new-attributes-to-police-and-tactical-teams-6nijnLczlE7vj6FO/), [Zistos](https://zistos.com/tactical/), [Blue Sheepdog](https://www.bluesheepdog.com/2011/10/19/tactical-pole-camera/)).
- **Door control/denial:** wedges (rubber/steel door stops) jammed under uncleared doors **lock off rooms** the team is bypassing, converting a multi-door hallway into a single manageable problem; suspects use the same wedges/barricades against the team (a wedged inward door defeats a ram and forces a new breach plan). Teams also "foam" or hold doors with rear security instead of clearing everything.
- **Never cross an uncleared open door**; doors left open behind the team are re-checked or held. A closed door is a "threshold decision": open-and-hold, pie, or breach.

---

## 7. Communications & Synchronization

- **Layers:** hand signals (stealth phase, stack) → whispered/bone-mic radio → verbal room calls (post-breach: "Clear!", "Clear left/right!", "Coming out!", "Man down!", "Gun!", "Hands!"). Signals are agency-specific and intentionally unpublished; the standard inventory covers stop/freeze, advance, numbers, door/window, suspect seen, rally ([Police1](https://www.police1.com/archive/articles/practical-hand-signs-for-patrol-vX1QNcBOzfH8pFB3/), [Recoil Offgrid infographic](https://www.offgridweb.com/preparation/infographic-close-combat-hand-signals/)).
- **Go-code cadence:** once elements report set ("Alpha set… Bravo set"), control passes to one voice — team leader or breacher: **"I have control… stand by… 5, 4, 3, 2, 1 — EXECUTE, EXECUTE, EXECUTE."** Initiation happens **on the first "execute"** (or on a designated count number) so every element moves on the same syllable. Explosive breaches may omit the audible countdown when it would compromise the team; readiness is then passed by physical signal to the entry team leader, who directs the breacher to initiate ([Police1 explosive option](https://www.police1.com/police-products/tactical/tactical-entry-tools/articles/the-explosive-option-for-swat-teams-3J8XFPem3BGyXSU9/)).
- **Simultaneous multi-point breach:** two-plus stacks at separate entries breach on the same execute (including multiple simultaneous explosive breaches), splitting defender attention and collapsing the structure from both ends; requires strict **limits of advance** / no-cross lines so converging teams don't shoot each other — each element owns defined rooms/sectors, link-up points are pre-briefed.
- Compromise authority: any member who is burned (spotted) can call the compromise ("Compromise, compromise — hit it!"), converting stealth to dynamic instantly.

---

## 8. Inside the Room: Threats, Muzzles, Shoot/No-Shoot

- **Threat prioritization:** (1) immediate armed threat in your sector / nearest the funnel, (2) your assigned hard corner, (3) sector sweep to center overlapping your partner, (4) secondary scans — hands, waistbands, hidden spaces (behind furniture, closets), other doors. **Proximity + weapon + intent** ranks targets; a gun-in-hand near the team beats a distant threat. Each man engages **only targets in his sector** — trusting teammates to own theirs is the core discipline of the flood (FM 3-06.11; [The Armory Life](https://www.thearmorylife.com/proper-room-clearing-tactics/)).
- **Muzzle discipline:** high-ready/low-ready/temple-index conventions so muzzles never cover teammates; when a teammate crosses your line, you **dip or raise the muzzle** and re-cover your sector when he's past. The classic violations: #2 sweeping #1's head crossing the threshold, #3 sweeping legs of the men ahead ([milsim CQB TTP text](https://dokumen.pub/from-insertion-to-extraction-advanced-milsim-cqb-tactics-techniques-and-procedures-1nbsped.html), [Tactical Training Center](https://tacticaltrainingcenternj.com/firearms-training/muzzle-discipline/)).
- **Shoot/no-shoot:** LE CQB is a discrimination problem, not a shooting problem — rooms contain hostages, bystanders, children, and suspects who surrender. Decision keys on **hands** ("hands kill"), visible weapon, and compliance with commands ("Police! Hands! Get down!"); target ID must beat trigger press even inside the 3–5 second bang window. Non-compliant but unarmed = less-lethal/hands-on, not gunfire. This is the single richest mechanic for a SWAT game (score realistic penalties for bad shoots; reward verbal domination and less-lethal resolution — the model *SWAT 4 / Ready or Not* correctly inherit from NTOA-style policy).
- **Post-clear priorities of work:** dominate → announce "Clear" → handcuff/search ("secure"), 360 coverage, count personnel, mark cleared room, evacuate hostages, report to command, then re-stack for the next room.

---

## 9. Common Failure Modes (design these as player mistakes)

1. **Stalling in the fatal funnel** — hesitating or engaging from the doorway; the defender's fire is pre-registered there ([Task Force Reaper MOUT notes](https://taskforcereaper.weebly.com/basic-mout-procedures.html)).
2. **Crossing lines of fire / muzzle flashing teammates** — over-rotating a sector into a teammate's space, sweeping men while crossing the threshold; cause of most blue-on-blue in CQB.
3. **Stack gap / broken flow** — #2 hesitates, #1 is alone in the room with all corners uncleared.
4. **Failing the hard corner** — running to depth without clearing the near corner; the threat behind you owns the room.
5. **Failed breach with no backup plan** — ram bounces, team stands compressed at a known point with surprise gone; doctrine mandates a staged secondary breacher/method.
6. **Bypassing uncleared space without holding it** — an unwedged, unwatched door behind the team = flank.
7. **Flashbang errors** — banging blind into a room with a child/fuel, cook-off injuries, throw-backs on un-cooked bangs, fires.
8. **Converging-team fratricide** on multi-entry hits without limits of advance.
9. **Over-reliance on speed** — dynamic entry against a prepared, barricaded shooter simply feeds officers into a prepared kill zone; the doctrinal answer was to slow down, contain, and call out ([Police1 dynamic vs deliberate](https://www.police1.com/swat/articles/dynamic-entry-versus-deliberate-entry-s86BB28VVWLfwJXW/), [SWAT Magazine "CQB: You're Doing It Wrong"](https://www.swatmag.com/article/close-quarters-battle-youre-doing-it-wrong/)).
10. **Tunnel vision / target fixation** — whole team locks on one suspect while a second threat or a hostage-taker acts unobserved.
11. **Announcement/legality failures** — wrong-address hits and knock-announce violations are the real-world catastrophic failure class (usable as mission-score consequences).

---

## Sources
- [FM 3-06.11 Chapter 3 — Urban Combat Skills (GlobalSecurity mirror)](https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/ch3.htm)
- [ATP 3-06.11 Brigade Combat Team Urban Operations (2024, Army training PDF)](https://rdl.train.army.mil/catalog-ws/view/100.ATSC/0B25D897-7E1C-4D09-A2C5-E50BE2A25378-1729554858673/ATP3_06x11.pdf)
- [Battle Drill 5/6 Enter Building/Clear Room (Boise State MS PDF)](https://www.boisestate.edu/sps-militaryscience/wp-content/uploads/sites/123/2014/04/building-clearroom.pdf) · [MWI on Battle Drill 6](https://mwi.westpoint.edu/enter-and-clear-a-room-the-history-of-battle-drill-6-and-why-the-army-needs-more-tactical-training-like-it-not-less/)
- [Police and Security News — Fundamental Breaching Skills for SWAT](https://policeandsecuritynews.com/2024/01/24/fundamental-breaching-skills-for-swat-officerseugene-nielsen/)
- [Police1 — Which breaching option is best](https://www.police1.com/police-products/tactical/tactical-entry-tools/articles/breaching-which-option-is-best-for-your-team-93B5EuCp5IHv95c1/) · [The explosive option for SWAT teams](https://www.police1.com/police-products/tactical/tactical-entry-tools/articles/the-explosive-option-for-swat-teams-3J8XFPem3BGyXSU9/) · [Dynamic vs deliberate entry](https://www.police1.com/swat/articles/dynamic-entry-versus-deliberate-entry-s86BB28VVWLfwJXW/) · [NTOA/LAPD barricade tips](https://www.police1.com/swat/articles/ntoa-14-barricaded-suspect-response-tips-from-lapd-swat-dpAJNiVQQLu3IVYf/) · [10 flashbang deployment tips](https://www.police1.com/police-products/wmd-equipment/ppe/articles/10-tips-for-flashbang-deployment-UH9FOXvQyyrsOari/) · [6 flashbang safety considerations](https://www.police1.com/officer-safety/articles/6-safety-considerations-for-flashbangs-bBqBroyFbvPiHGnD/) · [Pole cameras](https://www.police1.com/police-products/technology/pole-cameras/articles/next-gen-pole-cameras-bring-new-attributes-to-police-and-tactical-teams-6nijnLczlE7vj6FO/) · [Hand signs](https://www.police1.com/archive/articles/practical-hand-signs-for-patrol-vX1QNcBOzfH8pFB3/)
- [SWAT Magazine — Ballistic breaching](https://www.swatmag.com/article/knock-knock-ballistic-breaching-with-shotguns/) · [Justifying an explosive breaching program](https://www.swatmag.com/article/breach-justifying-explosive-breaching-program/) · [Flashbang training](https://www.swatmag.com/article/get-the-most-flashbang-for-your-buck-training-with-distraction-devices/) · [CQB: You're Doing It Wrong](https://www.swatmag.com/article/close-quarters-battle-youre-doing-it-wrong/)
- [Blue Sheepdog — Speed, Surprise, Violence of Action](https://www.bluesheepdog.com/2016/03/02/speed-surprise-violence-action/) · [Tactical pole camera ops](https://www.bluesheepdog.com/2011/10/19/tactical-pole-camera/)
- [FDLE — Dynamic Entry vs Surround and Call-Out (research paper)](https://www.fdle.state.fl.us/getContentAsset/473e081c-d3f7-4a88-913d-a9e5c62aca1c/73aabf56-e6e5-4330-95a3-5f2a270a1d2b/Cheshire-Lee-paper.pdf?language=en)
- [Special Tactics — Limited Penetration vs Points of Domination](https://www.specialtactics.me/blog/2017/3/5/debate-4-limited-penetration-vs-points-of-domination) · [Iron Survival](https://ironsurvival.com/blog/cqb-limited-versus-deep-penetration) · [UF PRO one-man clearing](https://ufpro.com/int/blog/itcqb-one-man-room-clearing-tactics)
- [Alford Strip charge](https://www.explosives.net/products/alford-strip/) · [Breacher's Boot water charge](https://www.explosives.net/products/breachers-boot/) · [EBAD Modular Stick Charge](https://ebad.com/products/modular-stick-charge-msc/) · [JSOM breacher overpressure/tamping study](https://jsomonline.org/wp-content/uploads/2024/02/2022456Kamimori.pdf)
- [OJP — Flash/Sound Diversionary Devices](https://www.ojp.gov/ncjrs/virtual-library/abstracts/flashsound-diversionary-devices) · [Arms Unlimited flashbang overview](https://armsunlimited.com/blog/flashbangs-diversionary-devices-in-law-enforcement/)
- [Defense Technology Flameless Tri-Chamber CS](https://www.defense-technology.com/product/flameless-tri-chamber-cs-grenade/) · [Blast ball / sting-ball](https://en.wikipedia.org/wiki/Blast_ball) · [Riot control grenades](https://combatoperators.com/weapons/grenades/riot-control/)
- [Zistos tactical cameras](https://zistos.com/tactical/) · [Garmont SWAT roles](https://garmonttactical.com/post/what-roles-are-in-a-swat-team-responsibilities-and-tactical-functions.html) · [The Armory Life — room clearing](https://www.thearmorylife.com/proper-room-clearing-tactics/) · [Recoil Offgrid hand signals](https://www.offgridweb.com/preparation/infographic-close-combat-hand-signals/) · [Task Force Reaper MOUT notes](https://taskforcereaper.weebly.com/basic-mout-procedures.html)

---

# Chapter 4: SWAT & Hostage-Rescue Games + HRT Doctrine

*(research agent report, 2026-08-07)*

# SWAT / Hostage-Rescue Game Research Dossier
Research compiled 2026-08-07 from web sources + game documentation. Games covered: SWAT 3 (1999), SWAT 4 (2005) + SEF mod, Ready or Not (RoN, 1.0 2023), Rainbow Six 1/Rogue Spear/Raven Shield (1998–2003), Zero Hour, Due Process. Plus real hostage-rescue doctrine.

---

## 1. Rules of Engagement (ROE) Systems

**SWAT 4 — the genre's canonical ROE model**
- Force is *authorized* only against an imminent threat: a suspect aiming/firing a weapon at someone. A suspect merely *holding* a gun (not aimed) is not a lawful target.
- Breaking ROE yields typed penalties: **"Unauthorized Use of Force"** (suspect incapacitated) vs **"Unauthorized Use of Deadly Force"** (suspect killed). Shooting fleeing or compliant suspects triggers these. The Stetchkov expansion extended this to abuse of taser/pepper spray/melee on already-compliant subjects.
- Mission score is out of **100**: completing objectives = 40 pts; all officers survive +10; player uninjured +5; all civilians unharmed +5; all suspects arrested (not shot) +5; weapons/evidence secured +5; timely TOC reports +5 (pro-rated by opportunities used). Penalties subtract per incident (ROE violations, hostage incapacitated/killed, officer down, failing to report a downed officer).
- Difficulty = required score threshold to advance, topping out at **95/100 on Elite** — at that level ROE perfection and arrest-heavy play are effectively mandatory. Brilliant design economy: difficulty isn't tougher enemies, it's *stricter professionalism*.
- **SEF (SWAT: Elite Force) mod**: tougher penalties, removes exploit-free kills via the sniper viewport, corrects ballistics, and randomizes appearances so you can't visually memorize who is a threat — ROE judgment becomes perceptual, not memorized.

**Ready or Not**
- Letter ranks F→S. **S-rank requires**: all hard objectives, all hidden *soft objectives*, every suspect **arrested** (including ones actively shooting at you and ones faking surrender/death), zero deaths of anyone (suspects, civilians, officers), and every person/body reported to TOC. Margins between ranks are tight.
- Killing even a legally-justified suspect costs score toward S, which forces less-lethal loadouts for rating runs.
- Community friction: "arrest-everyone" vs terrorist cells feels absurd; **"Relaxed ROE" scoring mods** are popular on Nexus — a signal that a single universal ROE across mission fictions (nightclub massacre vs barricaded DV suspect) reads as unfair. Design takeaway: *ROE strictness should flex with the scenario's fiction*.

---

## 2. Compliance Mechanics

**Core loop (all games)**: shout → hidden morale check → comply / flee / feint / fight → zip-cuff → report → move on. The arrest is the genre's "kill confirm."

- **SWAT 3 (1999)**: first full implementation. Compliance shout ("Put your hands up!") on a dedicated key; suspects and civilians surrender based on hidden morale influenced by intimidation — officers aiming, flashbang/CS exposure, being wounded, being outnumbered. Commands issued to ELEMENT or RED/BLUE two-man teams via a context-sensitive crosshair command tree.
- **SWAT 4**: yell for compliance; probability influenced by suspect archetype/morale, active stun effects (flash, gas, sting, taser), wounds, and proximity of aimed officers. Compliant subjects must be **zip-cuffed** (civilians too — a memorable, transgressive-feeling rule) and each arrest/downed person **radioed to TOC** for score. Uncuffed "compliant" suspects can re-arm if you walk away; some civilians panic and refuse repeated shouts, requiring pepper spray to "unlock" compliance.
- **Ready or Not** (documented on the wiki): each suspect/civilian spawns with a **random morale value 0–1.5** set by archetype. Each compliance yell runs a check against morale; on failure suspects may **feint surrender, attack, or flee**; civilians stand their ground. Morale is *lowered* by shock: battering ram, C2 breach, stun grenades — so violent entry mechanically produces surrenders. The **Negotiator officer trait grants up to +60% surrender chance** on yells. States: compliant (hands up) → secured (zip-tied). TOC reporting of all persons/bodies is scored.
- **Zero Hour**: positional compliance — a suspect **outnumbered from behind always surrenders**; one-on-one it depends on the suspect's fear level. Cheap to implement, very readable.
- Design takeaway: morale as a hidden but *influenceable* stat (stims, numbers, surprise, traits) makes non-lethal play a system to master rather than a dice roll; feint-surrender keeps cuffing tense.

---

## 3. Non-Lethal Arsenal & Balance

| Tool | Behavior | Balance note |
|---|---|---|
| Taser (SWAT 4, Stetchkov Cobra 2-shot, RoN) | Instant full incapacitation, single target | Gated by range, 1–2 shots, slow reload; SEF adds drugged suspects who shrug off pain compliance |
| Beanbag shotgun | Knockdown + big morale hit, 1 hit usually forces compliance | **The dominant LTL** in both SWAT 4 and RoN; inaccurate, and lethal at point-blank/headshot range (both games model beanbag kills — an ROE trap) |
| Pepperball launcher | High capacity, ranged, needs 3–4 hits to build an irritant cloud | Widely called underpowered in RoN; niche = safe standoff harassment |
| Pepper spray | Melee-range compliance breaker | Mainly for stubborn *civilians*; abuse of it on compliant people is penalized (Stetchkov/SEF) |
| Area LTL: flashbang, CS gas, sting grenade, 40mm launcher rounds | Temporary stun + morale debuff window | The real workhorse: stun-then-yell is the meta arrest combo |

**Balance problem identified by both communities**: if any one LTL reliably hard-stops a suspect (beanbag), it becomes a straight gun-replacement and crowds out the rest of the kit; players run beanbag-only S-rank runs. Levers used: lethality-at-close-range risk, ammo scarcity, reload time, per-archetype resistance (drugged/armored/fanatic suspects resisting pain compliance), and accuracy penalties.

---

## 4. Hostage & Civilian AI, and Manufactured Urgency

- **SWAT 4**: civilians cower, scream, panic, and *wander* — mobile score liabilities who walk into crossfire. Certain missions script hostage executions if suspects are alerted and given time (e.g., Fairfax Residence). SEF adds a personality axis: **"insane" suspects will shoot hostages without hesitation; "polite" ones deprioritize it** — threat triage becomes per-suspect.
- **Ready or Not**: civilians flee/hide; suspects **take human shields**; on Neon Tomb some civilians wear **improvised bomb vests** — not defusable, must be arrested normally, shooting near the vest risks detonation (and vests sometimes fail, being crude — a nice fiction-driven mercy roll). Suspects left unmanaged may execute civilians.
- **Rainbow Six (1998 era)**: terrorists execute hostages when alerted/alarms raised; **any hostage death = mission failure** in rescue missions. Urgency came from stealth-vs-clock pressure, and it was brutal.
- **Zero Hour**: suspects grab hostages as shields; flash-stun before they act.
- Urgency techniques observed (few games use literal visible countdowns): alert/alarm escalation states, audio telegraphs (screaming, a single gunshot from an uncleared wing), probabilistic executions that accelerate with noise, human-shield standoffs, and hard fail states on hostage death. Tension = the *threat* of a timer, not a HUD timer.

---

## 5. Mission Structure — "Bring Order to Chaos"

- **SWAT 4's universal implicit objective set**: rescue all civilians, arrest or neutralize all suspects, report everything to TOC — plus per-mission specifics (arrest a named HVT, rescue named hostages, disarm bombs, secure evidence/weapons). Mission ends only when *every* person on the map is accounted for and secured. The map itself is the objective list.
- **RoN**: hard objectives (rescue X, defuse bombs, arrest HVT, locate evidence) + hidden **soft objectives** (report all bodies/civilians/suspects, arrest-all) that gate S-rank. Scenario archetypes: barricaded suspects, raid, active shooter, bomb threat, hostage rescue.
- **Rainbow Six**: 17-mission campaigns mixing hostage rescue, recon, infiltration, defusal; binary fail conditions.
- **Due Process**: attack/defend bomb objective in **procedurally generated buildings** — procedural generation exists specifically to kill memorized meta and force per-round planning.

---

## 6. Pre-Mission Planning (R6 / SWAT 3) and Why It Faded

- **Rainbow Six / Rogue Spear / Raven Shield**: full planning phase — briefing, intel review, roster selection (8 operatives, permadeath), loadout kits, splitting into fire teams, **waypoint paths drawn on blueprints** with per-waypoint orders (breach, frag, flashbang, hold, speed/ROE settings), and **go-codes** ("Alpha! Bravo!") voice-triggered to synchronize multi-team assaults. You could even run the mission hands-off in Watch mode as a pure commander.
- **SWAT 3** skipped drawn plans but kept briefings/floor plans and moved planning *into* the mission: a dynamic crosshair-context command tree ("breach and clear," cover, gas) directed at Element/Red/Blue.
- **Why it died**: (1) console ports — planning was "too unwieldy for gamepad control" and was cut from console R6 3, whose leaner design then became the *base* for Lockdown and the Vegas cover-shooter era; (2) pacing — planning could take longer than the mission, and one-bullet lethality meant constant re-planning loops; (3) design realization that plans rarely survive contact, so mid-mission command (SWAT 3/4 style) is the better decision locus; (4) market shift to immediate action.
- **Due Process revived it** for PvP: a per-round planning phase where the team **draws its plan on the map and the drawings appear on the floor in-game** as breadcrumb trails. It works there because a human opposition + procedural maps make every plan fresh. Takeaway: planning phases thrive when plans can't be memorized and when the plan artifact is visible during execution.

---

## 7. Real Hostage-Rescue Doctrine Highlights

- **Priority of life**: hostages/civilians > officers > suspects. Peaceful negotiated surrender is the doctrinal ideal; premature assault is treated as the highest-risk option.
- **Negotiation-first**: time favors authorities (fatigue, rapport, intelligence accumulation); crisis negotiation team (CNT) runs in parallel with the tactical team, feeding a shared intel picture, under a unified command post (the real "TOC").
- **Two assault types** (per NTOA/IACP-style doctrine):
  - **Deliberate / command-initiated**: rehearsed, synchronized, launched on leadership's decision — typically on an intelligence window (suspects separated from hostages) or when negotiation collapses and execution appears planned.
  - **Emergency / conditionally-initiated (immediate action)**: a pre-staged rapid entry executed the moment external stimuli indicate active violence — **shots fired inside, panicked screaming, weapon presented at a hostage**. An emergency assault plan is maintained from minutes after arrival, and it is continuously updated.
- **Snipers/observers as intel**: sniper-observer teams deploy immediately, providing "eyes on" — suspect count, locations, weapons, pattern of life — long before (and often instead of) firing; they can also initiate a coordinated assault with a precision shot.
- Game-design translation: this gives a natural phase machine — *contain → gather intel (sniper/negotiator) → negotiate (clock runs, intel improves, but execution risk events can fire) → deliberate assault on a window, OR emergency assault trigger interrupts everything*. SWAT 4's Sierra sniper viewports and RoN's TOC are thin slices of this; no game has shipped the full negotiation-vs-assault decision loop.

---

## 8. What Makes These Games Tense vs Frustrating

**Tension (works):**
- One-bullet lethality + permanent consequence; slow doors as suspense objects (what's behind it is unknown every replay via randomized spawns/loadouts).
- ROE inversion: the trigger is a liability, so *every* armed contact is a judgment call under time pressure.
- Audio-first threat awareness (screams, muffled shots, SWAT 4's ambient dread); SEF's randomized appearances making threat-ID perceptual.
- The cuffing ritual: approaching a "surrendered" suspect who might be feinting.

**Frustration (documented player criticism):**
- **RoN suspect "aimbot"**: measured ~120–250 ms reaction times, 360-degree snap shots, perfect accuracy while jitter-strafing, perfect night vision, and suicidal aggression (prioritizing killing the player over self-preservation). Players feel forced to choose between eating an unreactable first shot or committing ROE violations — the ROE reads as unfair when the AI's kinematics are superhuman.
- **Teammate AI**: RoN squadmates block doorways after opening them, get stuck on geometry, forget threats within seconds, don't hold angles (players note SWAT 4's 2005 AI held verticals and reloaded under 25% ammo — regression hurts more than absence).
- RNG compliance that ignores player effort reads as arbitrary; wandering civilians dying to suspect fire and costing *the player* score feels like punishment without agency.
- Lesson: strict consequence systems are only accepted when the information game is fair — readable threat states, human-plausible AI reaction envelopes, and score penalties tied to player-controllable events.

---

## 9. Difficulty & Consequence Systems

- **SWAT 4**: difficulty = passing-score threshold (Elite = 95/100); no health regen; injuries persist through the mission; failure is usually score-death, not player-death.
- **SWAT 3**: named officers with **permadeath across the career campaign** — losing a veteran operator is a campaign-scale loss.
- **Rainbow Six**: operative **permadeath** plus lingering wounds across the campaign roster; losing your best marksman mid-campaign was the era's signature consequence.
- **Ready or Not 1.0 Commander Mode**: a **stress meta-system** — acting outside the use-of-force continuum, losing hostages, or endangering innocents raises officer stress through states Content → Anxious → Stressed → Crisis; high-stress officers must be benched into **therapy (up to 3 officers, ~3 missions to recover)** or risk permanently quitting; officers can die permanently; **Ironman mode deletes the save on death**. This is the most interesting modern consequence design: it moralizes ROE by making *your squad's mental health* the accumulator for your conduct.
- **Due Process**: round-based PvP elimination; consequence is social (wasting the team's drawn plan).

---

## Cross-Cutting Design Takeaways

1. Score-as-difficulty (SWAT 4) elegantly makes "professionalism" the hard mode; consider scenario-flexed ROE to avoid RoN's arrest-terrorists dissonance.
2. Compliance = influenceable hidden morale (surprise, numbers, stims, traits) + feint risk; publish the levers, hide the roll.
3. Keep exactly zero LTL tools that hard-stop reliably at all ranges, or lethal weapons become cosmetic.
4. Urgency via alarm-escalation and audio-telegraphed probabilistic executions beats HUD countdowns.
5. Doctrine offers an unmined phase structure: negotiate/intel loop with sniper eyes-on, interruptible by emergency-assault triggers (shots fired inside).
6. Planning phases need anti-memorization (procedural maps or PvP) and in-world plan artifacts (Due Process floor drawings) to survive.
7. Consequence systems land when accumulated on things players identify with (named officers, stress/therapy) rather than abstract score alone.
8. AI fairness (human reaction envelopes, readable intent animations) is the precondition for strict ROE being fun.

Sources:
- [Police Quest Omnipedia — Rules of Lethal Engagement](https://policequest.fandom.com/wiki/Rules_of_Lethal_Engagement)
- [Police Quest Omnipedia — Mission Score](https://policequest.fandom.com/wiki/Mission_Score)
- [GameFAQs — SWAT 4 Stetchkov Syndicate: Unauthorized Use of Force](https://gamefaqs.gamespot.com/pc/930133-swat-4-the-stetchkov-syndicate/answers/267183-unauthorized-use-of-force)
- [GameSpot — SWAT 4 Walkthrough (scoring)](https://www.gamespot.com/articles/swat-4-walkthrough/1100-6122667/)
- [Gamerant — Ready or Not: All S-Rank Requirements](https://gamerant.com/ready-or-not-how-get-s-rank-missions/)
- [TheGamer — How To Get S Rank In Ready Or Not](https://www.thegamer.com/ready-or-not-obtain-s-rank-guide/)
- [Nexus Mods — No Mercy for Terrorists: Relaxed ROE](https://www.nexusmods.com/readyornot/mods/3234)
- [Ready or Not Wiki — Suspects (morale mechanics)](https://readyornot.wiki.gg/wiki/Suspects)
- [Nexus Mods — Drop Your Weapon: Realistic AI Morale Tweaks](https://www.nexusmods.com/readyornot/mods/3182)
- [ModDB — SWAT: Elite Force mod](https://www.moddb.com/mods/swat-elite-force)
- [GitHub — SWATEliteForce README](https://github.com/eezstreet/SWATEliteForce/blob/master/README.md)
- [SWAT Wiki — SWAT 3: Close Quarters Battle](https://swatseries.fandom.com/wiki/SWAT_3:_Close_Quarters_Battle)
- [Old PC Gaming — SWAT 3 review](https://oldpcgaming.net/swat-3-close-quarters-battle-review/)
- [Archive.org — Rogue Spear manual (planning, go-codes)](https://archive.org/stream/Rainbow_Six_Rogue_Spear_UK_Manual_PC/Rainbow_Six_Rogue_Spear_UK_Manual_PC_djvu.txt)
- [Xbox Wire — The History of Tom Clancy's Rainbow Six](https://news.xbox.com/en-us/2015/03/31/games-the-history-of-tom-clancys-rainbow-six/)
- [TV Tropes — Rainbow Six](https://tvtropes.org/pmwiki/pmwiki.php/VideoGame/RainbowSix)
- [Rainbow Six Wiki — Rainbow Six (1998)](https://rainbowsix.fandom.com/wiki/Rainbow_Six)
- [Zero Hour Wiki — Gameplay Tips, Tricks, and Mechanics](https://zerohour.fandom.com/wiki/Gameplay_Tips,_Tricks,_and_Mechanics)
- [Wikipedia — Zero Hour (video game)](https://en.wikipedia.org/wiki/Zero_Hour_(video_game))
- [Due Process Wiki — Mechanics](https://dueprocess.fandom.com/wiki/Mechanics)
- [DigiPen — Due Process studio debut interview](https://www.digipen.edu/showcase/news/digipen-dragons-giant-enemy-crab-debut-due-process)
- [Ready or Not Wiki — Neon Tomb](https://ready-or-not.fandom.com/wiki/Neon_Tomb)
- [Police1 — When patrol becomes the hostage rescue team](https://www.police1.com/police-training/when-patrol-becomes-the-hostage-rescue-team)
- [IACP — Hostage Situations Model Policy](https://www.theiacp.org/sites/default/files/2018-08/HostagePolicy.pdf)
- [NTOA — Hostage Rescue Tactics course overview](https://public.ntoa.org/AppResources/CourseDetails/322.pdf)
- [FBIAgentEdu — FBI Sniper/Observer role](https://www.fbiagentedu.org/careers/tactical-operations/fbi-sniper-observer/)
- [Police1 — Tactical response to barricaded gunman and hostage situations](https://www.police1.com/special-operations/tactical-response-to-barricaded-gunman-and-hostage-situations)
- [Toolify — Unveiling the Troublesome AI in Ready or Not](https://www.toolify.ai/ai-news/unveiling-the-troublesome-ai-in-ready-or-not-198707)
- [Nexus Mods — SWAT and Suspects AI Overhaul](https://www.nexusmods.com/readyornot/mods/1358)
- [TechRadar — Ready or Not review](https://www.techradar.com/gaming/ready-or-not-review)
- [Item Level Gaming — Commander Mode Guide (roster, therapy, traits)](https://itemlevel.net/ready-or-not-commander-mode-guide-in-1-0-roster-therapy-traits/)
- [Ready or Not Wiki — Update 1.0](https://ready-or-not.fandom.com/wiki/Update_1.0)
- [Gamerant — Ready or Not: How to Give Officers a Break](https://gamerant.com/ready-or-not-how-give-officers-break/)

---

# Chapter 5: Rainbow Six Siege Operator & Gadget Design

*(research agent report, 2026-08-07)*

# Rainbow Six Siege Operator & Gadget Design — Research Brief for a Single-Player Top-Down Tactical Game

## 1. Operator Design Philosophy

**One defining gadget per operator.** Every operator is built around exactly one unique gadget that defines their tactical identity — the gun is secondary, the gadget is the character. Ubisoft's stated design goal (per designer interviews, e.g. Emilien Lomet on the Sam Fisher/Zero release: "Sam is all about intel and gadget denial") is that each operator answers one tactical question. The best-regarded operators have *simple core mechanics with real trade-offs*; the community and designers point to the Bandit/Kaid/Thatcher/Mute web as ideal because every piece has a counter that depends on player skill, not stats.

**Attacker vs defender split.** Hard asymmetry: attackers bring mobility, breaching, and intel projection; defenders bring fortification, traps, and intel denial. Operators are locked to one side, which lets each side's gadget pool be balanced as a closed ecosystem.

**Speed/armor trade-off.** Classic system: each operator is rated 1–3 Speed with inverse Armor (3-speed/1-armor fragile flankers ↔ 1-speed/3-armor slow anchors). Operation Crystal Guard (Y6S3) converted armor to flat HP: 1-armor = 100 HP, 2-armor = 110 HP, 3-armor = 125 HP, removing hidden damage-resistance math. A later rework (Siege X era, tested in Testing Grounds) made it a *player choice*: five armor tiers (Light/Tactical/Medium/Heavy/Juggernaut), with each speed rating choosing among three of them — trading HP against movement speed per loadout. **Design takeaway:** a single legible axis (fast-and-fragile vs slow-and-tough) is enough; Siege's evolution shows flat visible HP beats hidden resistance multipliers, and letting players slide along the axis per-mission adds buildcraft cheaply.

**Loadout slots.** Fixed template: Primary weapon (2–3 choices) + Secondary (pistol/machine pistol) + Generic Utility slot (choose 1–2 of: frag/breach charge/claymore/smoke/stun/hard-breach charge on attack; impact grenade/barbed wire/deployable shield/nitro cell/observation blocker on defense) + Unique Gadget (fixed, non-optional). The generic slot is the balancing dial — access to frags or a secondary hard breach can make or break an operator without touching their identity.

---

## 2. Iconic Attacker Kits and the Problem Each Solves

| Operator | Gadget | Tactical problem solved |
|---|---|---|
| **Thermite** (USA) | 2× Exothermic Charge | The original hard breach: opens reinforced walls/hatches, creating the main assault lane. Slow, loud, telegraphed — a "set-piece" moment. |
| **Hibana** (Japan) | X-Kairos pellet launcher | Ranged hard breach: fires breaching pellets from distance in selectable bursts (2/4/6), ideal for hatches and multiple small openings; harder to deny than a planted charge. |
| **Ace** (Norway) | 3× SELMA throwable charge | Volume hard breach: three thrown charges that chew downward in stages; forgiving, self-sufficient, hard for defenders to destroy mid-cycle. |
| **Maverick** (USA) | Blowtorch | Silent, precise hard breach: cuts murder-holes and man-sized gaps; *ignores* electrification entirely — the stealth answer to Bandit/Kaid. |
| **Thatcher** (UK) | 3× EMP grenade | Electronics denial: area-disables all defender electronics (jammers, batteries, ADS, cameras). The enabler that lets hard breach happen. Historically near-100% pick rate — a lesson that a pure enabler can be *too* mandatory. |
| **Twitch** (France) | 2× Shock Drone | Precision electronics denial + intel in one body: drone with a laser that destroys individual gadgets. Trades area effect for accuracy and reusability. |
| **Kali** (India) | CSRX sniper + LV lance | Standoff gadget deletion: an under-barrel explosive lance that destroys gadgets through/behind walls from range. |
| **Ash** (Israel/USA) | 2× Breaching Round | Soft breach at range + entry fragging: opens unreinforced walls from distance, destroys shields/barricades instantly. Archetypal 3-speed aggressive entry. |
| **Zofia** (Poland) | KS79 launcher (impact + concussion rounds) | Flexible entry: breach *or* stun from the same tube; self-sufficient soloist. |
| **Sledge** (UK) | Breaching hammer | Infinite, silent-ish soft breach: melee hammer opens floors/walls/hatches repeatedly at zero ammo cost — vertical play enabler. |
| **Buck** (Canada) | Skeleton Key underbarrel shotgun | Soft breach as weapon attachment: shreds floors/ceilings for vertical sightlines without swapping weapons. |
| **Ying** (China) | 4× Candela cluster flash | Flash entry: rolling/anchored cluster flashbangs that saturate a room before a coordinated push; her goggles protect herself. |
| **Blitz** (Germany) | Flash Shield | Flash entry, personal: shield with a face-mounted flash — close-range aggression that forces a reaction. |
| **Montagne** (France) | Extendable full shield | Pure area denial/bait: near-invulnerable from the front when extended, can't shoot while extended; walking cover for the team, intel by drawing fire. |
| **Fuze** (Russia/Uzbekistan) | 4× Cluster Charge | Through-wall utility/kill pressure: mounts on a soft surface and vomits grenades into the room beyond; clears anchored positions and trap nests without entering. Infamous hostage-killer — a great case study in gadget-vs-objective tension. |
| **IQ** (Germany) | Electronics Scanner | Intel: wrist scanner reveals all electronics through walls — finds traps, cams, nitro cells; pairs detection with her own gun to shoot them through soft surfaces. |
| **Zero** (USA) | Argus launcher cameras | Deep recon + denial: fires cameras that punch *through* walls, viewing both sides, each with a one-shot laser. Intel that also removes gadgets. |
| **Iana** (Netherlands) | Gemini Replicator | Risk-free recon: pilots an expendable holographic clone of herself to scout and bait reactions; the clone dies, she doesn't. |
| **Finka** (Russia) | Adrenal Surge | Team support: global buff — HP boost, faster ADS, revives downed teammates remotely. The attacker-side "healer" beat (Doc is her defender mirror with a heal/revive pistol). |
| **Nomad** (Morocco) | 3× Airjab repulsion mine | Flank denial: sticky air-blast mines knock down anyone walking past — locks doors behind the attacking squad so roamers can't hit them from the rear. (Grim's bee swarm is the modern intel-flavored version.) |

**Pattern to steal:** each kit = *verb + constraint*. Thermite "opens the impossible wall, but must stand at it"; Fuze "kills through walls, but blindly"; Montagne "is cover, but unarmed while being it." The constraint is what creates squad interdependence.

---

## 3. Iconic Defender Concepts → Enemy/Encounter Design

- **Mute — Signal Disruptor jammers.** Area-denial of electronics: jams drones, remote detonators, and breach charges near the jammer. As an enemy: a jammer unit/emplacement that disables the player's drone and remote gadgets within a radius until destroyed — creates a "kill the jammer first" objective layer.
- **Bandit/Kaid — electrified reinforcements.** Shock Wire batteries (Bandit, removable/re-placeable — enabling the skill play "Bandit tricking": pulling and replacing the battery to bait breach charges) and Electroclaw (Kaid, remote, covers hatches). As enemy design: electrified walls that destroy player breach tools unless the power source is found and cut — a puzzle lock on the breach verb.
- **Traps.** Kapkan (doorway explosive tripwires), Frost (Welcome Mat leg-hold traps that *down* rather than kill — creating rescue/bait situations), Ela (Grzmot concussion proximity mines), Lesion (invisible poison Gu mines that ping damage and force a removal animation), Melusi (Banshee slow-fields that also make noise). Trap taxonomy worth copying: **lethal / downing / disorienting / slowing+alarming** — each creates a different pacing beat, and downing traps are the most interesting in squad play because they generate rescue decisions.
- **Jäger — ADS "Magpie" active defense.** Auto-intercepts thrown projectiles (grenades, flashes, Candelas) within radius, limited charges. As an enemy: a turret that eats the player's grenades until baited out with cheap throwables or shot — teaches resource-baiting. Wamai's Mag-NET variant *redirects* rather than negates (pulls projectiles to a new detonation point) — a nastier, more dynamic version.
- **Roamers vs anchors.** Defenders self-sort into **anchors** (1-speed, hold the objective room, play traps/utility — e.g. Rook with his armor-plate bag, Doc, Maestro with his bulletproof Evil Eye turrets) and **roamers** (3-speed, leave the objective to ambush, waste attacker time, hit flanks — Vigil who hides from drones, Caveira who silently stalks and "interrogates" downed attackers to wallhack-reveal their whole team). **Direct enemy-AI mapping:** anchor archetypes = stationary fortified enemies defending the objective; roamer archetypes = patrol/ambush enemies that attack the player's flank and punish slow, noisy play. The tension between clearing roamers (time cost) and rushing the objective (flank risk) is the core attacker dilemma — perfectly reproducible vs AI.

---

## 4. Drone/Recon Phase & the Intel-vs-Action Economy

- Structure: 45-second **prep phase** — attackers pilot small wheeled drones to find the objective and mark defenders while defenders reinforce, trap, and set up. Then the **action phase** (~3 min). Each attacker gets 2 drones; drones that survive prep become live cameras for mid-round intel.
- **Drones are a spendable economy.** Community/analyst framing: Siege's "economy" is drones the way CS:GO's is money. A dead drone is spent intel; a hidden live drone is banked intel. Teams that burn all drones early go in blind; teams that over-drone run out of clock. Time itself is the second currency — every second droning is a second not pushing.
- Defender mirror: fixed CCTV cams (shootable), plus operator cams (Valkyrie's throwable Black Eyes, Maestro's armored Evil Eyes), and intel-deniers (Mute jammers near drone holes, Mozzie who *steals* attacker drones, Vigil who is invisible to cams).
- **Single-player translation:** a pre-mission or on-demand drone/scout mode is one of Siege's most portable systems — top-down games can render it as a fog-of-war-lifting scout unit with limited battery/count. Key rules to keep: intel is (a) finite, (b) destructible by the enemy, (c) time-costed, and (d) actionable (marks persist on enemies/traps). Making enemies react to spotting/destroying the drone preserves the risk side of the loop.

---

## 5. Destruction & Reinforcement — Why It's the Core of Siege

- Surfaces are tiered: **soft** (drywall, wood floors/hatches — shootable, meleeable, breachable), **reinforced** (defender-applied metal on soft walls/hatches, defeats everything except hard breach), and **indestructible** (structural concrete/exterior). Defenders get a shared pool of ~10 reinforcements.
- Destruction is *the* strategic layer: bullet holes create murder-sightlines; Sledge/Buck opening a floor turns a 2D fight into a 3D one (vertical pressure onto the objective from above/below); a Thermite wall converts a defended chokepoint into a wide-open kill lane. The map is a mutable graph — **players edit the level's connectivity graph in real time**, and defenders pre-edit it in the prep phase. Analyst writing on Siege consistently identifies this as the reason no two rounds play alike.
- Reinforcement is the defender's counter-verb, which in turn creates the hard-breacher role, which creates Bandit/Mute, which creates Thatcher/Maverick — the entire counterplay tree grows out of destructibility.
- **Top-down translation:** top-down is arguably *better* for this — wall states are perfectly readable from above. Implement wall segments with material tags (soft/reinforced/structural), let breach verbs edit the nav-graph (AI teammates and enemies must re-path), and let enemies pre-fortify differently per run for replayability. Vertical floor-breaching is the hardest part to translate; a single-floor game can substitute "ceiling vents/floor grates" or interior windows as the second connectivity layer.

---

## 6. Breach Tool Interactions (the Breaching Ladder)

| Tool | Surface | Character |
|---|---|---|
| Bullets/melee | Soft only | Free, small holes, sightlines not passage |
| **Impact grenade** (defender) / grenades | Soft only | Instant, ranged, small ragged hole — defenders use impacts to open *their own* rotation holes between rooms |
| **Breach charge** (generic attacker utility) | Soft only | Placed, remote-detonated, man-sized hole + lethal blast through the wall; destroyed by shooting it, denied by jammers/wire baiting |
| **Sledge/Buck/Ash** (soft-breach specialists) | Soft only | Repeatable/ranged/silent variants of the same verb |
| **Exothermic/hard breach** (Thermite, Hibana, Ace, secondary hard-breach charge) | Reinforced + soft | Slow, loud, telegraphed; **fails against electrified walls (Bandit/Kaid) and jammed walls (Mute)** — must be enabled by Thatcher/Twitch/Kali/Maverick |
| **Maverick torch** | Reinforced | Quiet, tiny holes, immune to electricity — the exception that beats the counter |

The key interaction rule: **soft breach is cheap and plentiful; hard breach is scarce, slow, and counterable.** Electricity destroys deployed breach gadgets; EMP disables electricity; defenders can bait by timing battery placement (Bandit trick). This rock-paper-scissors *within the breaching action itself* is a complete minigame worth porting wholesale.

---

## 7. How Siege Teaches Counterplay Loops

- The canonical chain: Thermite (opens wall) ← Bandit/Kaid/Mute (deny breach) ← Thatcher/Kali/Twitch (deny the denial) ← Bandit-tricking (skill-based re-denial) ← Maverick (sidesteps the whole chain). Every gadget has ≥2 counters; nearly every counter has a counter.
- Other clean loops: grenades ← Jäger ADS ← bait with cheap throwable or Brava/Twitch drone kill; drones ← Mute jammer/Mozzie theft ← Thatcher EMP; traps ← IQ scan/drone spotting ← hiding traps off camera-lines; shields ← Ela/Oryx/melee-stagger and explosives ← ADS eating the explosives.
- Pedagogy: counters are **legible and diegetic** (electricity visibly crackles on a wall, jammers buzz, EMP pops with a distinctive sound), so losses read as "I lacked the right tool/order," not randomness. The lesson arrives as a *plan-level* failure, teaching draft/loadout thinking, not just aim.
- **Single-player version:** counterplay loops become **lock-and-key encounter design with multiple keys** — a jammed, electrified wall can be solved by EMP (key A), by finding the battery on the other side (key B), or by torching a murder-hole (key C). Design rule from Siege's Thatcher problem: never make one key mandatory, or that key becomes an auto-pick; every lock needs at least one clunky-but-universal fallback.

---

## 8. What Translates to Single-Player Squad Play (and What Doesn't)

Evidence base: **Rainbow Six Extraction** (Ubisoft's own co-op/solo PvE conversion of 18–20 Siege operators vs AI) shows the roster ports surprisingly well — intel, breach, traps, and support kits carried straight over; Doc (heal/revive) and Pulse (wall-scan intel) rank among the best *solo* picks because they compensate for missing teammates.

**Translates well (player kits or AI-teammate kits):**
- **All breaching** (Thermite/Hibana/Ace/Sledge/Buck/Ash) — breach is player-vs-level, no human opponent needed; it's the most PvE-native verb in the game.
- **Intel** (IQ, Pulse, Zero, Iana, drones) — works if enemies carry detectable gadgets/positions and fog of war exists; Iana's decoy works if AI reacts believably to the clone.
- **Support** (Finka, Doc, Rook) — heal/revive/buff is *better* in PvE (down-but-not-out states, teammate rescue).
- **Flash/entry** (Ying, Zofia, Blitz) — needs AI with a stun/suppression state; very satisfying vs AI.
- **Flank denial** (Nomad, claymores) — works if enemy AI actually flanks; doubles as a teaching tool for the roamer-enemy archetype.
- **Fuze** — cluster-through-wall is spectacular in PvE, plus objective-damage tension keeps his comedy/risk identity.
- **Shields** (Montagne) — great as an AI-teammate "mobile cover" role in top-down.
- **Defender concepts** flip to the *enemy* side: Mute/Bandit/Kapkan/Frost/Jäger/Maestro become enemy emplacements, traps, and elite units (see §3); or to the player in defense/holdout missions.

**Translates poorly (PvP-dependent):**
- **Mind-game operators**: Vigil (invisible to enemy cams), Caveira (interrogation reveals human teammates), Mira's one-way Black Mirror windows, Alibi decoys that punish human misidentification — these exploit *human* perception/psychology; vs AI they degrade into stat toggles unless AI perception is elaborately simulated.
- **Time-wasting/economy griefing** (roam-clear tempo, Oryx wall-dashing to rotate, Clash's taser shield) — built around a match clock and human tilt.
- **Pure denial of human intel** (Mozzie stealing drones, Mute vs enemy drones) — only matters if the opponent runs an intel economy; give it to enemies instead.
- **Bandit-tricking-style timing duels** — reaction-time mind games vs humans; as PvE it must become a scripted puzzle.
- **Rule of thumb:** kits whose target is *the level or the enemy's body/gadgets* port cleanly; kits whose target is *the opponent's information state or patience* need re-design or side-flipping to enemy AI.

**AI-teammate note:** Siege kits are naturally *orderable* — "breach here," "scan this room," "hold this door with the shield" map to one-click squad commands because each kit is a single verb with a location parameter. That's the deepest reason operator design suits squad-command games.

---

## 9. Operator Identity — Why Players Attach

- **Name + nationality + real CTU.** Every operator has a codename (Thermite, Sledge), a real name, a nationality, and membership in a real or plausible counter-terror unit (SAS, GIGN, Spetsnaz, FBI SWAT, GROM, SAT…). Early design made operators feel like interchangeable members of their unit; Ubisoft explicitly shifted to giving each a distinct personality — the unit is flavor, the individual is the brand.
- **Gadget = personality.** The gadget is characterized as personal invention or signature tool (Thermite is literally a demolitions PhD; Sledge's hammer is a personal eccentricity; Tachanka's turret became a community legend). Bios, in-engine cinematics, and voice lines reinforce that *the gadget expresses the person*.
- **Silhouette and readability.** Each operator has a distinct visual silhouette (Sledge's kilt-adjacent bulk and hammer, Blitz's shield, Montagne's mass, Ela's beanie and spray-paint palette, Frost's toque, Caveira's face paint), because instant friend/foe/kit identification at a glance is a gameplay requirement — cosmetic DLC deliberately preserves silhouette. Elite skins double down on heritage (Hibana's kyūdō outfit, Sledge's Highland Games tartan), which is the monetization proof that heritage-based identity drives attachment.
- **Attachment loop:** pick rate → mastery ("I'm a Sledge main") → self-expression via skins/charms → lore investment (seasonal cinematics, operator relationships e.g. the Ela/Zofia sister rivalry). Players attach to operators as *playstyle identities* first, characters second — "maining" is choosing how you think.
- **For your game:** give each squad member (1) a codename tied to their verb, (2) a nationality/background that explains the gadget's origin, (3) one silhouette-defining prop readable at top-down scale (hammer, shield, backpack rig, antenna), (4) a one-line personality that colors barks during gadget use, and (5) a visible mastery/cosmetic track per character. Small roster (6–10) with maximal kit contrast beats a large roster of overlapping kits — Siege's own designers admit a 100-operator roster forces overlap.

---

Sources:
- [FandomWire — How Rainbow Six Siege's New Armor System Works](https://fandomwire.com/here-how-rainbow-six-siege-new-armor-system-works/)
- [Rainbow Six Wiki — Armor and Speed](https://rainbowsix.fandom.com/wiki/Armor_and_Speed)
- [Destructoid — Siege X Testing Grounds Armor and Speed system explained](https://www.destructoid.com/rainbow-six-siege-x-testing-grounds-armor-and-speed-system-explained/)
- [TechRadar — Operation Crystal Guard (armor→HP change)](https://www.techradar.com/news/rainbow-six-siege-operation-crystal-guard-is-live-on-main-server)
- [The Loadout — Siege shouldn't balance operators on lore (design philosophy/counterplay)](https://www.theloadout.com/rainbow-six-siege/zofia-withstand-operator-design)
- [ESPN — Sam Fisher operator, designer Emilien Lomet interview](https://www.espn.com/gaming/story/_/id/29675072/rainbow-six-siege-add-splinter-cell-sam-fisher-operator)
- [SiegeGG — Thermite operator guide](https://siege.gg/news/3162-rainbow-six-siege-operator-guide-thermite)
- [SiegeGG — Community's favorite hard breacher](https://siege.gg/news/rainbow-six-siege-poll-reveals-communitys-favorite-hard-breacher)
- [Rainbow Six Wiki — Reinforcement](https://rainbowsix.fandom.com/wiki/Reinforcement)
- [SiegeGG — Mute operator guide](https://siege.gg/news/rainbow-six-siege-operator-guide-mute)
- [SiegeGG — Wamai operator guide](https://siege.gg/news/rainbow-six-siege-wamai-operator-guide)
- [R6 Siege Center — Jäger guide](https://r6siegecenter.com/guides/operators/defenders/jager/)
- [Medium — Systems of Combat, Structures of Play: how Siege rewards tactical unity](https://medium.com/@hhc30/systems-of-combat-structures-of-play-how-tom-clancys-rainbow-six-siege-rewards-tactical-unity-9b6d42bc5d78)
- [Reforged Gaming — Rainbow Six Siege: Drone Economy](https://reforgedgaming.org/2019/02/09/rainbow-six-siege-drone-economy/)
- [R6 Siege Center — Droning guide](https://r6siegecenter.com/guides/attack/droning/)
- [Rainbow Six Wiki — Drone](https://rainbowsix.fandom.com/wiki/Drone)
- [The Loadout — Rainbow Six Extraction operators](https://www.theloadout.com/rainbow-six-extraction/operators)
- [NintendoSmash — Extraction best operators for solo or team players](https://nintendosmash.com/rainbow-six-extraction-the-best-operators-for-solo-or-team-players/)
- [TheSixthAxis — Extraction operators and gadgets](https://www.thesixthaxis.com/2022/01/21/rainbow-six-extraction-operators-gadget-list/)
- [Trusted Reviews — old operators visual redesign / hero identity](https://www.trustedreviews.com/news/rainbow-six-sieges-old-operators-could-be-getting-a-visual-redesign-to-make-them-look-like-heroes-3810646)
- [Dot Esports — All Elite skins in Rainbow Six Siege (heritage-based identity)](https://dotesports.com/rainbow-6/news/all-elite-skins-in-rainbow-six-siege)

---

# Chapter 6: Direct Control + Squad Command Hybrids

*(research agent report, 2026-08-07)*

# Direct Control + Squad Command Hybrids — Research Digest

## 1. The Game Catalog: Who Has Done This

### Closest analogs to your design (top-down, direct control + AI orders)

| Game | Control model | Command model | Key lesson |
|---|---|---|---|
| **Police Stories** (2019) | Top-down, WASD + mouse aim, you ARE officer John Rimes | Right-click radial wheel commands one AI partner (Rick): breach, clear room, cover, arrest, use item | The closest direct analog to your design. Explicitly "Hotline Miami control + SWAT 4/Door Kickers tactics." Note it caps at **one** AI partner — command bandwidth is deliberately matched to action tempo. Scaling to 3-4 squadmates is your open design problem |
| **Running With Rifles** (2015) | Top-down, direct control of one soldier among hundreds | Rank-gated followers (1 per 1000 XP, up to 10). RMB-click = move there; double-click = charge without cover. Orders are loose suggestions; AI fights autonomously | Low-fidelity orders work when the battle is macro-scale chaos and squadmates are disposable. Rank-gating squad size is a clean progression hook. Weakness: the war proceeds without you — hero feeling diluted |
| **Aliens: Dark Descent** (2023) | Top-down-ish; the squad moves as ONE blob you steer directly (RTS click-move, near-direct feel) | Command wheel triggers **slow motion by default** (settings slider to full pause); game auto-picks the best marine for each order; marines auto-engage | The modern proof-of-concept for action-tension + commands: slow-mo-on-menu preserved dread where full pause would kill it. Squad-as-single-unit removes per-man babysitting entirely |
| **Cannon Fodder** (1993) | Mouse-driven direct control of leader; squad follows as a conga line | Split squad into groups, send groups semi-autonomously | The primitive ancestor: follower-blob + direct fire feels great; per-man orders barely needed at small scale |
| **Door Kickers 1/2** | No true direct aim control — plan paths, pause anytime, edit live | Waypoints + go-codes (A/B/C in DK2), pause-anytime replanning | Your genre baseline. Community threads repeatedly ask for direct single-unit control — evidence of demand for exactly your hybrid. DK2's go-code system is the bridge: pre-plan the SQUAD, then trigger codes while you play the operator |

### Third/first-person hybrids (the design gold mines)

| Game | Control model | Command model | Key lesson |
|---|---|---|---|
| **Freedom Fighters** (2003) | 3rd-person shooter, fully vulnerable player | **Three buttons total**: follow/attack/defend, aimed via your normal reticle. **Tap = one squadmate, hold = whole squad.** Squad grows to 12 via charisma earned by heroics | Widely cited as the never-bettered benchmark ("I still don't think I've played a game with squad mechanics as good"). Trope codifier. The whole system rides on the reticle you're already using — zero extra aiming modes |
| **Star Wars: Republic Commando** (2005) | FPS, you are Boss | **Context-sensitive hotspots authored into levels** (snipe spot, turret, terminal, breach point): look at it, one button assigns a man. F-keys for form-up/search-and-destroy/secure. Focus-fire on marked target | "Simple enough to use in the middle of combat, which keeps it an action shooter rather than a slow tactics sim." Authored hotspots = designers pre-solve the AI positioning problem. Squadmates go down but are revivable — robust, never permanently lost |
| **Brothers in Arms: Road to Hill 30** (2005) | FPS, you shoot | Hold button → command cursor paints ground/target; 1-2 fireteams (fire team suppresses, assault team flanks); suppression state shown as icons over enemies | Find-Fix-Flank-Finish as a *legible loop*: the game shows you suppression state so orders have visible cause-effect. Contrast with Full Spectrum Warrior (same mechanics, **no player gun**) which plays as a puzzle game — the gun is what keeps it an action game |
| **SWAT 4** (2005) / **Ready or Not** (2023) | FPS | Crosshair-anchored context menu on doors/rooms: stack up, mirror, breach type, bang & clear; red/blue/gold element addressing; **"hold until my go"** deferred orders | Context menu depth is fine because the pace is slow and deliberate. RoN adds Move/Hold/Fall In/Stack Up + team split. Deferred "on my mark" orders are the FPS cousin of Door Kickers go-codes |
| **Ghost Recon** (2001) / classic **Rainbow Six** | FPS, can body-hop between soldiers | Command map + ROE per fireteam. R6: pre-mission waypoint plans with go-codes (Alpha/Bravo/Zulu) called in-mission | The full autonomy-slider vocabulary lives here (see section 5). R6's plan-then-play-one-operative loop is structurally identical to what you're building |
| **Helldivers 1/2** | Direct control (top-down in HD1) | No AI squad — human co-op; stratagems are directional-code inputs under fire | Relevant lesson anyway: making command input *cost something* (fumbling a code while a charger bears down) is itself a skill expression. Don't reflexively make ordering frictionless |
| **Alien Swarm** (2010) | Top-down, WASD + mouse aim | Designed for 4-player co-op (bots are an afterthought) | Proof the top-down aim/shoot feel scales to 4-operator squads; the co-op role split (medic/tech/heavy) is a template for AI squadmate specializations |

## 2. Order-Issuing UX Under Fire

**Five proven patterns, ranked by fit for real-time top-down:**

1. **Reticle-as-order-cursor + tiny verb set (Freedom Fighters).** 3 verbs max; the context (aimed at enemy vs. ground vs. building) resolves meaning; tap/hold multiplexes one-vs-all addressing. Best-in-class for zero-interruption ordering. **Strongest single pattern for your game** — your mouse cursor is already a world-position pointer.
2. **Authored context hotspots (Republic Commando).** Level designers place breach points, cover slots, hack spots; one keypress assigns. Pre-solves AI positioning failure and makes squad actions look brilliant. Cost: authoring burden, less sandbox freedom. In top-down, translates to snap-points on doors/windows/cover.
3. **Radial menu (Police Stories, Mass Effect wheel).** Direction = command, learnable as muscle memory; pairs naturally with slow-mo-while-open. Cap at ~6-8 slices; occludes the fight while open.
4. **Hierarchical context list (SWAT 4).** Deepest verb set, expert-fast via number keys, but heavy under fire; the existence of voice-command mods (AVCS4 for RoN) signals menu friction. Suits slow methodical pacing only.
5. **Queued waypoints + go-codes (Rainbow Six, Door Kickers 2).** Plan squad routes pre-contact; in the fight, your only command load is "GO BRAVO." This is your Door Kickers inheritance and the best answer to "how do I command 3 guys while personally in a gunfight": front-load the commanding, reduce mid-fight input to one key.

**Cross-cutting rules:** instant verbal acknowledgment bark before the AI even starts moving (perceived responsiveness); visible order lines/ghost markers (Door Kickers plan lines) so orders have persistent state; two-tier addressing (individual vs. element vs. all — FF's tap/hold, SWAT's red/blue/gold); never require selecting a unit first if the verb can infer the best man (Dark Descent auto-picks the right marine — huge friction saver).

## 3. Character Switching as Alternative/Complement

- **Commandos / Shadow Tactics / Desperados III:** hard-switch between specialists; unpossessed characters are parked (safe, passive). Works because it's puzzle-stealth — no time pressure between actions. **Shadow Mode/Showdown** (queue one action per character, execute simultaneously) is really WEGO-in-miniature: "orders" expressed as recorded intents. Brilliant for synchronized takedowns; wrong for continuous combat.
- **Ghost Recon 2001:** body-hop between soldiers mid-mission — switching as a *repair tool* when AI positioning fails.
- **GTA V:** switching is smooth and roles are distinct (stealth/driving/firepower); AI credibly holds its own while unpossessed — the fiction of "three heroes" survives because switch transitions are cinematic, not menu-y.
- **Verdict for your design:** full switching undermines "I am THIS operator" identity and the hero fantasy (section 6). But **possession-as-fallback** is worth stealing: quick-possess a squadmate if your operator goes down (Republic Commando lets a squadmate revive you instead — alternative solution), or a brief "take the shot" possession for a marksman. Treat switching as an exception mechanic, not the core verb.

## 4. The AI Squadmate Competence Problem

**Canonical failure modes:** pathing through your fire lane / into a doorway funnel, blocking the door you're stacking on, standing in grenades (Kingdom Hearts' Donald problem — absent exactly when needed), breaking stealth, stealing the room before you enter, and friendly-fire ambiguity.

**Proven design tricks (mostly: delete the failure mode rather than solve it):**
- **TLOU Ellie (GDC 2014, Max Dyckhoff):** companions are **invisible to enemies** for stealth purposes; follow system generates candidate positions and scores them (cover, LOS to player, not in player's aim); teleports when off-screen. Naughty Dog explicitly chose fun over realism and documented when they broke their own rules.
- **BioShock Infinite Elizabeth (GDC postmortem):** remove combat responsibility entirely — can't be hurt, contributes by tossing supplies. Competence via non-combat utility.
- **Republic Commando:** squadmates never permanently die (down/revive loop), shoot competently, and the *player* revives *them* — babysitting reframed as heroic rescue.
- **Aimbot with damage governor:** AI teammates rarely miss (looks competent) but deal capped DPS so they can't clear the level for you. Inverse of the damage-sponge approach; both hide the same dial.
- **Doorway etiquette:** explicit door-side slot claiming (SWAT stack positions), yield-to-player pathing priority, AI never occupies the tile the player is moving through. In top-down this is *fully visible*, so it matters more than in FPS.
- **Formation slots + cover snapping:** followers hold offset slots relative to the player and magnetize to authored cover, rather than freeform pathfinding (Freedom Fighters' squads visibly take cover near where you pointed).
- **No AI-to-player friendly fire** (or hard aim-suppression when the player crosses the line of fire) — while keeping *player*-to-AI friendly fire on, if you want Door Kickers-style consequence.
- **Predictability beats intelligence:** MIT Lincoln Lab's Hanabi human-AI research found humans rated even objectively strong AI teammates as frustrating when illegible. A dumber AI whose behavior the player can simulate mentally ("he will hold that corner until go-code") *feels* smarter.

## 5. Autonomy Sliders

The classic vocabulary (Ghost Recon 2001, ArmA, Rogue Spear):
- **Fire ROE:** Recon (hold fire) / Suppress (return + pinning fire) / Assault (fire at will). ArmA's hold/return/open-fire is the same triad.
- **Movement ROE:** Hold / Advance / Advance-at-all-costs.
- **Stance:** stand/crouch/prone trading speed vs. accuracy vs. profile.
- **SWAT-style engagement policy:** lethal vs. less-lethal priority, restrain vs. cover.

**Recommendation for top-down real-time:** per-element (not per-man) ROE with exactly three states, displayed as a persistent icon on each unit ring; default = **return fire** (hold-fire default ruins firefights, weapons-free default ruins stealth approaches); one hotkey cycles it. Stances are worth having in a Door-Kickers-like only if your cover/concealment sim reads them.

## 6. Keeping the Player the Hero

Why Freedom Fighters and Republic Commando are the two games always cited:
- **Freedom Fighters:** the player is *fragile* — you need the squad, but the squad is recruited by you, grown by your charisma (earned via heroic acts), and aimed by your reticle. Every squad achievement is authored by a player decision. You're not stronger than your men; you're the *will* of the group.
- **Republic Commando:** you are "Boss"; squad banter constantly acknowledges your orders; hotspot actions (slice, snipe, breach) only occur where you assign them, so squad brilliance is player-triggered; and rescuing downed brothers makes you the linchpin.
- **Anti-patterns:** RWR-style autonomous war (squad wins without you); pure-liability squads (escort-mission feel); and Full Spectrum Warrior's no-gun purity (competent, but you're a manager, not a hero).
- **Concrete techniques:** bias kill-securing to the player (AI suppresses and wounds; finishing pushes come from you); gate the dramatic verbs (breach charge, flashbang toss through a window) on player marks/go-codes; capped AI DPS per section 4; VO that credits the player's calls ("good call, Boss"); and keep camera + aim permanently on the player's operator — orders come *from inside the fight*, never a detached god view (except the pre-mission planner).

## 7. Squad Status UI While the Player Is Aiming

- **In-world beats HUD panels in top-down** — you can see your squad. Use unit rings/outlines encoding state by color (moving/holding/suppressed/reloading/down), order lines and ghost waypoints (Door Kickers plan lines already solved this), and small ammo/reload pips above heads.
- **Corner squad panel** as secondary: portrait + health bar + current-order icon + ammo state (the Darktide/Deep Rock "coherency panel" pattern: alive/down/low-health/reloading at a glance). Republic Commando's diegetic helmet HUD (per-man health + current order icon) is the FPS reference.
- **Critical alerts jump channels:** man-down triggers a center-screen-adjacent ping + distinct VO bark, not just a panel change. Under fire, **audio is the primary squad-status channel** — give each squadmate a distinct voice and reserve specific barks for reloading / suppressed / down / order-complete.
- Rules of thumb from HUD literature: surface only 3-4 states, high-contrast icons legible in ~200ms, cluster near (not on) the reticle path, everything else on-demand (hold-Tab expanded view).

## 8. Time Models: Pause, Slow-Mo, WEGO

| Model | Exemplars | Fit for direct-control action + command |
|---|---|---|
| **Full pause anytime (RTwP)** | Door Kickers, Mass Effect wheel, classic BioWare | Maximum control, but freezing mid-firefight kills the action feel your WASD layer exists to create. Right for the *pre-contact planning* phase; wrong as the mid-fight default |
| **Slow-mo while command UI open** | **Aliens: Dark Descent** (default slow-mo, settings slider to full pause), Satellite Reign, Max Payne-style | **Best fit.** Preserves tension and animation continuity, gives ~5x decision time, naturally rate-limits command spam. Dark Descent shipping it *with an accessibility slider to full pause* is the model to copy |
| **Time-moves-when-you-move** | Superhot | Conflicts with your design: your operator's own movement/aim IS the action, so the mechanic punishes exactly the direct-control layer you want to keep. Skip |
| **WEGO simultaneous turns** | Frozen Synapse, Combat Mission | Elegant for simultaneous-plan puzzles, but incompatible with continuous WASD control. Its useful residue is Shadow Mode-style *queued synchronized actions* — which you get via go-codes anyway |

**Recommended stack for your game:** (1) optional pre-mission/pre-breach planning with squad waypoints + go-codes (Door Kickers DNA); (2) full real-time direct control as the default state; (3) hold-key slow-mo (~15% timescale) radial/reticle-order mode for mid-fight commands; (4) accessibility setting upgrading slow-mo to full pause; (5) go-code keys (Z/X/C) as the only command input you *need* during a set-piece breach.

## Synthesis: The Design Gap You're Filling

No shipped game combines all three of: (a) top-down WASD+mouse operator control, (b) multi-man (3+) AI squad ordering, (c) Door Kickers-grade planning/go-codes. Police Stories proves (a)+ordering but caps at 1 partner; Dark Descent proves squad-command+slow-mo but removes per-man control and direct aim; Freedom Fighters/Republic Commando prove the command UX and hero-feel grammar but in 3rd/1st person; Door Kickers owns planning but has no operator. The load-bearing borrowings: Freedom Fighters' tap-one/hold-all reticle orders, Republic Commando's authored snap-points + revive loop, DK2 go-codes, Dark Descent's slow-mo-with-pause-slider, TLOU-style legibility-over-intelligence AI, and capped-DPS never-miss squadmates so the player stays the hero.

Sources:
- [Freedom Fighters — GameSpot review](https://www.gamespot.com/reviews/freedom-fighters-review/1900-6075492/) · [Squad Controls — Tropedia](https://tropedia.fandom.com/wiki/Squad_Controls) · [Freedom Fighters Retrospective — SUPERJUMP](https://www.superjumpmagazine.com/freedom-fighters-lives-on-in-the-memories-of-gamers/) · [GameTyrant retro review](https://gametyrant.com/news/retro-review-freedom-fighters-a-blast-of-tactical-fun)
- [Republic Commando feature preview — GameSpot](https://www.gamespot.com/articles/star-wars-republic-commando-feature-preview/1100-6117691/) · [Republic Commando manual (PDF)](https://cdn.akamai.steamstatic.com/steam/apps/6000/manuals/Star_Wars_Republic_Commando_Manual-English.pdf?t=1398915792) · [2026 retrospective](https://swtorstrategies.com/2026/03/star-wars-republic-commando-2005.html)
- [Ready or Not vs SWAT 4 comparison](https://trueorgame.com/ready-or-not-vs-swat-4-a-deep-dive-comparison-for-tactical-fans/) · [Mastering SWAT AI in Ready or Not — Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3494083514) · [AVCS4 voice control mod](https://forum.voiceattack.com/smf/index.php?topic=4110.0)
- [Analyzing the Squad Control of Brothers in Arms — ModDB](https://www.moddb.com/news/analyzing-the-squad-control-of-brothers-in-arms/) · [Brothers in Arms review — GameSpot](https://www.gamespot.com/reviews/brothers-in-arms-road-to-hill-30-review/1900-6120728/)
- [Police Stories — Steam](https://store.steampowered.com/app/539470/Police_Stories/) · [Police Stories — Wikipedia](https://en.wikipedia.org/wiki/Police_Stories) · [GamingOnLinux impressions](https://www.gamingonlinux.com/2019/10/some-thoughts-on-police-stories-the-recently-released-slower-tactical-top-down-shooter/)
- [RWR Squad control wiki](https://runningwithrifles.fandom.com/wiki/Squad_control) · [Running with Rifles — Wikipedia](https://en.wikipedia.org/wiki/Running_with_Rifles)
- [Door Kickers — Wikipedia](https://en.wikipedia.org/wiki/Door_Kickers) · [KillHouse Games interview](https://sudonull.com/post/112024-Interview-with-KillHouse-Games) · [DK single-unit control discussion](https://steamcommunity.com/app/248610/discussions/0/371918937281296492/)
- [Ghost Recon (2001) — Wikipedia](https://en.wikipedia.org/wiki/Tom_Clancy%27s_Ghost_Recon_(2001_video_game)) · [Ghost Recon — StrategyWiki](https://strategywiki.org/wiki/Tom_Clancy%27s_Ghost_Recon)
- [Ellie's buddy AI at GDC 2014 — Game Developer](https://www.gamedeveloper.com/design/ellie-s-buddy-ai-in-i-the-last-of-us-i-explained-at-gdc-2014) · [The AI of The Last of Us — Game Developer](https://www.gamedeveloper.com/design/endure-and-survive-the-ai-of-the-last-of-us) · [Elizabeth AI postmortem — GDC Vault](https://www.gdcvault.com/play/1020831/Bringing-BioShock-Infinite-s-Elizabeth) · [MIT Lincoln Lab human-AI teaming study](https://www.ll.mit.edu/news/ai-smart-does-it-play-well-others)
- [Aliens: Dark Descent review — Gaming Nexus](https://www.gamingnexus.com/Article/12877/Aliens-Dark-Descent/) · [RTwP discussion — Steam](https://steamcommunity.com/app/1150440/discussions/0/3414305314937000704/) · [GameTyrant review](https://gametyrant.com/news/aliens-dark-descent-review-tactical-terrifying-terrific)
- [Real-Time with Pause — TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/RealTimeWithPause) · [RTwP squad shooters thread — RPG Codex](https://rpgcodex.net/forums/threads/squad-based-tactical-shooters-that-utilize-a-real-time-with-pause-system.132760/)
- [Shadow Tactics — Kotaku](https://kotaku.com/shadow-tactics-is-a-stealth-renaissance-1789765814) · [Shadow Tactics — Scientific Gamer](https://scientificgamer.com/thoughts-shadow-tactics-blades-of-the-shogun/)
- [Mass Effect Combat wiki (Tactical Pause)](https://masseffect.fandom.com/wiki/Combat) · [GTA V character switching — Sportskeeda](https://www.sportskeeda.com/esports/how-switch-characters-gta-5-ps4-xbox-one-pc)
- [Helldivers 2 hands-on — PlayStation Blog](https://blog.playstation.com/2024/02/02/helldivers-2-hands-on-report-chaotic-co-op-and-empowering-stratagems/)
- [Darktide Squad HUD mod (state taxonomy)](https://www.nexusmods.com/warhammer40kdarktide/mods/844) · [HUD design guide — RocketBrush](https://rocketbrush.com/blog/designing-practical-and-pretty-hud-in-video-games)

---

## 7. Movement formations and small-unit tactics (added v1.1, for the formation system)

Sources: US Army FM 3-21.8 / ATP 3-21.8 (Infantry Platoon and Squad), Ranger
Handbook (SH 21-76), and the doctrine chapters already cited in §3. Written to
answer Sam's ask directly: what are the formations, what is each FOR, and what
should the game keep or bend in the name of fun.

### 7.1 Fire team formations (4 men)

**Wedge** — the default, and doctrine is emphatic about that. Team leader at
the point, men echeloned back on both sides ~10m apart. Fires and flexes in
every direction; each man's sector interlocks with the next. Breaks down in
dense vegetation or narrow streets, where it collapses to a file on its own.
*Game read: our current formation. Balanced; nobody downrange of the leader.*

**File** — single trail behind the leader. For restricted terrain, dense
woods, limited visibility, speed on a known route. Its cost is the textbook's
bluntest sentence: the file masks nearly all of its own fire to the front —
only the point man can shoot at what appears ahead.
*Game read: narrow and fast, and if contact comes head-on you have one gun.*

**Line** — everyone abreast, facing the objective. Maximum firepower forward,
used for the assault itself and not much else: it is wide, slow to control,
and has almost no flank or rear security.
*Game read: the formation you switch to for the last 100 meters.*

### 7.2 Squad formations (two fire teams + SL)

- **Squad column** (teams in column, each in wedge): the workhorse. Depth,
  strong flank fire, good control; weaker fire to the direct front.
- **Squad line** (teams abreast): assault posture, maximum front fire, hard
  to control, used for short pushes.
- **Squad file**: the fire-team file scaled up — restricted terrain only.
- **Squad vee**: both teams forward, SL behind — strong front for a meeting
  engagement, hardest to control; rarely the right answer and the game skips it.

### 7.3 Movement techniques (orthogonal to formation)

Doctrine separates the SHAPE from the PACE, and the game already models the
pace column: **traveling** (contact unlikely — close up, move fast: our follow
order), **traveling overwatch** (contact possible — trail element hangs back),
**bounding overwatch** (contact expected — one element moves only while the
other is set: our BOUND play, verbatim). Formation and technique compose:
squad column + bounding overwatch is the canonical approach march.

### 7.4 Battle drills worth stealing later

- BD1 React to Contact — return fire, seek cover, report; the base of fire
  forms and the maneuver element works the flank. (Our squad AI approximates
  the first half; the deliberate flank is future work.)
- BD2 Break Contact — the peel: one element suppresses while the other moves
  AWAY, alternating. This is BOUND run in reverse and would make retreat
  (v0.23) a fighting maneuver instead of a menu button. Best candidate.
- BD6 Enter Building / Clear Room — points of domination, sectors crossing at
  the door: shipped in the entry plays since v0.5.

### 7.5 Fun versus tactics — the calls the game makes

1. Doctrine's spacing (10m per man) is a screen and a half at our zoom. We
   compress to 34-45px steps: the SHAPE survives, the scale bends.
2. Doctrine has seven formations; the game ships three (wedge / column /
   line) because each is a genuinely different answer under fire, and the
   other four are refinements a mouse can't feel. Vee and echelon fold into
   wedge; the two files fold into column.
3. The real cost of a file — masked fire — is modeled honestly: trail sectors
   face the flanks, so a head-on contact really is one gun until the snake
   unfolds. The real gift of a line — every sector forward — is equally real,
   which makes it the pre-breach and assault formation it is in doctrine.
4. Formation is squad-wide and instant on a key. Doctrine would stagger the
   transition; the game trades that for control feel, the same trade the
   command wheel already made.

---

## CHANGELOG
- v1.0 (2026-08-07): Initial release — six-chapter parallel research sweep plus synthesis.
- v1.1 (2026-08-14): Added §7 — movement formations, techniques, battle drills (FM 3-21.8 / Ranger Handbook), and the fun-versus-tactics calls for the in-game formation system.
