// headless browser stubs
global.window = { addEventListener(){}, innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1 };
const ctxStub = new Proxy({ canvas: {} }, { get: (t, k) => (k in t ? t[k] : (typeof k === 'string' ? () => {} : undefined)), set: () => true });
const elStub = () => ({ addEventListener(){}, classList: { add(){}, remove(){}, toggle(){} }, style: {}, dataset: {}, textContent: '', innerHTML: '', className: '',
  getContext: () => ctxStub, width: 0, height: 0, appendChild(){}, querySelectorAll: () => [] });
global.document = { getElementById: () => elStub(), createElement: () => elStub(), querySelectorAll: () => [] };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => {};
// localStorage: an in-memory one, so persistence is actually testable headless
// (the real code try/catches around a missing one, which would hide a bug where
// nothing is ever written)
const _ls = new Map();
global.localStorage = {
  getItem: k => (_ls.has(k) ? _ls.get(k) : null),
  setItem: (k, v) => { _ls.set(k, String(v)); },
  removeItem: k => { _ls.delete(k); },
  clear: () => _ls.clear(),
};
