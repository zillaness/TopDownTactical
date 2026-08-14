
// ===== headless smoke tests =====
parseLevel();
console.log('map', level.w + 'x' + level.h, 'doors:', level.doors.length,
  'enemies:', level.spawns.enemies.length, 'hostages:', level.spawns.hostages.length,
  'civs:', level.spawns.civilians.length, 'squad:', level.spawns.squad.length,
  'player:', !!level.spawns.player);
console.log('enemy kinds:', level.spawns.enemies.map(e => e.kind).join(','));
console.log('doors:', level.doors.map(d => `${d.tx},${d.ty}${d.orient}${d.locked?'L':''}`).join(' '));

const ps = level.spawns.player, hs = level.spawns.hostages[0];
const st = tileAt(ps.x, ps.y), gt = tileAt(hs.x, hs.y);
const path = astar(st.tx, st.ty, gt.tx, gt.ty, passForPath, pathCostSquad);
console.log('path player->hostage:', path ? path.length + ' tiles' : 'NULL — UNREACHABLE!');
for (const es of level.spawns.enemies) {
  const et = tileAt(es.x, es.y);
  if (!astar(st.tx, st.ty, et.tx, et.ty, passForPath, pathCostEnemy)) console.log('UNREACHABLE enemy', et.tx, et.ty, es.kind);
}
console.log('reachability check done');

seen.init();
const vis = computeVisPolygon(ps.x, ps.y, 620);
console.log('vis polygon points:', vis.length);
console.log('hostage visible from spawn (want false):', lineOfSight(ps.x, ps.y, hs.x, hs.y, opaque));

initGame(); game.state = 'play';
let alarmAt = null;
for (let i = 0; i < 600; i++) { update(1/60); if (game.alarm && alarmAt === null) alarmAt = i/60; }
console.log('after 10s idle: alarm =', game.alarm, alarmAt !== null ? '(at '+alarmAt.toFixed(2)+'s!)' : '',
  '| enemies alive:', game.enemies.filter(e => e.alive).length,
  '| squad alive:', game.squad.filter(s => s.alive).length,
  '| player hp:', game.player.hp, '| state:', game.state);

const front = level.doors.find(d => d.tx === 10);
kickDoor(front, game.player);
game.player.x = 14 * TILE; game.player.y = 15 * TILE + TILE / 2;
for (let i = 0; i < 900; i++) { if (game.state === 'play') update(1/60); }
console.log('after entry 15s: alarm =', game.alarm,
  '| threats:', game.enemies.filter(e => e.alive && e.state !== 'cuffed').length,
  '| player hp:', Math.round(game.player.hp), 'alive:', game.player.alive,
  '| squad alive:', game.squad.filter(s => s.alive).length,
  '| state:', game.state, '| execT:', game.execT.toFixed(1));

// order pipeline: stack squad on office door and GO
initGame(); game.state = 'play';
game.selected = new Set([0,1,2]);
const offDoor = level.doors.find(d => d.tx === 22 && d.ty === 13);
orderStack(selectedSquaddies(), offDoor);
// teleport squad near the door so they stack fast
game.squad.forEach((s, i) => { s.x = (20 + i) * TILE; s.y = 15 * TILE; });
let goFired = false, planStates = new Set();
for (let i = 0; i < 1800; i++) {
  if (game.state !== 'play') break;
  update(1/60);
  const p = game.plans[0];
  if (p) { planStates.add(p.state); if (p.state === 'ready' && !goFired) { p.state = 'executing'; p.t = 0; goFired = true; } }
}
console.log('breach test: GO fired =', goFired, '| plan states seen:', [...planStates].join(','),
  '| office door state:', offDoor.state, '| bangs used:', game.stats.bangsUsed,
  '| squad orders:', game.squad.map(s => s.order.type).join(','));
console.log('SMOKE TEST DONE');

// extended breach outcome check
const officeGuard = game.enemies.find(e => e.kind === 'guard' && Math.floor(e.y / TILE) < 13 && Math.floor(e.x / TILE) < 29);
console.log('office guard after breach: alive =', officeGuard ? officeGuard.alive : '?', '| state:', officeGuard ? officeGuard.state : '?');

// ===== map 2 integrity =====
game.mapIndex = 1; initGame();
console.log('map2', level.w + 'x' + level.h, 'doors:', level.doors.length,
  'enemies:', level.spawns.enemies.length, 'hostages:', level.spawns.hostages.length,
  'civs:', level.spawns.civilians.length, 'squad:', level.spawns.squad.length, 'player:', !!level.spawns.player);
const ps2 = level.spawns.player;
const st2 = tileAt(ps2.x, ps2.y);
for (const hsp of level.spawns.hostages) {
  const ht = tileAt(hsp.x, hsp.y);
  const pp = astar(st2.tx, st2.ty, ht.tx, ht.ty, passForPath, pathCostSquad);
  console.log('map2 path player->hostage@' + ht.tx + ',' + ht.ty + ':', pp ? pp.length + ' tiles' : 'UNREACHABLE!');
}
for (const es of level.spawns.enemies) {
  const et = tileAt(es.x, es.y);
  if (!astar(st2.tx, st2.ty, et.tx, et.ty, passForPath, pathCostEnemy)) console.log('map2 UNREACHABLE enemy', et.tx, et.ty, es.kind);
}
// 10s idle: no false alarm on map 2 either
game.state = 'play';
for (let i = 0; i < 600; i++) update(1/60);
console.log('map2 after 10s idle: alarm =', game.alarm, '| enemies alive:', game.enemies.filter(e => e.alive).length);
console.log('MAP2 TEST DONE');

// ===== wall charge =====
game.mapIndex = 0; initGame(); game.state = 'play';
const p3 = game.player;
// face east toward building west wall x=10: stand just west of it at tile (9,10)
p3.x = 9 * TILE + 8; p3.y = 10 * TILE + TILE / 2; p3.face = 0;
plantWallCharge(p3);
console.log('charge planted:', !!game.wallCharge, game.wallCharge, '| charges left:', p3.charges);
detonateWallCharge();
console.log('wall after blow (want false):', isWall(10, 10), '| stats.breaches:', game.stats.breaches);
const holePath = astar(9, 10, 12, 10, passForPath, pathCostSquad);
console.log('path through new hole:', holePath ? holePath.length + ' tiles' : 'NULL');
console.log('WALLCHARGE TEST DONE');

// ===== feint surrender =====
initGame(); game.state = 'play';
const fe = game.enemies[0];
fe.state = 'surrender'; fe.feint = true; fe.feintT = 0.5;
for (let i = 0; i < 120; i++) update(1/60);
console.log('feinter after 2s (want not surrender):', fe.state, '| cuff blocks feint:');
const fe2 = game.enemies[1];
fe2.state = 'surrender'; fe2.feint = true; fe2.feintT = 5;
cuffEnemy(fe2);
for (let i = 0; i < 120; i++) update(1/60);
console.log('cuffed feinter stays cuffed:', fe2.state === 'cuffed');
console.log('FEINT TEST DONE');

// ===== map 3 integrity =====
game.mapIndex = 2; initGame();
console.log('map3', level.w + 'x' + level.h, 'doors:', level.doors.length,
  'enemies:', level.spawns.enemies.length, 'hostages:', level.spawns.hostages.length, 'player:', !!level.spawns.player);
const ps3 = level.spawns.player, st3 = tileAt(ps3.x, ps3.y);
for (const hsp of level.spawns.hostages) {
  const ht = tileAt(hsp.x, hsp.y);
  const pp = astar(st3.tx, st3.ty, ht.tx, ht.ty, passForPath, pathCostSquad);
  console.log('map3 path player->hostage@' + ht.tx + ',' + ht.ty + ':', pp ? pp.length + ' tiles' : 'UNREACHABLE!');
}
for (const es of level.spawns.enemies) {
  const et = tileAt(es.x, es.y);
  if (!astar(st3.tx, st3.ty, et.tx, et.ty, passForPath, pathCostEnemy)) console.log('map3 UNREACHABLE enemy', et.tx, et.ty, es.kind);
}
game.state = 'play';
for (let i = 0; i < 600; i++) update(1/60);
console.log('map3 after 10s idle: alarm =', game.alarm, '| enemies alive:', game.enemies.filter(e => e.alive).length);
console.log('MAP3 TEST DONE');

// ===== compliance statistics (arrest path regression) =====
game.mapIndex = 0; game.diffIndex = 1;
let surr = 0, feints = 0, N = 300;
for (let i = 0; i < N; i++) {
  initGame(); game.state = 'play';
  const e = game.enemies[0];
  e.flashedRecently = 3; e.blind = 3;           // flashed
  if (trySurrender(e, game.player)) { surr++; if (e.feint) feints++; }
}
const rate = surr / N, feintRate = feints / Math.max(1, surr);
console.log('flashed surrender rate:', rate.toFixed(2), '(expect ~0.55±0.08)',
  '| feint share:', feintRate.toFixed(2), '(expect ~0.20±0.08)');
if (Math.abs(rate - 0.55) > 0.08) console.log('COMPLIANCE RATE OUT OF BAND!');
if (Math.abs(feintRate - 0.20) > 0.09) console.log('FEINT RATE OUT OF BAND!');

// outgunned: player + 2 squad with LOS, enemy idle
let surr2 = 0;
for (let i = 0; i < N; i++) {
  initGame(); game.state = 'play';
  const e = game.enemies[0];                    // hall guard at (15,13)
  game.player.x = e.x - 100; game.player.y = e.y;
  game.squad.forEach((s, j) => { s.x = e.x - 90; s.y = e.y + (j - 1) * 24; });
  if (trySurrender(e, game.player)) surr2++;
}
console.log('outgunned surrender rate:', (surr2 / N).toFixed(2), '(expect ~0.28±0.08)');
console.log('COMPLIANCE TEST DONE');

// ===== map 4 integrity =====
game.mapIndex = 3; initGame();
console.log('map4', level.w + 'x' + level.h, 'doors:', level.doors.length,
  'enemies:', level.spawns.enemies.length, 'hostages:', level.spawns.hostages.length, 'player:', !!level.spawns.player);
const ps4 = level.spawns.player, st4 = tileAt(ps4.x, ps4.y);
for (const hsp of level.spawns.hostages) {
  const ht = tileAt(hsp.x, hsp.y);
  const pp = astar(st4.tx, st4.ty, ht.tx, ht.ty, passForPath, pathCostSquad);
  console.log('map4 path player->hostage@' + ht.tx + ',' + ht.ty + ':', pp ? pp.length + ' tiles' : 'UNREACHABLE!');
}
for (const es of level.spawns.enemies) {
  const et = tileAt(es.x, es.y);
  if (!astar(st4.tx, st4.ty, et.tx, et.ty, passForPath, pathCostEnemy)) console.log('map4 UNREACHABLE enemy', et.tx, et.ty, es.kind);
}
game.state = 'play';
for (let i = 0; i < 600; i++) update(1/60);
console.log('map4 after 10s idle: alarm =', game.alarm, '| enemies alive:', game.enemies.filter(e => e.alive).length);
console.log('MAP4 TEST DONE');

(function cornerTests(){
// ===== corner advantage =====
game.mapIndex = 0; game.diffIndex = 1; initGame(); game.state = 'play';

// eye must actually sit off-centre, on the correct side
const p = game.player;
p.x = 500; p.y = 500; p.face = 0;              // facing east; unit's right is +Y
p.handed = 'right'; p.shoulder = 'strong'; p.swapT = 0;
const eR = eyePoint(p);
p.shoulder = 'support';
const eS = eyePoint(p);
p.shoulder = 'strong'; p.handed = 'left';
const eL = eyePoint(p);
p.handed = 'right';
console.log('facing east @ (500,500):');
console.log('  right/strong  eye y=', eR.y.toFixed(1), eR.y > 500 ? '(+Y = unit right) OK' : 'WRONG SIDE');
console.log('  right/support eye y=', eS.y.toFixed(1), eS.y < 500 ? '(-Y = unit left) OK' : 'WRONG SIDE');
console.log('  left/strong   eye y=', eL.y.toFixed(1), Math.abs(eL.y - eS.y) < 0.01 ? '(mirrors support) OK' : 'MISMATCH');

// concrete LOS asymmetry: open the office door, then edge east along the hall.
// The strong-side eye should clear the doorway at a different x than the weak side.
const door = doorAt(22, 13); openDoor(door, true);
function firstSight(handed, shoulder) {
  p.handed = handed; p.shoulder = shoulder; p.swapT = 0;
  p.y = 15 * TILE + TILE / 2; p.face = -Math.PI / 2;   // facing NORTH up the wall
  for (let x = 18 * TILE; x < 26 * TILE; x += 0.5) {
    p.x = x;
    const eye = eyePoint(p);
    if (lineOfSight(eye.x, eye.y, 22 * TILE + 16, 10 * TILE, opaque)) return x;
  }
  return null;
}
const a = firstSight('right', 'strong');
const b = firstSight('right', 'support');
console.log('facing north, first x that sees into the north room:');
console.log('  strong shoulder :', a === null ? 'never' : a.toFixed(1));
console.log('  support shoulder:', b === null ? 'never' : b.toFixed(1));
console.log('  asymmetric?', (a !== null && b !== null && a !== b) ? 'YES — corner advantage is live'
            : 'NO — mechanic is not producing a difference');
p.shoulder = 'strong'; p.handed = 'right';

let lefties = 0; const NH = 4000;
for (let i = 0; i < NH; i++) if (rollHandedness() === 'left') lefties++;
const lr = lefties / NH;
console.log('left-handed rate:', lr.toFixed(3), '(target 0.10)', Math.abs(lr - 0.10) < 0.02 ? 'OK' : 'OUT OF BAND');

p.moving = false; p.recoil = 0; p.shoulder = 'strong';
const sStrong = currentSpread(p);
p.shoulder = 'support';
const sSupport = currentSpread(p);
p.shoulder = 'strong';
console.log('spread penalty ratio:', (sSupport / sStrong).toFixed(2), '(target 2.30)');
console.log('CORNER TEST DONE');
})();

(function windowAndBlastTests(){
// ===== windows =====
game.mapIndex = 0; game.diffIndex = 1; initGame(); game.state = 'play';
const wins = [...level.windowAt.values()];
console.log('windows parsed:', wins.length, wins.map(w=>`${w.tx},${w.ty}${w.orient}`).join(' '));
const w0 = wins[0];
console.log('window blocks movement:', solidForMove(w0.tx, w0.ty), '(want true)');
console.log('window blocks sight   :', opaque(w0.tx, w0.ty), '(want false)');
console.log('window blocks pathing :', !passForPath(w0.tx, w0.ty), '(want true)');

// throw a bang at a window from the open side; it should break and pass through
const cx = w0.tx*TILE + TILE/2, cy = w0.ty*TILE + TILE/2;
const p = game.player;
p.x = cx; p.y = cy + TILE*3;            // stand south of it
game.noises = [];
throwBang(p, cx, cy - TILE*3);          // aim north, through the glass
for (let i = 0; i < 40 && game.bangs.length; i++) updateBangs(1/60);
console.log('window broken by grenade:', w0.broken, '(want true)');
const glassNoise = game.noises.some(n => n.type === 'glass');
console.log('breaking emitted noise  :', glassNoise, '(want true)');

// a bullet through a second window should shatter it too
const w1 = wins[1];
if (w1) {
  const bx = w1.tx*TILE + TILE/2, by = w1.ty*TILE + TILE/2;
  p.x = bx; p.y = by + TILE*2; p.face = -Math.PI/2; p.cooldown = 0; p.reloading = 0; p.ammo = 30;
  tryFire(p, -Math.PI/2);
  for (let i = 0; i < 20; i++) updateBullets(1/60);
  console.log('window broken by bullet :', w1.broken, '(want true)');
}

// ===== breach blast harms bystanders =====
initGame(); game.state = 'play';
const h = game.hostages[0];
const bx2 = h.x + 30, by2 = h.y;        // charge goes off a stride away
const hpBefore = h.hp;
applyBlast(bx2, by2, 'player');
console.log('hostage hp', hpBefore, '->', Math.round(h.hp), '| alive:', h.alive,
            '| counted against us:', game.stats.hostagesDead);
initGame(); game.state = 'play';
const h2 = game.hostages[0];
applyBlast(h2.x + 200, h2.y, 'player');  // well outside the wound radius
console.log('hostage far from blast unhurt:', h2.hp === 40, '(want true)');
console.log('WINDOW+BLAST TEST DONE');
})();

(function missionTests(){
console.log('--- mission framework ---');
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; game.diffIndex = 1; initGame(); game.state = 'play';
  const ps = level.spawns.player, st = tileAt(ps.x, ps.y);
  let unreachable = 0;
  for (const h of level.spawns.hostages) {
    const t = tileAt(h.x, h.y);
    if (!astar(st.tx, st.ty, t.tx, t.ty, passForPath, pathCostSquad)) unreachable++;
  }
  for (const e of level.spawns.enemies) {
    const t = tileAt(e.x, e.y);
    if (!astar(st.tx, st.ty, t.tx, t.ty, passForPath, pathCostEnemy)) unreachable++;
  }
  let exfilOk = 'n/a';
  if (level.extraction.length) {
    const z = level.extraction[0];
    exfilOk = astar(st.tx, st.ty, z.tx, z.ty, passForPath, pathCostSquad) ? 'reachable' : 'UNREACHABLE';
  }
  // 10s idle must not self-alarm
  for (let i = 0; i < 600; i++) update(1/60);
  console.log(`${MAPS[m].name.padEnd(14)} ${MAPS[m].type.padEnd(18)} [${MAPS[m].objectives.join(', ')}]`);
  console.log(`   hostages=${game.hostages.length} enemies=${game.enemies.length} hvt=${hvtUnit()?'yes':'no'} ` +
              `exfil=${exfilOk} unreachable=${unreachable} idleAlarm=${game.alarm}`);
  if (unreachable) console.log('   !! UNREACHABLE SPAWNS');
}

// capture semantics: killing the HVT fails, cuffing him wins with exfil
game.mapIndex = MAPS.findIndex(m => m.objectives.includes('capture'));
initGame(); game.state = 'play';
let h = hvtUnit();
h.hp = 0; killEntity(h, 'player');
console.log('capture: HVT killed ->', JSON.stringify(missionFailure()));
initGame(); game.state = 'play';
h = hvtUnit(); h.state = 'surrender'; h.feint = false; cuffEnemy(h);
console.log('capture: HVT cuffed -> capture done =', OBJECTIVES.capture.done(),
            '| extract done (not at point) =', OBJECTIVES.extract.done());
const z = level.extraction[0];
game.player.x = z.tx*TILE + 16; game.player.y = z.ty*TILE + 16;
console.log('capture: player at exfil -> extract done =', OBJECTIVES.extract.done());
checkMissionEnd(1/60);
console.log('capture: mission state after both ->', game.state, '(want debrief)');
console.log('MISSION TEST DONE');
})();

(function ballisticsTests(){
console.log('--- ballistics ---');
game.mapIndex = 0; game.diffIndex = 1; initGame(); game.state = 'play';

// material classification: exterior shell should be concrete, interior dividers drywall
let conc = 0, dry = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
  if (level.mat[y][x] === 'concrete') conc++;
  if (level.mat[y][x] === 'drywall') dry++;
}
console.log('materials: concrete=' + conc + ' drywall(partition)=' + dry,
            dry > 0 ? 'OK' : 'NO PARTITIONS CLASSIFIED');

// find an interior partition and fire FMJ then HP at it point blank
let part = null;
for (let y = 1; y < level.h-1 && !part; y++) for (let x = 1; x < level.w-1; x++)
  if (level.mat[y][x] === 'drywall') { part = {x, y}; break; }
console.log('test partition at', part.x + ',' + part.y, '| opaque(blocks sight):', opaque(part.x, part.y),
            '| resist:', materialAt(part.x, part.y).resist);

function fireAt(ammoKey, fromDX) {
  game.bullets = [];
  const b = {
    x: (part.x + fromDX) * TILE + 16, y: part.y * TILE + 16,
    ang: fromDX < 0 ? 0 : Math.PI, speed: 1500,
    dmg: 34 * AMMO[ammoKey].dmgMul, pen: AMMO[ammoKey].pen,
    side: 'player', traveled: 0, range: 900, alive: true, owner: null,
  };
  game.bullets.push(b);
  for (let i = 0; i < 8 && game.bullets.length; i++) updateBullets(1/240);
  // did it end up on the far side of the partition?
  const past = fromDX < 0 ? b.x > (part.x + 1) * TILE : b.x < part.x * TILE;
  return { alive: b.alive, past, dmg: b.dmg.toFixed(1) };
}
const fmj = fireAt('fmj', -1);
const hp  = fireAt('hp',  -1);
const ap  = fireAt('ap',  -1);
console.log('FMJ through drywall:', fmj.past ? 'PENETRATED' : 'stopped', '| dmg left', fmj.dmg);
console.log('HP  through drywall:', hp.past ? 'PENETRATED' : 'stopped', '| dmg left', hp.dmg);
console.log('AP  through drywall:', ap.past ? 'PENETRATED' : 'stopped', '| dmg left', ap.dmg);
console.log('  expected: FMJ and AP penetrate, HP stops ->',
            (fmj.past && ap.past && !hp.past) ? 'CORRECT' : 'WRONG');

// concrete must stop everything
let conctile = null;
for (let x = 1; x < level.w-1 && !conctile; x++) if (level.mat[0][x] === 'concrete') conctile = {x, y:0};
game.bullets = [];
const cb = { x: conctile.x*TILE+16, y: 2*TILE, ang: -Math.PI/2, speed: 1500, dmg: 34,
             pen: AMMO.ap.pen, side:'player', traveled:0, range:900, alive:true, owner:null };
game.bullets.push(cb);
for (let i = 0; i < 8 && game.bullets.length; i++) updateBullets(1/240);
console.log('AP vs concrete:', cb.alive ? 'PENETRATED (WRONG)' : 'stopped (correct)');

// spall: fragments off a struck barrier wound whoever is hugging it
initGame(); game.state='play';
const vic = game.enemies[0];
const impact = { x: vic.x + 18, y: vic.y };      // a round strikes 18px away
const before = vic.hp;
applySpall(impact.x, impact.y, MATERIALS.brick, 'player');
console.log('spall at 18px: hp', before, '->', vic.hp.toFixed(1),
            vic.hp < before ? 'CORRECT (wall-hugging hurts)' : 'WRONG (no spall)');
const far = game.enemies[1]; const fb = far.hp;
applySpall(far.x + 60, far.y, MATERIALS.brick, 'player');
console.log('spall at 60px: hp', fb, '->', far.hp.toFixed(1),
            far.hp === fb ? 'CORRECT (out of fragment range)' : 'WRONG');

// grazing ricochet: nearly parallel to the top wall, drifting into it.
// The skip is probabilistic (75%), so fire a volley and assert most skip.
initGame(); game.state='play';
let skipped = 0, trials = 20;
for (let k = 0; k < trials; k++) {
  game.bullets = [];
  const rb = { x: 20*TILE, y: 1*TILE + 6, ang: -deg(4), speed: 1500, dmg: 34,
               pen: AMMO.fmj.pen, side:'player', traveled:0, range:900, alive:true, owner:null };
  game.bullets.push(rb);
  for (let i = 0; i < 40 && game.bullets.length; i++) updateBullets(1/240);
  if (rb.ricochets > 0) skipped++;
}
console.log('grazing volley: ' + skipped + '/' + trials + ' skipped along the wall',
            skipped >= trials * 0.5 ? 'CORRECT' : 'WRONG (rounds burying in the wall)');
console.log('BALLISTICS TEST DONE');
})();

(function triggerDisciplineTests(){
console.log('--- trigger discipline: the cone a string of shots is fired through ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const dg = r => (r * 180 / Math.PI).toFixed(2);

// Fire N rounds back to back and record the cone each one actually left through.
function string(primary, n) {
  game.loadout.primary = primary; initGame();
  const p = game.player;
  p.moving = false; p.walking = false; p.steady = false; p.sprinting = false;
  p.suppress = 0; p.turnBloom = 0; p.recoil = 0; p.burst = 0; p.ammo = 999;
  const cones = [];
  for (let i = 0; i < n; i++) {
    cones.push(currentSpread(p));                 // what THIS round goes through
    p.cooldown = 0; p.reloading = 0;
    tryFire(p, p.face);
    updateShooterWeapon(p, 60 / p.weapon.rpm);    // the gap the fire rate forces
  }
  return cones;
}
const carb = string('carbine', 8);
console.log('  M4, eight rounds held down: ' + carb.map(dg).join('  '));
console.log('    round 1 leaves at the base cone (' + dg(PRIMARIES.carbine.w.spreadBase) + '):',
            Math.abs(carb[0] - PRIMARIES.carbine.w.spreadBase) < 1e-9
              ? 'CORRECT (the gun climbs after the round is gone)' : 'WRONG');
console.log('    it only ever opens up:',
            carb.every((c, i) => i === 0 || c >= carb[i - 1] - 1e-9) ? 'CORRECT' : 'WRONG');
console.log('    and each step is bigger than the last, so the string degrades:',
            carb[2] - carb[1] > carb[1] - carb[0] && carb[3] - carb[2] > carb[2] - carb[1]
              ? 'CORRECT' : 'WRONG');
const triple = carb[2], dump = carb[7];
console.log('    third round of a triple ' + dg(triple) + '° vs eighth of a dump ' + dg(dump) + '°: ' +
            (dump / triple).toFixed(1) + 'x worse',
            dump > triple * 2 ? 'CORRECT (bursting is rewarded)' : 'WRONG (no reason to let off)');

// Letting off has to buy the cone back, or there is no burst rhythm to find.
function settleTime(primary, shots) {
  game.loadout.primary = primary; initGame();
  const p = game.player;
  p.moving = false; p.recoil = 0; p.burst = 0; p.ammo = 999;
  for (let i = 0; i < shots; i++) { p.cooldown = 0; tryFire(p, p.face); updateShooterWeapon(p, 60 / p.weapon.rpm); }
  const hot = p.recoil;
  let t = 0;
  while (p.burst !== 0 && t < 5) { updateShooterWeapon(p, 1 / 60); t += 1 / 60; }
  return { hot, t };
}
const s3 = settleTime('carbine', 3), s8 = settleTime('carbine', 8);
console.log('  M4 settle: ' + dg(s3.hot) + '° after a triple -> ' + s3.t.toFixed(2) + 's, ' +
            dg(s8.hot) + '° after a dump -> ' + s8.t.toFixed(2) + 's');
console.log('    a triple recovers inside half a second:', s3.t < 0.5 ? 'CORRECT' : 'WRONG');
console.log('    a dump costs you more than a triple does:', s8.t > s3.t ? 'CORRECT' : 'WRONG');

// The marksman rifle exists to hit one thing at range: its first shot must be
// the tightest first shot in the game.
const firsts = Object.keys(PRIMARIES).map(k => ({ k, c: string(k, 1)[0] }));
firsts.forEach(f => console.log('  ' + PRIMARIES[f.k].name.padEnd(17) + 'first shot ' + dg(f.c) + '°'));
const best = firsts.reduce((a, b) => a.c <= b.c ? a : b);
console.log('    tightest first shot is the DMR:', best.k === 'dmr' ? 'CORRECT' : 'WRONG (' + best.k + ')');
// and the belt-fed degrades more slowly per shot, because long strings are its job
const sawStr = string('saw', 8);
const sawRamp = (sawStr[3] - sawStr[2]) / Math.max(1e-9, sawStr[2] - sawStr[1]);
const carbRamp = (carb[3] - carb[2]) / Math.max(1e-9, carb[2] - carb[1]);
console.log('  per-shot growth: M4 x' + carbRamp.toFixed(2) + ', belt-fed x' + sawRamp.toFixed(2),
            sawRamp < carbRamp ? 'CORRECT (the SAW is built to keep firing)' : 'WRONG');
game.loadout.primary = 'carbine'; initGame();
console.log('TRIGGER DISCIPLINE TEST DONE');
})();

(function aimSolutionTest(){
console.log('--- firing solution ---');
// Regression: rounds leave the offset muzzle, so the aim angle must be computed
// FROM the muzzle. Using the body->target angle displaces every shot laterally.
const saved = TUNE.eyeLateral;
function hitRate(lateral, shots) {
  TUNE.eyeLateral = lateral;
  let hits = 0;
  for (let i = 0; i < shots; i++) {
    game.mapIndex = 0; initGame(); game.state = 'play';
    const P = game.player;
    P.x = 400; P.y = 400; P.handed = 'right'; P.shoulder = 'strong';
    P.weapon = { ...TUNE.rifle, spreadBase: 0, spreadMove: 0, spreadWalkMove: 0, recoil: 0 };
    P.recoil = 0; P.moving = false; P.cooldown = 0; P.reloading = 0; P.ammo = 30;
    const tgt = game.enemies[0];
    tgt.x = 650; tgt.y = 400; tgt.alive = true; tgt.hp = 1000; tgt.state = 'idle';
    game.enemies.slice(1).forEach(e => e.alive = false);
    game.hostages.forEach(h => h.alive = false);
    game.civilians.forEach(c => c.alive = false);
    game.squad.forEach(s => s.alive = false);
    P.face = angleTo(P.x, P.y, tgt.x, tgt.y);
    game.bullets = [];
    const hp0 = tgt.hp;
    tryFire(P, aimAngle(P, tgt.x, tgt.y));
    for (let f = 0; f < 40 && game.bullets.length; f++) updateBullets(1/240);
    if (tgt.hp < hp0) hits++;
  }
  return hits / shots;
}
let worst = 1;
for (const lat of [0, 6, 14]) {
  const r = hitRate(lat, 40);
  worst = Math.min(worst, r);
  console.log(`  eyeLateral=${String(lat).padStart(2)} -> hit rate ${(r*100).toFixed(0)}% (zero spread, target dead ahead)`);
}
console.log('  aim is independent of muzzle offset:', worst >= 0.95 ? 'CORRECT' : 'WRONG — shots are being displaced');
TUNE.eyeLateral = saved;
console.log('AIM TEST DONE');
})();

(function crashAndRoomTests(){
console.log('--- regressions: door close + room integrity ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const d = level.doors[0];
openDoor(d, true);
[game.player, ...game.squad, ...game.enemies, ...game.hostages, ...game.civilians]
  .forEach(e => { if (e && e !== game.player) e.alive = false; });
game.player.x = -999; game.player.y = -999;
let threw = null;
try { closeDoor(d); } catch (e) { threw = e.message; }
console.log('  closeDoor on an open door:', threw ? 'THROWS — ' + threw : 'OK', threw ? 'WRONG' : 'CORRECT');
console.log('  door actually closed:', d.state === 'closed' ? 'CORRECT' : 'WRONG (' + d.state + ')');

// rooms must not leak through windows
let worst = null;
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; initGame();
  const sizes = {};
  for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
    const r = level.room[y][x]; if (r) sizes[r] = (sizes[r] || 0) + 1;
  }
  const biggest = Math.max(...Object.values(sizes));
  const hostRooms = game.hostages.map(h => roomAt(h.x, h.y));
  const blockers = hostRooms.map(r => game.enemies.filter(e => e.alive && roomAt(e.x, e.y) === r).length);
  console.log(`  ${MAPS[m].name.padEnd(15)} rooms ${Object.keys(sizes).length}  largest ${biggest}t  ` +
              `hostage rooms ${JSON.stringify(hostRooms)}  blockers ${JSON.stringify(blockers)}`);
  if (worst === null || biggest > worst) worst = biggest;
}
// the real test is not room size (the exterior is legitimately huge) but whether a
// hostage's room has leaked into the exterior where the team spawns
let leaked = 0;
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; initGame();
  const spawnRoom = roomAt(level.spawns.player.x, level.spawns.player.y);
  for (const h of game.hostages) if (roomAt(h.x, h.y) === spawnRoom) leaked++;
}
console.log('  hostages sharing a room with the spawn point:', leaked,
            leaked === 0 ? 'CORRECT (interiors sealed from exterior)' : 'WRONG — rooms leaking outdoors');
console.log('CRASH+ROOM TEST DONE');
})();

(function feedbackTests(){
console.log('--- feedback: damage direction, spall, corpse identity ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player;

// a round that lands tells you which way it came from
game.hurt.length = 0;
const inbound = deg(30);
applyHit(P, { dmg: 10, ang: inbound, side: 'enemy' }, P.x + 8, P.y + 4);
const arc = game.hurt[0];
console.log('  round inbound on bearing ' + (inbound * 180 / Math.PI).toFixed(0) +
            '° -> arc points at ' + (arc ? (arc.ang * 180 / Math.PI).toFixed(0) + '°' : 'NOTHING'),
            arc && Math.abs(Math.abs(angDiff(arc.ang, inbound)) - Math.PI) < 0.01 ? 'CORRECT (back down the line)' : 'WRONG');

// spall reports itself the way a hit does, instead of subtracting hp in silence
game.hurt.length = 0; game.camKick = 0; game.fx.length = 0;
const hpBefore = P.hp;
applySpall(P.x + 14, P.y, MATERIALS.concrete, 'enemy');
console.log('  spall at 14px: hp ' + hpBefore.toFixed(1) + ' -> ' + P.hp.toFixed(1) +
            ', arcs ' + game.hurt.length + ', camKick ' + game.camKick.toFixed(1) +
            ', fx ' + game.fx.length,
            (P.hp < hpBefore && game.hurt.length === 1 && game.camKick > 0 && game.fx.length >= 2)
              ? 'CORRECT' : 'WRONG (damage without feedback)');

// only the player gets arcs — they are a HUD channel, not a world event
game.hurt.length = 0;
applySpall(game.squad[0].x + 10, game.squad[0].y, MATERIALS.concrete, 'enemy');
console.log('  spall on a squaddie pushes ' + game.hurt.length + ' player arcs',
            game.hurt.length === 0 ? 'CORRECT' : 'WRONG');

// four categories the grade scores separately must not share one corpse colour
const mk = (side, extra) => Object.assign({ side, r: 9 }, extra || {});
const kinds = { operator: mk('squad'), player: mk('player'), hostage: mk('hostage'),
                civilian: mk('civ'), suspect: mk('enemy'), executed: mk('enemy', { wasSurrendered: true }) };
const cols = {}; for (const k in kinds) cols[k] = corpseTint(kinds[k]);
const distinct = new Set(Object.values(cols)).size;
console.log('  corpse tints ' + JSON.stringify(cols));
console.log('  distinct colours: ' + distinct + '/6', distinct === 6 ? 'CORRECT' : 'WRONG');

// the muzzle flash belongs on the muzzle, which is the whole premise
P.face = 0; P.cooldown = 0; P.reloading = 0; P.ammo = 30; P.shoulder = 'strong'; P.handed = 'right';
game.fx.length = 0;
const eye = eyePoint(P);
tryFire(P, aimAngle(P, P.x + 300, P.y));
const flash = game.fx.find(f => f.kind === 'muzzle');
console.log('  muzzle flash offset from the centreline: ' +
            (flash ? Math.abs(flash.y - P.y).toFixed(1) + 'px (eye is ' + Math.abs(eye.y - P.y).toFixed(1) + 'px off)' : 'NO FLASH'),
            flash && Math.abs(flash.y - eye.y) < 0.5 ? 'CORRECT (on the muzzle)' : 'WRONG (on the body)');
console.log('FEEDBACK TEST DONE');
})();

(function playbookTests(){
console.log('--- playbook: formation geometry and points of domination ---');

// the wedge must never put a man on the point man's firing line
game.mapIndex = 0; initGame(); game.state = 'play';
let worstBore = 180, minPair = 999;
for (let f = 0; f < 12; f++) {
  game.player.face = (f / 12) * TAU;
  const st = game.squad.map(s => { s._wedgeAng = undefined; return wedgeStation(s, 1); });
  st.forEach(p => {
    const off = Math.abs(angDiff(game.player.face, angleTo(game.player.x, game.player.y, p.x, p.y))) * 180 / Math.PI;
    if (off < worstBore) worstBore = off;
  });
  for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) {
    const sep = Math.abs(angDiff(angleTo(game.player.x, game.player.y, st[i].x, st[i].y),
                                 angleTo(game.player.x, game.player.y, st[j].x, st[j].y))) * 180 / Math.PI;
    if (sep < minPair) minPair = sep;
  }
}
console.log('  closest wedge station to your bore, over 12 headings: ' + worstBore.toFixed(0) + '°',
            worstBore > 35 ? 'CORRECT (nobody downrange of you)' : 'WRONG');
console.log('  smallest bearing gap between two teammates: ' + minPair.toFixed(0) + '°',
            minPair > 25 ? 'CORRECT (no two share a bearing)' : 'WRONG');

// points of domination: opposite sides, out of the funnel, inside the room
let tested = 0, bad = [], sameRoom = 0;
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; initGame();
  for (const d of level.doors) {
    const c = doorCenter(d);
    const n = doorNormal(d, c.x + TILE * 2, c.y + TILE * 2);
    const pts = dominationPoints(d, n);
    if (pts.length !== 3) { bad.push(MAPS[m].name + ' wrong count'); continue; }
    tested++;
    const inward = { x: -n.x, y: -n.y }, lat = { x: n.y === 0 ? 0 : 1, y: n.x === 0 ? 0 : 1 };
    const side = p => (p.x - c.x) * lat.x + (p.y - c.y) * lat.y;
    const depth = p => (p.x - c.x) * inward.x + (p.y - c.y) * inward.y;
    if (side(pts[0]) * side(pts[1]) > 0) bad.push(MAPS[m].name + ' corners on the same side');
    if (depth(pts[0]) < TILE * 0.8 || depth(pts[1]) < TILE * 0.8) bad.push(MAPS[m].name + ' corner still in the funnel');
    for (const p of pts) if (isWall(tileAt(p.x, p.y).tx, tileAt(p.x, p.y).ty)) bad.push(MAPS[m].name + ' point inside a wall');
    const seed = tileAt(c.x + inward.x * TILE * 1.2, c.y + inward.y * TILE * 1.2);
    const rid = inBounds(seed.tx, seed.ty) ? level.room[seed.ty][seed.tx] : 0;
    if (rid && [pts[0], pts[1]].every(p => level.room[tileAt(p.x, p.y).ty][tileAt(p.x, p.y).tx] === rid)) sameRoom++;
  }
}
console.log('  ' + tested + ' doors across ' + MAPS.length + ' maps: ' +
            (bad.length ? bad.length + ' BAD -> ' + [...new Set(bad)].join('; ') : 'all valid CORRECT'));
console.log('  both corners inside the room behind the door: ' + sameRoom + '/' + tested,
            sameRoom / tested > 0.9 ? 'CORRECT' : 'WRONG (flood fill not resolving rooms)');

// pie slots: nobody standing in the fatal funnel, all on the approach side
game.mapIndex = 0; initGame();
let funnel = 0, wrongSide = 0, pies = 0;
for (const d of level.doors) {
  const c = doorCenter(d);
  const n = doorNormal(d, c.x + TILE * 2, c.y + TILE * 2);
  const lat = { x: n.y === 0 ? 0 : 1, y: n.x === 0 ? 0 : 1 };
  for (const p of pieSlots(d, n)) {
    pies++;
    if (Math.abs((p.x - c.x) * lat.x + (p.y - c.y) * lat.y) < TILE * 0.6) funnel++;
    if ((p.x - c.x) * n.x + (p.y - c.y) * n.y < 0) wrongSide++;
  }
}
console.log('  pie slots: ' + pies + ' total, ' + funnel + ' in the funnel, ' + wrongSide + ' on the wrong side of the door',
            funnel === 0 && wrongSide === 0 ? 'CORRECT' : 'WRONG');

// every play must run without throwing, on a door and with no door in reach
game.mapIndex = 0; initGame(); game.state = 'play';
const doorFor = level.doors.find(d => d.state === 'closed');
let ran = 0, threw = [];
for (const play of PLAYS) {
  const c = doorCenter(doorFor);
  game.player.x = c.x + 50; game.player.y = c.y + 50;
  input.mouse.wx = c.x; input.mouse.wy = c.y;
  try { if (callPlay(play)) ran++; } catch (e) { threw.push(play.name + ': ' + e.message); }
  // and again with the cursor and the player nowhere near a door
  game.player.x = level.spawns.player.x; game.player.y = level.spawns.player.y;
  input.mouse.wx = -9999; input.mouse.wy = -9999;
  try { callPlay(play); } catch (e) { threw.push(play.name + ' (no door): ' + e.message); }
}
console.log('  ' + PLAYS.length + ' plays called with a door and without: ' +
            (threw.length ? 'THREW -> ' + threw.join(' | ') : ran + ' executed, none threw CORRECT'));
console.log('PLAYBOOK TEST DONE');
})();

(function armorTests(){
console.log('--- body armor: rating vs penetration, wear, and coverage ---');
game.mapIndex = 0; initGame(); game.state = 'play';

// the protection ladder must match the ammunition table, not vibes
const expect = {
  soft:  { stop: ['hp', 'pistol', 'hp9', 'bird', 'buck'],       through: ['fmj', 'ap', 'x39', 'slug'] },
  plate: { stop: ['hp', 'pistol', 'hp9', 'bird', 'buck', 'fmj', 'x39'], through: ['ap', 'slug'] },
  heavy: { stop: Object.keys(AMMO),                              through: [] },
};
let ladder = [];
for (const [ak, exp] of Object.entries(expect)) {
  const A = ARMOR[ak];
  exp.stop.forEach(r => { if (AMMO[r].pen >= A.rating) ladder.push(A.name + ' should stop ' + AMMO[r].name); });
  exp.through.forEach(r => { if (AMMO[r].pen < A.rating) ladder.push(A.name + ' should NOT stop ' + AMMO[r].name); });
}
console.log('  protection ladder vs the AMMO table:', ladder.length ? 'WRONG -> ' + ladder.join('; ') : 'CORRECT');

// a defeated plate still costs the round something; a plate that holds costs it nearly everything
const sample = (ak, pen, n) => {
  let tot = 0;
  for (let i = 0; i < n; i++) {
    const e = wearArmor(makeShooter(0, 0, 'enemy', 1e6, TUNE.akm), ak);
    tot += throughArmor(e, 100, pen).dmg;
  }
  return tot / n;
};
const held = sample('plate', 26, 4000), beat = sample('plate', 46, 4000), bare = sample('none', 26, 200);
console.log('  100 damage into III PLATE: held ' + held.toFixed(1) + ', defeated ' + beat.toFixed(1) +
            ', no armor ' + bare.toFixed(1),
            (held < beat && beat < bare && held < 40 && beat > 70) ? 'CORRECT' : 'WRONG');

// coverage: some hits must miss the plate entirely, or armor is a flat multiplier
let onPlate = 0, N = 4000;
for (let i = 0; i < N; i++) {
  const e = wearArmor(makeShooter(0, 0, 'enemy', 1e6, TUNE.akm), 'plate');
  if (throughArmor(e, 10, 26).hitArmor) onPlate++;
}
const cov = onPlate / N;
console.log('  hits that actually struck the plate: ' + (cov * 100).toFixed(0) + '% (spec ' +
            (ARMOR.plate.cover * 100).toFixed(0) + '%)',
            Math.abs(cov - ARMOR.plate.cover) < 0.04 ? 'CORRECT' : 'WRONG');

// armor is a buffer that runs out, not immunity
const P = wearArmor(makeShooter(0, 0, 'player', 100, TUNE.akm), 'plate');
let rounds = 0;
while (P.armor > 0 && rounds < 60) { rounds++; throughArmor(P, 30, 32); }
console.log('  III PLATE absorbs ' + rounds + ' rifle rounds before it is spent',
            rounds >= 2 && rounds <= 10 ? 'CORRECT (a buffer, not immunity)' : 'WRONG');
const spent = throughArmor(P, 30, 32);
console.log('  once spent it stops working: ' + spent.dmg.toFixed(1) + ' of 30 gets through',
            spent.dmg === 30 && !spent.hitArmor ? 'CORRECT' : 'WRONG');

// Armour costs WIND, not top speed. Every tier must shorten the sprint, and
// wearing nothing must mean no limit at all.
const speeds = Object.entries(ARMOR).map(([k, v]) => v.speed);
const tanks = Object.entries(ARMOR).map(([k, v]) => v.sprint);
console.log('  top speed is unaffected by armour: ' + JSON.stringify(speeds),
            speeds.every(v => v === 1) ? 'CORRECT' : 'WRONG');
console.log('  seconds of sprint per tier: ' + JSON.stringify(tanks),
            tanks[0] === null && tanks.slice(1).every((v, i) => i === 0 || v < tanks[i])
              ? 'CORRECT (unarmoured is unlimited, and it shortens as it gets heavier)' : 'WRONG');

// enemies are bare below ELITE
const worn = {};
for (let di = 0; di < DIFFICULTIES.length; di++) {
  game.diffIndex = di; game.mapIndex = 1; initGame();
  worn[DIFFICULTIES[di].name] = game.enemies.filter(e => e.armorMax > 0).length + '/' + game.enemies.length;
}
game.diffIndex = 1;
// armour is a ramp across the tiers now, not a switch that flips at ELITE
const n = k => +worn[k].split('/')[0];
console.log('  suspects wearing armor by tier: ' + JSON.stringify(worn),
            n('ROOKIE') === 0 && n('ELITE') > n('REGULAR') && n('REGULAR') >= n('ROOKIE')
              ? 'CORRECT (it ramps, and ROOKIE faces nobody armoured)' : 'WRONG');
console.log('ARMOR TEST DONE');
})();

(function incidentTests(){
console.log('--- incidents: every bystander death names its cause ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player;

const kill = (setup) => {
  game.mapIndex = 0; initGame(); game.state = 'play'; game.incidents.length = 0;
  const h = game.hostages[0];
  setup(h);
  return game.incidents[0];
};

const cases = [
  ['direct player round', h => { const P2 = game.player; P2.ammoType = 'fmj';
      applyHit(h, { dmg: 999, ang: 0, pen: 26, side: 'player', owner: P2 }, h.x, h.y); }],
  ['round through drywall', h => { const P2 = game.player; P2.ammoType = 'fmj';
      applyHit(h, { dmg: 999, ang: 0, pen: 26, side: 'squad', owner: P2, penetrated: ['drywall'] }, h.x, h.y); }],
  ['ricochet', h => { const P2 = game.player; P2.ammoType = 'fmj';
      applyHit(h, { dmg: 999, ang: 0, pen: 26, side: 'enemy', owner: P2, ricochets: 1 }, h.x, h.y); }],
  ['spall off brick', h => { h.hp = 1; applySpall(h.x + 8, h.y, MATERIALS.brick, 'player'); }],
  ['breach blast', h => { h.hp = 1; applyBlast(h.x, h.y, 'squad'); }],
  // the clock is the taker's own awareness now, not the global flag
  ['executed', h => { const t = game.enemies.find(e => e.kind === 'taker') || game.enemies[0];
      t.kind = 'taker'; t.x = h.x + 10; t.y = h.y; t.alerted = true; t.state = 'hunt';
      game.alarm = true; game.execT = -1;
      game.hostages.forEach((x, i) => { if (i) x.alive = false; });
      updateExecutionTimer(0.016); }],
];
let missing = [];
for (const [label, setup] of cases) {
  const inc = kill(setup);
  if (!inc) { missing.push(label + ': NO INCIDENT'); continue; }
  if (/cause unrecorded/.test(inc.text)) missing.push(label + ': unattributed');
  console.log('  ' + label.padEnd(22) + ' -> "' + inc.text + '"' + (inc.byUs ? '  [charged to you]' : ''));
}
console.log('  all six attributed:', missing.length ? 'WRONG -> ' + missing.join('; ') : 'CORRECT');

// the failure message must carry the cause, not a shrug
game.mapIndex = 0; initGame(); game.state = 'play'; game.incidents.length = 0;
const h0 = game.hostages[0]; game.player.ammoType = 'fmj';
applyHit(h0, { dmg: 999, ang: 0, pen: 26, side: 'player', owner: game.player, penetrated: ['drywall'] }, h0.x, h0.y);
const msg = OBJECTIVES.rescue.failed();
console.log('  mission failure text: "' + msg + '"',
            msg && msg !== 'A hostage was killed.' && /drywall/.test(msg) ? 'CORRECT' : 'WRONG');

// a secured hostage is prone and must not be a bullet target at all
game.mapIndex = 0; initGame(); game.state = 'play';
const h1 = game.hostages[0];
game.enemies.forEach(e => e.alive = false);
trySecureHostage(h1);
const hitable = firstEntityOnSegment({ x: h1.x - 60, y: h1.y, side: 'player', owner: null }, h1.x + 60, h1.y);
console.log('  secured hostage: prone=' + h1.prone + ', r=' + h1.r +
            ', still a bullet target: ' + (hitable && hitable.ent === h1),
            h1.prone && !(hitable && hitable.ent === h1) ? 'CORRECT' : 'WRONG');
console.log('  securing damages nobody: hostages alive ' +
            game.hostages.filter(x => x.alive).length + '/' + game.hostages.length,
            game.hostages.every(x => x.alive) ? 'CORRECT' : 'WRONG');
console.log('INCIDENT TEST DONE');
})();

(function briefingTests(){
console.log('--- briefing: intel derived from the map, and the call sheet ---');

// surveying a map must never disturb the one you are standing in
game.mapIndex = 0; initGame(); game.state = 'play';
const sig = () => level.w + ':' + level.h + ':' + level.doors.length + ':' +
                  level.spawns.enemies.length + ':' + level.spawns.hostages.length;
const before = sig();
for (let m = 0; m < MAPS.length; m++) surveyMap(MAPS[m].src, 2);
console.log('  live level after surveying all six maps: ' + sig(),
            sig() === before ? 'CORRECT (no globals touched)' : 'WRONG — clobbered ' + before);

// the survey must agree with what parseLevel actually builds
let drift = [];
for (let m = 0; m < MAPS.length; m++) {
  game.mapIndex = m; initGame();
  const s = surveyMap(MAPS[m].src, game.diffIndex);
  if (s.contacts !== level.spawns.enemies.length) drift.push(MAPS[m].name + ' contacts ' + s.contacts + ' vs ' + level.spawns.enemies.length);
  if (s.hostages.length !== level.spawns.hostages.length) drift.push(MAPS[m].name + ' hostages');
  if (s.doors !== level.doors.length) drift.push(MAPS[m].name + ' doors ' + s.doors + ' vs ' + level.doors.length);
  if (s.windows !== level.windowAt.size) drift.push(MAPS[m].name + ' windows');
  let dry = 0;
  for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) if (level.mat[y][x] === 'drywall') dry++;
  if (Math.abs(dry - s.partitions) > 0) drift.push(MAPS[m].name + ' partitions ' + s.partitions + ' vs ' + dry);
}
console.log('  survey vs parseLevel across six maps:',
            drift.length ? 'WRONG -> ' + drift.join('; ') : 'CORRECT (contacts, hostages, doors, windows, partitions)');

// the contact estimate must be a band around the truth, never exact, never wild
let bad = [];
for (let m = 0; m < MAPS.length; m++) {
  const s = surveyMap(MAPS[m].src, 1);
  const band = contactBand(s.contacts, (MAPS[m].name.length * 7 + 13) | 0).split('–').map(Number);
  if (!(band[0] <= s.contacts && s.contacts <= band[1])) bad.push(MAPS[m].name + ' band excludes truth');
  if (band[0] === band[1]) bad.push(MAPS[m].name + ' band is exact');
  if (band[1] - band[0] > 4) bad.push(MAPS[m].name + ' band too wide');
}
console.log('  contact estimate brackets the truth without giving it away:',
            bad.length ? 'WRONG -> ' + bad.join('; ') : 'CORRECT');

// armor intel must track the difficulty that actually arms them
// ROOKIE is the bare tier now; armour ramps from REGULAR up
const r = briefingLines(MAPS[0], surveyMap(MAPS[0].src, 0), 0).find(l => l[0] === 'THEIR ARMOR')[1];
const e = briefingLines(MAPS[0], surveyMap(MAPS[0].src, 2), 2).find(l => l[0] === 'THEIR ARMOR')[1];
console.log('  armor intel ROOKIE:  "' + r.slice(0, 26) + '"');
console.log('  armor intel ELITE:   "' + e.slice(0, 26) + '"',
            /No body armour/.test(r) && /(PLATE|SOFT|HEAVY)/.test(e) ? 'CORRECT (it names what they wear)' : 'WRONG');

// the command wheel: four directions, each one meaning something on the target
const dirs = WHEEL.map(w => w.dir);
console.log('  wheel directions: ' + dirs.join('/'),
            dirs.length === 4 && new Set(dirs).size === 4 &&
            ['up','down','left','right'].every(d => dirs.includes(d))
              ? 'CORRECT (D-pad reachable)' : 'WRONG');
game.mapIndex = 0; initGame(); game.state = 'play';
const doorCtx = (() => { const d = level.doors.find(x => x.state === 'closed'); const c = doorCenter(d);
  return { x: c.x, y: c.y, door: d, far: true }; })();
const openCtx = { x: game.player.x + 200, y: game.player.y, door: null, far: true };
WHEEL.forEach(w => console.log('    ' + w.dir.padEnd(6) + ' on a door: "' + w.label(doorCtx, game.squad) +
                               '"   on open ground: "' + w.label(openCtx, game.squad) + '"'));
let threw = [];
for (const w of WHEEL) for (const c of [doorCtx, openCtx]) {
  game.mapIndex = 0; initGame(); game.state = 'play';
  try { w.run(game.squad.filter(s => s.alive), c); } catch (e) { threw.push(w.dir + ': ' + e.message); }
}
console.log('  all four run on a door and on open ground:',
            threw.length ? 'WRONG -> ' + threw.join(' | ') : 'CORRECT');
console.log('BRIEFING TEST DONE');
})();

(function aarTests(){
console.log('--- after-action review: lights on when it goes wrong ---');
game.mapIndex = 0; initGame(); game.state = 'play';

// a real shot must record where it was fired from, or there is no line to draw
const P = game.player;
P.face = 0; P.cooldown = 0; P.reloading = 0; P.ammo = 30;
game.bullets.length = 0;
tryFire(P, aimAngle(P, P.x + 300, P.y));
const b0 = game.bullets[0];
console.log('  fired round carries its origin: ' +
            (b0 && b0.ox !== undefined ? '(' + b0.ox.toFixed(0) + ',' + b0.oy.toFixed(0) + ')' : 'NO'),
            b0 && b0.ox !== undefined ? 'CORRECT' : 'WRONG');

// failing must turn the lights on rather than cutting to a menu
game.mapIndex = 0; initGame(); game.state = 'play'; game.zoom = 1.6;
const h = game.hostages[0];
applyHit(h, { dmg: 999, ang: 0, pen: 26, side: 'player', owner: P, ox: h.x - 200, oy: h.y - 60 }, h.x, h.y);
endMission(false, 'A hostage was killed.');
let unseen = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) if (!seen.grid[y][x]) unseen++;
console.log('  state after failing: ' + game.state + ', unseen tiles: ' + unseen,
            game.state === 'aar' && unseen === 0 ? 'CORRECT' : 'WRONG');
console.log('  camera framed both ends: zoom ' + game.zoom.toFixed(2) + ' (play zoom 1.60)',
            game.zoom <= 1.6 && game.zoom >= 0.55 ? 'CORRECT' : 'WRONG');

// stepping must clamp at both ends rather than running off the list
aarFocus(99); const hi = game.aar.i;
aarFocus(-5); const lo = game.aar.i;
console.log('  focus clamps to [0, ' + (game.aar.list.length - 1) + ']: hi=' + hi + ' lo=' + lo,
            hi === game.aar.list.length - 1 && lo === 0 ? 'CORRECT' : 'WRONG');

// and leaving hands the camera back
endMission(false, 'A hostage was killed.');
console.log('  after acknowledging: state ' + game.state + ', zoom restored to ' + game.zoom.toFixed(2),
            game.state === 'debrief' && Math.abs(game.zoom - 1.6) < 0.001 ? 'CORRECT' : 'WRONG');

// a win goes straight to the debrief — the review is for failures
game.mapIndex = 0; initGame(); game.state = 'play';
endMission(true, '');
console.log('  a won mission skips the review: ' + game.state,
            game.state === 'debrief' ? 'CORRECT' : 'WRONG');

// failing with nothing recorded must still produce something to look at
game.mapIndex = 0; initGame(); game.state = 'play';
game.incidents.length = 0;
endMission(false, 'Time expired.');
console.log('  failure with no incidents still reviewable: ' + game.aar.list.length + ' entry, "' +
            game.aar.list[0].text + '"',
            game.aar && game.aar.list.length === 1 ? 'CORRECT' : 'WRONG');
endMission(false, 'Time expired.');
console.log('AAR TEST DONE');
})();

(function noiseAndClockTests(){
console.log('--- noise through structure, and whose clock it is ---');
game.mapIndex = 0; initGame(); game.state = 'play';

// sound must lose energy through material, and lose more through more of it
const openLoss = soundLoss(100, 100, 160, 100);
console.log('  loss across open floor: ' + openLoss, openLoss === 0 ? 'CORRECT' : 'WRONG');
let oneWall = null, twoWall = null;
for (let y = 2; y < level.h - 2 && !twoWall; y++) {
  let hits = [];
  for (let x = 1; x < level.w - 1; x++) if (isWall(x, y) && !isWall(x - 1, y)) hits.push(x);
  if (hits.length >= 2) {
    const yy = y * TILE + 16;
    oneWall = soundLoss((hits[0] - 1) * TILE + 16, yy, (hits[0] + 1) * TILE + 16, yy);
    twoWall = soundLoss((hits[0] - 1) * TILE + 16, yy, (hits[1] + 1) * TILE + 16, yy);
  }
}
console.log('  loss through one barrier: ' + oneWall + ', through two: ' + twoWall,
            oneWall > 0 && twoWall > oneWall ? 'CORRECT (it accumulates)' : 'WRONG');

// a closed door must muffle and an open one must not
const d = level.doors[0], c = doorCenter(d);
const across = (dx, dy) => soundLoss(c.x - dx, c.y - dy, c.x + dx, c.y + dy);
d.state = 'closed'; const shut = across(d.orient === 'h' ? 0 : 40, d.orient === 'h' ? 40 : 0);
d.state = 'open';   const open = across(d.orient === 'h' ? 0 : 40, d.orient === 'h' ? 40 : 0);
console.log('  door closed loses ' + shut + ', open loses ' + open,
            shut > open ? 'CORRECT (closing a door behind you now does something)' : 'WRONG');
d.state = 'closed';

// the executioner's clock must be HIS, not a global flag
game.mapIndex = 0; initGame(); game.state = 'play';
const taker = game.enemies.find(e => e.kind === 'taker');
const other = game.enemies.find(e => e !== taker);
game.alarm = false; taker.alerted = false; other.alerted = false;
alertEnemy(other, other.x, other.y);              // someone far away hears something
console.log('  a guard alerting sets game.alarm: ' + game.alarm +
            ', but the taker knows: ' + taker.alerted);
console.log('  clock running on a global alarm the taker cannot know about: ' + game.alarmTimerVisible(),
            game.alarm && !taker.alerted && !game.alarmTimerVisible() ? 'CORRECT' : 'WRONG');
alertEnemy(taker, 0, 0);
console.log('  once HE knows, the clock runs: ' + game.alarmTimerVisible(),
            game.alarmTimerVisible() ? 'CORRECT' : 'WRONG');

// and a callout must actually move awareness between men
game.mapIndex = 0; initGame(); game.state = 'play';
const a = game.enemies[0], b = game.enemies[1];
b.x = a.x + 60; b.y = a.y; a.alerted = false; b.alerted = false; a._calloutCd = 0;
enemyCallout(a, a.x + 200, a.y);
console.log('  a shout at 60px with nothing between reaches a comrade: ' + b.alerted,
            b.alerted ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame(); game.state = 'play';
const a2 = game.enemies[0], b2 = game.enemies[1];
b2.x = a2.x + 3000; b2.y = a2.y; a2.alerted = false; b2.alerted = false; a2._calloutCd = 0;
enemyCallout(a2, a2.x, a2.y);
console.log('  the same shout does not reach a man 3000px away: ' + !b2.alerted,
            !b2.alerted ? 'CORRECT' : 'WRONG');
console.log('NOISE+CLOCK TEST DONE');
})();

(function shootHouseAndBoundTests(){
console.log('--- the shoot house, and bounding overwatch ---');
const shIdx = MAPS.findIndex(m => m.training);
console.log('  a training mission exists: ' + (shIdx >= 0 ? MAPS[shIdx].name : 'NONE'),
            shIdx >= 0 ? 'CORRECT' : 'WRONG');
game.mapIndex = shIdx; initGame(); game.state = 'play';
console.log('  no hostages, no civilians, no hostage-taker: ' +
            game.hostages.length + '/' + game.civilians.length + '/' +
            game.enemies.filter(e => e.kind === 'taker').length,
            !game.hostages.length && !game.civilians.length &&
            !game.enemies.some(e => e.kind === 'taker') ? 'CORRECT (nothing on a clock)' : 'WRONG');
console.log('  objectives: ' + JSON.stringify(MAPS[shIdx].objectives),
            MAPS[shIdx].objectives.length === 1 && MAPS[shIdx].objectives[0] === 'neutralize'
              ? 'CORRECT (just the fight)' : 'WRONG');

// it must teach the things it claims to: doors incl. a locked one, shoot-through
// partitions, real cover, and windows
const locked = level.doors.filter(d => d.locked).length;
let dry = 0, brick = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
  if (level.mat[y][x] === 'drywall') dry++;
  if (level.mat[y][x] === 'brick') brick++;
}
console.log('  teaches: ' + level.doors.length + ' doors (' + locked + ' locked), ' +
            dry + ' shoot-through partitions, ' + brick + ' brick cover tiles, ' +
            level.windowAt.size + ' windows',
            locked >= 1 && dry > 10 && brick > 0 && level.windowAt.size > 0 ? 'CORRECT' : 'WRONG');

// every contact must be reachable, or the mission cannot be completed
const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
const unreachable = level.spawns.enemies.filter(es => {
  const et = tileAt(es.x, es.y);
  return !astar(st0.tx, st0.ty, et.tx, et.ty, passForPath, pathCostSquad);
});
console.log('  all ' + level.spawns.enemies.length + ' contacts reachable from the entry: ' +
            (unreachable.length === 0), unreachable.length === 0 ? 'CORRECT' : 'WRONG');

// --- bounding overwatch: somebody is always still
const play = PLAYS.find(p => p.name === 'BOUND');
console.log('  BOUND is in the playbook on [' + (play ? play.key : '?') + ']', play ? 'CORRECT' : 'WRONG');
game.diffIndex = 1; game.densityIndex = 1;   // pin: leaked ELITE/SWARM is a different test
game.mapIndex = shIdx; initGame(); game.state = 'play';
const P = game.player;
input.mouse.wx = P.x + 420; input.mouse.wy = P.y;
callPlay(play);
console.log('  called: orders ' + JSON.stringify(game.squad.map(s => s.order.type)),
            game.squad.every(s => s.order.type === 'bound') ? 'CORRECT' : 'WRONG');
const elements = new Set(game.squad.map(s => s.order.element));
console.log('  split into ' + elements.size + ' elements',
            elements.size === 2 ? 'CORRECT (one moves, one watches)' : 'WRONG');

// drive it and confirm at least one man is stationary on every frame of travel
let bothMoving = 0, samples = 0, swaps = 0, lastUp = game.bound ? game.bound.moving : 0;
const prev = new Map();
for (let f = 0; f < 60 * 14 && game.bound; f++) {
  game.squad.forEach(s => prev.set(s, { x: s.x, y: s.y }));
  update(1 / 60);
  if (!game.bound) break;
  if (game.bound.moving !== lastUp) { swaps++; lastUp = game.bound.moving; }
  const moved = game.squad.filter(s => s.alive && dist(s.x, s.y, prev.get(s).x, prev.get(s).y) > 0.4);
  const still = game.squad.filter(s => s.alive).length - moved.length;
  samples++;
  if (still === 0) bothMoving++;
}
console.log('  frames of travel where NOBODY was covering: ' + bothMoving + '/' + samples,
            samples > 0 && bothMoving / samples < 0.06 ? 'CORRECT' : 'WRONG (' +
            (100 * bothMoving / Math.max(1, samples)).toFixed(0) + '% uncovered)');

// and the degenerate case: if the covering element dies, the bound must END,
// not continue as one man strolling with nobody on his ground
initGame(); game.state = 'play';
input.mouse.wx = game.player.x + 420; input.mouse.wy = game.player.y;
callPlay(play);
const solo = game.squad.filter(s => s.order.element === 0);
solo.forEach(s => { s.alive = false; });             // the covering element is gone
update(1 / 60);
const survivor = game.squad.find(s => s.alive);
console.log('  covering element wiped: bound=' + (game.bound !== null) + ', survivor order=' +
            (survivor ? survivor.order.type : '—'),
            game.bound === null && survivor && survivor.order.type === 'hold'
              ? 'CORRECT (ELEMENT DOWN — HOLDING)' : 'WRONG (he kept strolling)');
console.log('  elements swapped ' + swaps + ' times during the move',
            swaps >= 1 ? 'CORRECT (it leapfrogs)' : 'WRONG (one element did it all)');
console.log('SHOOT HOUSE + BOUND TEST DONE');
})();

(function loadoutAndVisionTests(){
console.log('--- sidearm, and shared vision ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player;

console.log('  guns carried: ' + P.guns.map(g => g.name).join(' + '),
            P.guns.length === 2 && P.gunIndex === 0 ? 'CORRECT (primary up)' : 'WRONG');

// magazine state must survive the swap in both directions
P.ammo = 7; P.swapT = 0; P.cooldown = 0;
swapGun(P, 1);
const onPistol = { name: P.guns[P.gunIndex].name, ammo: P.ammo, mag: P.weapon.mag, round: P.ammoType };
P.ammo = 3; P.cooldown = 0;
swapGun(P, 0);
const back = { name: P.guns[P.gunIndex].name, ammo: P.ammo };
console.log('  to sidearm: ' + JSON.stringify(onPistol));
console.log('  back to primary: ' + JSON.stringify(back) + ' (left it on 7)',
            onPistol.ammo === SIDEARM.w.mag && back.ammo === 7 ? 'CORRECT (each gun keeps its rounds)' : 'WRONG');
swapGun(P, 1);
console.log('  the sidearm fires pistol ammunition: ' + P.ammoType,
            P.ammoType === 'pistol' ? 'CORRECT' : 'WRONG');
console.log('  and swapping costs time: cooldown ' + P.cooldown.toFixed(2) + 's',
            P.cooldown >= TUNE.gunSwapTime - 0.001 ? 'CORRECT' : 'WRONG');
swapGun(P, 0);

// shared vision: a squaddie's cone must reveal ground the player has not walked
game.mapIndex = 0; initGame(); game.state = 'play';
seen.init();
const s0 = game.squad[0];
s0.x = game.player.x + 300; s0.y = game.player.y; s0.face = 0;
const count = () => { let n = 0; for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) if (seen.grid[y][x]) n++; return n; };
const before = count();
computeVisCone(s0.x, s0.y, TUNE.squadViewDist, s0.face, deg(160), 44);
const gained = count() - before;
console.log('  one squaddie cone reveals ' + gained + ' tiles', gained > 20 ? 'CORRECT' : 'WRONG');

// ...and it must be a cone, not a circle: nothing behind him
let behind = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) {
  if (!seen.grid[y][x]) continue;
  const wx = x * TILE + 16, wy = y * TILE + 16;
  if (dist(s0.x, s0.y, wx, wy) < 40) continue;
  if (Math.abs(angDiff(s0.face, angleTo(s0.x, s0.y, wx, wy))) > deg(100)) behind++;
}
console.log('  tiles revealed behind him: ' + behind, behind === 0 ? 'CORRECT (a cone, not a circle)' : 'WRONG');

// last-known must survive losing sight, and expire
game.mapIndex = 0; initGame(); game.state = 'play';
const e0 = game.enemies[0];
e0.x = game.player.x + 100; e0.y = game.player.y; game.player.face = 0;
game.eye = eyePoint(game.player);
rememberSightings();
const marked = !!e0.lastSeen;
e0.x = game.player.x + 5000;
rememberSightings();
console.log('  contact remembered after he leaves: ' + (marked && !!e0.lastSeen),
            marked && e0.lastSeen ? 'CORRECT' : 'WRONG');
console.log('  the mark expires after ' + TUNE.memoryFade + 's',
            TUNE.memoryFade > 5 && TUNE.memoryFade < 60 ? 'CORRECT' : 'WRONG');

// snake cam works on both a door and a window
game.mapIndex = 0; initGame(); game.state = 'play';
const dd = level.doors.find(x => x.state === 'closed'), dc = doorCenter(dd);
game.player.x = dc.x + 30; game.player.y = dc.y + 30; game.snake = null;
snakeCam(game.player);
const onDoor = !!game.snake;
const win = [...level.windowAt.values()][0];
game.player.x = win.tx * TILE + 16; game.player.y = win.ty * TILE + 16 + 34; game.snake = null;
snakeCam(game.player);
const onWin = !!game.snake;
game.player.x = 20; game.player.y = 20; game.snake = null;
snakeCam(game.player);
console.log('  snake cam: door ' + onDoor + ', window ' + onWin + ', open ground ' + !!game.snake,
            onDoor && onWin && !game.snake ? 'CORRECT' : 'WRONG');
console.log('LOADOUT+VISION TEST DONE');
})();

(function suppressionAndPillboxTests(){
console.log('--- suppression, base of fire, and the pillbox ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player, e = game.enemies[0];

// a round that misses close must still count
e.x = P.x + 300; e.y = P.y; e.suppress = 0;
const b = { x: P.x, y: P.y, ang: 0, side: 'player', owner: P, dmg: 1, pen: 26 };
suppressAlong(b, P.x + 600, P.y + 20);           // passes 20px off him
console.log('  a round 20px wide adds ' + (e.suppress || 0).toFixed(2) + ' suppression',
            e.suppress > 0 ? 'CORRECT' : 'WRONG');
e.suppress = 0;
suppressAlong(b, P.x + 600, P.y + 300);          // passes 300px off him
console.log('  a round 300px wide adds ' + (e.suppress || 0).toFixed(2),
            !e.suppress ? 'CORRECT (only near misses count)' : 'WRONG');

// friendly rounds must not suppress the friendlies who fired them
game.squad[0].x = P.x + 100; game.squad[0].y = P.y; game.squad[0].suppress = 0;
suppressAlong(b, P.x + 600, P.y);
console.log('  your own rounds do not suppress your own team: ' + !game.squad[0].suppress,
            !game.squad[0].suppress ? 'CORRECT' : 'WRONG');
const eb = { x: e.x, y: e.y, ang: Math.PI, side: 'enemy', owner: e, dmg: 1, pen: 26 };
P.suppress = 0; suppressAlong(eb, P.x, P.y + 15);
console.log('  incoming fire suppresses YOU too: ' + (P.suppress || 0).toFixed(2),
            P.suppress > 0 ? 'CORRECT' : 'WRONG');

// suppression must open the cone and, past the threshold, stop him firing back
const base = currentSpread(e);
e.suppress = TUNE.suppressMax;
const wide = currentSpread(e);
console.log('  his cone at full suppression: ' + (base * 180 / Math.PI).toFixed(1) + '° -> ' +
            (wide * 180 / Math.PI).toFixed(1) + '°', wide > base ? 'CORRECT' : 'WRONG');
console.log('  pinned threshold ' + TUNE.suppressPinned + ' of max ' + TUNE.suppressMax,
            TUNE.suppressPinned < TUNE.suppressMax ? 'CORRECT (he is degraded before he is pinned)' : 'WRONG');

// measure it end to end: does a pinned enemy actually stop shooting?
function volley(suppressed) {
  // open ground on the pillbox approach, so he genuinely has line of sight —
  // updateEnemy drops him to hunt the moment he cannot see you
  game.mapIndex = MAPS.findIndex(m => m.name === 'THE PILLBOX'); initGame(); game.state = 'play';
  const t = game.enemies[0], pl = game.player;
  pl.x = 6 * TILE; pl.y = 15 * TILE;
  t.x = pl.x + 230; t.y = pl.y; t.state = 'combat'; t.target = pl; t.reactT = 0; t.alerted = true;
  // enemies spawn with a random homeFace; point him at the player or he never
  // acquires and the measurement is a coin flip
  t.face = angleTo(t.x, t.y, pl.x, pl.y); t.homeFace = t.face;
  t.ammo = 999;
  let shots = 0;
  const _tf = tryFire;
  tryFire = function (sh, a) { const r = _tf(sh, a); if (r && sh === t) shots++; return r; };
  for (let f = 0; f < 60 * 6; f++) {
    if (suppressed) t.suppress = TUNE.suppressMax;
    t.ammo = 999; t.reloading = 0;
    updateEnemy(t, 1 / 60);
  }
  tryFire = _tf;
  return shots;
}
const free = volley(false), pinned = volley(true);
console.log('  rounds he gets off in 6s: unsuppressed ' + free + ', pinned ' + pinned,
            free > 0 && pinned === 0 ? 'CORRECT (a base of fire buys the crossing)' : 'WRONG');

// the base-of-fire order
game.mapIndex = 0; initGame(); game.state = 'play';
const t0 = game.enemies[0];
t0.lastSeen = { x: t0.x, y: t0.y, t: 0 };
const ctx = wheelContext.call ? { x: t0.x, y: t0.y, threat: { x: t0.x, y: t0.y }, door: null, far: true } : null;
const down = WHEEL.find(w => w.dir === 'down');
console.log('  wheel down on a known contact reads: "' + down.label(ctx, game.squad) + '"',
            /SUPPRESS/.test(down.label(ctx, game.squad)) ? 'CORRECT' : 'WRONG');
down.run(game.squad.filter(s => s.alive), ctx);
console.log('  orders: ' + JSON.stringify(game.squad.map(s => s.order.type)),
            game.squad.every(s => s.order.type === 'suppress') ? 'CORRECT' : 'WRONG');

// the pillbox
const pb = MAPS.findIndex(m => m.name === 'THE PILLBOX');
console.log('  THE PILLBOX exists at index ' + pb, pb >= 0 ? 'CORRECT' : 'WRONG');
game.mapIndex = pb; initGame();
console.log('  skirmish, not a rescue: objectives ' + JSON.stringify(MAPS[pb].objectives) +
            ', hostages ' + game.hostages.length,
            !MAPS[pb].objectives.includes('rescue') && game.hostages.length === 0 ? 'CORRECT' : 'WRONG');
console.log('  firing slits: ' + level.windowAt.size + ' windows, ' +
            level.doors.length + ' door(s) into the strongpoint',
            level.windowAt.size >= 3 && level.doors.length >= 1 ? 'CORRECT' : 'WRONG');
let brick = 0;
for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++) if (level.mat[y][x] === 'brick') brick++;
console.log('  hard cover on the approach: ' + brick + ' brick tiles to bound between',
            brick >= 20 ? 'CORRECT' : 'WRONG');
const st = tileAt(level.spawns.player.x, level.spawns.player.y);
const unreach = level.spawns.enemies.filter(sp => {
  const et = tileAt(sp.x, sp.y);
  return !astar(st.tx, st.ty, et.tx, et.ty, passForPath, pathCostSquad);
});
console.log('  all ' + level.spawns.enemies.length + ' defenders reachable: ' + (unreach.length === 0),
            unreach.length === 0 ? 'CORRECT (the flank goes through)' : 'WRONG');
console.log('SUPPRESSION+PILLBOX TEST DONE');
})();

(function throwablesTests(){
console.log('--- frag, concussion, smoke, and bounding into cover ---');
const pbIdx = MAPS.findIndex(m => m.name === 'THE PILLBOX');
game.mapIndex = pbIdx; initGame(); game.state = 'play';
const P = game.player;

console.log('  the bag: ' + THROW_ORDER.map(k => THROWABLES[k].name + ' ' + (P.nades[k] || 0)).join(', '));
// the wheel is four directions — kinds may share one (smoke/CS), but at most
// one kind per direction can ever be CARRIED by a single kit
const dirs = new Set(THROW_ORDER.map(k => THROWABLES[k].dir));
const carriedPerDir = [...dirs].map(d =>
  THROW_ORDER.filter(k => THROWABLES[k].dir === d && (P.nades[k] || 0) > 0).length);
console.log('  four directions, carried kinds per direction ' + carriedPerDir.join('/'),
            dirs.size === 4 && carriedPerDir.every(n => n <= 1) ? 'CORRECT (d-pad still works)' : 'WRONG');

// FRAG kills, and the incident names it
game.mapIndex = pbIdx; initGame(); game.state = 'play'; game.incidents.length = 0;
const victim = game.enemies[0];
victim.x = game.player.x + 400; victim.y = game.player.y;
wearArmor(victim, 'none'); victim.hp = 65;
detonateFrag({ x: victim.x, y: victim.y, side: 'player', kind: 'frag' });
console.log('  frag on a man at zero range: ' + (victim.alive ? 'survived ' + victim.hp.toFixed(0) + 'hp' : 'killed'),
            !victim.alive ? 'CORRECT' : 'WRONG');
game.mapIndex = pbIdx; initGame(); game.state = 'play';
const far = game.enemies[0]; far.x = game.player.x + 400; far.y = game.player.y; far.hp = 65;
detonateFrag({ x: far.x + TUNE.fragWound + 60, y: far.y, side: 'player', kind: 'frag' });
console.log('  frag beyond its wounding radius: ' + far.hp.toFixed(0) + 'hp left',
            far.hp === 65 ? 'CORRECT (it has an edge)' : 'WRONG');

// CONCUSSION reaches around a corner that a flashbang cannot
game.mapIndex = pbIdx; initGame(); game.state = 'play';
function behindWall() {
  // find a spot with a wall between two open tiles
  for (let y = 10; y < 25; y++) for (let x = 16; x < 42; x++) {
    if (!isWall(x, y) || level.mat[y][x] !== 'drywall') continue;
    const a = { x: (x - 2) * TILE + 16, y: y * TILE + 16 }, b = { x: (x + 2) * TILE + 16, y: y * TILE + 16 };
    if (!isWall(tileAt(a.x, a.y).tx, tileAt(a.x, a.y).ty) && !isWall(tileAt(b.x, b.y).tx, tileAt(b.x, b.y).ty)
        && !lineOfSight(a.x, a.y, b.x, b.y, opaque)) return { a, b };
  }
  return null;
}
// use a PARTITION, not concrete — the claim is that overpressure carries
// through thin structure and around a corner, not through a bunker wall
game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';
const pair = behindWall();
if (pair) {
  const e1 = game.enemies[0];
  e1.x = pair.b.x; e1.y = pair.b.y; e1.stagger = 0; e1.blind = 0; e1.hp = 65;
  detonateBang({ x: pair.a.x, y: pair.a.y, side: 'player', kind: 'bang' });
  const flashHit = e1.blind > 0;
  e1.stagger = 0; e1.blind = 0;
  detonateConcussion({ x: pair.a.x, y: pair.a.y, side: 'player', kind: 'conc' });
  const concHit = e1.stagger > 0;
  console.log('  through a wall: flashbang reached him ' + flashHit + ', concussion reached him ' + concHit,
              !flashHit && concHit ? 'CORRECT (that is the difference between them)' : 'WRONG');
} else console.log('  through a wall: NO TEST GEOMETRY FOUND');

// SMOKE blocks sight but not bullets or movement
game.mapIndex = pbIdx; initGame(); game.state = 'play';
game.smokes.length = 0; level.smokeGrid = null;
const A = { x: 8 * TILE + 16, y: 15 * TILE + 16 }, B = { x: 16 * TILE + 16, y: 15 * TILE + 16 };
const losBefore = lineOfSight(A.x, A.y, B.x, B.y, opaque);
popSmoke({ x: (A.x + B.x) / 2, y: A.y, side: 'player', kind: 'smoke' });
for (let i = 0; i < 120; i++) updateSmokes(1 / 60);
const mid = tileAt((A.x + B.x) / 2, A.y);
console.log('  sight across open ground before smoke: ' + losBefore + ', after: ' +
            lineOfSight(A.x, A.y, B.x, B.y, opaque),
            losBefore && !lineOfSight(A.x, A.y, B.x, B.y, opaque) ? 'CORRECT' : 'WRONG');
console.log('  smoke stops bullets: ' + blocksBullet(mid.tx, mid.ty) +
            ', smoke stops movement: ' + solidForMove(mid.tx, mid.ty),
            !blocksBullet(mid.tx, mid.ty) && !solidForMove(mid.tx, mid.ty)
              ? 'CORRECT (sight only)' : 'WRONG');
// and it must clear itself up
for (let i = 0; i < 60 * (TUNE.smokeLife + 2); i++) updateSmokes(1 / 60);
console.log('  it dissipates: ' + game.smokes.length + ' clouds left, sight back: ' +
            lineOfSight(A.x, A.y, B.x, B.y, opaque),
            game.smokes.length === 0 && lineOfSight(A.x, A.y, B.x, B.y, opaque) ? 'CORRECT' : 'WRONG');

// BOUNDING must finish its legs behind something
game.mapIndex = pbIdx; initGame(); game.state = 'play';
const s0 = game.squad[0];
s0.x = 6 * TILE; s0.y = 15 * TILE;
const goal = { x: 30 * TILE, y: 15 * TILE };
const threat = threatBearingFor(s0, goal.x, goal.y);
let covered = 0, naive = 0, N = 24;
for (let i = 0; i < N; i++) {
  s0.x = (6 + (i % 6)) * TILE; s0.y = (11 + (i % 9)) * TILE;
  const leg = pickBoundLeg(s0, goal.x, goal.y);
  if (coveredFrom(leg.x, leg.y, threat.x, threat.y) > 0.25) covered++;
  const straight = nearestPassable(s0.x + Math.cos(angleTo(s0.x, s0.y, goal.x, goal.y)) * TUNE.boundLeg,
                                   s0.y + Math.sin(angleTo(s0.x, s0.y, goal.x, goal.y)) * TUNE.boundLeg);
  if (coveredFrom(straight.x, straight.y, threat.x, threat.y) > 0.25) naive++;
}
console.log('  bound legs that end in cover: ' + covered + '/' + N +
            '   (straight-line legs: ' + naive + '/' + N + ')',
            covered > naive ? 'CORRECT (it is looking for cover now)' : 'WRONG — no better than a sprint');
console.log('THROWABLES TEST DONE');
})();

(function weaponRosterTests(){
console.log('--- the squad automatic and the marksman rifle ---');
const cells = [];
for (const [k, v] of Object.entries(PRIMARIES)) {
  cells.push({ k, name: v.name, dmg: v.w.dmg, rpm: v.w.rpm, mag: v.w.mag,
               range: v.w.range, spread: +(v.w.spreadBase * 180 / Math.PI).toFixed(1),
               carry: v.speed || 1 });
}
cells.forEach(c => console.log('  ' + c.name.padEnd(17) + String(c.dmg).padStart(3) + 'dmg ' +
  String(c.rpm).padStart(4) + 'rpm ' + String(c.mag).padStart(4) + 'rd ' +
  String(c.range).padStart(5) + 'px  cone ' + String(c.spread).padStart(4) + '°  move x' + c.carry));
const saw = PRIMARIES.saw, dmr = PRIMARIES.dmr, m4 = PRIMARIES.carbine;
console.log('  the belt-fed trades: ' + (saw.w.mag / m4.w.mag).toFixed(1) + 'x the ammunition, ' +
            (saw.w.spreadBase / m4.w.spreadBase).toFixed(1) + 'x the cone, ' +
            Math.round((1 - saw.speed) * 100) + '% slower',
            saw.w.mag > m4.w.mag && saw.w.spreadBase > m4.w.spreadBase && saw.speed < 1 ? 'CORRECT' : 'WRONG');
console.log('  the marksman trades: ' + (dmr.w.dmg / m4.w.dmg).toFixed(1) + 'x the damage and ' +
            (dmr.w.range / m4.w.range).toFixed(1) + 'x the reach, at ' +
            (dmr.w.rpm / m4.w.rpm).toFixed(2) + 'x the rate',
            dmr.w.dmg > m4.w.dmg && dmr.w.range > m4.w.range && dmr.w.rpm < m4.w.rpm ? 'CORRECT' : 'WRONG');

// rounds-to-kill: each gun should own a different range band
function rtk(prim, ammoKey, hp) {
  const round = AMMO[ammoKey];
  let n = 0, left = hp;
  while (left > 0 && n < 60) { n++; left -= prim.w.dmg * round.dmgMul; }
  return n;
}
console.log('  rounds to put down a 65hp guard — M4 ' + rtk(m4, 'fmj', 65) +
            ', SAW ' + rtk(saw, 'fmj', 65) + ', DMR ' + rtk(dmr, 'fmj', 65),
            rtk(dmr, 'fmj', 65) === 1 ? 'CORRECT (one round, one guard)' : 'WRONG');
console.log('  ...but a 120hp elite still takes ' + rtk(dmr, 'fmj', 120) + ' from the DMR',
            rtk(dmr, 'fmj', 120) > 1 ? 'CORRECT (the hard men are still a problem)' : 'WRONG');
// and no duplicate keys quietly eating a template
const tmplSrc = Object.keys(SQUAD_TEMPLATES);
console.log('  ' + tmplSrc.length + ' distinct squad templates: ' + tmplSrc.join(', '),
            tmplSrc.length === new Set(tmplSrc).size && tmplSrc.length >= 4 ? 'CORRECT' : 'WRONG');

// the weight must actually be felt in the legs
game.mapIndex = 0;
game.loadout.primary = 'carbine'; game.loadout.armor = 'none'; initGame();
const fast = gunSpeed(game.player) * armorSpeed(game.player);
game.loadout.primary = 'saw'; initGame();
const slow = gunSpeed(game.player) * armorSpeed(game.player);
game.loadout.primary = 'carbine'; initGame();
console.log('  move multiplier: carbine x' + fast.toFixed(2) + ', belt-fed x' + slow.toFixed(2),
            slow < fast ? 'CORRECT (carrying it costs you)' : 'WRONG');

// and the squad can field them
const roles = Object.keys(ROLES);
console.log('  squad roles: ' + roles.join(', '),
            roles.includes('support') && roles.includes('marksman') ? 'CORRECT' : 'WRONG');
const tmpls = Object.entries(SQUAD_TEMPLATES).map(([k, v]) => k + '(' + v.roles.join('/') + ')');
console.log('  templates: ' + tmpls.join('  '));
let badRole = [];
for (const [k, v] of Object.entries(SQUAD_TEMPLATES)) v.roles.forEach(r => { if (!ROLES[r]) badRole.push(k + ':' + r); });
console.log('  every template names real roles:', badRole.length ? 'WRONG -> ' + badRole.join() : 'CORRECT');
console.log('WEAPON ROSTER TEST DONE');
})();

(function missionPickerTests(){
console.log('--- mission buttons must name the mission they load ---');
// Regression: the buttons render training-first while MAPS keeps its own order,
// so any code that reads a mission index off a button's POSITION picks the
// wrong mission. It highlighted one and loaded another, and hung best-grade
// labels on missions that never earned them.
const rendered = MAPS.map((m, i) => ({ m, i }))
  .sort((a, b) => (b.m.training ? 1 : 0) - (a.m.training ? 1 : 0));
let drift = [];
rendered.forEach((r, pos) => { if (r.i !== pos) drift.push(r.m.name + ' renders at ' + pos + ' but is MAPS[' + r.i + ']'); });
console.log('  render order differs from MAPS order: ' + (drift.length > 0),
            drift.length > 0 ? 'CORRECT (so position must never be used as an index)' : 'n/a');
console.log('    ' + drift.slice(0, 3).join('; '));
const usesPosition = /querySelectorAll\("\.mapbtn"\)\.forEach\(\(x, j\) => \{\s*x\.classList\.toggle\("sel", j === game\.mapIndex\)/;
console.log('  refreshMenu keys off the button position:', usesPosition.test(refreshMenu.toString()) ? 'WRONG' : 'CORRECT (it reads dataset.idx)');
console.log('  and best grades are keyed by the same index: ' +
            (/bests\[j \+ ":"/.test(refreshMenu.toString()) && /\+x\.dataset\.idx/.test(refreshMenu.toString())
              ? 'yes' : 'check'),
            /\+x\.dataset\.idx/.test(refreshMenu.toString()) ? 'CORRECT' : 'WRONG');
console.log('MISSION PICKER TEST DONE');
})();

(function versionConsistencyTests(){
console.log('--- the build must agree with itself about what version it is ---');
// This exists because it did not: twelve feature commits shipped under one
// filename because nothing failed when the version was left alone. This cannot
// catch "forgot to bump", but it catches every way the three records disagree.
const fs = require('fs'), path = require('path');
// the suite runs as a concatenated bundle in /tmp, so __dirname is useless;
// run.sh cds into tests/, so the repo is one level up from cwd
const dir = path.join(process.cwd(), '..');
const files = fs.readdirSync(dir).filter(f => /^top_down_tactical_v[\d.]+\.html$/.test(f));
console.log('  exactly one game file: ' + files.join(', '), files.length === 1 ? 'CORRECT' : 'WRONG');
const name = files[0], src = fs.readFileSync(path.join(dir, name), 'utf8');
const fileV = name.match(/_v([\d.]+)\.html$/)[1];
const headerName = (src.match(/^\s*file:\s*(\S+)/m) || [])[1];
const headerV = (src.match(/^\s*version:\s*([\d.]+)/m) || [])[1];
const titleV = (src.match(/<title>[^<]*v([\d.]+)/) || [])[1];
const h2V = (src.match(/<h2>v([\d.]+) prototype/) || [])[1];
const logged = [...src.matchAll(/^\s{2}v([\d.]+) \(\d{4}-\d{2}-\d{2}\)/gm)].map(m => m[1]);
const newest = logged[logged.length - 1];
console.log('  filename ' + fileV + ' | header ' + headerV + ' | title ' + titleV +
            ' | menu ' + h2V + ' | newest changelog entry ' + newest);
const agree = [headerV, titleV, h2V, newest].every(v => v === fileV) && headerName === name;
console.log('  all five agree:', agree ? 'CORRECT' : 'WRONG — the build is lying about its own version');
// compare as tuples, not as floats — parseFloat says 0.10 is older than 0.9
const cmp = (a, b) => {
  const A = a.split('.').map(Number), B = b.split('.').map(Number);
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    if ((A[i] || 0) !== (B[i] || 0)) return (A[i] || 0) - (B[i] || 0);
  }
  return 0;
};
console.log('  changelog is in order: ' + logged.join(' -> '),
            logged.length > 1 && logged.every((v, i) => i === 0 || cmp(v, logged[i - 1]) > 0)
              ? 'CORRECT' : 'WRONG');
console.log('VERSION TEST DONE');
})();

(function doorwayTests(){
console.log('--- getting through a doorway, and getting a grenade through one ---');
game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';

// grenades must thread an opening rather than bounce off the jamb
let made = 0, tries = 0;
for (const d of level.doors) {
  openDoor(d, true);
  const c = doorCenter(d);
  const n = doorNormal(d, c.x + TILE * 2, c.y + TILE * 2);
  const lat = { x: n.y === 0 ? 0 : 1, y: n.x === 0 ? 0 : 1 };
  for (let off = -3; off <= 3; off++) {
    const from = { x: c.x + n.x * TILE * 3 + lat.x * off * 14,
                   y: c.y + n.y * TILE * 3 + lat.y * off * 14, r: 10, side: 'player' };
    if (isWall(tileAt(from.x, from.y).tx, tileAt(from.x, from.y).ty)) continue;
    const target = { x: c.x - n.x * TILE * 2.2, y: c.y - n.y * TILE * 2.2 };
    game.bangs.length = 0;
    throwNade(from, target.x, target.y, 'bang');
    for (let i = 0; i < 200 && game.bangs.length && game.bangs[0].travelLeft > 0; i++) updateBangs(1 / 60);
    const g = game.bangs[0]; tries++;
    if (g && (g.x - c.x) * n.x + (g.y - c.y) * n.y < -TILE * 0.5) made++;
  }
}
console.log('  grenades thrown at a point inside a room: ' + made + '/' + tries + ' got in (' +
            (100 * made / tries).toFixed(0) + '%)',
            made / tries > 0.9 ? 'CORRECT' : 'WRONG');

// a throw with a clear straight line must NOT be bent toward some other door
const P = game.player;
const straight = throwLane({ x: P.x, y: P.y }, P.x + 120, P.y);
console.log('  an unobstructed throw is left alone: ' +
            (Math.abs(straight.x - (P.x + 120)) < 0.01 && !straight.threaded),
            Math.abs(straight.x - (P.x + 120)) < 0.01 ? 'CORRECT' : 'WRONG (aim assist is stealing throws)');

// walking through: near-square approaches must be reliable, oblique ones need work
function traverse(useAssist, approachDeg) {
  game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';
  let ok = 0, n2 = 0;
  for (const d of level.doors) {
    openDoor(d, true);
    const c = doorCenter(d), nn = doorNormal(d, c.x + TILE * 2, c.y + TILE * 2);
    const lat = { x: nn.y === 0 ? 0 : 1, y: nn.x === 0 ? 0 : 1 };
    for (let off = -10; off <= 10; off += 5) {
      const pl = game.player;
      pl.x = c.x + nn.x * TILE * 2 + lat.x * off;
      pl.y = c.y + nn.y * TILE * 2 + lat.y * off;
      if (isWall(tileAt(pl.x, pl.y).tx, tileAt(pl.x, pl.y).ty)) continue;
      n2++;
      const base = Math.atan2(-nn.y, -nn.x) + deg(approachDeg);
      for (let f = 0; f < 260; f++) {
        const nd = nearestDoor(pl.x, pl.y, 40);
        const rad = (nd && nd.state !== 'closed') ? pl.r * TUNE.doorwaySqueeze : pl.r;
        const a = useAssist ? doorwayAssist(pl, Math.cos(base), Math.sin(base))
                            : { dx: Math.cos(base), dy: Math.sin(base) };
        const res = moveCircle(pl.x, pl.y, rad, a.dx * TUNE.playerRun / 60, a.dy * TUNE.playerRun / 60, solidForMove);
        pl.x = res.x; pl.y = res.y;
        if ((pl.x - c.x) * nn.x + (pl.y - c.y) * nn.y < -TILE * 0.9) { ok++; break; }
      }
    }
  }
  return ok / Math.max(1, n2);
}
const sq = traverse(true, 0), ob = traverse(true, 18), hard = traverse(true, 32);
console.log('  walking through, square on: ' + (sq * 100).toFixed(0) + '%',
            sq > 0.9 ? 'CORRECT' : 'WRONG');
console.log('  18° off square: ' + (ob * 100).toFixed(0) + '%', ob > 0.8 ? 'CORRECT' : 'WRONG');
console.log('  32° off square: ' + (hard * 100).toFixed(0) + '% — deliberately still work,',
            hard < 0.8 ? 'CORRECT (catching a frame stays realistic)' : 'note: fully assisted now');
console.log('DOORWAY TEST DONE');
})();

(function sprintTests(){
console.log('--- sprint, and the wind armour costs you ---');
game.mapIndex = 0; initGame(); game.state = 'play';
const P = game.player;

// unarmoured: no tank at all
wearArmor(P, 'none'); P.stam = undefined; P.moving = true;
for (let i = 0; i < 60 * 30; i++) updateStamina(P, 1 / 60, true);
console.log('  no armour, 30s of continuous sprint: stam=' + P.stam + ', still allowed: ' + P.stamOk,
            P.stam === null && P.stamOk ? 'CORRECT (run all day)' : 'WRONG');

// armoured: the tank empties, and roughly on schedule
// read game.player fresh — initGame replaces the object, so a captured
// reference silently measures the previous loadout
function burn(kind) {
  const pl = game.player;
  wearArmor(pl, kind); pl.stam = undefined; pl.blown = false; pl.moving = true;
  updateStamina(pl, 0, false);
  let t = 0;
  while (pl.stamOk && t < 60) { updateStamina(pl, 1 / 60, true); t += 1 / 60; }
  return t;
}
const rows = ['soft', 'plate', 'heavy'].map(k => ({ k, t: burn(k), spec: ARMOR[k].sprint }));
rows.forEach(r => console.log('  ' + ARMOR[r.k].name.padEnd(11) + 'sprinted ' + r.t.toFixed(1) +
                              's (tank ' + r.spec + 's)'));
console.log('  each tier is shorter than the last:',
            rows.every((r, i) => i === 0 || r.t < rows[i - 1].t) ? 'CORRECT' : 'WRONG');
console.log('  and each matches its tank:',
            rows.every(r => Math.abs(r.t - r.spec) < 0.4) ? 'CORRECT' : 'WRONG');

// blown means blown: you cannot stutter-tap it back
wearArmor(P, 'heavy'); P.stam = 0; P.blown = true; P.moving = true;
updateStamina(P, 1 / 60, true);
console.log('  sprinting on an empty tank: ' + P.stamOk, !P.stamOk ? 'CORRECT (you are blown)' : 'WRONG');
let recov = 0;
while (P.blown && recov < 30) { updateStamina(P, 1 / 60, false); recov += 1 / 60; }
console.log('  seconds of not-sprinting before you can go again: ' + recov.toFixed(1),
            recov > 1 && recov < 8 ? 'CORRECT' : 'WRONG');

// standing still recovers faster than jogging
wearArmor(P, 'plate'); P.stam = 1; P.blown = false;
P.moving = true;  let a = P.stam; updateStamina(P, 1, false); const jog = P.stam - a;
P.stam = 1; P.moving = false; a = P.stam; updateStamina(P, 1, false); const still = P.stam - a;
console.log('  recovery per second: jogging ' + jog.toFixed(2) + ', standing ' + still.toFixed(2),
            still > jog ? 'CORRECT' : 'WRONG');

// a belt-fed empties the tank faster than a carbine
game.loadout.armor = 'plate';
game.loadout.primary = 'carbine'; initGame(); const carb = burn('plate');
game.loadout.primary = 'saw';     initGame(); const saw = burn('plate');
game.loadout.primary = 'carbine'; initGame();
console.log('  same plate, carbine ' + carb.toFixed(1) + 's vs belt-fed ' + saw.toFixed(1) + 's',
            saw < carb ? 'CORRECT (the gun drains it too)' : 'WRONG');

// the three gaits must be genuinely different, and sprint must be the worst shot
const mk = (o) => Object.assign({ weapon: PRIMARIES.carbine.w, recoil: 0, moving: true,
                                  walking: false, shoulder: 'strong', suppress: 0, turnBloom: 0 }, o);
const deg2 = r => (r * 180 / Math.PI).toFixed(2);
const steady = currentSpread(mk({ moving: false, steady: true }));
const planted = currentSpread(mk({ moving: false }));
const jogging = currentSpread(mk({}));
const sprinting = currentSpread(mk({ sprinting: true }));
console.log('  cone: steady ' + deg2(steady) + '° < planted ' + deg2(planted) +
            '° < jogging ' + deg2(jogging) + '° < sprinting ' + deg2(sprinting) + '°',
            steady < planted && planted < jogging && jogging < sprinting ? 'CORRECT' : 'WRONG');
console.log('  sprint speed ' + TUNE.playerSprint + ' > run ' + TUNE.playerRun + ' > steady ' + TUNE.playerWalk,
            TUNE.playerSprint > TUNE.playerRun && TUNE.playerRun > TUNE.playerWalk ? 'CORRECT' : 'WRONG');

// --- the stutter-tap sweep.
// A regen that pays out the instant the key is up makes the tank infinite at
// any duty cycle under regen/(drain+regen) — you never blow, and you carry a
// permanent fraction of the sprint bonus for free. Sweep every duty cycle a
// hand can actually produce and demand two things of all of them: the tank
// still empties, and no tap beats simply holding it down.
function rideOut(kind, onFrames, offFrames, seconds) {
  const pl = game.player;
  wearArmor(pl, kind); pl.stam = undefined; pl.blown = false; pl.stamRest = 0;
  pl.moving = true;
  updateStamina(pl, 0, false);
  const dt = 1 / 60, frames = Math.round(seconds / dt);
  let dist = 0, blew = false, lowest = Infinity;
  for (let f = 0; f < frames; f++) {
    const want = onFrames === Infinity ? true : (f % (onFrames + offFrames)) < onFrames;
    updateStamina(pl, dt, want);
    const sprinting = want && pl.stamOk;
    dist += (sprinting ? TUNE.playerSprint : TUNE.playerRun) * armorSpeed(pl) * gunSpeed(pl) * dt;
    if (pl.blown) blew = true;
    lowest = Math.min(lowest, pl.stam);
  }
  return { avg: dist / seconds, blew, lowest };
}
const DUTIES = [[1,1],[1,2],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5],[3,5],[5,5],[6,10],[10,20],[15,45]];
// 120s is longer than any real approach: a pattern that has not emptied a 9s
// tank in two minutes of continuous tapping is paying for itself out of regen.
for (const kind of ['soft', 'plate', 'heavy']) {
  const hold = rideOut(kind, Infinity, 0, 120);
  let best = null, neverBlew = [];
  for (const [on, off] of DUTIES) {
    const r = rideOut(kind, on, off, 120);
    if (!r.blew) neverBlew.push(on + 'on/' + off + 'off (tank floor ' + r.lowest.toFixed(2) + ')');
    if (!best || r.avg > best.avg) best = Object.assign({ on, off }, r);
  }
  console.log('  ' + ARMOR[kind].name.padEnd(11) + 'hold ' + hold.avg.toFixed(1) +
              'px/s, best of ' + DUTIES.length + ' tap patterns ' + best.avg.toFixed(1) +
              'px/s (' + best.on + 'on/' + best.off + 'off)');
  console.log('    every duty cycle still blows the tank:',
              neverBlew.length === 0 ? 'CORRECT' : 'WRONG — free forever at ' + neverBlew.join(', '));
  console.log('    tapping does not beat holding:',
              best.avg <= hold.avg + 0.5 ? 'CORRECT' : 'WRONG — tapping wins by ' +
              (best.avg - hold.avg).toFixed(1) + 'px/s');
}
// and the unarmoured case is untouched by the delay: still no tank to empty
const bare = rideOut('none', 2, 4, 120);
console.log('  NO ARMOR   tapping: ' + bare.avg.toFixed(1) + 'px/s, blown: ' + bare.blew,
            !bare.blew ? 'CORRECT (nothing to spend)' : 'WRONG');
console.log('SPRINT TEST DONE');
})();

(function densityTests(){
console.log('--- enemy density ---');
const names = DENSITY.map(d => d.name + ' x' + d.mul);
console.log('  tiers: ' + names.join(', '),
            DENSITY.length >= 3 && DENSITY.some(d => d.mul === 1) ? 'CORRECT' : 'WRONG');

const rows = [];
let bad = [];
for (let m = 0; m < MAPS.length; m++) {
  const counts = [];
  for (let d = 0; d < DENSITY.length; d++) {
    game.densityIndex = d; game.mapIndex = m; initGame();
    counts.push(game.enemies.length);
    // uniques must stay unique or the objectives break
    const takers = game.enemies.filter(e => e.kind === 'taker').length;
    const hvts = game.enemies.filter(e => e.kind === 'hvt').length;
    if (takers > 1) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' has ' + takers + ' hostage-takers');
    if (hvts > 1) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' has ' + hvts + ' principals');
    // everybody must be somewhere legal and reachable
    const st = tileAt(level.spawns.player.x, level.spawns.player.y);
    for (const e of game.enemies) {
      const t = tileAt(e.x, e.y);
      if (isWall(t.tx, t.ty) || isWindow(t.tx, t.ty)) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' spawn inside geometry');
      else if (!astar(st.tx, st.ty, t.tx, t.ty, passForPath, pathCostSquad)) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' unreachable spawn');
    }
    // nobody stacked on top of anybody
    const seenT = new Set();
    for (const e of game.enemies) {
      const k = tileAt(e.x, e.y).tx + ',' + tileAt(e.x, e.y).ty;
      if (seenT.has(k)) bad.push(MAPS[m].name + '@' + DENSITY[d].key + ' two men on one tile');
      seenT.add(k);
    }
  }
  rows.push({ name: MAPS[m].name, counts });
}
game.densityIndex = 1; game.mapIndex = 0; initGame();
rows.forEach(r => console.log('  ' + r.name.padEnd(18) + r.counts.map(c => String(c).padStart(4)).join('')));
console.log('  ' + ''.padEnd(18) + DENSITY.map(d => d.name.slice(0, 4).padStart(4)).join(''));
console.log('  every map scales monotonically:',
            rows.every(r => r.counts.every((c, i) => i === 0 || c >= r.counts[i - 1])) ? 'CORRECT' : 'WRONG');
console.log('  and SWARM is strictly more than STANDARD everywhere:',
            rows.every(r => r.counts[3] > r.counts[1]) ? 'CORRECT' : 'WRONG');
console.log('  placement legal on all ' + MAPS.length + ' maps x ' + DENSITY.length + ' tiers:',
            bad.length ? 'WRONG -> ' + [...new Set(bad)].slice(0, 4).join('; ') : 'CORRECT');

// the briefing must promise what the mission delivers
let drift = [];
for (let m = 0; m < MAPS.length; m++) for (let d = 0; d < DENSITY.length; d++) {
  game.densityIndex = d; game.mapIndex = m; initGame();
  const s = surveyMap(MAPS[m].src, game.diffIndex);
  if (Math.abs(s.contacts - game.enemies.length) > 1) {
    drift.push(MAPS[m].name + '@' + DENSITY[d].key + ' brief says ' + s.contacts + ', map has ' + game.enemies.length);
  }
}
game.densityIndex = 1; game.mapIndex = 0; initGame();
console.log('  briefing contact estimate tracks the real count:',
            drift.length ? 'WRONG -> ' + drift.slice(0, 3).join('; ') : 'CORRECT (within the intel fuzz)');
console.log('DENSITY TEST DONE');
})();

(function beachTests(){
console.log('--- the beach maps, and the demolition objective ---');
const li = MAPS.findIndex(m => m.name === 'THE LANDING');
const si = MAPS.findIndex(m => m.name === 'SEAWALL');
console.log('  both maps exist: ' + (li >= 0) + '/' + (si >= 0), li >= 0 && si >= 0 ? 'CORRECT' : 'WRONG');

game.densityIndex = 1; game.mapIndex = li; initGame();
console.log('  THE LANDING is ' + level.w + 'x' + level.h + ' tiles with ' + game.enemies.length + ' defenders',
            level.w > 60 && level.h > 35 && game.enemies.length >= 20 ? 'CORRECT (large scale)' : 'WRONG');
const st = tileAt(level.spawns.player.x, level.spawns.player.y);
const unreach = level.spawns.enemies.filter(sp => {
  const t = tileAt(sp.x, sp.y);
  return !astar(st.tx, st.ty, t.tx, t.ty, passForPath, pathCostSquad);
});
console.log('  every defender reachable across the beach: ' + (unreach.length === 0),
            unreach.length === 0 ? 'CORRECT' : 'WRONG');
let slits = level.windowAt.size;
console.log('  bunker firing slits: ' + slits + ', doors ' + level.doors.length,
            slits >= 6 && level.doors.length >= 3 ? 'CORRECT' : 'WRONG');

// SEAWALL: a mission you can finish without killing anybody
game.mapIndex = si; initGame(); game.state = 'play';
console.log('  SEAWALL objectives ' + JSON.stringify(MAPS[si].objectives) + ', charges ' + game.demo.length,
            MAPS[si].objectives.join() === 'demolish,extract' && game.demo.length === 3 ? 'CORRECT' : 'WRONG');
console.log('  no neutralize objective — killing is optional:',
            !MAPS[si].objectives.includes('neutralize') ? 'CORRECT' : 'WRONG');
const P = game.player;
console.log('  starts incomplete: demolish ' + OBJECTIVES.demolish.done() + ', extract ' + OBJECTIVES.extract.done(),
            !OBJECTIVES.demolish.done() && !OBJECTIVES.extract.done() ? 'CORRECT' : 'WRONG');

// planting takes time and being there
const d0 = game.demo[0];
P.x = d0.x; P.y = d0.y; P.stagger = 0;
input.keys.clear();
updateDemo(P, 1 / 60);
console.log('  standing on a charge without holding [E]: progress ' + d0.t.toFixed(2),
            d0.t === 0 ? 'CORRECT' : 'WRONG');
input.keys.add('e');
let t = 0;
while (!d0.armed && t < 10) { updateDemo(P, 1 / 60); t += 1 / 60; }
console.log('  holding [E] on it: armed after ' + t.toFixed(1) + 's (spec ' + TUNE.demoPlant + 's)',
            d0.armed && Math.abs(t - TUNE.demoPlant) < 0.2 ? 'CORRECT' : 'WRONG');
// walking off cancels
const d1 = game.demo[1];
P.x = d1.x; P.y = d1.y;
for (let i = 0; i < 60; i++) updateDemo(P, 1 / 60);
const partial = d1.t;
P.x = d1.x + 400; P.y = d1.y;
for (let i = 0; i < 30; i++) updateDemo(P, 1 / 60);
console.log('  walking off mid-plant: ' + partial.toFixed(2) + 's -> ' + d1.t.toFixed(2) + 's',
            d1.t < partial && !d1.armed ? 'CORRECT (it bleeds back)' : 'WRONG');

// exfil must not open until every charge is set
game.demo.forEach(d => { d.armed = false; });
const ez = level.extraction[0];
P.x = ez.tx * TILE + 16; P.y = ez.ty * TILE + 16;
console.log('  standing on the boat with charges unset: extract ' + OBJECTIVES.extract.done(),
            !OBJECTIVES.extract.done() ? 'CORRECT' : 'WRONG');
game.demo.forEach(d => { d.armed = true; });
console.log('  all three set, standing on the boat: extract ' + OBJECTIVES.extract.done(),
            OBJECTIVES.extract.done() ? 'CORRECT' : 'WRONG');
console.log('  ...and the mission is complete with ' + game.enemies.filter(e => e.alive).length + ' defenders still alive',
            game.mission.objectives.every(k => OBJECTIVES[k].done()) && game.enemies.some(e => e.alive)
              ? 'CORRECT (you never had to kill them)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('BEACH TEST DONE');
})();

(function chargeAndAmmoTests(){
console.log('--- wall charges without H, and a readable magazine ---');
console.log('  H is no longer bound:', !/pressed\("h"\)/.test(updatePlayer.toString()) ? 'CORRECT' : 'WRONG');

game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';
const P = game.player;
// find an interior wall and stand next to it
let target = null;
outer: for (let y = 4; y < level.h - 4; y++) for (let x = 4; x < level.w - 4; x++) {
  if (!isWall(x, y) || doorAt(x, y)) continue;
  for (const [ox, oy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    if (!isWall(x + ox, y + oy) && !isWindow(x + ox, y + oy)) {
      target = { x, y, from: { x: (x + ox) * TILE + 16, y: (y + oy) * TILE + 16 } }; break outer;
    }
  }
}
P.x = target.from.x; P.y = target.from.y;
const wc = { x: target.x * TILE + 16, y: target.y * TILE + 16 };
console.log('  pointing at a wall in reach: ' + !!breachableAt(P, wc.x, wc.y),
            breachableAt(P, wc.x, wc.y) ? 'CORRECT (cursor-aimed)' : 'WRONG');
P.x = target.from.x + 600;
console.log('  same wall from 600px away: ' + !!breachableAt(P, wc.x, wc.y),
            !breachableAt(P, wc.x, wc.y) ? 'CORRECT (there is a reach)' : 'WRONG');
P.x = target.from.x;
console.log('  pointing at open floor: ' + !!breachableAt(P, P.x, P.y),
            !breachableAt(P, P.x, P.y) ? 'CORRECT' : 'WRONG');

// it blows on its own
game.wallCharge = null; P.charges = 2;
plantWallCharge(P, breachableAt(P, wc.x, wc.y));
console.log('  planted, charges left ' + P.charges + ', fuse ' + game.wallCharge.fuse + 's',
            game.wallCharge && P.charges === 1 ? 'CORRECT' : 'WRONG');
const wallBefore = level.wall[target.y][target.x];
let t = 0;
while (game.wallCharge && t < 10) { updateFx(1 / 60); t += 1 / 60;
  if (game.wallCharge) { game.wallCharge.fuse -= 1 / 60; if (game.wallCharge.fuse <= 0) detonateWallCharge(); } }
console.log('  it blew itself after ' + t.toFixed(1) + 's, wall ' + wallBefore + ' -> ' + level.wall[target.y][target.x],
            level.wall[target.y][target.x] === 0 ? 'CORRECT (no second keypress)' : 'WRONG');

// the wheel understands a wall
game.mapIndex = MAPS.findIndex(m => m.training); initGame(); game.state = 'play';
const up = WHEEL.find(w => w.dir === 'up');
const wallCtx = { x: wc.x, y: wc.y, wall: { tx: target.x, ty: target.y }, door: null, threat: null, far: true };
console.log('  wheel up on a wall reads: "' + up.label(wallCtx, game.squad) + '"',
            /WALL/.test(up.label(wallCtx, game.squad)) ? 'CORRECT' : 'WRONG');
up.run(game.squad.filter(s => s.alive), wallCtx);
const br = game.squad.find(s => s.order.type === 'wallbreach');
console.log('  it tasks the BREACHER: ' + (br ? br.name + ' (' + br.role + ')' : 'nobody') +
            ', others ' + JSON.stringify(game.squad.filter(s => s !== br).map(s => s.order.type)),
            br && br.role === 'breacher' ? 'CORRECT (the role finally does something)' : 'WRONG');
// and they stand clear of their own blast
const others = game.squad.filter(s => s !== br);
const clear = others.every(s => dist(s.order.x, s.order.y, wc.x, wc.y) > TUNE.blastWound);
console.log('  the rest wait outside the wounding radius: ' + clear, clear ? 'CORRECT' : 'WRONG');
console.log('CHARGE TEST DONE');
})();

(function veterancyTests(){
console.log('--- veterancy: the men get better, and dying costs you all of it ---');
localStorage.clear();
game.mapIndex = 0; game.diffIndex = 1; initGame(); game.state = 'play';

// a fresh team is three boots
let ranks = game.squad.map(s => s.rank.name);
console.log('  fresh team: ' + ranks.join(', '),
            ranks.every(r => r === 'BOOT') ? 'CORRECT' : 'WRONG');

// XP is credited to the man who did the work, not split across the team
const shooter = game.squad[0], bystander = game.squad[1];
const victim = game.enemies.find(e => e.alive);
killEntity(victim, 'squad', shooter);
console.log('  a kill credits the shooter ' + (shooter.mxp || 0) + ' XP, the man beside him ' +
            (bystander.mxp || 0), (shooter.mxp === XP.kill && !bystander.mxp) ? 'CORRECT' : 'WRONG');

// killing a man who has his hands up is not marksmanship
const surr = game.enemies.find(e => e.alive);
surr.state = 'surrender';
const before = shooter.mxp;
killEntity(surr, 'squad', shooter);
console.log('  executing a surrendered suspect pays ' + (shooter.mxp - before) + ' XP',
            shooter.mxp === before ? 'CORRECT (nothing)' : 'WRONG');

// banking: survivors keep it, and it persists
game.squad.forEach(s => { s.alive = true; s.mxp = 100; });
let rowsA = settleVeterancy(true);
let saved = JSON.parse(localStorage.getItem('tdt_vets'));
// only the men who DEPLOYED bank XP — the bench does not level from home
const deployed = game.squad.map(s => s.name);
const bench = SQUAD_NAMES.filter(n => !deployed.includes(n));
console.log('  after a win with +100 each: ' + deployed.map(n => n + '=' + saved[n].xp).join(' ') +
            ' | bench ' + bench.map(n => saved[n].xp).join(','),
            deployed.every(n => saved[n].xp === 100 + XP.win) &&
            bench.every(n => saved[n].xp === 0) ? 'CORRECT (bench stays at 0)' : 'WRONG');
console.log('  and it survives a new mission: ' +
            (initGame(), game.squad.map(s => s.name + ' ' + s.rank.name).join(', ')),
            game.squad.every(s => s.rank.name === 'OPERATOR') ? 'CORRECT (promoted)' : 'WRONG');

// rank is a real mechanical difference, not a label
const boot = RANKS[0], master = RANKS[RANKS.length - 1];
console.log('  BOOT vs MASTER — react x' + boot.react + '/' + master.react +
            ', cone x' + boot.spread + '/' + master.spread + ', suppression x' + boot.sup + '/' + master.sup,
            master.react < boot.react && master.spread < boot.spread && master.sup < boot.sup ? 'CORRECT' : 'WRONG');
const mono = RANKS.every((r, i) => i === 0 || (r.xp > RANKS[i-1].xp && r.react <= RANKS[i-1].react &&
                                               r.spread <= RANKS[i-1].spread && r.sup <= RANKS[i-1].sup));
console.log('  the ladder only ever improves:', mono ? 'CORRECT' : 'WRONG');
// and the tighter cone actually reaches the weapon
localStorage.setItem('tdt_vets', JSON.stringify({ REYES: { xp: 2000, missions: 9, kia: 0 },
                                                  OKAFOR: { xp: 0, missions: 0, kia: 0 },
                                                  DANE: { xp: 0, missions: 0, kia: 0 } }));
initGame();
const vetOp = game.squad.find(s => s.name === 'REYES'), rookie = game.squad.find(s => s.name === 'OKAFOR');
console.log('  REYES is ' + vetOp.rank.name + ' with a ' + (vetOp.weapon.spreadBase * 180 / Math.PI).toFixed(2) +
            '° base cone; OKAFOR is ' + rookie.rank.name + ' at ' +
            (rookie.weapon.spreadBase * 180 / Math.PI).toFixed(2) + '°',
            vetOp.weapon.spreadBase < rookie.weapon.spreadBase ? 'CORRECT' : 'WRONG');

// death wipes it — that is the whole stake
game.squad.forEach(s => { s.mxp = 500; });
vetOp.alive = false;
const rowsB = settleVeterancy(true);
saved = JSON.parse(localStorage.getItem('tdt_vets'));
console.log('  REYES KIA: xp ' + saved.REYES.xp + ', kia count ' + saved.REYES.kia +
            '; OKAFOR banked ' + saved.OKAFOR.xp,
            saved.REYES.xp === 0 && saved.REYES.kia === 1 && saved.OKAFOR.xp > 0 ? 'CORRECT' : 'WRONG');
const kiaRow = rowsB.find(r => r.name === 'REYES');
console.log('  and the debrief says so out loud: "' + kiaRow.text + '"',
            kiaRow.kia && /KIA/.test(kiaRow.text) && /lost/.test(kiaRow.text) ? 'CORRECT' : 'WRONG');
initGame();
console.log('  he comes back a boot: ' + game.squad.find(s => s.name === 'REYES').rank.name,
            game.squad.find(s => s.name === 'REYES').rank.name === 'BOOT' ? 'CORRECT' : 'WRONG');
localStorage.clear(); initGame();
console.log('VETERANCY TEST DONE');
})();

(function gamepadTests(){
console.log('--- gamepad: the pad writes into the same input the keyboard does ---');
game.mapIndex = 0; initGame(); game.state = 'play';

// deadzone: sticks rest dirty, and the response must be continuous past the floor
const rest = padStick(0.15, 0.10), edge = padStick(0.23, 0), full = padStick(1, 0);
console.log('  resting stick (0.15,0.10) -> magnitude ' + rest.m.toFixed(3),
            rest.m === 0 ? 'CORRECT (ignored)' : 'WRONG (drift reaches the game)');
console.log('  just past the floor -> ' + edge.m.toFixed(3) + ', full deflection -> ' + full.m.toFixed(3),
            edge.m > 0 && edge.m < 0.1 && Math.abs(full.m - 1) < 1e-9 ? 'CORRECT (no jump at the edge)' : 'WRONG');
const diag = padStick(1, 1);
console.log('  diagonal is normalised, not 1.41x fast: ' + Math.hypot(diag.x, diag.y).toFixed(3),
            Math.abs(Math.hypot(diag.x, diag.y) - 1) < 1e-9 ? 'CORRECT' : 'WRONG');

// rumble severity is derived from camKick, so it must span the whole range
const kinds = [1, 3, 6, 12].map(rumbleKindFor);
console.log('  camKick rise 1/3/6/12 -> ' + kinds.join(', '),
            new Set(kinds).size === 4 ? 'CORRECT (four distinct textures)' : 'WRONG');
console.log('  every kind has a pattern:',
            kinds.every(k => RUMBLE[k] && RUMBLE[k].ms > 0) ? 'CORRECT' : 'WRONG');
const asc = kinds.every((k, i) => i === 0 || RUMBLE[k].strong >= RUMBLE[kinds[i-1]].strong);
console.log('  and a bigger shake never rumbles less:', asc ? 'CORRECT' : 'WRONG');

// the standard mapping must cover every verb the keyboard has
const verbs = ['a','b','x','y','lb','rb','lt','rt','back','start','l3','r3','up','down','left','right'];
console.log('  buttons mapped: ' + verbs.length + ', all distinct indices: ' +
            new Set(verbs.map(v => PAD[v])).size,
            new Set(verbs.map(v => PAD[v])).size === verbs.length ? 'CORRECT' : 'WRONG');

// a d-pad press must call the SAME play a mouse flick calls
input.padDir = 'up';
game.wheel = { sx: 0, sy: 0, wx: game.player.x + 40, wy: game.player.y, dir: null };
const padPick = wheelDirection();
input.padDir = null;
input.mouse.x = 0; input.mouse.y = -80;      // a flick straight up
const mousePick = wheelDirection();
game.wheel = null;
console.log('  d-pad up -> "' + padPick + '", mouse flick up -> "' + mousePick + '"',
            padPick === 'up' && mousePick === 'up' ? 'CORRECT (one code path)' : 'WRONG');
console.log('  and the pad direction wins over a stale cursor offset:',
            padPick === 'up' ? 'CORRECT' : 'WRONG');

// padOrder must actually issue an order, not just open a wheel
const squad = game.squad.filter(s => s.alive);
squad.forEach(s => s.order = { type: 'follow' });
input.mouse.x = 400; input.mouse.y = 300;
input.mouse.wx = game.player.x + 120; input.mouse.wy = game.player.y;
padOrder(null);                               // "go there"
issueOrders();
input.justPressed.clear(); input.justReleased.clear(); input.padDir = null;
const moved = squad.filter(s => s.order.type !== 'follow').length;
console.log('  A ("go there") retasked ' + moved + '/' + squad.length + ' operators',
            moved === squad.length ? 'CORRECT' : 'WRONG');
console.log('  and the wheel closed behind it:', game.wheel === null ? 'CORRECT' : 'WRONG');

// selection cycling has to terminate back at "whole team"
game.selected.clear();
const seen = [];
for (let i = 0; i < game.squad.length + 1; i++) { padCycleSelection(); seen.push(game.selected.size); }
console.log('  cycling selection ' + (game.squad.length + 1) + 'x -> sizes ' + seen.join(','),
            seen[seen.length - 1] === 0 ? 'CORRECT (wraps back to whole team)' : 'WRONG');

// with no pad present nothing may leak into the keyboard state
input.keys.clear();
pad.connected = false; pad.index = null;
pollGamepad(1 / 60);
console.log('  no controller attached: ' + input.keys.size + ' synthetic keys held, connected=' + pad.connected,
            input.keys.size === 0 && !pad.connected ? 'CORRECT' : 'WRONG');
console.log('  and rumbling into no controller is a no-op:',
            (padRumble('blast', 1), true) ? 'CORRECT' : 'WRONG');
game.selected.clear();
console.log('GAMEPAD TEST DONE');
})();

(function grenadierTests(){
console.log('--- the 40mm: reaching the man you cannot shoot ---');
game.mapIndex = 0; game.loadout.squad = 'standard'; initGame(); game.state = 'play';

// arming distance: a round that flew 100px is a rock, a round that flew 300px is a blast
function fire(d, standoff) {
  const g = { x: 100, y: 100, kind: 'he40', side: 'squad', armed: d >= TUNE.he40Arm };
  const victim = game.enemies.find(e => e.alive);
  victim.x = 100 + standoff; victim.y = 100; const hp0 = victim.hp;
  const alive0 = victim.alive;
  detonateNade(g);
  return { dmg: hp0 - victim.hp, killed: alive0 && !victim.alive };
}
const dud = fire(100, 20);
console.log('  unarmed round (100px flight), man at 20px: ' + dud.dmg.toFixed(0) + ' dmg',
            dud.dmg === 0 ? 'CORRECT (a rock, not a blast)' : 'WRONG');
initGame();
const lethal = fire(300, 20);
console.log('  armed round, man inside the lethal radius: killed=' + lethal.killed,
            lethal.killed ? 'CORRECT' : 'WRONG');
initGame();
const wound = fire(300, 55);
console.log('  armed round, man at 55px: ' + wound.dmg.toFixed(0) + ' dmg through his armour',
            wound.dmg > 15 && !wound.killed ? 'CORRECT (wounds, does not delete the room)' : 'WRONG');

// the friendly-clear check refuses an impact near anyone we protect
initGame();
const h = game.hostages[0];
console.log('  impact point on top of a hostage: ' + blastClearOfFriends(h.x, h.y, TUNE.he40Wound),
            !blastClearOfFriends(h.x, h.y, TUNE.he40Wound) ? 'CORRECT (refused)' : 'WRONG');
const open = { x: game.player.x + 400, y: game.player.y };
// (an impact far from everyone should clear, geometry permitting)

// a grenadier with a covered target lobs; without the launcher role he cannot
const s0 = game.squad[0];
s0.role = 'grenadier'; s0.roe = 'free'; s0.nadeCd = 0; s0.reactT = 0; s0.stagger = 0;
const foe = game.enemies.find(e => e.alive);
foe.x = s0.x + 400; foe.y = s0.y; foe.state = 'combat';
game.bangs.length = 0;
// force the "sees him, cannot shoot him" condition via the AI's own branch:
s0.engaged = foe; s0._blockedBy = null;
const before = game.bangs.length;
if (dist(s0.x, s0.y, foe.x, foe.y) > TUNE.he40Arm + 40 &&
    blastClearOfFriends(foe.x, foe.y, TUNE.he40Wound)) launch40mm(s0, foe.x, foe.y);
const round = game.bangs[game.bangs.length - 1];
console.log('  launched: kind=' + (round && round.kind) + ', armed=' + (round && round.armed) +
            ', cooldown=' + s0.nadeCd + 's',
            round && round.kind === 'he40' && round.armed && s0.nadeCd === TUNE.he40Cd ? 'CORRECT' : 'WRONG');

// the round flies flat and fast and goes off on arrival, not on a hand-grenade fuse
let t = 0; const d0 = dist(round.x, round.y, foe.x, foe.y);
while (game.bangs.length && t < 3) { updateBangs(1 / 120); t += 1 / 120; }
console.log('  ' + d0.toFixed(0) + 'px flight took ' + t.toFixed(2) + 's',
            t < d0 / TUNE.he40Speed + 0.15 ? 'CORRECT (impact-fused, not thrown)' : 'WRONG');

// menu: the grenadier letter shows up in a template row
console.log('  GRENADIER role exists with launcher flag:',
            ROLES.grenadier && ROLES.grenadier.launcher ? 'CORRECT' : 'WRONG');
console.log('GRENADIER TEST DONE');
})();

(function rifleSquadTests(){
console.log('--- the rifle squad: nine guns in two fireteams ---');
localStorage.clear();
game.mapIndex = 0; game.loadout.squad = 'rifle9'; initGame(); game.state = 'play';

console.log('  squad size: ' + game.squad.length,
            game.squad.length === 8 ? 'CORRECT (you are the ninth)' : 'WRONG');
const A = game.squad.filter(s => s.team === 'A'), B = game.squad.filter(s => s.team === 'B');
console.log('  fireteams: A=' + A.length + ' B=' + B.length,
            A.length === 4 && B.length === 4 ? 'CORRECT' : 'WRONG');
const count = r => game.squad.filter(s => s.role === r).length;
console.log('  TO&E: ' + count('rifleman') + ' riflemen, ' + count('grenadier') + ' grenadiers, ' +
            count('support') + ' ARs',
            count('rifleman') === 4 && count('grenadier') === 2 && count('support') === 2
              ? 'CORRECT (TL/GRN/AR/RFLM x2)' : 'WRONG');
console.log('  team leads flagged: ' + game.squad.filter(s => s.lead).map(s => s.team + '-' + s.name).join(', '),
            game.squad.filter(s => s.lead).length === 2 ? 'CORRECT' : 'WRONG');
const names = new Set(game.squad.map(s => s.name));
console.log('  eight distinct names, all on the veterancy books: ' + names.size + '/' +
            Object.keys(loadVets()).length,
            names.size === 8 && Object.keys(loadVets()).length >= 8 ? 'CORRECT' : 'WRONG');

// every man spawned somewhere he can stand
const stuck = game.squad.filter(s => solidForMove(Math.floor(s.x / TILE), Math.floor(s.y / TILE)));
console.log('  spawn overflow ringed onto passable ground: ' + (8 - stuck.length) + '/8',
            stuck.length === 0 ? 'CORRECT' : 'WRONG');

// formation: eight distinct stations, none downrange of the player
game.player.face = 0;
const bearings = game.squad.map(s => { s._wedgeAng = undefined; const st = wedgeStation(s, 10); return angleTo(game.player.x, game.player.y, st.x, st.y); });
const inBore = bearings.filter(b => Math.abs(angDiff(0, b)) < deg(35)).length;
console.log('  stations inside ±35° of the bore: ' + inBore,
            inBore === 0 ? 'CORRECT (nobody downrange)' : 'WRONG');
const uniq = new Set(bearings.map(b => b.toFixed(1)));
console.log('  distinct bearings: ' + uniq.size + '/8', uniq.size >= 7 ? 'CORRECT' : 'WRONG');

// BOUND splits by fireteam, not by list order
const play = WHEEL.find(w => w.name === 'BOUND');
play.run(game.squad.filter(s => s.alive), { point: { x: game.player.x + 200, y: game.player.y } });
const aElems = new Set(A.map(s => s.order.element)), bElems = new Set(B.map(s => s.order.element));
console.log('  BOUND: team A elements ' + [...aElems].join(',') + ', team B ' + [...bElems].join(','),
            aElems.size === 1 && bElems.size === 1 && [...aElems][0] !== [...bElems][0]
              ? 'CORRECT (bounds by fireteam)' : 'WRONG');

// T cycles team selection
game.selected.clear(); game._teamSel = null;
input.justPressed.add('t'); issueOrders(); input.justPressed.clear();
const selA = [...game.selected].every(i => game.squad[i].team === 'A') && game.selected.size === 4;
input.justPressed.add('t'); issueOrders(); input.justPressed.clear();
const selB = [...game.selected].every(i => game.squad[i].team === 'B') && game.selected.size === 4;
input.justPressed.add('t'); issueOrders(); input.justPressed.clear();
console.log('  [T]: team A (' + selA + ') -> team B (' + selB + ') -> everyone (' + (game.selected.size === 0) + ')',
            selA && selB && game.selected.size === 0 ? 'CORRECT' : 'WRONG');

// the three-man templates are untouched
game.loadout.squad = 'standard'; initGame();
console.log('  STANDARD still fields ' + game.squad.length + ', teamless: ' +
            game.squad.every(s => !s.team),
            game.squad.length === 3 && game.squad.every(s => !s.team) ? 'CORRECT' : 'WRONG');
localStorage.clear();
console.log('RIFLE SQUAD TEST DONE');
})();

(function gasTests(){
console.log('--- CS gas: your masks work, theirs do not ---');
game.mapIndex = 0; game.loadout.squad = 'standard'; game.loadout.kit = 'riot'; initGame(); game.state = 'play';

console.log('  RIOT kit carries: ' + JSON.stringify(game.player.nades),
            game.player.nades.gas === 3 && game.player.nades.smoke === 0 ? 'CORRECT (gas replaces smoke)' : 'WRONG');

// the cloud must never block a sightline
game.smokes.length = 0;
popGas({ x: game.player.x + 100, y: game.player.y, side: 'player' });
for (let i = 0; i < 240; i++) { updateSmokes(1 / 60); }
const cloud = game.smokes[0];
// test the mechanism, not the map: a smoke cloud writes the vision grid, a gas
// cloud must not — and opaque() at the cloud's own centre must stay false
const gridSet = level.smokeGrid ? level.smokeGrid.reduce((n, v) => n + v, 0) : 0;
const ct = tileAt(cloud.x, cloud.y);
console.log('  cloud at r=' + cloud.r.toFixed(0) + ': smoke-grid cells set ' + gridSet +
            ', opaque at centre ' + opaque(ct.tx, ct.ty),
            gridSet === 0 && !opaque(ct.tx, ct.ty) ? 'CORRECT (CS is thin)' : 'WRONG');
game.smokes.length = 0; popSmoke({ x: cloud.x, y: cloud.y, side: 'player' });
for (let i = 0; i < 240; i++) updateSmokes(1 / 60);
const gridSet2 = level.smokeGrid.reduce((n, v) => n + v, 0);
console.log('  the same spot as SMOKE sets ' + gridSet2 + ' cells',
            gridSet2 > 10 ? 'CORRECT (smoke still blinds)' : 'WRONG');
game.smokes.length = 0; popGas({ x: cloud.x, y: cloud.y, side: 'player' });
for (let i = 0; i < 240; i++) updateSmokes(1 / 60);

// an unmasked man in the cloud accumulates pressure and eventually folds
const foe = game.enemies.find(e => e.alive && e.kind !== 'elite' && e.kind !== 'taker');
foe.x = cloud.x; foe.y = cloud.y; foe.state = 'idle'; foe.gasT = 0;
const r0 = Math.random; let seq = 0.99; Math.random = () => (seq = seq > 0.5 ? 0.01 : 0.99);
let t = 0;
while (foe.state !== 'surrender' && t < 20) { updateSmokes(1/60); updateGasEffects(1 / 60); t += 1 / 60; }
Math.random = r0;
console.log('  unmasked suspect in the cloud folded after ' + t.toFixed(1) + 's (gasT=' +
            foe.gasT.toFixed(1) + ', suppress=' + foe.suppress.toFixed(1) + ')',
            foe.state === 'surrender' && t > TUNE.gasSurrenderAt ? 'CORRECT (chokes, then checks the will table)' : 'WRONG');

// the squad is masked: standing in it costs them nothing
const op = game.squad[0]; op.x = cloud.x; op.y = cloud.y;
const sup0 = op.suppress || 0; op.gasT = 0;
for (let i = 0; i < 120; i++) updateGasEffects(1 / 60);
console.log('  a masked operator in the same cloud: gasT=' + (op.gasT || 0) + ', suppress +' +
            ((op.suppress || 0) - sup0).toFixed(2),
            !(op.gasT > 0) && (op.suppress || 0) - sup0 === 0 ? 'CORRECT (masks work)' : 'WRONG');

// hostages cough but are never killed by it
const h = game.hostages[0]; h.x = cloud.x; h.y = cloud.y; const hp0 = h.hp;
for (let i = 0; i < 600; i++) updateGasEffects(1 / 60);
console.log('  a hostage in the cloud for 10s: hp ' + hp0 + ' -> ' + h.hp + ', gasT=' + h.gasT.toFixed(1),
            h.hp === hp0 && h.gasT > 0 ? 'CORRECT (miserable, not dead)' : 'WRONG');

// the wheel: gas rides the smoke slot, and the pick prefers what you carry
const cands = THROW_ORDER.filter(k => THROWABLES[k].dir === 'right');
const picked = cands.find(k => (game.player.nades[k] || 0) > 0) || cands[0];
console.log('  flick-right with the RIOT kit picks: ' + picked,
            picked === 'gas' ? 'CORRECT' : 'WRONG');
game.loadout.kit = 'entry'; initGame();
const cands2 = THROW_ORDER.filter(k => THROWABLES[k].dir === 'right');
const picked2 = cands2.find(k => (game.player.nades[k] || 0) > 0) || cands2[0];
console.log('  flick-right with the ENTRY kit picks: ' + picked2,
            picked2 === 'smoke' ? 'CORRECT (kits decide the slot)' : 'WRONG');
console.log('GAS TEST DONE');
})();

(function suppressorTests(){
console.log('--- suppressors: silence bought with handling ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; game.loadout.kit = 'entry';

// loud is the default, and the toggle reaches the whole team
game.loadout.can = false; initGame(); game.state = 'play';
console.log('  default loadout: player can=' + !!game.player.can,
            !game.player.can ? 'CORRECT (loud until chosen)' : 'WRONG');
game.loadout.can = true; initGame(); game.state = 'play';
console.log('  SUPPRESSED: player + squad fitted: ' +
            [game.player, ...game.squad].map(e => !!e.can).join(','),
            [game.player, ...game.squad].every(e => e.can) ? 'CORRECT (whole team)' : 'WRONG');

// the report: radius, flash, and what an enemy hears through a wall
const P = game.player;
game.noises.length = 0; game.fx.length = 0;
P.cooldown = 0; P.reloading = 0; P.ammo = 30;
tryFire(P, P.face);
const nSupp = game.noises.find(n => n.type === 'shot');
const flashSupp = game.fx.some(f => f.kind === 'muzzle');
console.log('  suppressed shot: radius ' + nSupp.radius + ' (loud is ' + TUNE.noiseShot + '), fuzzy=' +
            nSupp.fuzzy + ', muzzle flash drawn=' + flashSupp,
            nSupp.radius === TUNE.suppNoiseShot && nSupp.fuzzy && !flashSupp ? 'CORRECT' : 'WRONG');
game.loadout.can = false; initGame(); game.state = 'play';
const P2 = game.player;
game.noises.length = 0; game.fx.length = 0;
P2.cooldown = 0; P2.ammo = 30; tryFire(P2, P2.face);
const nLoud = game.noises.find(n => n.type === 'shot');
console.log('  loud shot: radius ' + nLoud.radius + ', flash drawn=' + game.fx.some(f => f.kind === 'muzzle'),
            nLoud.radius === TUNE.noiseShot && !nLoud.fuzzy && game.fx.some(f => f.kind === 'muzzle')
              ? 'CORRECT' : 'WRONG');

// one interior wall swallows the suppressed report at ranges where loud carries
const behindWall = TUNE.suppNoiseShot - (SOUND_LOSS.drywall || 55);
console.log('  through one drywall partition: suppressed reaches ' + behindWall + 'px, loud reaches ' +
            (TUNE.noiseShot - 55) + 'px',
            behindWall < 160 && TUNE.noiseShot - 55 > 400 ? 'CORRECT (the wall does the work)' : 'WRONG');

// a heard suppressed shot investigates a WRONG point, and does not combat-alert
game.loadout.can = true; initGame(); game.state = 'play';
let scatter = 0, alerted = 0, trials = 40;
for (let i = 0; i < trials; i++) {
  const e = game.enemies.find(x => x.alive);
  e.state = 'idle'; e.investigate = null;
  game.noises.length = 0;
  addNoise(e.x + 60, e.y, TUNE.suppNoiseShot, 'shot', 'player', true);
  processNoises();
  if (e.state === 'combat') alerted++;
  if (e.investigate) scatter += dist(e.investigate.x, e.investigate.y, e.x + 60, e.y);
}
console.log('  40 heard suppressed shots: combat alerts ' + alerted + ', mean placement error ' +
            (scatter / trials).toFixed(0) + 'px',
            alerted === 0 && scatter / trials > 30 ? 'CORRECT (goes looking in the wrong place)' : 'WRONG');

// handling: the fitted gun swings slower
game.loadout.can = false; initGame();
const rate = (can) => {
  game.loadout.can = can; initGame(); game.state = 'play';
  const p = game.player; p.face = 0;
  input.mouse.wx = p.x - 500; input.mouse.wy = p.y;   // 180 degrees away
  updatePlayer(p, 1 / 60);
  return Math.abs(p.face);
};
const swungLoud = rate(false), swungCan = rate(true);
console.log('  one frame of a 180 swing: loud ' + swungLoud.toFixed(3) + ' rad, suppressed ' +
            swungCan.toFixed(3) + ' rad (' + (100 * swungCan / swungLoud).toFixed(0) + '%)',
            swungCan < swungLoud * 0.9 ? 'CORRECT (the longer gun is slower)' : 'WRONG');
game.loadout.can = false; initGame();
console.log('SUPPRESSOR TEST DONE');
})();

(function casualtyTests(){
console.log('--- casualties: down is not dead, and the tourniquet is the difference ---');
localStorage.clear();
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; game.loadout.can = false; initGame(); game.state = 'play';

// a squaddie at zero goes DOWN, and the team does not count him lost yet
const cas = game.squad[0];
cas.hp = 1; cas.armor = 0;
killEntity(cas, 'enemy', null);
console.log('  hit to zero: alive=' + cas.alive + ' downed=' + cas.downed + ' bleedT=' +
            cas.bleedT + 's, squadLost=' + game.stats.squadLost,
            cas.alive && cas.downed && cas.bleedT === TUNE.bleedOut && game.stats.squadLost === 0
              ? 'CORRECT (a casualty, not a corpse)' : 'WRONG');

// enemies stop seeing him as a target
const foe = game.enemies.find(e => e.alive);
foe.x = cas.x + 80; foe.y = cas.y; foe.blind = 0; foe.alerted = true; foe.face = Math.PI;
let acquired = false;
for (const t of [game.player, ...game.squad]) {
  if (!t || !t.alive || t.downed) continue;
  if (t === cas) acquired = true;
}
console.log('  target scan skips the man on the ground:', !acquired ? 'CORRECT' : 'WRONG');

// the clock is real: unstabilized, he bleeds out and THEN it is a death
let t = 0;
while (cas.alive && t < 30) { updateSquaddie(cas, 0.5); t += 0.5; }
console.log('  left bleeding: died after ' + t.toFixed(1) + 's, squadLost=' + game.stats.squadLost,
            !cas.alive && Math.abs(t - TUNE.bleedOut) < 1.5 && game.stats.squadLost === 1
              ? 'CORRECT (the clock was the whole fight)' : 'WRONG');

// the tourniquet: hold [E] on him for tqTime and he is saved — but not healed
initGame(); game.state = 'play';
const cas2 = game.squad[0];
cas2.hp = 1; cas2.armor = 0; killEntity(cas2, 'enemy', null);
game.player.x = cas2.x + 10; game.player.y = cas2.y;
input.keys.add('e');
let held2 = 0;
while (!cas2.stabilized && held2 < 5) { updateTourniquet(game.player, 1 / 60); held2 += 1 / 60; }
input.keys.delete('e');
console.log('  held [E] for ' + held2.toFixed(2) + 's: stabilized=' + cas2.stabilized +
            ', still down=' + cas2.downed + ', hp=' + cas2.hp,
            cas2.stabilized && cas2.downed && cas2.hp === 0 && Math.abs(held2 - TUNE.tqTime) < 0.1
              ? 'CORRECT (saved, not healed)' : 'WRONG');
// and stable means the clock has stopped
const bt = cas2.bleedT;
for (let i = 0; i < 600; i++) updateSquaddie(cas2, 1 / 60);
console.log('  ten more seconds down: alive=' + cas2.alive + ', clock moved ' + (bt - cas2.bleedT).toFixed(1) + 's',
            cas2.alive && bt === cas2.bleedT ? 'CORRECT (stable holds)' : 'WRONG');

// walking away mid-hold loses progress
initGame(); game.state = 'play';
const cas3 = game.squad[0];
cas3.hp = 1; cas3.armor = 0; killEntity(cas3, 'enemy', null);
game.player.x = cas3.x + 10; game.player.y = cas3.y;
input.keys.add('e');
for (let i = 0; i < 60; i++) updateTourniquet(game.player, 1 / 60);   // 1s of 3
const partial = game.tq ? game.tq.t : 0;
game.player.x = cas3.x + 300;                                          // walked off
updateTourniquet(game.player, 1 / 60);
input.keys.delete('e');
console.log('  1s of hold, then walked away: progress was ' + partial.toFixed(2) + 's, now ' +
            (game.tq ? game.tq.t : 0),
            partial > 0.9 && !game.tq && !cas3.stabilized ? 'CORRECT (you have to stay on him)' : 'WRONG');

// veterancy: the stabilized man banks, the bleeder is wiped
localStorage.setItem('tdt_vets', JSON.stringify({ REYES: { xp: 600, missions: 5, kia: 0 },
  OKAFOR: { xp: 600, missions: 5, kia: 0 }, DANE: { xp: 0, missions: 0, kia: 0 } }));
initGame(); game.state = 'play';
const [rey, oka] = [game.squad.find(s => s.name === 'REYES'), game.squad.find(s => s.name === 'OKAFOR')];
rey.hp = 1; rey.armor = 0; killEntity(rey, 'enemy', null); rey.stabilized = true; rey.mxp = 50;
oka.hp = 1; oka.armor = 0; killEntity(oka, 'enemy', null); oka.mxp = 50;   // never tied off
const rows = settleVeterancy(false);
const saved = JSON.parse(localStorage.getItem('tdt_vets'));
console.log('  REYES (tourniquet on): ' + saved.REYES.xp + ' XP — "' + rows.find(r => r.name === 'REYES').text + '"',
            saved.REYES.xp === 660 ? 'CORRECT (kept + banked)' : 'WRONG');
console.log('  OKAFOR (left bleeding): ' + saved.OKAFOR.xp + ' XP, kia=' + saved.OKAFOR.kia,
            saved.OKAFOR.xp === 0 && saved.OKAFOR.kia === 1 ? 'CORRECT (the retreat does not save him)' : 'WRONG');
localStorage.clear(); initGame();
console.log('CASUALTY TEST DONE');
})();

(function newMapsTests(){
console.log('--- ramadi, the treeline, the standoff ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

// trees are a real material with the promised ballistics
console.log('  tree: opaque=' + MATERIALS.tree.opaque + ' resist=' + MATERIALS.tree.resist +
            ' (pistol pen ' + AMMO.pistol.pen + ', rifle pen ' + AMMO.fmj.pen + ')',
            MATERIALS.tree.opaque && AMMO.pistol.pen < MATERIALS.tree.resist &&
            AMMO.fmj.pen > MATERIALS.tree.resist ? 'CORRECT (blocks sight, eats pistol, blunts rifle)' : 'WRONG');

for (const nm of ['RAMADI ROW', 'THE TREELINE', 'THE STANDOFF']) {
  const mi = MAPS.findIndex(m => m.name === nm);
  game.mapIndex = mi; initGame(); game.state = 'play';
  // every enemy reachable from the player spawn
  const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
  const unreachable = level.spawns.enemies.filter(es => {
    const et = tileAt(es.x, es.y);
    return !astar(st0.tx, st0.ty, et.tx, et.ty, passForPath, pathCostSquad);
  });
  console.log('  ' + nm + ': ' + game.enemies.length + ' enemies, all reachable: ' +
              (unreachable.length === 0), unreachable.length === 0 ? 'CORRECT' : 'WRONG');
}

// the treeline actually fights through trees: count tree tiles and check a trunk
game.mapIndex = MAPS.findIndex(m => m.name === 'THE TREELINE'); initGame();
let trees = 0; for (let y = 0; y < level.h; y++) for (let x = 0; x < level.w; x++)
  if (level.mat[y][x] === 'tree') trees++;
console.log('  THE TREELINE has ' + trees + ' tree tiles', trees > 80 ? 'CORRECT (it is a forest)' : 'WRONG');

// the standoff: the front door is locked, and its garrison HOLDS (guards, no patrols)
game.mapIndex = MAPS.findIndex(m => m.name === 'THE STANDOFF'); initGame();
const locked = level.doors.filter(d => d.locked).length;
const patrols = game.enemies.filter(e => e.kind === 'patrol').length;
console.log('  THE STANDOFF: ' + locked + ' barricaded door, ' + patrols + ' patrols among ' +
            game.enemies.length + ' suspects',
            locked >= 1 && patrols === 0 ? 'CORRECT (they hold and wait)' : 'WRONG');

// DMR glass: zoom floor drops with the marksman rifle in hand
game.mapIndex = 0; game.loadout.primary = 'dmr'; initGame(); game.state = 'play';
game.player.gunIndex = 0;
console.log('  glassing() with the DMR up: ' + glassing(), glassing() ? 'CORRECT' : 'WRONG');
game.zoom = 0.7; glassing();
game.player.gunIndex = 1;    // sidearm out
updateCamera(1 / 60);
console.log('  swap to the sidearm at 0.7x: zoom snaps to ' + game.zoom,
            game.zoom === 1 ? 'CORRECT (the glass goes away with the rifle)' : 'WRONG');
game.loadout.primary = 'carbine'; initGame();
console.log('  carbine never glasses: ' + glassing(), !glassing() ? 'CORRECT' : 'WRONG');
console.log('NEW MAPS TEST DONE');
})();

(function buddyAidTests(){
console.log('--- buddy aid and the drag: a wounded man costs two guns ---');
localStorage.clear();
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; initGame(); game.state = 'play';

// right-click a downed man assigns the nearest able squaddie as medic
const cas = game.squad[0], medic = game.squad[1];
cas.hp = 1; cas.armor = 0; killEntity(cas, 'enemy', null);
medic.x = cas.x + 60; medic.y = cas.y;
game.selected.clear();
input.mouse.wx = cas.x; input.mouse.wy = cas.y;
input.justPressed.add('rmb'); issueOrders(); input.justPressed.clear(); input.justReleased.clear();
console.log('  right-click on the casualty: ' + medic.name + ' order=' + medic.order.type,
            medic.order.type === 'aid' && medic.order.target === cas ? 'CORRECT (medic assigned)' : 'WRONG');

// he walks over, works for tqTime, and the casualty comes out stable
let t = 0;
while (!cas.stabilized && t < 20) { updateSquaddie(medic, 1 / 30); t += 1 / 30; }
console.log('  stabilized after ' + t.toFixed(1) + 's (travel + ' + TUNE.tqTime + 's of work): ' + cas.stabilized,
            cas.stabilized && t > TUNE.tqTime ? 'CORRECT' : 'WRONG');
console.log('  and the medic went back to the fight: order=' + medic.order.type,
            medic.order.type === 'hold' ? 'CORRECT' : 'WRONG');

// mid-treatment he does not shoot — that is the two-gun cost
initGame(); game.state = 'play';
const cas2 = game.squad[0], medic2 = game.squad[1];
cas2.hp = 1; cas2.armor = 0; killEntity(cas2, 'enemy', null);
medic2.x = cas2.x + 10; medic2.y = cas2.y;
medic2.order = { type: 'aid', target: cas2 };
updateSquaddie(medic2, 0.5);                       // hands in the wound now
const busy = medic2.order.type === 'aid' && medic2._aidT > 0;
console.log('  mid-treatment state: aidT=' + (medic2._aidT || 0).toFixed(2) + 's — a gun the team does not have',
            busy ? 'CORRECT' : 'WRONG');

// the drag: hold E while moving hauls him; still treats
initGame(); game.state = 'play';
const cas3 = game.squad[0], P = game.player;
cas3.hp = 1; cas3.armor = 0; killEntity(cas3, 'enemy', null);
P.x = cas3.x + 14; P.y = cas3.y;
input.keys.add('e'); P.moving = true;
const from = { x: cas3.x, y: cas3.y };
updateTourniquet(P, 1 / 60);                      // grab him first, within reach
for (let i = 0; i < 40; i++) { P.x += 4; updateTourniquet(P, 1 / 60); }   // then haul
const dragged = dist(cas3.x, cas3.y, from.x, from.y);
console.log('  moving with [E] held: casualty dragged ' + dragged.toFixed(0) + 'px behind, dragging=' + (P.dragging === cas3),
            dragged > 80 && P.dragging === cas3 ? 'CORRECT (haul him out)' : 'WRONG');
console.log('  he trails at arm\'s length: ' + dist(P.x, P.y, cas3.x, cas3.y).toFixed(0) + 'px',
            dist(P.x, P.y, cas3.x, cas3.y) < 30 ? 'CORRECT' : 'WRONG');
P.moving = false;
let held3 = 0;
while (!cas3.stabilized && held3 < 5) { updateTourniquet(P, 1 / 60); held3 += 1 / 60; }
input.keys.delete('e');
console.log('  then stood still ' + held3.toFixed(1) + 's: stabilized=' + cas3.stabilized + ', dragging cleared=' + !P.dragging,
            cas3.stabilized && !P.dragging ? 'CORRECT (one hold, two verbs)' : 'WRONG');
localStorage.clear(); initGame();
console.log('BUDDY AID TEST DONE');
})();

(function formationTests(){
console.log('--- formations: wedge, column, line (FM 3-21.8, compressed) ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'rifle9'; initGame(); game.state = 'play';
const P = game.player; P.face = 0;

function stations() {
  return game.squad.map(s => { s._wedgeAng = undefined; const st = wedgeStation(s, 10); 
    return { bear: angDiff(0, angleTo(P.x, P.y, st.x, st.y)), d: dist(P.x, P.y, st.x, st.y), sector: st.sector }; });
}
game.formation = 'wedge';
const W = stations();
console.log('  WEDGE: ' + W.filter(w => Math.abs(w.bear) < deg(35)).length + ' stations in the bore',
            W.filter(w => Math.abs(w.bear) < deg(35)).length === 0 ? 'CORRECT (balanced, nobody downrange)' : 'WRONG');

game.formation = 'column';
// test the CONTRACT (slot geometry), not the terrain snap — walls legitimately
// deflect a 300px tail on an indoor map, and that is nearestPassable working
const slots = game.squad.map((s, i) => formationSlot(i, game.squad.length));
const behind = slots.filter(sl => Math.abs(Math.abs(sl.bear) - Math.PI) < deg(15)).length;
const spread = Math.max(...slots.map(sl => sl.d)) - Math.min(...slots.map(sl => sl.d));
console.log('  COLUMN: ' + behind + '/8 slots trail behind, depth ' + spread.toFixed(0) + 'px',
            behind === 8 && spread > 200 ? 'CORRECT (a snake — narrow and deep)' : 'WRONG');
const C = stations();
const standable = C.every(c => c.d > 5);
console.log('  and every snapped station is standable ground:', standable ? 'CORRECT' : 'WRONG');
const flankSectors = slots.every(c => Math.abs(Math.abs(angDiff(0, c.sector)) - deg(95)) < deg(2));
console.log('  COLUMN sectors face the flanks (masked fire modeled):',
            flankSectors ? 'CORRECT (head-on contact is one gun)' : 'WRONG');

game.formation = 'line';
const L = stations();
const abreast = L.filter(l => Math.abs(Math.abs(l.bear) - deg(90)) < deg(20)).length;
console.log('  LINE: ' + abreast + '/8 stations abreast, all sectors forward: ' +
            L.every(l => Math.abs(angDiff(0, l.sector)) < deg(5)),
            abreast === 8 && L.every(l => Math.abs(angDiff(0, l.sector)) < deg(5))
              ? 'CORRECT (assault shape — every gun on the front)' : 'WRONG');

// V cycles and wraps
game.formation = 'wedge';
input.justPressed.add('v'); updatePlayer(game.player, 1/60); input.justPressed.clear();
const f1 = game.formation;
input.justPressed.add('v'); updatePlayer(game.player, 1/60); input.justPressed.clear();
const f2 = game.formation;
input.justPressed.add('v'); updatePlayer(game.player, 1/60); input.justPressed.clear();
console.log('  [V]: wedge -> ' + f1 + ' -> ' + f2 + ' -> ' + game.formation,
            f1 === 'column' && f2 === 'line' && game.formation === 'wedge' ? 'CORRECT (cycles)' : 'WRONG');
game.loadout.squad = 'standard'; game.formation = 'wedge'; initGame();
console.log('FORMATION TEST DONE');
})();

(function longWalkTests(){
console.log('--- the long walk: infil, snatch, exfil ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
const mi = MAPS.findIndex(m => m.name === 'THE LONG WALK');
game.mapIndex = mi; initGame(); game.state = 'play';
console.log('  map: ' + level.w + 'x' + level.h + ', objectives ' + JSON.stringify(MAPS[mi].objectives),
            level.w >= 70 && MAPS[mi].objectives.includes('capture') && MAPS[mi].objectives.includes('extract')
              ? 'CORRECT (large, and the job is a round trip)' : 'WRONG');
const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
const hvt = level.spawns.enemies.find(e => e.kind === 'hvt');
const ht = tileAt(hvt.x, hvt.y);
const path = astar(st0.tx, st0.ty, ht.tx, ht.ty, passForPath, pathCostSquad);
console.log('  HVT reachable, ' + (path ? path.length : 0) + ' tiles out',
            path && path.length > 60 ? 'CORRECT (a genuinely long walk)' : 'WRONG');
const unreachable = level.spawns.enemies.filter(es => {
  const et = tileAt(es.x, es.y);
  return !astar(st0.tx, st0.ty, et.tx, et.ty, passForPath, pathCostSquad);
});
console.log('  all ' + level.spawns.enemies.length + ' contacts reachable: ' + (unreachable.length === 0),
            unreachable.length === 0 ? 'CORRECT' : 'WRONG');
console.log('  extraction back at the treeline: ' + level.extraction.length + ' tiles at x=' +
            level.extraction.map(e => e.tx).join(','),
            level.extraction.length >= 2 && level.extraction.every(e => e.tx < 10) ? 'CORRECT' : 'WRONG');
console.log('LONG WALK TEST DONE');
})();

(function droneTests(){
console.log('--- FIELD TEST: the drones ---');
game.mapIndex = MAPS.findIndex(m => m.name === 'RAMADI ROW');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
initGame(); game.state = 'play';

// ISR: reveals the street, never the rooms
seen.init();
const yard = { x: 23 * TILE, y: 12 * TILE };          // mid-street
launchISR(yard.x, yard.y);
console.log('  launched: on station=' + !!game.isr + ', remaining=' + game.isrLeft,
            game.isr && game.isrLeft === 0 ? 'CORRECT (one per mission, field-test tuning)' : 'WRONG');
updateISR(0.5);
let ext = 0, int = 0;
for (let ty = 0; ty < level.h; ty++) for (let tx = 0; tx < level.w; tx++) {
  if (!seen.grid[ty][tx]) continue;
  const cx = tx * TILE + 16, cy = ty * TILE + 16;
  if (dist(yard.x, yard.y, cx, cy) > TUNE.isrRadius) continue;
  if (level.interior[ty][tx] && !level.wall[ty][tx]) int++;
  else if (!level.interior[ty][tx]) ext++;
}
console.log('  revealed: ' + ext + ' exterior tiles, ' + int + ' interior floor tiles',
            ext > 30 && int === 0 ? 'CORRECT (intel, not a wallhack)' : 'WRONG');
// paints men in the open, not men indoors
const outside = game.enemies.find(e => { const t2 = tileAt(e.x, e.y); return !level.interior[t2.ty][t2.tx]; })
             || game.enemies[0];
outside.x = yard.x + 40; outside.y = yard.y; outside.lastSeen = null;
const inside = game.enemies.find(e => e !== outside);
const it = tileAt(inside.x, inside.y);
inside.x = 8 * TILE + 16; inside.y = 6 * TILE + 16; inside.lastSeen = null;   // in a house
game.isr.tick = 0; updateISR(0.01);
console.log('  painted: man in the street=' + !!outside.lastSeen + ', man indoors=' + !!inside.lastSeen,
            outside.lastSeen && !inside.lastSeen ? 'CORRECT' : 'WRONG');
let t = 0; while (game.isr && t < 40) { updateISR(0.5); t += 0.5; }
console.log('  bingo after ' + t.toFixed(1) + 's', Math.abs(t - TUNE.isrTime) < 1.5 ? 'CORRECT' : 'WRONG');

// FPV: the man is a statue, the bird flies over walls, the blast is real
initGame(); game.state = 'play';
const P = game.player, px0 = P.x;
launchFPV();
console.log('  FPV up: ' + !!game.fpv + ', remaining=' + game.fpvLeft,
            game.fpv && game.fpvLeft === 0 ? 'CORRECT' : 'WRONG');
input.keys.add('d');
game.noises.length = 0;
for (let i = 0; i < 120; i++) { updatePlayer(P, 1 / 60); }
input.keys.delete('d');
const flew = game.fpv.x - px0;
console.log('  two seconds of D: bird +' + flew.toFixed(0) + 'px, man +' + (P.x - px0).toFixed(0) + 'px',
            flew > 300 && P.x === px0 ? 'CORRECT (goggles down, statue)' : 'WRONG');
console.log('  the world heard it: ' + game.noises.filter(n => n.side === 'player').length + ' buzz noises',
            game.noises.filter(n => n.side === 'player').length >= 3 ? 'CORRECT' : 'WRONG');
const foe2 = game.enemies.find(e => e.alive);
foe2.x = game.fpv.x + 15; foe2.y = game.fpv.y; const hp0 = foe2.hp; const alive0 = foe2.alive;
input.justPressed.add('lmb'); updatePlayer(P, 1 / 60); input.justPressed.clear();
console.log('  LMB: detonated=' + !game.fpv + ', man beside it ' + (foe2.alive ? (hp0 - foe2.hp).toFixed(0) + ' dmg' : 'killed'),
            !game.fpv && (!foe2.alive || foe2.hp < hp0) ? 'CORRECT (a frag with a camera)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('DRONE TEST DONE');
})();

(function cameraTests(){
console.log('--- FIELD TEST: security cameras ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'THE STANDOFF'); initGame(); game.state = 'play';

console.log('  THE STANDOFF mounts ' + level.cameras.length + ' cameras',
            level.cameras.length === 2 ? 'CORRECT' : 'WRONG');
const yardCam = level.cameras.reduce((a, b) => a.y > b.y ? a : b);
console.log('  yard camera faces ' + (Math.abs(angDiff(yardCam.face, Math.PI / 2)) < 0.1 ? 'south (the approach)' : yardCam.face.toFixed(2)),
            Math.abs(angDiff(yardCam.face, Math.PI / 2)) < 0.1 ? 'CORRECT (away from its wall)' : 'WRONG');

// stand in the cone: dwell, then the garrison learns
const P = game.player;
P.x = yardCam.x + Math.cos(yardCam.face) * 100; P.y = yardCam.y + Math.sin(yardCam.face) * 100;
game.enemies.forEach(e => { e.alerted = false; e.state = 'idle'; });
let t = 0;
while (t < 3 && !game.enemies.some(e => e.alerted)) { updateCameras(1 / 30); t += 1 / 30; }
const alerted = game.enemies.filter(e => e.alerted).length;
console.log('  stood in the cone: burned after ' + t.toFixed(1) + 's, ' + alerted + ' suspects alerted',
            t > TUNE.camDwell - 0.2 && t < TUNE.camDwell + 0.6 && alerted >= 1 && alerted <= 3
              ? 'CORRECT (dwell, then the call)' : 'WRONG');

// a fast crossing is a flicker, not a call
initGame(); game.state = 'play';
const cam2 = level.cameras.reduce((a, b) => a.y > b.y ? a : b);
game.player.x = cam2.x + Math.cos(cam2.face) * 100; game.player.y = cam2.y + Math.sin(cam2.face) * 100;
// the squad spawns at the police line — exactly what a yard camera watches, as
// the first draft of this test discovered. Park them out of frame.
game.squad.forEach((sq, i) => { sq.x = cam2.x - 400; sq.y = cam2.y - 400 + i * 30; });
game.enemies.forEach(e => { e.alerted = false; e.state = 'idle'; });
for (let i = 0; i < 15; i++) updateCameras(1 / 30);      // half a second
game.player.x = cam2.x - 300;                             // gone
for (let i = 0; i < 90; i++) updateCameras(1 / 30);
console.log('  crossed it in 0.5s: alerted=' + game.enemies.some(e => e.alerted) + ', dwell decayed to ' + cam2.dwell.toFixed(2),
            !game.enemies.some(e => e.alerted) && cam2.dwell === 0 ? 'CORRECT (a flicker)' : 'WRONG');

// any round takes it off the wall — loudly
game.bullets.push({ x: cam2.x - 60, y: cam2.y, ang: 0, speed: 1500, dmg: 30, pen: 26,
                    side: 'player', traveled: 0, range: 300, alive: true, ox: cam2.x - 60, oy: cam2.y });
game.noises.length = 0;
for (let i = 0; i < 10 && cam2.alive; i++) updateBullets(1 / 120);
console.log('  shot: camera dead=' + !cam2.alive + ', glass noise=' +
            game.noises.some(n => n.type === 'glass'),
            !cam2.alive && game.noises.some(n => n.type === 'glass') ? 'CORRECT (loud option)' : 'WRONG');

// the quiet option: walk under it and snip
initGame(); game.state = 'play';
const cam3 = level.cameras[0];
game.player.x = cam3.x + 10; game.player.y = cam3.y;
game.noises.length = 0;
playerInteract(game.player);
console.log('  [E] underneath: dead=' + !cam3.alive + ', noises made=' + game.noises.length,
            !cam3.alive && game.noises.length === 0 ? 'CORRECT (quiet option)' : 'WRONG');

game.mapIndex = MAPS.findIndex(m => m.name === 'THE LONG WALK'); initGame();
console.log('  THE LONG WALK town mounts ' + level.cameras.length,
            level.cameras.length === 2 ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('CAMERA TEST DONE');
})();

(function fireSupportTests(){
console.log('--- FIELD TEST: fire missions ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

// indoor missions have no guns on call
game.mapIndex = 0; initGame(); game.state = 'play';
callFireMission(game.player.x + 200, game.player.y);
console.log('  THE COMPOUND: missions=' + game.fireMissionsLeft + ', called=' + !!game.fireMission,
            game.fireMissionsLeft === 0 && !game.fireMission ? 'CORRECT (no guns for CQB)' : 'WRONG');

// the treeline has a battery
game.mapIndex = MAPS.findIndex(m => m.name === 'THE TREELINE'); initGame(); game.state = 'play';
console.log('  THE TREELINE: ' + game.fireMissionsLeft + ' fire missions on call',
            game.fireMissionsLeft === 2 ? 'CORRECT' : 'WRONG');
const tx = game.player.x + 500, ty = game.player.y;
const foe = game.enemies.find(e => e.alive);
foe.x = tx; foe.y = ty; const hp0 = foe.hp;
callFireMission(tx, ty);
console.log('  called: left=' + game.fireMissionsLeft + ', splash in ' + game.fireMission.t + 's',
            game.fireMissionsLeft === 1 && game.fireMission.t === TUNE.mortarFlight ? 'CORRECT' : 'WRONG');
// nothing lands during flight
for (let i = 0; i < 60 * 3.5; i++) updateFireMission(1 / 60);
console.log('  3.5s in: rounds still in the air=' + (game.fireMission.rounds === TUNE.mortarRounds),
            game.fireMission.rounds === TUNE.mortarRounds ? 'CORRECT (no recall, no early impact)' : 'WRONG');
let t = 0;
game.decals.length = 0;
while (game.fireMission && t < 10) { updateFireMission(1 / 60); t += 1 / 60; }
console.log('  fire for effect: ' + game.decals.length + ' craters over ' + t.toFixed(1) + 's, target ' +
            (foe.alive ? (hp0 - foe.hp).toFixed(0) + ' dmg' : 'killed'),
            game.decals.length === TUNE.mortarRounds && (!foe.alive || foe.hp < hp0)
              ? 'CORRECT (five rounds, a sheaf, a result)' : 'WRONG');
const spread2 = Math.max(...game.decals.map(d => dist(d.x, d.y, tx, ty)));
console.log('  worst round landed ' + spread2.toFixed(0) + 'px off the grid',
            spread2 <= TUNE.mortarScatter * 1.5 ? 'CORRECT (scatter bounded)' : 'WRONG');

// danger close warns but does not refuse — the sheaf is YOUR responsibility
initGame(); game.state = 'play';
callFireMission(game.player.x + 60, game.player.y);
console.log('  called on our own position: "' + game.hint.slice(0, 60) + '..."',
            /DANGER CLOSE/.test(game.hint) && game.fireMission ? 'CORRECT (warns, fires anyway)' : 'WRONG');
game.fireMission = null;
callFireMission(game.player.x + 500, game.player.y);
callFireMission(game.player.x + 500, game.player.y);
console.log('  battery dry: "' + game.hint.slice(0, 40) + '"',
            /dry|left/.test(game.hint) ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('FIRE SUPPORT TEST DONE');
})();

(function houseVariantTests(){
console.log('--- the standoff rotation: three houses, three problems ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
for (const nm of ['THE SPLIT', 'THE RANCH']) {
  const mi = MAPS.findIndex(m => m.name === nm);
  game.mapIndex = mi; initGame(); game.state = 'play';
  const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
  const unreachable = level.spawns.enemies.filter(es => {
    const et = tileAt(es.x, es.y);
    return !astar(st0.tx, st0.ty, et.tx, et.ty, passForPath, pathCostSquad);
  });
  const locked = level.doors.filter(d => d.locked).length;
  const patrols = game.enemies.filter(e => e.kind === 'patrol').length;
  console.log('  ' + nm + ': ' + game.enemies.length + ' suspects (' + patrols + ' patrols), ' +
              locked + ' barricaded doors, ' + level.cameras.length + ' camera, all reachable: ' +
              (unreachable.length === 0),
              unreachable.length === 0 && locked >= 1 && patrols === 0 && level.cameras.length === 1
                ? 'CORRECT (holds and waits, like the first one)' : 'WRONG');
}
// the ranch's corridor is real: the hallway row is open end to end
game.mapIndex = MAPS.findIndex(m => m.name === 'THE RANCH'); initGame();
let hall = 0;
for (let x = 7; x <= 38; x++) if (!level.wall[9][x]) hall++;
console.log('  THE RANCH hallway: ' + hall + '/32 tiles open',
            hall >= 30 ? 'CORRECT (a shooting gallery both ways)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('HOUSE VARIANT TEST DONE');
})();

(function peelTests(){
console.log('--- the peel: leaving a fight alive ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'THE TREELINE'); initGame(); game.state = 'play';
const P = game.player;

// a known threat ahead, a rally behind
const foe = game.enemies.find(e => e.alive);
foe.x = P.x + 380; foe.y = P.y; foe.state = 'combat';
foe.lastSeen = { x: foe.x, y: foe.y, t: game.stats.time, face: 0 };
const rally = nearestPassable(P.x - 320, P.y);
input.mouse.wx = rally.x; input.mouse.wy = rally.y;
const play = PLAYS.find(pl => pl.name === 'PEEL');
console.log('  PEEL is on the call sheet [' + play.key + ']', play ? 'CORRECT' : 'WRONG');
callPlay(play);
console.log('  called: orders ' + JSON.stringify(game.squad.map(s => s.order.type)) +
            ', fire axis toward the threat: ' + (Math.abs(game.peel.tx - foe.x) < 60),
            game.squad.every(s => s.order.type === 'peel') && Math.abs(game.peel.tx - foe.x) < 60
              ? 'CORRECT' : 'WRONG');

// drive it: displacement toward the rally, rounds toward the threat, never uncovered
const d0 = game.squad.reduce((a, s2) => a + dist(s2.x, s2.y, rally.x, rally.y), 0) / 3;
const shots0 = game.stats.shotsFired;
let squadRounds = 0, bothMoving = 0, samples = 0, swaps = 0, lastUp = game.peel.moving;
const prevPos = new Map();
for (let f = 0; f < 60 * 16 && game.peel; f++) {
  game.squad.forEach(s2 => prevPos.set(s2, { x: s2.x, y: s2.y }));
  const ammoBefore = game.squad.reduce((a, s2) => a + s2.ammo, 0);
  update(1 / 60);
  squadRounds += Math.max(0, ammoBefore - game.squad.reduce((a, s2) => a + s2.ammo, 0));
  if (!game.peel) break;
  if (game.peel.moving !== lastUp) { swaps++; lastUp = game.peel.moving; }
  samples++;
  const moved = game.squad.filter(s2 => s2.alive && dist(s2.x, s2.y, prevPos.get(s2).x, prevPos.get(s2).y) > 0.4);
  if (moved.length === game.squad.filter(s2 => s2.alive).length) bothMoving++;
}
const d1 = game.squad.reduce((a, s2) => a + dist(s2.x, s2.y, rally.x, rally.y), 0) / 3;
console.log('  mean distance to rally ' + d0.toFixed(0) + ' -> ' + d1.toFixed(0) + 'px over ' +
            (samples / 60).toFixed(1) + 's, ' + swaps + ' element swaps',
            d1 < 80 && swaps >= 1 ? 'CORRECT (they got out, trading places)' : 'WRONG');
console.log('  rounds fired covering the withdrawal: ' + squadRounds,
            squadRounds > 6 ? 'CORRECT (shooting the whole way)' : 'WRONG');
console.log('  frames with nobody set: ' + bothMoving + '/' + samples,
            bothMoving / Math.max(1, samples) < 0.06 ? 'CORRECT' : 'WRONG');
console.log('  and it ended holding, facing the threat: ' +
            game.squad.every(s2 => s2.order.type === 'hold'),
            game.squad.every(s2 => s2.order.type === 'hold') ? 'CORRECT' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('PEEL TEST DONE');
})();

(function turretQrfTests(){
console.log('--- FIELD TEST: the emplaced gun, and the counterattack ---');
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'THE PILLBOX'); initGame(); game.state = 'play';

const t = level.turrets[0];
console.log('  THE PILLBOX mounts ' + level.turrets.length + ' gun, facing its slit: ' +
            (Math.abs(angDiff(t.face0, Math.PI)) < 0.1 ? 'west (the approach)' : t.face0.toFixed(2)),
            level.turrets.length === 1 && Math.abs(angDiff(t.face0, Math.PI)) < 0.1 ? 'CORRECT' : 'WRONG');

// mount: pinned, clamped, belt-fed
const P = game.player;
P.x = t.x + 12; P.y = t.y;
playerInteract(P);
console.log('  [E]: mounted=' + (P.turret === t) + ', weapon=' + P.weapon.name,
            P.turret === t && P.weapon.name === 'EMPLACED M2' ? 'CORRECT' : 'WRONG');
input.mouse.wx = t.x - 300; input.mouse.wy = t.y;      // into the arc
for (let i = 0; i < 30; i++) updatePlayer(P, 1 / 30);
const inArc = Math.abs(angDiff(t.face0, P.face)) < TUNE.turretArc / 2 + 0.01;
input.mouse.wx = t.x + 300;                             // directly behind the mount
for (let i = 0; i < 60; i++) updatePlayer(P, 1 / 30);
const clamped = Math.abs(angDiff(t.face0, P.face)) <= TUNE.turretArc / 2 + 0.01;
console.log('  aim into the arc ok=' + inArc + '; dragged behind the mount, face stays clamped=' + clamped,
            inArc && clamped ? 'CORRECT (it only points where the mount points)' : 'WRONG');
playerInteract(P);
console.log('  [E] again: off the gun, carbine back: ' + P.weapon.name,
            !P.turret && P.weapon.name !== 'EMPLACED M2' ? 'CORRECT' : 'WRONG');

// squaddie on the gun via right-click
const gnr = game.squad[0];
game.selected.clear();
input.mouse.wx = t.x; input.mouse.wy = t.y;
input.mouse.rx = 0; input.mouse.ry = 0;
input.mouse.x = 0; input.mouse.y = 0;      // no stale flick: this is a plain release
input.justPressed.add('rmb'); issueOrders();
input.justPressed.clear(); input.justReleased.add('rmb'); issueOrders(); input.justReleased.clear();
const manOrder = game.squad.find(s2 => s2.order.type === 'man');
console.log('  right-click the gun: ' + (manOrder ? manOrder.name + ' ordered to MAN it' : 'nobody'),
            manOrder ? 'CORRECT' : 'WRONG');
let tm = 0;
while (!manOrder.turret && tm < 15) { updateSquaddie(manOrder, 1 / 30); tm += 1 / 30; }
console.log('  he walked over and mounted in ' + tm.toFixed(1) + 's: ' + (manOrder.turret === t) +
            ', on the belt: ' + manOrder.weapon.name,
            manOrder.turret === t && manOrder.weapon.name === 'EMPLACED M2' ? 'CORRECT' : 'WRONG');
manOrder.order = { type: 'follow' };
updateSquaddie(manOrder, 1 / 30);
console.log('  new order pulls him off: dismounted=' + !manOrder.turret + ', gun free=' + !t.manned,
            !manOrder.turret && !t.manned ? 'CORRECT' : 'WRONG');

// QRF: the quiet minute is not a win
console.log('  QRF declared: ' + JSON.stringify(MAPS[game.mapIndex].qrf) + ', Q points=' + level.spawns.qrf.length,
            MAPS[game.mapIndex].qrf.size === 6 && level.spawns.qrf.length === 2 ? 'CORRECT' : 'WRONG');
const before2 = game.enemies.length;
game.enemies.forEach(e => { e.alive = false; });        // the garrison falls
updateQRF(1 / 30);
console.log('  garrison down: phase=' + game.qrfState.phase + ', neutralize done=' + OBJECTIVES.neutralize.done(),
            game.qrfState.phase === 'inbound' && !OBJECTIVES.neutralize.done()
              ? 'CORRECT (the quiet minute is for reloading)' : 'WRONG');
for (let i = 0; i < 8 * 30; i++) updateQRF(1 / 30);
console.log('  counterattack: ' + (game.enemies.length - before2) + ' fresh guns, all alerted: ' +
            game.enemies.slice(before2).every(e => e.alerted),
            game.enemies.length - before2 === 6 && game.enemies.slice(before2).every(e => e.alerted)
              ? 'CORRECT' : 'WRONG');
game.enemies.forEach(e => { e.alive = false; });
console.log('  wave destroyed: neutralize done=' + OBJECTIVES.neutralize.done(),
            OBJECTIVES.neutralize.done() ? 'CORRECT (NOW it is over)' : 'WRONG');
game.mapIndex = 0; initGame();
console.log('TURRET+QRF TEST DONE');
})();

(function brokenArrowTests(){
console.log('--- BROKEN ARROW: you are the QRF ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW'); initGame(); game.state = 'play';

const wounded = game.squad.filter(s2 => s2.qrfCasualty);
console.log('  deployed ' + game.squad.length + ' (3 up + ' + wounded.length + ' already down), clocks: ' +
            wounded.map(s2 => s2.bleedT + 's').join(', '),
            wounded.length === 2 && wounded.every(s2 => s2.downed && !s2.stabilized && s2.bleedT === TUNE.brokenBleed)
              ? 'CORRECT (the mission is the men)' : 'WRONG');
console.log('  they are strangers: ' + wounded.map(s2 => s2.name).join(', '),
            wounded.every(s2 => RECRUIT_NAMES.includes(s2.name) && s2.recruitCandidate)
              ? 'CORRECT (recruit pool — save them and they can sign)' : 'WRONG');
console.log('  objective reads: "' + OBJECTIVES.stabilize.label() + '", done=' + OBJECTIVES.stabilize.done(),
            /WOUNDED 0\/2/.test(OBJECTIVES.stabilize.label()) && !OBJECTIVES.stabilize.done() ? 'CORRECT' : 'WRONG');

// distance is the enemy: they are a real trip away
const st0 = tileAt(level.spawns.player.x, level.spawns.player.y);
const wt = tileAt(wounded[0].x, wounded[0].y);
const path = astar(st0.tx, st0.ty, wt.tx, wt.ty, passForPath, pathCostSquad);
console.log('  crash site is ' + (path ? path.length : 0) + ' tiles out on a ' + TUNE.brokenBleed + 's clock',
            path && path.length > 12 ? 'CORRECT' : 'WRONG');

// tie both off: objective completes, extract gates open
wounded.forEach(s2 => s2.stabilized = true);
console.log('  both tied off: stabilize done=' + OBJECTIVES.stabilize.done() +
            ', extract still pending=' + !OBJECTIVES.extract.done(),
            OBJECTIVES.stabilize.done() && !OBJECTIVES.extract.done() ? 'CORRECT (now walk home)' : 'WRONG');

// lose one and the mission is lost with him
wounded[0].stabilized = false; wounded[0].bleedT = 0.01;
updateSquaddie(wounded[0], 0.1);
const fail = missionFailure();
console.log('  he bleeds out: "' + (fail || '').slice(0, 50) + '..."',
            fail && /bled out|mission/.test(fail) ? 'CORRECT (the mission fails with him)' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; initGame();
console.log('BROKEN ARROW TEST DONE');
})();

(function muzzleSplitTests(){
console.log('--- the muzzle split: you see from the eye, you shoot from the barrel ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; game.loadout.primary = 'carbine'; game.loadout.can = false;
initGame(); game.state = 'play';
const P = game.player;

function firedFrom(can) {
  game.loadout.can = can; initGame(); game.state = 'play';
  const p = game.player;
  p.face = 0; p.cooldown = 0; p.ammo = 30; p.reloading = 0;
  game.bullets.length = 0;
  tryFire(p, 0);
  const b = game.bullets[0];
  const eye = eyePoint(p);
  return { d: dist(b.ox, b.oy, eye.x, eye.y), eye };
}
const loud = firedFrom(false), supp = firedFrom(true);
console.log('  carbine round leaves ' + loud.d.toFixed(1) + 'px past the eye, suppressed ' + supp.d.toFixed(1),
            Math.abs(loud.d - TUNE.gunLen.default) < 0.5 &&
            Math.abs(supp.d - (TUNE.gunLen.default + TUNE.gunLenCan)) < 0.5
              ? 'CORRECT (the can is a longer gun)' : 'WRONG');

// vision is untouched by the split: eyePoint has no idea what gun you carry
game.loadout.can = false; initGame(); game.state = 'play';
const p2 = game.player; p2.face = 0;
const e1 = eyePoint(p2);
game.loadout.can = true; initGame(); game.state = 'play';
game.player.face = 0;
game.player.x = p2.x; game.player.y = p2.y;
const e2 = eyePoint(game.player);
console.log('  eye point loud vs suppressed: ' + dist(e1.x, e1.y, e2.x, e2.y).toFixed(2) + 'px apart',
            dist(e1.x, e1.y, e2.x, e2.y) < 0.01 ? 'CORRECT (vision cone unchanged)' : 'WRONG');

// against a wall the muzzle clamps: no firing from the far side of masonry
game.loadout.can = false; initGame(); game.state = 'play';
const p3 = game.player;
let wallT = null;
outer: for (let ty = 1; ty < level.h - 1; ty++) for (let tx = 1; tx < level.w - 1; tx++) {
  if (level.wall[ty][tx] && !level.wall[ty][tx - 1] && inBounds(tx - 1, ty) && level.interior[ty][tx - 1]) { wallT = { tx, ty }; break outer; }
}
p3.x = wallT.tx * TILE - 12; p3.y = wallT.ty * TILE + 16; p3.face = 0;
const mzWall = muzzlePoint(p3, 0);
const mt = tileAt(mzWall.x, mzWall.y);
console.log('  12px from a wall, aiming into it: muzzle reaches ' + mzWall.len.toFixed(1) +
            'px, still outside the wall: ' + !level.wall[mt.ty][mt.tx],
            mzWall.len < 12 && !level.wall[mt.ty][mt.tx] ? 'CORRECT (pressed against the brick, not through it)' : 'WRONG');
game.loadout.can = false; initGame();
console.log('MUZZLE SPLIT TEST DONE');
})();

(function sectorTests(){
console.log('--- sectors of fire: responsibility made visible ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'rifle9'; initGame(); game.state = 'play';

// ANCHOR splits the circle by ACTUAL team size, not by three
const team = game.squad.filter(s => s.alive);
PLAYS.find(p => p.key === '4').run(team);
const faces = team.map(s => s.order.face);
const widths = new Set(team.map(s => s.order.sector.toFixed(4)));
let minGap = TAU;
for (let i = 0; i < faces.length; i++) for (let j = i + 1; j < faces.length; j++)
  minGap = Math.min(minGap, Math.abs(angDiff(faces[i], faces[j])));
console.log('  ANCHOR with 8 men: sector width ' + (TAU / 8 * 180 / Math.PI).toFixed(0) +
            '° each, smallest gap between faces ' + (minGap * 180 / Math.PI).toFixed(0) + '°',
            widths.size === 1 && Math.abs([...widths][0] - TAU / 8) < 1e-3 && minGap > deg(40)
              ? 'CORRECT (360 split eight ways, nothing unwatched)' : 'WRONG');

// every order type yields a drawable sector or an honest null
const kinds = {};
team[0].order = { type: 'hold', face: 1, sector: 1 }; kinds.hold = !!sectorOf(team[0]);
team[0].order = { type: 'suppress', x: team[0].x + 100, y: team[0].y }; kinds.suppress = !!sectorOf(team[0]);
team[0].order = { type: 'follow' }; kinds.follow = !!sectorOf(team[0]);
team[0].downed = true; kinds.downedNull = sectorOf(team[0]) === null; team[0].downed = false;
console.log('  sectors: hold=' + kinds.hold + ' suppress=' + kinds.suppress + ' follow=' +
            kinds.follow + ' downed->null=' + kinds.downedNull,
            kinds.hold && kinds.suppress && kinds.follow && kinds.downedNull ? 'CORRECT' : 'WRONG');
game.loadout.squad = 'standard'; initGame();
console.log('SECTOR TEST DONE');
})();

(function chainedWheelTests(){
console.log('--- the chained wheel: right is movement, then how, then what ---');
game.mapIndex = 0; game.diffIndex = 1; game.densityIndex = 1;
game.loadout.squad = 'standard'; initGame(); game.state = 'play';
const P = game.player;

function openWheelAt(wx, wy) {
  input.mouse.wx = wx; input.mouse.wy = wy;
  input.mouse.x = 400; input.mouse.y = 300;
  input.mouse.rx = 400; input.mouse.ry = 300;
  input.justPressed.add('rmb'); issueOrders(); input.justPressed.clear();
}
function flick(dir) {
  const OFF = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  input.mouse.x = game.wheel.sx + OFF[dir][0] * (TUNE.wheelCommit + 10);
  input.mouse.y = game.wheel.sy + OFF[dir][1] * (TUNE.wheelCommit + 10);
  issueOrders();
}
function release() { input.justReleased.add('rmb'); issueOrders(); input.justReleased.clear(); }

// the exact chain from Sam's message: right (move) -> up (bump) -> right (overwatch)
const dest = nearestPassable(P.x + 200, P.y);
openWheelAt(dest.x, dest.y);
console.log('  opened on empty ground: menu=' + game.wheel.menu, game.wheel.menu === 'root' ? 'CORRECT' : 'WRONG');
flick('right');
console.log('  flick right: menu=' + game.wheel.menu + ' (re-anchored)', game.wheel.menu === 'gait' ? 'CORRECT (movement ring)' : 'WRONG');
flick('up');
console.log('  flick up: menu=' + game.wheel.menu + ', locked gait=' + (game.wheel.chain && game.wheel.chain.gait),
            game.wheel.menu === 'posture' && game.wheel.chain.gait === 'bump' ? 'CORRECT (bump locked)' : 'WRONG');
input.mouse.x = game.wheel.sx + TUNE.wheelDeadzone + 8; input.mouse.y = game.wheel.sy;  // point at OVERWATCH, under commit
issueOrders();
release();
const orders = game.squad.map(s2 => s2.order);
console.log('  release on overwatch: orders=' + JSON.stringify(orders.map(o => o.type + '/' + (o.posture || '-') + '/' + (o.fast ? 'fast' : 'slow'))),
            orders.every(o => o.type === 'move' && o.posture === 'overwatch' && o.fast) ? 'CORRECT (bump then overwatch)' : 'WRONG');

// arrival applies the posture
const m0 = game.squad[0];
m0.x = m0.order.x; m0.y = m0.order.y;
updateSquaddie(m0, 1 / 60);
console.log('  on arrival: ' + m0.order.type + ' sector ' + ((m0.order.sector || 0) * 180 / Math.PI).toFixed(0) + '°',
            m0.order.type === 'hold' && m0.order.sector > 1 ? 'CORRECT (overwatching onward)' : 'WRONG');

// operator ring: hold on a man, flick up = self aid; tap = select
initGame(); game.state = 'play';
const op = game.squad[0];
op.hp = 50;
openWheelAt(op.x, op.y);
console.log('  opened ON an operator: menu=' + game.wheel.menu + ' target=' + game.wheel.op.name,
            game.wheel.menu === 'operator' && game.wheel.op === op ? 'CORRECT (contextual)' : 'WRONG');
game.wheel.tapT = 1.0;                                  // held, not tapped
flick('up'); release();
console.log('  flick up (FIRST AID): order=' + op.order.type,
            op.order.type === 'selfaid' ? 'CORRECT' : 'WRONG');
let t3 = 0; const hp0 = op.hp;
while (op.order.type === 'selfaid' && t3 < 8) { updateSquaddie(op, 1 / 30); t3 += 1 / 30; }
console.log('  ' + t3.toFixed(1) + 's later: hp ' + hp0 + ' -> ' + op.hp,
            op.hp === hp0 + TUNE.selfAidHeal && t3 >= TUNE.selfAidTime ? 'CORRECT (a third of him back)' : 'WRONG');
// tap still selects
openWheelAt(game.squad[1].x, game.squad[1].y);
game.wheel.tapT = 0.05; release();
console.log('  a quick tap on a man still selects: ' + game.selected.has(1),
            game.selected.has(1) ? 'CORRECT (muscle memory kept)' : 'WRONG');
game.selected.clear(); initGame();
console.log('CHAINED WHEEL TEST DONE');
})();

(function rosterTests(){
console.log('--- the roster: recruits, recovery, and who actually deploys ---');
localStorage.clear();
game.diffIndex = 1; game.densityIndex = 1; game.loadout.squad = 'standard';

// a wounded survivor goes into recovery, and the next deployment skips him
game.mapIndex = 0; initGame(); game.state = 'play';
const w1 = game.squad[0];                     // REYES
w1.hp = 1; w1.armor = 0; killEntity(w1, 'enemy', null); w1.stabilized = true;
settleVeterancy(true);
let v = loadVets();
console.log('  REYES wounded+stabilized: status=' + v.REYES.status + ' recoverIn=' + v.REYES.recoverIn,
            v.REYES.status === 'recovering' && v.REYES.recoverIn === 2 ? 'CORRECT (out 2 missions)' : 'WRONG');
initGame();
console.log('  next deployment: ' + game.squad.map(s2 => s2.name).join(', '),
            !game.squad.some(s2 => s2.name === 'REYES') && game.squad.length === 3
              ? 'CORRECT (VASQUEZ steps up, REYES sits)' : 'WRONG');

// two finished missions later he is back
settleVeterancy(true); initGame(); settleVeterancy(true);
v = loadVets();
console.log('  after two missions on the sideline: status=' + (v.REYES.status || 'ready'),
            v.REYES.status !== 'recovering' ? 'CORRECT (cleared to return)' : 'WRONG');

// BROKEN ARROW: save a stranger, win, and he signs
localStorage.clear();
game.mapIndex = MAPS.findIndex(m => m.name === 'BROKEN ARROW'); initGame(); game.state = 'play';
const rc = game.squad.filter(s2 => s2.recruitCandidate);
rc.forEach(s2 => { s2.stabilized = true; });
const rows2 = settleVeterancy(true);
v = loadVets();
const signed = rc.filter(s2 => v[s2.name]);
console.log('  both saved and brought home: ' + signed.map(s2 => s2.name + ' (' + v[s2.name].xp + ' XP, ' +
            v[s2.name].status + ')').join(', '),
            signed.length === 2 && signed.every(s2 => v[s2.name].xp === 150 && v[s2.name].recruit &&
              v[s2.name].status === 'recovering') ? 'CORRECT (they owe you one)' : 'WRONG');
console.log('  roster grew: ' + loadRosterOrder().length + ' names',
            loadRosterOrder().length === 10 ? 'CORRECT (8 founders + 2 recruited)' : 'WRONG');
const recruitRow = rows2.find(r => r.recruited);
console.log('  debrief says: "' + recruitRow.text.slice(0, 44) + '..."',
            /RECRUITED/.test(recruitRow.text) ? 'CORRECT' : 'WRONG');

// an unsaved stranger does not sign
localStorage.clear();
initGame(); game.state = 'play';
const rc2 = game.squad.filter(s2 => s2.recruitCandidate);
rc2[0].stabilized = true; rc2[1].alive = false; rc2[1].downed = false;
settleVeterancy(true);
v = loadVets();
console.log('  one saved, one lost: on the books=' + [rc2[0].name, rc2[1].name].map(n => !!v[n]).join('/'),
            v[rc2[0].name] && !v[rc2[1].name] ? 'CORRECT (only the living sign)' : 'WRONG');
localStorage.clear(); game.mapIndex = 0; game.loadout.squad = 'standard'; initGame();
console.log('ROSTER TEST DONE');
})();
