/* Kue ulang tahun (section penutup): animasi mulai saat terlihat, tap untuk tiup lilin */
(() => {
  const sec = document.querySelector('.finale');
  if (!sec) return;
  const candlesBox = sec.querySelector('#candles'), blow = sec.querySelector('#blowArea');
  const hint = sec.querySelector('#cakeHint'), cat = sec.querySelector('#catGif');
  const TOTAL = 9;

  // lilin + api
  for (let i = 0; i < TOTAL; i++) {
    const c = document.createElement('div');
    c.className = 'velas';
    for (let j = 0; j < 5; j++) { const f = document.createElement('div'); f.className = 'fuego'; c.appendChild(f); }
    candlesBox.appendChild(c);
  }
  const candles = [...sec.querySelectorAll('.velas')];

  // kue jatuh & tersusun begitu section masuk layar
  const start = () => sec.querySelector('#bizcocho_1')?.beginElement?.();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { start(); io.disconnect(); } }, { threshold: .4 });
    io.observe(sec);
  } else start();

  // lilin muncul satu per satu setelah kue selesai
  sec.querySelector('#crema')?.addEventListener('endEvent', () => {
    candlesBox.style.opacity = '1';
    candles.forEach((c, i) => {
      c.style.animation = `candle-appear .4s ease-out ${i * .15}s forwards`;
      setTimeout(() => { c.style.opacity = '1'; }, i * 150 + 400);
    });
    setTimeout(() => { blow.style.pointerEvents = 'auto'; }, TOTAL * 150 + 400);
  });

  let blown = false;
  function blowCandles() {
    if (blown) return;
    blown = true;
    blow.style.pointerEvents = 'none';
    candles.forEach((c, i) => setTimeout(() => {
      const flames = c.querySelectorAll('.fuego');
      flames.forEach(f => { f.style.animation = 'flicker .2s 2 alternate'; });
      setTimeout(() => flames.forEach(f => { f.style.transition = 'all .1s ease-out'; f.style.opacity = '0'; f.style.transform = 'scale(0)'; }), 400);
    }, i * 50));
    setTimeout(() => { hint.textContent = 'Semoga wish-mu jadi kenyataan!'; }, TOTAL * 80 + 300);
    setTimeout(confetti, TOTAL * 80 + 500);
  }
  blow.addEventListener('click', blowCandles);
  blow.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); blowCandles(); } });

  function confetti() {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#ff8800', '#ff0088', '#8800ff'];
    sec.style.setProperty('--fall', sec.offsetHeight + 20 + 'px');
    for (let i = 0; i < 100; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.cssText = `background:${colors[i % colors.length]};left:${Math.random() * 100}%;width:${Math.random() * 10 + 5}px;height:${Math.random() * 10 + 5}px;animation-delay:${Math.random() * .5}s;animation-duration:${Math.random() * 1.5 + 1.5}s`;
      sec.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }
    setTimeout(() => { cat.hidden = false; }, 3000);
  }
})();
