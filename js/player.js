/* Pemutar musik di kartu "make a wish": satu audio dengan tombol musik melayang (#bgm) */
(() => {
  const au = document.querySelector('#bgm'), btn = document.querySelector('.music'), box = document.querySelector('.player');
  if (!au || !btn || !box) return;
  const $ = id => document.getElementById(id);
  const seek = $('pSeek'), cur = $('pCur'), dur = $('pDur');
  const STEP = 10;                                       // detik per tekan mundur/maju
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
  let dragging = false;

  const paint = () => {
    const d = au.duration, t = au.currentTime;
    const pct = d ? Math.min(t / d, 1) : 0;
    if (!dragging) seek.value = Math.round(pct * 1000);
    seek.style.setProperty('--p', (seek.value / 10) + '%');
    cur.textContent = fmt(dragging ? seek.value / 1000 * (d || 0) : t);
    dur.textContent = fmt(d);
  };
  const sync = () => box.classList.toggle('is-playing', btn.classList.contains('is-playing'));

  // play/jeda memakai tombol musik yang sudah ada (fade & izin autoplay ikut terurus)
  $('pPlay').addEventListener('click', () => btn.click());
  $('pPrev').addEventListener('click', () => { au.currentTime = Math.max(0, au.currentTime - STEP); paint(); });
  $('pNext').addEventListener('click', () => {
    const d = au.duration || 0;
    au.currentTime = d ? Math.min(d - .25, au.currentTime + STEP) : au.currentTime + STEP; paint();
  });
  seek.addEventListener('input', () => { dragging = true; paint(); });
  seek.addEventListener('change', () => { if (au.duration) au.currentTime = seek.value / 1000 * au.duration; dragging = false; paint(); });

  new MutationObserver(sync).observe(btn, { attributes: true, attributeFilter: ['class'] });
  ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked'].forEach(e => au.addEventListener(e, paint));

  // Equalizer: bar bergerak mengikuti status putar (bentuk dasar meniru gelombang di gambar kartu)
  (() => {
    const cv = $('pEq'); if (!cv) return;
    const ctx = cv.getContext('2d'), N = 44;
    const raw = [68, 48, 40, 32, 49, 54, 63, 72, 72, 72, 72, 63, 63, 41, 60, 31, 18, 17, 50, 44, 36, 21, 52, 58, 40, 52, 52, 52, 30, 15, 9];
    const base = Array.from({ length: N }, (_, i) => {
      const x = i / (N - 1) * (raw.length - 1), a = Math.floor(x), b = Math.min(a + 1, raw.length - 1);
      return (raw[a] + (raw[b] - raw[a]) * (x - a)) / 72;
    });
    const sp = base.map((_, i) => 2.2 + ((i * 37) % 11) * .32), ph = base.map((_, i) => i * 1.7);
    const cur = base.map(v => v * .9);
    let W = 0, H = 0, last = 0;
    const size = () => {
      const r = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
      cv.width = Math.round(w * r); cv.height = Math.round(h * r); W = cv.width; H = cv.height;
    };
    new ResizeObserver(size).observe(cv); size();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function draw(ts) {
      requestAnimationFrame(draw);
      if (!W || ts - last < 33) return; last = ts;                  // ~30 fps cukup
      const playing = box.classList.contains('is-playing') && !au.paused && !reduce, t = ts / 1000;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#fff';
      const pitch = W / N, bw = pitch * .5;
      for (let i = 0; i < N; i++) {
        const target = playing ? Math.max(.08, Math.min(1, base[i] * (.3 + .85 * (.5 + .5 * Math.sin(t * sp[i] + ph[i]))) + .06 * Math.sin(t * 9 + i))) : base[i] * .9;
        cur[i] += (target - cur[i]) * (playing ? .45 : .12);
        const bh = Math.max(cur[i] * H, bw), x = i * pitch + (pitch - bw) / 2, y = (H - bh) / 2, r = bw / 2;
        ctx.beginPath(); ctx.moveTo(x, y + r); ctx.arc(x + r, y + r, r, Math.PI, 0); ctx.lineTo(x + bw, y + bh - r);
        ctx.arc(x + r, y + bh - r, r, 0, Math.PI); ctx.closePath(); ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  })();
  sync(); paint();
})();
