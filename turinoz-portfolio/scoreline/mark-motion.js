/* Scoreline header mark: the bars lift inside the mark, left to right.
   Sides go up and come back from below, the middle goes down and comes back from above.
   cubic-bezier(.65,0,.35,1), 800ms, delays L 0 / M 180 / R 440ms, 1s hold. Also ticks the match minute on the demo buttons. */
(() => {
  const EASE = [.65, 0, .35, 1], DUR = 800, DELAY = [0, 180, 440], HOLD = 1000;
  const cx = 3 * EASE[0], bx = 3 * (EASE[2] - EASE[0]) - cx, ax = 1 - cx - bx;
  const cy = 3 * EASE[1], by = 3 * (EASE[3] - EASE[1]) - cy, ay = 1 - cy - by;
  const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
  const ease = x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; X(t) < x ? lo = t : hi = t; } return Y(t); };

  // match minute on the demo buttons: 67' → 90', then again
  let min = 67;
  setInterval(() => { min = min >= 90 ? 67 : min + 1; document.querySelectorAll('.board .min').forEach(b => { b.textContent = min + '’'; }); }, 2400);

  const mark = document.querySelector('.brand .slmark');
  if (!mark || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const bars = [...mark.children], RUN = Math.max(...DELAY) + DUR;
  function lap() {
    const t0 = performance.now(), H = mark.clientHeight;
    const geo = bars.map(b => ({ h: b.offsetHeight, r: b.offsetTop }));
    (function frame(now) {
      const el = now - t0;
      bars.forEach((bar, i) => {
        const { h, r } = geo[i], e = ease((el - DELAY[i]) / DUR), D = H + h, dir = i === 1 ? 1 : -1;
        let top = r + dir * e * D; top = ((top + h) % D + D) % D - h;
        bar.style.transform = e === 0 || e === 1 ? '' : `translateY(${top - r}px)`;
      });
      if (el < RUN) requestAnimationFrame(frame); else setTimeout(lap, HOLD);
    })(t0);
  }
  setTimeout(lap, HOLD);
})();
