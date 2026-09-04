// file: tests.js (raycaster-poc/tests)
// version: 1.1
// author: Sam Cao
// created: 2026-09-04
// last_updated: 2026-09-04
// description: Headless assertions for the raycaster column solver, world queries, weapon model, loadouts, the spawn reaction clock, and impact feedback.
// ai_update: Update last_updated and version. Append changelog at bottom.

let PASS = 0, FAIL = 0;
function ok(label, cond, detail) {
  if (cond) { PASS++; console.log("  CORRECT  " + label + (detail ? "   " + detail : "")); }
  else { FAIL++; console.log("  WRONG    " + label + (detail ? "   " + detail : "")); }
}
function near(a, b, tol) { return Math.abs(a - b) <= tol; }
function head(s) { console.log("\n== " + s + " =="); }

// ---------------------------------------------------------------------------
head("map");
initGame();
ok("map parsed", level.w === 40 && level.h === 20, `${level.w}x${level.h}`);
ok("player start found", !!level.start, JSON.stringify(level.start));
ok("enemies spawned", game.enemies.length === 6, game.enemies.length + " enemies");
ok("doors found", level.doors.length === 5, level.doors.length + " doors");
ok("border is concrete", materialAt(0, 0) === MATERIALS.concrete);
ok("out of bounds is concrete", materialAt(-1, 5) === MATERIALS.concrete);
ok("open floor is air", materialAt(3, 3) === MATERIALS.air);

// ---------------------------------------------------------------------------
head("column solver: no fisheye");
// Stand in the open, square onto the north wall, and look straight at it.
// Every column must come back the same perpendicular distance. If the solver
// used euclidean distance instead, the edge columns would read 1/cos(37.5°)
// = 1.26x long and the wall would bow.
{
  const px = 30 * TILE + TILE / 2, py = 4 * TILE + TILE / 2;
  const cols = castColumns(px, py, -Math.PI / 2, TUNE.fov, 200, 900);
  const hit = cols.filter(c => c.hit);
  const ds = hit.map(c => c.dist);
  const min = Math.min(...ds), max = Math.max(...ds);
  ok("all columns hit something", hit.length === 200, hit.length + "/200");
  ok("flat wall reads flat", near(min, max, 1.0), `spread ${(max - min).toFixed(3)}px  (min ${min.toFixed(2)} max ${max.toFixed(2)})`);

  // and prove the failure mode we are avoiding is real: euclidean distance
  // across the same view would vary by ~26%.
  const halfFov = TUNE.fov / 2;
  const euclidRatio = 1 / Math.cos(halfFov);
  ok("fisheye would have been visible", euclidRatio > 1.25,
     `uncorrected edge would be ${((euclidRatio - 1) * 100).toFixed(1)}% long`);
}

head("column solver: geometry");
{
  const px = 30 * TILE + TILE / 2, py = 4 * TILE + TILE / 2;
  const cols = castColumns(px, py, -Math.PI / 2, TUNE.fov, 64, 900);
  // wall is at y=0 (row 0 is concrete); player centre is in row 4.
  // distance from py to the far face of row 0 is py - TILE.
  const want = py - TILE;
  ok("distance to the north wall is right", near(cols[32].dist, want, 1.5),
     `got ${cols[32].dist.toFixed(1)} want ~${want}`);
  ok("texU stays in range", cols.every(c => c.texU >= 0 && c.texU <= 1));
  ok("side is 0 or 1", cols.every(c => c.side === 0 || c.side === 1));
  ok("north wall reports a Y face", cols[32].side === 1, "side=" + cols[32].side);
}

head("column solver: termination");
{
  // Cast from inside solid geometry and from every angle; nothing may hang or
  // return NaN.
  let bad = 0;
  for (let a = 0; a < 360; a += 7) {
    const cols = castColumns(20 * TILE, 10 * TILE, deg(a), TUNE.fov, 48, 900);
    for (const c of cols) if (!isFinite(c.dist) || c.dist < 0) bad++;
  }
  ok("no NaN or negative distances over 360°", bad === 0, bad + " bad columns");
}

// ---------------------------------------------------------------------------
head("sight versus bullets");
ok("drywall blocks sight", MATERIALS.drywall.opaque === true);
ok("drywall does not stop a rifle round", MATERIALS.drywall.resist < AMMO.fmj.pen,
   `resist ${MATERIALS.drywall.resist} vs pen ${AMMO.fmj.pen}`);
ok("glass passes sight", MATERIALS.glass.opaque === false);
ok("glass stops a body", solidForMove(30, 7) === true);
ok("concrete stops everything", MATERIALS.concrete.resist > AMMO.ap.pen);

// ---------------------------------------------------------------------------
head("penetration: caliber against material");
function shootThrough(ammoKey, matKey) {
  const b = { pen: AMMO[ammoKey].pen, dmg: 34, ang: 0, x: 0, y: 0,
              traveled: 0, alive: true, penetrated: [], side: "player" };
  resolveImpact(b, 0, 0, 0, 0, MATERIALS[matKey]);
  return b.alive;
}
ok("5.56 FMJ crosses drywall", shootThrough("fmj", "drywall"));
ok("5.56 FMJ crosses a wood partition", shootThrough("fmj", "wood"));
ok("5.56 FMJ does NOT cross brick", !shootThrough("fmj", "brick"),
   `pen ${AMMO.fmj.pen} vs resist ${MATERIALS.brick.resist}`);
ok("5.56 AP crosses brick", shootThrough("ap", "brick"));
ok("5.56 HP does NOT cross drywall", !shootThrough("hp", "drywall"),
   `pen ${AMMO.hp.pen} vs resist ${MATERIALS.drywall.resist}`);
ok("nothing crosses concrete", !shootThrough("ap", "concrete"));
{
  const b = { pen: 26, dmg: 34, ang: 0, x: 0, y: 0, traveled: 0, alive: true,
              penetrated: [], side: "player" };
  resolveImpact(b, 0, 0, 0, 0, MATERIALS.drywall);
  ok("damage falls off through cover", b.dmg < 34 && b.dmg === 34 * MATERIALS.drywall.dmgKeep,
     `34 -> ${b.dmg.toFixed(1)}`);
  ok("penetration budget is spent", b.pen === 26 - MATERIALS.drywall.resist, "pen now " + b.pen);
  ok("the round remembers what it crossed", b.penetrated.length === 1, b.penetrated.join(","));
}

// ---------------------------------------------------------------------------
head("the spread model");
{
  const p = game.player;
  const base = { weapon: p.weapon, recoil: 0, turnBloom: 0, sprinting: false,
                 steady: false, moving: false, walking: false };
  const idle = currentSpread(base);
  ok("a still shooter is at the weapon's floor", near(idle, p.weapon.spreadBase, 1e-9),
     (idle * 180 / Math.PI).toFixed(2) + "°");
  ok("steady tightens the cone", currentSpread({ ...base, steady: true }) < idle);
  ok("movement opens it", currentSpread({ ...base, moving: true }) > idle);
  ok("walking opens it less than running",
     currentSpread({ ...base, moving: true, walking: true }) < currentSpread({ ...base, moving: true }));
  ok("sprinting is worst", currentSpread({ ...base, sprinting: true }) > currentSpread({ ...base, moving: true }));
  ok("recoil adds directly", near(currentSpread({ ...base, recoil: deg(2) }), idle + deg(2), 1e-9));
  ok("a snapped shot is worse than a pied one",
     currentSpread({ ...base, turnBloom: deg(6) }) > idle);
  ok("turn bloom is capped", near(currentSpread({ ...base, turnBloom: deg(90) }),
     idle + TUNE.turnBloomMax, 1e-9), "cap " + (TUNE.turnBloomMax * 180 / Math.PI) + "°");
}

head("recoil ramps and settles");
{
  initGame();
  const p = game.player;
  const before = p.recoil;
  for (let i = 0; i < 6; i++) { p.cool = 0; fire(p); }
  const peak = p.recoil;
  ok("holding the trigger walks the cone up", peak > before, (peak * 180 / Math.PI).toFixed(2) + "°");
  ok("recoil is capped at the weapon's max", peak <= p.weapon.recoilMax + 1e-9);
  for (let i = 0; i < 120; i++) { p.recoil = Math.max(0, p.recoil - (1 / 60) * p.weapon.recoilDecay); }
  ok("it settles when you stop", p.recoil === 0);
}

// ---------------------------------------------------------------------------
head("doors");
{
  initGame();
  const d = level.doors[0];
  ok("a closed door is opaque", materialAt(d.tx, d.ty).opaque === true);
  ok("a closed door blocks a body", solidForMove(d.tx, d.ty) === true);
  d.open = 1;
  ok("an open door passes sight", materialAt(d.tx, d.ty) === MATERIALS.air);
  ok("an open door passes a body", solidForMove(d.tx, d.ty) === false);
  d.open = 0.55;
  ok("half open passes sight before it passes a body",
     materialAt(d.tx, d.ty) === MATERIALS.air && solidForMove(d.tx, d.ty) === true);
  d.open = 0;
}

// ---------------------------------------------------------------------------
head("movement does not leak through walls");
{
  initGame();
  const p = game.player;
  let escapes = 0;
  for (let i = 0; i < 4000; i++) {
    const a = Math.random() * Math.PI * 2;
    const m = moveCircle(p.x, p.y, Math.cos(a) * 9, Math.sin(a) * 9, p.r);
    p.x = m.x; p.y = m.y;
    if (circleHits(p.x, p.y, p.r)) escapes++;
  }
  ok("4000 random steps never end inside geometry", escapes === 0, escapes + " escapes");
  ok("player stayed in bounds",
     p.x > 0 && p.y > 0 && p.x < level.w * TILE && p.y < level.h * TILE,
     `${p.x.toFixed(0)},${p.y.toFixed(0)}`);
}

// ---------------------------------------------------------------------------
head("line of sight");
{
  initGame();
  const p = game.player;
  ok("you can see your own position", lineOfSight(p.x, p.y, p.x, p.y));
  ok("you cannot see through the concrete border",
     !lineOfSight(2 * TILE + 16, 2 * TILE + 16, 2 * TILE + 16, -TILE));
  const openA = { x: 3 * TILE + 16, y: 3 * TILE + 16 }, openB = { x: 8 * TILE + 16, y: 3 * TILE + 16 };
  ok("you can see across open floor", lineOfSight(openA.x, openA.y, openB.x, openB.y));
}

// ---------------------------------------------------------------------------
head("a shot resolves end to end");
{
  initGame();
  const p = game.player;
  const e = game.enemies[0];
  // put an enemy directly in front of the player, in the open, and fire
  p.x = 5 * TILE + 16; p.y = 3 * TILE + 16;
  p.face = 0; p.recoil = 0; p.turnBloom = 0; p.moving = false;
  e.x = p.x + 5 * TILE; e.y = p.y; e.alive = true; e.hp = 70;
  for (const other of game.enemies) if (other !== e) other.alive = false;
  const hpBefore = e.hp;
  let fired = 0;
  for (let i = 0; i < 240 && e.hp === hpBefore; i++) {
    p.cool = 0; p.mag = p.weapon.mag; fire(p); fired++;
    for (let s = 0; s < 12; s++) updateBullets(1 / 240);
  }
  ok("rounds reach a target in the open", e.hp < hpBefore, `${fired} shot(s), hp ${hpBefore} -> ${e.hp.toFixed(1)}`);
  ok("hits were counted", game.hits > 0, game.hits + " hits of " + game.shots + " shots");
}

head("a wall between you and the target actually matters");
{
  initGame();
  const p = game.player;
  for (const other of game.enemies) other.alive = false;
  const e = game.enemies[0];
  e.alive = true; e.hp = 70;
  // column 11 is a concrete pillar wall running down the map; put the enemy
  // on the far side of it and shoot at the wall.
  p.x = 5 * TILE + 16; p.y = 15 * TILE + 16; p.face = 0;
  e.x = 14 * TILE + 16; e.y = 15 * TILE + 16;
  ok("the concrete column is between them", !lineOfSight(p.x, p.y, e.x, e.y));
  const hpBefore = e.hp;
  for (let i = 0; i < 30; i++) {
    p.cool = 0; p.mag = p.weapon.mag; fire(p);
    for (let s = 0; s < 24; s++) updateBullets(1 / 240);
  }
  ok("concrete stops every round", e.hp === hpBefore, "hp " + e.hp);
}

// ---------------------------------------------------------------------------
head("shooting THROUGH a wall — the headline mechanic");
{
  // Map row 7 columns 1-7 are drywall (resist 5). Stand south of it and put a
  // man on the far side, out of sight. FMJ (pen 26) must reach him; HP (pen 4)
  // must not.
  function tryThroughWall(ammoKey) {
    initGame();
    const p = game.player;
    for (const o of game.enemies) o.alive = false;
    const e = game.enemies[0];
    e.alive = true; e.hp = 500;                 // survive so we measure damage
    p.x = 4 * TILE + 16; p.y = 9 * TILE + 16; p.face = -Math.PI / 2;
    p.recoil = 0; p.turnBloom = 0; p.moving = false; p.sprinting = false;
    e.x = 4 * TILE + 16; e.y = 5 * TILE + 16;
    const blind = !lineOfSight(p.x, p.y, e.x, e.y);
    p.ammoType = ammoKey;
    const hp0 = e.hp;
    for (let i = 0; i < 40; i++) {
      p.cool = 0; p.mag = p.weapon.mag; fire(p);
      for (let st = 0; st < 30; st++) updateBullets(1 / 240);
    }
    return { blind, dealt: hp0 - e.hp, wall: materialAt(4, 7) };
  }
  const fmj = tryThroughWall("fmj");   // pen 26 against the drywall's resist 5
  ok("the wall between them is drywall", fmj.wall === MATERIALS.drywall);
  ok("he is not visible through it", fmj.blind);
  ok("5.56 FMJ kills through drywall", fmj.dealt > 0, "dealt " + fmj.dealt.toFixed(1));
  ok("penetrations were counted", game.penetrations > 0, game.penetrations + " crossings");

  const hp = tryThroughWall("hp");     // pen 4, which does not beat resist 5
  ok("5.56 HP does NOT reach him through the same wall", hp.dealt === 0,
     "dealt " + hp.dealt.toFixed(1));
}

// ---------------------------------------------------------------------------
head("the Pages pointer stays in step with the build");
{
  const fs = require("fs"), path = require("path");
  // run.sh cds into tests/, and the suite is bundled into /tmp, so __dirname
  // is useless here. cwd is the anchor.
  const dir = path.join(process.cwd(), "..");
  const builds = fs.readdirSync(dir).filter(f => /^raycaster_poc_v.*\.html$/.test(f));
  ok("exactly one build file exists", builds.length === 1, builds.join(", ") || "none");
  const idx = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const targets = [...idx.matchAll(/raycaster_poc_v[0-9.]+\.html/g)].map(m => m[0]);
  ok("index.html names a redirect target", targets.length > 0, targets.length + " references");
  ok("every reference points at the build that exists",
     builds.length === 1 && targets.every(t => t === builds[0]),
     [...new Set(targets)].join(", ") + " vs " + builds[0]);
  ok("the pointer refuses to be cached", /no-store/.test(idx));
}

// ---------------------------------------------------------------------------
head("the sim runs without exploding");
{
  initGame();
  let err = null;
  try { for (let i = 0; i < 1800; i++) update(1 / 60); }
  catch (ex) { err = ex; }
  ok("30 simulated seconds with no exception", !err, err ? err.message : "");
  ok("bullets are reaped", game.bullets.length < 400, game.bullets.length + " in flight");
  ok("player is still on the map",
     game.player.x > 0 && game.player.x < level.w * TILE, game.player.x.toFixed(0));
}


// ---------------------------------------------------------------------------
head("the spawn is survivable  (v1.0 killed you 200/200 in 0.92s)");
{
  // v1.0 had no settle and no reaction clock: every enemy went from zero to
  // firing in a flat 0.23s, and one of them sits 6.3 tiles from the start with
  // clear line of sight. Standing still and never firing was a guaranteed death
  // inside a second. This is the regression guard for that.
  let deaths = 0, firstShot = [], N = 120;
  for (let i = 0; i < N; i++) {
    initGame();
    let shot = null;
    for (let f = 0; f < 60 * 6; f++) {
      update(1 / 60);
      if (shot === null && game.bullets.some(b => b.side === "enemy")) shot = f / 60;
      if (!game.player.alive) { deaths++; break; }
    }
    if (shot !== null) firstShot.push(shot);
  }
  const earliest = firstShot.length ? Math.min(...firstShot) : Infinity;
  ok("nobody shoots during the settle", earliest >= TUNE.missionSettle,
     "earliest incoming round " + earliest.toFixed(2) + "s vs settle " + TUNE.missionSettle + "s");
  ok("you are not dead before the settle expires", deaths === 0 || earliest >= TUNE.missionSettle,
     deaths + "/" + N + " died within 6s");
  // The clock is a ROLL, not a constant. v1.0's flat ramp produced one value.
  const spread = firstShot.length > 1 ? Math.max(...firstShot) - earliest : 0;
  ok("the reaction clock varies between spawns", spread > 0.15,
     "spread " + spread.toFixed(2) + "s across " + firstShot.length + " runs");
}

head("gunfire is exempt from the settle");
{
  initGame();
  ok("the settle is running at spawn", game.settleT > 0, game.settleT.toFixed(2) + "s");
  fire(game.player);
  ok("your first round ends it for everyone", game.settleT === 0,
     "otherwise the opening beat would be a free clear");
}

head("the garrison carries an AKM, not your MP5");
{
  initGame();
  const e = game.enemies[0];
  ok("enemy weapon is the AKM", e.weapon === AKM, e.guns[0].name);
  ok("it is worse than yours", AKM.spreadBase > PRIMARIES.carbine.w.spreadBase,
     `${(AKM.spreadBase * 180 / Math.PI).toFixed(2)}deg vs ${(PRIMARIES.carbine.w.spreadBase * 180 / Math.PI).toFixed(2)}deg`);
  ok("it fires in bursts", Array.isArray(AKM.burst) && Array.isArray(AKM.burstPause),
     AKM.burst.join("-") + " rounds, then " + AKM.burstPause.join("-") + "s");
  // Burst discipline means a pause actually lands.
  let paused = false;
  for (let i = 0; i < 40 && !paused; i++) { e.cool = 0; e.mag = 30; fire(e); if (e.burstPause > 0) paused = true; }
  ok("a burst ends in a pause", paused, "burstPause " + e.burstPause.toFixed(2) + "s");
}

head("weapon numbers match top-down-tactical v0.89");
{
  // v1.0 was ported from a build predating the accuracy pass and carried the
  // rejected values. These are the current ones; this guard fails on drift.
  const d = a => +(a * 180 / Math.PI).toFixed(2);
  ok("carbine cone is 0.34deg, not the old 0.54", d(PRIMARIES.carbine.w.spreadBase) === 0.34);
  ok("carbine reaches 1150, not the old 900", PRIMARIES.carbine.w.range === 1150);
  ok("carbine reloads in 1.45s, not the old 1.9", PRIMARIES.carbine.w.reload === 1.45);
  ok("shotgun cycles at 180rpm, not the old 95", PRIMARIES.shotgun.w.rpm === 180);
  ok("shotgun no longer cycles slower than the DMR",
     PRIMARIES.shotgun.w.rpm > PRIMARIES.dmr.w.rpm,
     `${PRIMARIES.shotgun.w.rpm} vs ${PRIMARIES.dmr.w.rpm}`);
  ok("buckshot patterns at 4.4deg, not the old 7", d(AMMO.buck.spread) === 4.4);
  ok("birdshot patterns at 7.2deg, not the old 11", d(AMMO.bird.spread) === 7.2);
  ok("DMR cone is 0.19deg, not the old 0.32", d(PRIMARIES.dmr.w.spreadBase) === 0.19);
  ok("SMG reloads in 1.15s, not the old 1.8", PRIMARIES.smg.w.reload === 1.15);
  ok("a buck pattern is narrower than a doorway across a room",
     Math.tan(AMMO.buck.spread / 2) * 2 * (10 * TILE) < TILE,
     (Math.tan(AMMO.buck.spread / 2) * 2 * (10 * TILE)).toFixed(1) + "px at 10 tiles vs a " + TILE + "px door");
}

head("one primary, picked at the briefing, plus a sidearm on scroll");
{
  initGame();
  const p = game.player;
  ok("six primaries to choose between", PRIMARY_KEYS.length === 6, PRIMARY_KEYS.join(" "));
  // A missing id silently falls back to the carbine's shape, so the shield man
  // was drawn holding a rifle. Caught in a screenshot, not by any assertion.
  ok("every primary names a viewmodel shape",
     PRIMARY_KEYS.every(k => PRIMARIES[k].id === k),
     PRIMARY_KEYS.filter(k => PRIMARIES[k].id !== k).join(",") || "all six");
  ok("the sidearm names one too", SIDEARM.id === "sidearm");
  ok("you carry exactly two guns", p.guns.length === 2, p.guns.map(g => g.name).join(" + "));
  ok("slot 1 is always the sidearm", p.guns[1].name === SIDEARM.name);
  const before = p.guns[0].name;
  swapGun(p);
  ok("scroll reaches the sidearm", p.weapon === SIDEARM.w, p.guns[p.gunIndex].name);
  ok("the swap costs no dead time", p.cool === 0, "Sam's call: the worse gun IS the price");
  ok("the sidearm beats reloading the primary", SIDEARM.w.reload < PRIMARIES.saw.w.reload,
     `${SIDEARM.w.reload}s vs the SAW's ${PRIMARIES.saw.w.reload}s`);
  swapGun(p);
  ok("and back to the primary", p.guns[p.gunIndex].name === before, before);
  // Ammo cycling belongs to the primary and costs most of a reload.
  p.reloading = 0;
  const msg = cycleAmmo(p);
  ok("X changes what the primary is loaded with", p.ammoType !== "fmj", msg);
  ok("and it costs most of a reload", p.reloading > p.weapon.reload * 0.5,
     p.reloading.toFixed(2) + "s");
  swapGun(p);
  ok("the sidearm feeds what it feeds", cycleAmmo(p).includes("feeds"));
}

head("the shield: scroll STOWS it");
{
  game.loadout.primary = "shield"; game.loadout.ammo = "pistol";
  initGame();
  const p = game.player;
  ok("the bunker is up on the primary slot", shieldUp(p), p.shieldHp + "hp");
  ok("it costs you speed while it is up", moveMulOf(p) < 1, moveMulOf(p) + "x");
  const coneUp = p.weapon.spreadBase, reloadUp = p.weapon.reload;
  swapGun(p);
  ok("swapping to the sidearm stows it", !shieldUp(p));
  ok("stowed, you get your legs back", moveMulOf(p) === 1);
  ok("stowed, the cone tightens", p.weapon.spreadBase < coneUp,
     `${(p.weapon.spreadBase * 180 / Math.PI).toFixed(2)}deg from ${(coneUp * 180 / Math.PI).toFixed(2)}deg`);
  ok("stowed, the reload speeds up", p.weapon.reload < reloadUp,
     `${p.weapon.reload}s from ${reloadUp}s`);
  swapGun(p);
  ok("and it is reversible", shieldUp(p), "the live question is WHEN to stow it");

  // Directional: it is a wall you POINT. He faces +x, so a round arriving from
  // in front of him is one TRAVELLING -x. Passing travelAng 0 here would be a
  // round taking him in the back, which the bunker is supposed to ignore.
  p.face = 0;
  p.shieldHp = SHIELD.hp;
  const front = shieldBlock(p, 100, AMMO.pistol.pen, Math.PI);
  ok("a round from the front is eaten", front < 100, front.toFixed(1) + " of 100 got through");
  p.shieldHp = SHIELD.hp;
  const back = shieldBlock(p, 100, AMMO.pistol.pen, 0);
  ok("a round from behind is not", back === 100, "you are carrying it, not wearing it");
  p.shieldHp = SHIELD.hp;
  const flank = shieldBlock(p, 100, AMMO.pistol.pen, -Math.PI / 2);
  ok("a round from the flank is not", flank === 100, "worth nothing from the side");
  p.shieldHp = SHIELD.hp;
  ok("carrying it costs the pool", (shieldBlock(p, 100, AMMO.pistol.pen, Math.PI), p.shieldHp < SHIELD.hp),
     p.shieldHp.toFixed(0) + " of " + SHIELD.hp + " left");
  p.shieldHp = SHIELD.hp;
  ok("AP defeats it", shieldBlock(p, 100, AMMO.ap.pen, Math.PI) > 50,
     "pen " + AMMO.ap.pen + " against rating " + SHIELD.rating);
  p.shieldHp = 0;
  ok("a shot-through bunker stops nothing", shieldBlock(p, 100, AMMO.pistol.pen, Math.PI) === 100,
     "and you are still carrying the weight");
  game.loadout.primary = "carbine"; game.loadout.ammo = "fmj";
}

head("grenades");
{
  initGame();
  const p = game.player;
  p.x = 3 * TILE + 16; p.y = 2 * TILE + 16; p.face = 0;
  const from = { x: p.x, y: p.y };
  ok("MMB throws one", throwNade(p, "frag") && game.nades.length === 1);
  ok("and it will not throw a second immediately", !throwNade(p, "frag"),
     "the only cost is cadence");
  let landed = null;
  for (let i = 0; i < 60 * 3; i++) {
    if (game.nades[0]) landed = { x: game.nades[0].x, y: game.nades[0].y };
    updateNades(1 / 60);
  }
  ok("it goes off", game.nades.length === 0);
  const carry = Math.hypot(landed.x - from.x, landed.y - from.y) / TILE;
  ok("a throw carries across a room, not across the map", carry > 3 && carry < 9,
     carry.toFixed(1) + " tiles");

  // Damage, staged rather than thrown, so the assertion is about the blast and
  // not about where a throw happens to land.
  initGame();
  const near2 = game.enemies[1];
  near2.x = 4 * TILE + 16; near2.y = 10 * TILE + 16;      // 2 tiles south, open floor
  const nhp = near2.hp;
  game.nades.push({ x: 4 * TILE + 16, y: 8 * TILE + 16, vx: 0, vy: 0, fuse: 0.01,
                    kind: "frag", side: "player", alive: true });
  for (let i = 0; i < 30; i++) updateNades(1 / 60);
  ok("a frag hurts what it can see", near2.hp < nhp, (nhp - near2.hp).toFixed(1) + " damage");

  // Same range, same charge, one drywall partition in between. Row 7 is drywall.
  initGame();
  const behind = game.enemies[1];
  behind.x = 4 * TILE + 16; behind.y = 6 * TILE + 16;     // 2 tiles north, through row 7
  const bhp = behind.hp;
  ok("the partition really is between them",
     !lineOfSight(4 * TILE + 16, 8 * TILE + 16, behind.x, behind.y));
  ok("and it is inside the blast radius",
     Math.hypot(0, (8 - 6) * TILE) < GRENADES.frag.radius,
     ((8 - 6) * TILE) + "px vs a " + GRENADES.frag.radius + "px radius");
  game.nades.push({ x: 4 * TILE + 16, y: 8 * TILE + 16, vx: 0, vy: 0, fuse: 0.01,
                    kind: "frag", side: "player", alive: true });
  for (let i = 0; i < 30; i++) updateNades(1 / 60);
  ok("it does not reach through a wall", behind.hp === bhp);

  // flash blinds instead of killing
  initGame();
  const t = game.enemies[1], thp = t.hp;
  game.nades.push({ x: t.x, y: t.y, vx: 0, vy: 0, fuse: 0.01, kind: "flash", side: "player", alive: true });
  for (let i = 0; i < 30; i++) updateNades(1 / 60);
  ok("a flashbang blinds", t.blind > 0, t.blind.toFixed(2) + "s");
  ok("and does not wound", t.hp === thp);
  t.face = Math.atan2(game.player.y - t.y, game.player.x - t.x);
  let firedWhileBlind = false;
  for (let i = 0; i < 60 && t.blind > 0; i++) { updateEnemies(1 / 60); if (game.bullets.length) firedWhileBlind = true; }
  ok("a blinded man does not shoot", !firedWhileBlind);
}

head("you can finally SEE where the rounds went");
{
  // v1.0 pushed spark and blood into game.fx and drew neither, and never drew
  // game.bullets at all. Nothing here asserts pixels — that is a Chromium job —
  // but the state the painter reads has to exist and be reachable.
  initGame();
  const p = game.player;
  p.x = 3 * TILE + 16; p.y = 2 * TILE + 16; p.face = -Math.PI / 2;   // face the north wall
  p.recoil = 0; p.turnBloom = 0; p.moving = false;
  game.decals = [];
  p.cool = 0; p.mag = 30; fire(p);
  for (let i = 0; i < 60; i++) updateBullets(1 / 240);
  ok("a round that strikes a wall leaves a hole", game.decals.length > 0,
     game.decals.length + " decals");
  ok("and throws a spark", game.fx.some(f => f.kind === "spark"));
  ok("the painter can find both", typeof drawDecals === "function" && typeof drawWorldFx === "function");

  // the cap holds
  for (let i = 0; i < TUNE.decalMax + 40; i++) addDecal(100, 100, "player");
  ok("holes are capped", game.decals.length <= TUNE.decalMax,
     game.decals.length + " of " + TUNE.decalMax);

  // a round into a man produces blood AND a hit marker
  initGame();
  const e2 = game.enemies[1];
  const p2 = game.player;
  p2.x = e2.x - 60; p2.y = e2.y; p2.face = 0;
  p2.recoil = 0; p2.turnBloom = 0; p2.moving = false; p2.cool = 0; p2.mag = 30;
  fire(p2);
  for (let i = 0; i < 60; i++) updateBullets(1 / 240);
  ok("a hit on a man bleeds", game.fx.some(f => f.kind === "blood"));
  ok("and posts a hit marker", game.fx.some(f => f.kind === "hitmark" || f.kind === "killmark"),
     "the unambiguous 'that one landed' signal");
}

head("RMB is the source game's STEADY, wearing a narrower field");
{
  initGame();
  const p = game.player;
  p.recoil = 0; p.turnBloom = 0; p.moving = false; p.sprinting = false;
  p.steady = false; const hip = currentSpread(p);
  p.steady = true;  const ads = currentSpread(p);
  ok("steady tightens the cone by steadyMul", near(ads, hip * TUNE.steadyMul, 1e-9),
     `${(hip * 180 / Math.PI).toFixed(3)}deg -> ${(ads * 180 / Math.PI).toFixed(3)}deg`);
  game.adsT = 0; ok("hip fire uses the full field", near(fovNow(), TUNE.fov, 1e-9));
  game.adsT = 1; ok("ADS pulls it in", fovNow() < TUNE.fov,
     `${(TUNE.fov * 180 / Math.PI).toFixed(0)}deg -> ${(fovNow() * 180 / Math.PI).toFixed(0)}deg`);
  game.adsT = 0;
}

// ---------------------------------------------------------------------------
console.log(`\n${PASS} CORRECT, ${FAIL} WRONG`);
if (FAIL > 0) process.exit(1);

// CHANGELOG
// v1.0 (2026-09-04): Initial suite — solver, fisheye, penetration, spread, doors, movement, LOS.
// v1.1 (2026-09-04): Spawn survivability and the reaction clock; settle and its
//   gunfire exemption; the AKM and burst discipline; a drift guard pinning every
//   weapon number to v0.89; briefing loadouts, the sidearm swap and ammo cycling;
//   the shield stow, its arc and AP defeating it; grenades; and the impact
//   feedback state that v1.0 created and never drew.
