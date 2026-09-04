// file: tests.js (raycaster-poc/tests)
// version: 1.0
// author: Sam Cao
// created: 2026-09-04
// last_updated: 2026-09-04
// description: Headless assertions for the raycaster column solver, world queries, and weapon model.
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
  function tryThroughWall(ammoIdx) {
    initGame();
    const p = game.player;
    for (const o of game.enemies) o.alive = false;
    const e = game.enemies[0];
    e.alive = true; e.hp = 500;                 // survive so we measure damage
    p.x = 4 * TILE + 16; p.y = 9 * TILE + 16; p.face = -Math.PI / 2;
    p.recoil = 0; p.turnBloom = 0; p.moving = false; p.sprinting = false;
    e.x = 4 * TILE + 16; e.y = 5 * TILE + 16;
    const blind = !lineOfSight(p.x, p.y, e.x, e.y);
    p.ammoIdx = ammoIdx;
    const hp0 = e.hp;
    for (let i = 0; i < 40; i++) {
      p.cool = 0; p.mag = p.weapon.mag; fire(p);
      for (let st = 0; st < 30; st++) updateBullets(1 / 240);
    }
    return { blind, dealt: hp0 - e.hp, wall: materialAt(4, 7) };
  }
  const fmj = tryThroughWall(0);   // carbine slot 0 = fmj
  ok("the wall between them is drywall", fmj.wall === MATERIALS.drywall);
  ok("he is not visible through it", fmj.blind);
  ok("5.56 FMJ kills through drywall", fmj.dealt > 0, "dealt " + fmj.dealt.toFixed(1));
  ok("penetrations were counted", game.penetrations > 0, game.penetrations + " crossings");

  const hp = tryThroughWall(1);    // carbine slot 1 = hp, pen 4 vs resist 5
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
console.log(`\n${PASS} CORRECT, ${FAIL} WRONG`);
if (FAIL > 0) process.exit(1);

// CHANGELOG
// v1.0 (2026-09-04): Initial suite — solver, fisheye, penetration, spread, doors, movement, LOS.
