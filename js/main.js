/* Birthday site — scroll experience
   Lenis (smooth scroll) + GSAP ScrollTrigger (scrub, parallax, stacking sections)
   + CSS scroll-driven animation (progress bar) dengan fallback bila library gagal dimuat
   atau pengguna memilih prefers-reduced-motion. */
(() => {
  if (window.__hbd) return;           // cegah inisialisasi ganda
  window.__hbd = true;

  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = reduceMQ.matches;
  reduceMQ.addEventListener?.('change', () => location.reload());

  // Dinding collage: baris foto bergerak seperti kereta (baris ganjil ke kiri, genap ke kanan)
  const wall = $('.wish__wall');
  if (wall) {
    const srcs = [...wall.querySelectorAll('img')].map(i => i.getAttribute('src'));
    wall.textContent = '';
    const ROWS = 5, PER_SET = 10;
    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div');
      row.className = 'wish__row' + (r % 2 ? ' is-right' : '');
      row.style.setProperty('--dur', (60 + r * 8) + 's');
      const track = document.createElement('div');
      track.className = 'wish__track';
      for (let n = 0; n < PER_SET * 2; n++) {           // 2 set identik = loop mulus
        const img = new Image();
        img.src = srcs[(r * 3 + (n % PER_SET)) % srcs.length];
        img.alt = ''; img.decoding = 'async';
        track.appendChild(img);
      }
      row.appendChild(track);
      wall.appendChild(row);
    }
  }

  // Hero: mulai animasi masuk setelah foto termuat
  const hero = $('.hero'), heroPhoto = $('.hero__photo');
  const heroImgs = $$('img', hero).filter(i => !i.classList.contains('hero__banner'));
  const go = () => hero.classList.add('is-ready');
  Promise.all(heroImgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))).then(go);
  setTimeout(go, 2500);

  // Efek miring foto hero mengikuti mouse (desktop)
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      heroPhoto.style.setProperty('--ty', (x * 8).toFixed(2) + 'deg');
      heroPhoto.style.setProperty('--tx', (-y * 8).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', () => { heroPhoto.style.setProperty('--ty', '0deg'); heroPhoto.style.setProperty('--tx', '0deg'); });
  }

  // Musik latar: coba autoplay; browser memblokir suara tanpa interaksi, jadi mulai di sentuhan/klik/tombol pertama
  (() => {
    const au = $('#bgm'), btn = $('.music'); if (!au || !btn) return;
    const VOL = .7; let want = true, fade;                   // want = pengguna tidak sedang menjeda manual
    const ui = on => { btn.classList.toggle('is-playing', on); btn.setAttribute('aria-pressed', on); };
    const fadeTo = (v, done) => { clearInterval(fade); fade = setInterval(() => {
      au.volume = Math.max(0, Math.min(1, au.volume + (v > au.volume ? .05 : -.05)));
      if (Math.abs(au.volume - v) < .05) { au.volume = v; clearInterval(fade); done && done(); } }, 60); };
    const play = () => { au.volume = 0; return au.play().then(() => { ui(true); btn.classList.remove('is-waiting'); fadeTo(VOL); off(); }); };
    const gesture = e => { if (e.target.closest('.music')) return; want && play().catch(() => {}); };
    const evs = ['pointerdown', 'touchend', 'keydown'];
    const off = () => evs.forEach(t => removeEventListener(t, gesture, true));
    evs.forEach(t => addEventListener(t, gesture, { capture: true, passive: true }));
    play().catch(() => btn.classList.add('is-waiting'));     // diblokir → menunggu interaksi pertama
    btn.addEventListener('click', () => {
      if (au.paused) { want = true; play().catch(() => {}); }
      else { want = false; ui(false); fadeTo(0, () => au.pause()); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (!au.paused) { au.pause(); au._r = true; } }
      else if (au._r && want) { au._r = false; au.play().catch(() => {}); }
    });
  })();

  if (reduce || !(window.gsap && window.ScrollTrigger && window.Lenis)) legacy(); else fx();

  /* ---------- Fallback: reveal sederhana (reduced-motion / library tidak ada) ---------- */
  function legacy() {
    $$('.mosaic img').forEach((el, i) => { el.dataset.reveal = ''; el.style.setProperty('--i', i); });
    $$('.rank__photos .polaroid').forEach((el, i) => el.style.transitionDelay = i * 150 + 'ms');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: .2, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal]').forEach(el => io.observe(el));
    if (reduce) return;

    const bar = $('.progress'), pars = $$('[data-par]').map(el => ({ el, k: parseFloat(el.dataset.par), cur: 0 }));
    let hp = 0;
    const frame = () => {
      const vh = innerHeight, max = document.documentElement.scrollHeight - vh;
      bar.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1) : 0);
      pars.forEach(p => {
        const r = p.el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const t = (r.top + r.height / 2 - vh / 2) * p.k;
        p.cur += (t - p.cur) * .1; p.el.style.setProperty('--py', p.cur.toFixed(1) + 'px');
      });
      hp += (Math.min(scrollY, vh) * -.06 - hp) * .1;
      heroPhoto.style.setProperty('--py', hp.toFixed(1) + 'px');
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Pengalaman utama: Lenis + GSAP ScrollTrigger ---------- */
  function fx() {
    const { gsap, ScrollTrigger: ST, Lenis } = window;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });   // address-bar mobile naik/turun tidak memicu refresh
    document.documentElement.classList.add('fx');

    const coarse = matchMedia('(pointer:coarse)').matches;
    const SC = coarse ? .5 : true;             // scrub: di touch diberi sedikit redaman
    const narrow = () => innerWidth < 900;
    const amp = v => narrow() ? v * .6 : v;    // amplitudo parallax lebih kecil di mobile

    /* 1. Smooth scroll — touch tetap native (momentum bawaan perangkat) */
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // Progress bar: CSS scroll-driven bila didukung, kalau tidak pakai nilai dari Lenis
    if (!(window.CSS && CSS.supports('animation-timeline', 'scroll()'))) {
      const bar = $('.progress');
      lenis.on('scroll', l => bar.style.setProperty('--p', l.progress || 0));
    }

    /* 2. Stacking sections */
    const secs = $$('body > header, body > section');
    const stack = secs.slice(0, -1);           // semua kecuali penutup (finale) menempel lalu ditutup section berikutnya
    const idx = new Map(secs.map((s, i) => [s, i]));
    const nat = [];                            // posisi natural (tanpa efek sticky) tiap section
    const measure = () => {
      let y = 0;
      secs.forEach((s, i) => { nat[i] = y; y += s.offsetHeight; });
      // section lebih tinggi dari layar menempel saat bagian bawahnya terlihat, baru ditutup section berikut
      stack.forEach(s => {
        const h = s.offsetHeight;
        s.style.top = Math.min(0, innerHeight - h) + 'px';
        s.style.top = `min(0px, calc(100lvh - ${h}px))`;
      });
    };
    stack.forEach((s, i) => {
      s.style.zIndex = i + 1;
      s.insertAdjacentHTML('beforeend', '<i class="shade" aria-hidden="true"></i>');
    });
    measure();
    ST.addEventListener('refreshInit', measure);

    // section yang sudah tertutup penuh oleh section berikutnya: sembunyikan (tidak digambar, animasi dijeda)
    stack.forEach((s, i) => ST.create({
      start: () => nat[i + 1] + 6, end: () => ST.maxScroll(window) + 100000, invalidateOnRefresh: true,
      onToggle: self => s.classList.toggle('is-covered', self.isActive)
    }));

    // posisi natural elemen di dokumen (tidak terpengaruh sticky/transform)
    const natY = el => {
      let y = 0, n = el;
      while (n && !idx.has(n)) { y += n.offsetTop; n = n.offsetParent; }
      return n ? nat[idx.get(n)] + y : y;
    };
    const maxS = () => ST.maxScroll(window);
    const secOf = el => idx.get(el.closest('body > header, body > section'));

    // section di bawah naik menutupi section di atas: mengecil sedikit + meredup
    stack.forEach((s, i) => {
      const shade = $('.shade', s);
      gsap.set(s, { transformOrigin: '50% 100%' });
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { start: () => nat[i + 1] - innerHeight, end: () => nat[i + 1], scrub: SC, invalidateOnRefresh: true }
      }).to(s, { scale: () => narrow() ? .955 : .94 }, 0).to(shade, { opacity: .55 }, 0);
    });

    // hero bergerak lebih lambat saat tertutup (kedalaman)
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { start: () => nat[1] - innerHeight, end: () => nat[1], scrub: SC, invalidateOnRefresh: true }
    }).to('.hero__banner', { y: () => -innerHeight * .09 }, 0)
      .to('.hero__text', { y: () => -innerHeight * .05 }, 0)
      .to('.hero__stage', { y: () => -innerHeight * .11 }, 0);

    /* 3. Reveal mengikuti scroll (fade / slide / scale) */
    const reveal = (el, from, to = {}, { len = .38, off = 0 } = {}) => {
      gsap.fromTo(el, from, {
        opacity: 1, x: 0, y: 0, scale: 1, ease: 'power2.out', ...to,
        scrollTrigger: {
          start: () => natY(el) - innerHeight * (.93 - off),
          end: () => Math.max(natY(el) - innerHeight * (.93 - off) + 1, Math.min(natY(el) - innerHeight * (.93 - off) + innerHeight * len, maxS())),
          scrub: SC, invalidateOnRefresh: true
        }
      });
    };
    $$('[data-reveal]').forEach(el => {
      el.removeAttribute('data-reveal');       // CSS reveal lama dimatikan, GSAP mengambil alih
      if (el.classList.contains('polaroid')) {
        const r = parseFloat(getComputedStyle(el).getPropertyValue('--r')) || 0, s = el.classList.contains('pa') ? 1 : -1;
        reveal(el, { opacity: 0, y: 110, x: 50 * s, rotation: r + 12 * s }, { rotation: r }, { len: .5 });
      } else if (el.classList.contains('sakti__sticker')) reveal(el, { opacity: 0, y: 90, scale: .92 }, {}, { len: .5 });
      else if (el.matches('.party__kittens')) reveal(el, { opacity: 0, y: 60, scale: .88 });
      else if (el.matches('.party__card')) reveal(el, { opacity: 0, y: 80, scale: .94 }, {}, { len: .45 });
      else reveal(el, { opacity: 0, y: 56 });
    });
    $$('.mosaic img').forEach((el, i) => reveal(el, { opacity: 0, y: 40, scale: .88 }, {}, { len: .3, off: -.03 * (i % 4) }));
    $$('.num, .wish__age').forEach(el => reveal(el, { opacity: 0, y: 36, scale: .72, transformOrigin: '50% 60%' }, {}, { len: .45 }));

    /* 4. Parallax */
    const par = (sel, a) => $$(sel).forEach(el => {
      const i = secOf(el), A = typeof a === 'function' ? a : () => a;
      gsap.fromTo(el, { yPercent: () => A(el) }, {
        yPercent: () => -A(el), ease: 'none',
        scrollTrigger: {
          start: () => nat[i] - innerHeight, end: () => Math.min(nat[i] + secs[i].offsetHeight, maxS()),
          scrub: SC, invalidateOnRefresh: true
        }
      });
    });
    par('.sakti__sticker', () => amp(7));
    par('.rank .pa', () => amp(10));
    par('.rank .pb', () => -amp(10));          // arah berlawanan: lapisan terasa berbeda kedalaman
    par('.love__age', () => amp(14));
    par('.party__kittens', () => amp(7));
    par('.hero__cat', () => amp(10));

    // latar bergerak lebih lambat dari konten (collage dinding & foto potret)
    $$('[data-par]').forEach(el => {
      const i = secOf(el), k = parseFloat(el.dataset.par);
      ST.create({
        start: () => nat[i] - innerHeight, end: () => nat[i] + secs[i].offsetHeight, invalidateOnRefresh: true,
        onUpdate: self => el.style.setProperty('--py', (k * (.5 - self.progress) * (innerHeight + secs[i].offsetHeight)).toFixed(1) + 'px')
      });
    });
    // ukur ulang setelah font & gambar selesai (tinggi section berubah)
    const refresh = () => ST.refresh();
    document.fonts?.ready.then(refresh);
    addEventListener('load', refresh);
  }
})();
