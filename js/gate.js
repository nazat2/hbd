/* Layar pembuka: satu tap = interaksi pertama, jadi musik bisa langsung menyala */
(() => {
  const gate = document.getElementById('gate'), btn = document.getElementById('gateBtn');
  if (!gate || !btn) return;
  const root = document.documentElement;
  ['1', '2'].forEach(n => { new Image().src = 'assets/images/finale/balloon-' + n + '.webp'; });   // panaskan cache
  const block = e => { e.preventDefault(); e.stopImmediatePropagation(); };
  const opts = { capture: true, passive: false };
  const lock = () => { root.classList.add('gate-lock'); ['wheel', 'touchmove'].forEach(t => addEventListener(t, block, opts)); };
  const unlock = () => { root.classList.remove('gate-lock'); ['wheel', 'touchmove'].forEach(t => removeEventListener(t, block, opts)); };
  lock();
  btn.focus({ preventScroll: true });
  let done = false;
  const open = () => {
    if (done) return; done = true;
    gate.classList.add('is-open');
    unlock(); scrollTo(0, 0);
    setTimeout(() => gate.remove(), 1100);
    balloons();
    dispatchEvent(new Event('gateopen'));
  };

  /* balon naik dari bawah ke atas, bergoyang seperti aset lain */
  function balloons() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.createElement('div'); layer.className = 'rise'; layer.setAttribute('aria-hidden', 'true');
    const narrow = innerWidth < 700, N = narrow ? 11 : 16;
    const r = (a, b) => a + Math.random() * (b - a);
    let maxT = 0;
    for (let i = 0; i < N; i++) {
      const w = narrow ? r(70, 130) : r(90, 190), d = r(5.5, 9), dl = r(0, 1.2);
      const b = document.createElement('div'); b.className = 'rise__b';
      b.style.cssText = `--x:${(((i + .5) / N) * 100 + r(-4, 4)).toFixed(1)}%;--w:${w.toFixed(0)}px;--d:${d.toFixed(1)}s;--dl:${dl.toFixed(1)}s;--sd:${r(2.6, 4.2).toFixed(1)}s;--dx:${r(-40, 40).toFixed(0)}px`;
      const img = new Image(); img.src = 'assets/images/finale/balloon-' + (1 + (i % 2 ^ (Math.random() < .5 ? 1 : 0))) + '.webp'; img.alt = ''; img.decoding = 'async';
      b.appendChild(img); layer.appendChild(b); maxT = Math.max(maxT, d + dl);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), (maxT + .5) * 1000);
  }
  btn.addEventListener('click', open);
})();
