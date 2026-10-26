/* Party popper: ledakan confetti dari kiri & kanan bawah saat halaman dibuka */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:10001;pointer-events:none';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, parts = [], raf = 0;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size(); addEventListener('resize', size);

  const COLORS = ['#ff6fa5', '#ffd166', '#fff3e0', '#ff4d6d', '#8ecae6', '#c77dff', '#ffb703', '#ffffff'];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function burst(side, n) {
    const x = side < 0 ? -10 : W + 10, y = H + 10;
    // sudut menembak ke atas-tengah (derajat dari horizontal)
    const base = side < 0 ? -62 : -118;
    const power = Math.min(W, H) < 600 ? 1.05 : 1.45;
    for (let i = 0; i < n; i++) {
      const a = (base + rnd(-24, 24)) * Math.PI / 180, v = rnd(11, 25) * power;
      const shape = Math.random();
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: rnd(6, 11), h: rnd(4, 7), rot: rnd(0, 6.28), vr: rnd(-.35, .35),
        tilt: rnd(0, 6.28), vt: rnd(.08, .25),
        c: COLORS[(Math.random() * COLORS.length) | 0],
        kind: shape < .55 ? 0 : shape < .8 ? 1 : 2,       // 0 kertas, 1 bulat, 2 serpentine
        life: 0, max: rnd(150, 230)
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter(p => p.life < p.max && p.y < H + 40);
    for (const p of parts) {
      p.life++;
      p.vx *= .985; p.vy = p.vy * .985 + .42;        // hambatan udara + gravitasi
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.tilt += p.vt;
      const fade = p.life > p.max - 40 ? (p.max - p.life) / 40 : 1;
      ctx.globalAlpha = Math.max(fade, 0);
      ctx.fillStyle = ctx.strokeStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.kind === 0) ctx.fillRect(-p.w / 2, -p.h / 2 * Math.abs(Math.cos(p.tilt)), p.w, p.h * Math.abs(Math.cos(p.tilt)) + .5);
      else if (p.kind === 1) { ctx.beginPath(); ctx.arc(0, 0, p.h / 1.6, 0, 6.28); ctx.fill(); }
      else { ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-p.w, 0); ctx.quadraticCurveTo(0, Math.sin(p.tilt) * p.w, p.w, 0); ctx.stroke(); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(tick) : (ctx.clearRect(0, 0, W, H), 0);
  }

  const pop = () => {
    const n = Math.min(W, H) < 600 ? 70 : 110;
    burst(-1, n); burst(1, n);
    setTimeout(() => { burst(-1, n * .6); burst(1, n * .6); }, 380);
  };
  window.firePopper = pop;

  // Ada layar pembuka: ledakan tepat saat dibuka, bersamaan dengan balon naik
  if (document.getElementById('gate')) { addEventListener('gateopen', () => setTimeout(pop, 120), { once: true }); return; }

  // mulai setelah animasi masuk hero siap
  const hero = document.querySelector('.hero');
  let done = false;
  const go = () => { if (done) return; done = true; setTimeout(pop, 600); };
  if (!hero || hero.classList.contains('is-ready')) go();
  else {
    new MutationObserver((_, o) => { if (hero.classList.contains('is-ready')) { o.disconnect(); go(); } }).observe(hero, { attributes: true, attributeFilter: ['class'] });
    setTimeout(go, 3200);
  }
})();
