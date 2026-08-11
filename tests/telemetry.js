
// ===== instrumented telemetry: measure fairness, not assert it =====
const VIEW_W = 1280, VIEW_H = 800;
const stats = { hits: [], deaths: [], contacts: [], shots: 0, hostageHits: [] };

const _applyHit = applyHit;
applyHit = function (ent, b, hx, hy) {
  const sh = b.owner;
  if (ent === game.player && sh) {
    const halfW = VIEW_W / (2 * game.zoom), halfH = VIEW_H / (2 * game.zoom);
    const dx = Math.abs(sh.x - game.cam.x), dy = Math.abs(sh.y - game.cam.y);
    stats.hits.push({
      range: Math.round(dist(sh.x, sh.y, ent.x, ent.y)),
      onScreen: dx <= halfW && dy <= halfH,
      hadLOS: lineOfSight(game.eye ? game.eye.x : ent.x, game.eye ? game.eye.y : ent.y, sh.x, sh.y, opaque),
      t: game.stats.time,
      dxCam: Math.round(dx), dyCam: Math.round(dy),
    });
  }
  if (ent.side === 'hostage' || ent.side === 'civ') {
    stats.hostageHits.push({ by: b.side, ric: b.ricochets || 0, pen: b.penetrated || false });
  }
  return _applyHit(ent, b, hx, hy);
};
const _tryFire = tryFire;
tryFire = function (s, ang) { const r = _tryFire(s, ang); if (r && s.side === 'player') stats.shots++; return r; };
// mark rounds that came through a barrier
const _resolveBarrier = resolveBarrier;
resolveBarrier = function (b, hit) { const before = b.alive; _resolveBarrier(b, hit); if (before && b.alive) b.penetrated = true; };

function runBot(mapIdx, reps, loadout) {
  Object.assign(game.loadout, loadout || {});
  const out = { deaths: 0, wins: 0, ttd: [], firstContact: [] };
  for (let r = 0; r < reps; r++) {
    game.mapIndex = mapIdx; initGame(); game.state = 'play';
    const P = game.player; let frames = 0, fc = null;
    input.keys.clear(); input.justPressed.clear();
    while (game.state === 'play' && frames < 60 * 120) {
      frames++;
      input.justPressed.clear(); input.keys.clear(); input.mouse.down = false;
      const tgt = nearestEntity(game.hostages, P.x, P.y, 1e9, h => h.alive && !h.secured)
        || nearestEntity(game.enemies, P.x, P.y, 1e9, e => e.alive && e.state !== 'cuffed');
      if (!tgt) break;
      if (frames % 60 === 1) { const st = tileAt(P.x,P.y), gt = tileAt(tgt.x,tgt.y);
        P._p = astar(st.tx,st.ty,gt.tx,gt.ty,passForPath,pathCostSquad); P._i = 0; }
      let mx = tgt.x, my = tgt.y;
      if (P._p && P._i < P._p.length) { const n = P._p[P._i], nx = n.tx*TILE+16, ny = n.ty*TILE+16;
        if (dist(P.x,P.y,nx,ny) < 14) P._i++;
        else { if(nx>P.x+6)input.keys.add('d'); if(nx<P.x-6)input.keys.add('a');
               if(ny>P.y+6)input.keys.add('s'); if(ny<P.y-6)input.keys.add('w'); } }
      const foe = nearestEntity(game.enemies,P.x,P.y,600,
        e=>e.alive&&e.state!=='cuffed'&&e.state!=='surrender'&&lineOfSight(P.x,P.y,e.x,e.y,opaque));
      if (foe) { if (fc === null) fc = game.stats.time; mx=foe.x; my=foe.y; input.mouse.down=true; }
      input.mouse.wx=mx; input.mouse.wy=my;
      const d = nearestDoor(P.x,P.y,50);
      if (d && d.state==='closed') input.justPressed.add(d.locked?'f':'e');
      if (nearestEntity(game.hostages,P.x,P.y,46,h=>h.alive&&!h.secured)) input.justPressed.add('e');
      try { update(1/60); updateCamera(1/60); } catch(e) {}
    }
    if (!game.player.alive) { out.deaths++; out.ttd.push(game.stats.time); }
    if (game.state === 'debrief' && game.player.alive && missionFailure() === null) out.wins++;
    if (fc !== null) out.firstContact.push(fc);
  }
  return out;
}

const avg = a => a.length ? (a.reduce((x,y)=>x+y,0)/a.length) : 0;
console.log('=== TELEMETRY: 20 runs per mission, default loadout ===');
for (let m = 0; m < MAPS.length; m++) {
  const r = runBot(m, 20);
  console.log(`${MAPS[m].name.padEnd(15)} deaths ${r.deaths}/20  clean wins ${r.wins}/20  ` +
              `avg time-to-death ${avg(r.ttd).toFixed(1)}s  avg first contact ${avg(r.firstContact).toFixed(1)}s`);
}
console.log('');
console.log('=== FAIRNESS: every round that hit the player ===');
const h = stats.hits;
const off = h.filter(x => !x.onScreen).length;
const blind = h.filter(x => !x.hadLOS).length;
console.log(`player was hit ${h.length} times total`);
console.log(`  shooter OFF-SCREEN at the time : ${off} (${(100*off/h.length).toFixed(0)}%)`);
console.log(`  player had NO line of sight to shooter: ${blind} (${(100*blind/h.length).toFixed(0)}%)`);
const ranges = h.map(x=>x.range).sort((a,b)=>a-b);
console.log(`  hit range: median ${ranges[Math.floor(ranges.length/2)]}px  p90 ${ranges[Math.floor(ranges.length*0.9)]}px  max ${ranges[ranges.length-1]}px`);
console.log(`  viewport half-extent at zoom ${game.zoom}: ${Math.round(1280/(2*game.zoom))}px wide, ${Math.round(800/(2*game.zoom))}px tall`);
console.log('');
console.log('=== BYSTANDER CASUALTIES ===');
const bh = stats.hostageHits;
console.log(`hostage/civilian rounds taken: ${bh.length}  by player side: ${bh.filter(x=>x.by==='player'||x.by==='squad').length}  ` +
            `via ricochet: ${bh.filter(x=>x.ric>0).length}  via penetration: ${bh.filter(x=>x.pen).length}`);
console.log(`player shots fired across all runs: ${stats.shots}`);
