
// ===== assault-bot end-to-end playthrough (drives the real input path) =====
function botRun(mapIdx, seedLabel) {
  game.mapIndex = mapIdx; initGame(); game.state = 'play';
  const P = game.player;
  let frames = 0, banged = false, errs = 0;
  input.keys.clear(); input.justPressed.clear();
  while (game.state === 'play' && frames < 60 * 150) {
    frames++;
    input.justPressed.clear();
    input.keys.clear();
    input.mouse.down = false;
    const target = nearestEntity(game.hostages, P.x, P.y, 1e9, h => h.alive && !h.secured)
      || nearestEntity(game.enemies, P.x, P.y, 1e9, e => e.alive && e.state !== 'cuffed');
    if (!target) break;
    // pathing intent: recompute every second
    if (frames % 60 === 1) {
      const st = tileAt(P.x, P.y), gt = tileAt(target.x, target.y);
      P._botPath = astar(st.tx, st.ty, gt.tx, gt.ty, passForPath, pathCostSquad);
      P._botI = 0;
    }
    let mx = target.x, my = target.y;
    if (P._botPath && P._botI < P._botPath.length) {
      const n = P._botPath[P._botI];
      const nx = n.tx * TILE + 16, ny = n.ty * TILE + 16;
      if (dist(P.x, P.y, nx, ny) < 14) P._botI++;
      else {
        if (nx > P.x + 6) input.keys.add('d'); if (nx < P.x - 6) input.keys.add('a');
        if (ny > P.y + 6) input.keys.add('s'); if (ny < P.y - 6) input.keys.add('w');
      }
    }
    // combat: aim & shoot nearest visible enemy
    const foe = nearestEntity(game.enemies, P.x, P.y, 600,
      e => e.alive && e.state !== 'cuffed' && e.state !== 'surrender' && lineOfSight(P.x, P.y, e.x, e.y, opaque));
    if (foe) { mx = foe.x; my = foe.y; input.mouse.down = true; }
    input.mouse.wx = mx; input.mouse.wy = my;
    // doors: kick what's in the way
    const d = nearestDoor(P.x, P.y, 50);
    if (d && d.state === 'closed') input.justPressed.add(d.locked ? 'f' : 'e');
    // one bang into the hostage room when close
    if (!banged && dist(P.x, P.y, target.x, target.y) < TILE * 6 && game.hostages.includes(target)) {
      input.justPressed.add('g'); banged = true;
    }
    // cuff & secure opportunistically
    if (nearestEntity(game.enemies, P.x, P.y, 46, e => e.alive && e.state === 'surrender')) input.justPressed.add('e');
    if (nearestEntity(game.hostages, P.x, P.y, 46, h => h.alive && !h.secured)) input.justPressed.add('e');
    try { update(1 / 60); } catch (e) { errs++; if (errs < 3) console.log('UPDATE ERROR:', e.message); }
  }
  const st = game.stats;
  console.log(`bot[${seedLabel}] map${mapIdx}: end=${game.state} t=${st.time.toFixed(0)}s ` +
    `playerAlive=${game.player.alive} hostSec=${st.hostagesSecured} hostDead=${st.hostagesDead} ` +
    `kills=${st.kills} arrests=${st.arrests} squadLost=${st.squadLost} errors=${errs}`);
  return errs;
}
let totalErrs = 0;
for (let r = 0; r < 3; r++) totalErrs += botRun(0, 'r' + r);
for (let r = 0; r < 3; r++) totalErrs += botRun(1, 'r' + r);
for (let r = 0; r < 3; r++) totalErrs += botRun(2, 'r' + r);
console.log('BOT RUNS DONE, total update errors:', totalErrs);
