// jsdom doesn't implement requestAnimationFrame; the bar uses rAF for the
// auto-scroll overflow check in _setScrollText. Shim it so init() doesn't
// throw and the callback can run on a microtask-ish timer.
if (typeof globalThis.requestAnimationFrame !== 'function') {
	globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
	globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

// This jsdom build exposes sessionStorage but not localStorage (the bar uses
// localStorage for volume + favorites). Provide a minimal in-memory shim so
// those persistence paths are exercised by the tests.
if (typeof globalThis.localStorage === 'undefined') {
	const store = new Map();
	const ls = {
		getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
		setItem: (k, v) => { store.set(String(k), String(v)); },
		removeItem: (k) => { store.delete(String(k)); },
		clear: () => { store.clear(); },
		key: (i) => [...store.keys()][i] ?? null,
		get length() { return store.size; },
	};
	globalThis.localStorage = ls;
	if (typeof window !== 'undefined') window.localStorage = ls;
}
