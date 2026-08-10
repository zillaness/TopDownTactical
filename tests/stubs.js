// headless browser stubs
global.window = { addEventListener(){}, innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1 };
const ctxStub = new Proxy({ canvas: {} }, { get: (t, k) => (k in t ? t[k] : (typeof k === 'string' ? () => {} : undefined)), set: () => true });
const elStub = () => ({ addEventListener(){}, classList: { add(){}, remove(){}, toggle(){} }, style: {}, dataset: {}, textContent: '', innerHTML: '', className: '',
  getContext: () => ctxStub, width: 0, height: 0, appendChild(){}, querySelectorAll: () => [] });
global.document = { getElementById: () => elStub(), createElement: () => elStub(), querySelectorAll: () => [] };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => {};
