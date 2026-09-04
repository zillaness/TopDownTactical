// file: stubs.js (raycaster-poc/tests)
// version: 1.0
// author: Sam Cao
// created: 2026-09-04
// last_updated: 2026-09-04
// description: Minimal DOM and canvas stubs so the raycaster script runs headlessly in Node.
// ai_update: Update last_updated and version. Append changelog at bottom.
//
// The render path is stubbed to no-ops on purpose. These tests assert the
// column solver, the weapon model, and the world queries — the things that can
// be wrong silently. Anything that only shows up as pixels is verified by
// screenshot in a real browser instead.

function ctx2d() {
  const noop = () => {};
  return {
    canvas: null,
    fillStyle: "", strokeStyle: "", lineWidth: 1, font: "", textAlign: "", textBaseline: "",
    imageSmoothingEnabled: false,
    fillRect: noop, strokeRect: noop, clearRect: noop,
    beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop, fill: noop,
    ellipse: noop, arc: noop, rect: noop, clip: noop, save: noop, restore: noop,
    translate: noop, scale: noop, rotate: noop, setTransform: noop,
    fillText: noop, measureText: () => ({ width: 0 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    // getImageData has to return real pixels: the texture cache reads them.
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4).fill(128) }),
    putImageData: noop, drawImage: noop,
  };
}

function makeCanvas(w, h) {
  const c = { width: w || 300, height: h || 150, style: {} };
  c.getContext = () => { const g = ctx2d(); g.canvas = c; return g; };
  c.addEventListener = () => {};
  c.requestPointerLock = () => {};
  return c;
}

const elements = { view: makeCanvas(1280, 800), overlay: { classList: { toggle: () => {} }, addEventListener: () => {} } };

globalThis.document = {
  getElementById: id => elements[id] || null,
  createElement: tag => (tag === "canvas" ? makeCanvas(32, 32) : { style: {}, addEventListener: () => {} }),
  addEventListener: () => {},
  pointerLockElement: null,
};

globalThis.window = {
  innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
  addEventListener: () => {},
};

// A no-op rAF: the bootstrap schedules one frame and it never runs, so the
// tests drive update() themselves at a fixed timestep.
globalThis.requestAnimationFrame = () => 0;

// CHANGELOG
// v1.0 (2026-09-04): Initial stubs.
