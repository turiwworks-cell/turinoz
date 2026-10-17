/* Scoreline header mark: the two moves from the brand book.
   Lift: the bars travel inside the mark, left to right. Sides go up and come back from below, the middle goes
         down and comes back from above. cubic-bezier(.65,0,.35,1), 800ms, delays L 0 / M 180 / R 440ms. Every 5s.
   Roll: the color rolls inside each bar, same directions. cubic-bezier(.802,.057,.35,1), 800ms, M 0 / L 160 / R 160ms.
         On hover, and each time the page reaches another section (a header link, the scroll, the pill).
   Also ticks the match minute on the demo buttons. */
(() => {
  const bez = B => {
    const cx = 3 * B[0], bx = 3 * (B[2] - B[0]) - cx, ax = 1 - cx - bx;
    const cy = 3 * B[1], by = 3 * (B[3] - B[1]) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x;
      for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; X(t) < x ? lo = t : hi = t; } return Y(t); };
  };
  const MOVES = {
    lift: { ease: bez([.65, 0, .35, 1]), dur: 800, delay: [0, 180, 440] },
    roll: { ease: bez([.802, .057, .35, 1]), dur: 800, delay: [160, 0, 160] },
  };
  const EVERY = 5000;

  // match minute on the demo buttons: 67' → 90', then again
  let min = 67;
  setInterval(() => { min = min >= 90 ? 67 : min + 1; document.querySelectorAll('.board .min').forEach(b => { b.textContent = min + '’'; }); }, 2400);

  const mark = document.querySelector('.brand .slmark');
  if (!mark || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bars = [...mark.children];
  let running = null, queued = false, idle = 0;

  function play(kind) {
    if (running) { if (kind === 'roll' && running === 'lift') queued = true; return; }
    clearTimeout(idle);
    if (document.hidden) { idle = setTimeout(() => play('lift'), EVERY); return; }
    running = kind;
    const m = MOVES[kind], run = Math.max(...m.delay) + m.dur, t0 = performance.now(), H = mark.clientHeight;
    const geo = bars.map(b => ({ h: b.offsetHeight, r: b.offsetTop }));
    (function frame(now) {
      const el = now - t0;
      bars.forEach((bar, i) => {
        const { h, r } = geo[i], e = m.ease((el - m.delay[i]) / m.dur), dir = i === 1 ? 1 : -1, still = e === 0 || e === 1;
        if (kind === 'roll') { bar.style.backgroundPosition = still ? '' : `0 ${dir * e * h}px`; return; }
        const D = H + h; let top = r + dir * e * D; top = ((top + h) % D + D) % D - h;
        bar.style.transform = still ? '' : `translateY(${top - r}px)`;
      });
      if (el < run) requestAnimationFrame(frame); else done(run);
    })(t0);
  }
  function done(run) {
    running = null;
    if (queued) { queued = false; play('roll'); return; }
    idle = setTimeout(() => play('lift'), EVERY - run);
  }

  // hover on the logo
  mark.closest('.brand').addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') play('roll'); });
  // another section: nav-pill.js marks the current link with aria-current (none above the first section)
  const menu = document.getElementById('links');
  if (menu) {
    let was = menu.querySelector('a[aria-current]');
    new MutationObserver(() => {
      const now = menu.querySelector('a[aria-current]');
      if (now !== was) { was = now; play('roll'); }
    }).observe(menu, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
  }
  idle = setTimeout(() => play('lift'), 1000);
})();
