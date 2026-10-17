/* Quiet Between Stars — case study (Turinoz)
   Sky, day/night, nav, the four-state player, the process rail, comparisons,
   the guide pages, formats and the lightbox. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sysLight = matchMedia('(prefers-color-scheme: light)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------- day / night (shared with the home page: tz-theme) ---------------- */
  const tm = $('#tm');
  const isLight = () => root.dataset.theme ? root.dataset.theme === 'light' : sysLight.matches;
  function themeUI() {
    const label = isLight() ? 'Switch to dark mode' : 'Switch to light mode';
    tm.setAttribute('aria-label', label); tm.title = label;
    sky.recolor();
  }
  tm.addEventListener('click', () => {
    root.dataset.theme = isLight() ? 'dark' : 'light';
    try { localStorage.setItem('tz-theme', root.dataset.theme); } catch (_) {}
    themeUI();
  });
  sysLight.addEventListener('change', () => { if (!root.dataset.theme) themeUI(); });

  /* ---------------- sky: a slow, seeded star field with depth ----------------
     Stars sit in 3D and drift toward the viewer very slowly; nearer stars are
     bigger and brighter, and move more when the page scrolls. */
  const sky = (() => {
    const cv = $('#sky'), ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, stars = [], rgb = '222,236,255', alpha = 1, raf = 0, last = 0, t = 0;
    const NEAR = 0.6, FAR = 6, SPEED = 0.018;              // world units per second: slow enough to forget
    let seed = 5;
    const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
    const sprite = document.createElement('canvas');
    function makeSprite() {
      const s = 32; sprite.width = sprite.height = s; const g = sprite.getContext('2d');
      const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, `rgba(${rgb},1)`); grd.addColorStop(.18, `rgba(${rgb},.55)`); grd.addColorStop(1, `rgba(${rgb},0)`);
      g.clearRect(0, 0, s, s); g.fillStyle = grd; g.fillRect(0, 0, s, s);
    }
    function spawn(s, far) {
      s.x = (rnd() - .5) * 2.4; s.y = (rnd() - .5) * 2.4;
      s.z = far ? FAR - rnd() * .4 : NEAR + Math.pow(rnd(), .9) * (FAR - NEAR);
      s.tw = .4 + rnd() * 1.4; s.ph = rnd() * 6.28; s.hero = rnd() < .1;
    }
    function build() {
      seed = 5; const n = Math.round(clamp(W * H / 9000, 70, 220));
      stars = Array.from({ length: n }, () => { const s = {}; spawn(s, false); return s; });
    }
    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); build(); draw();
    }
    function recolor() {
      const cs = getComputedStyle(root);
      rgb = (cs.getPropertyValue('--star') || '222,236,255').trim();
      alpha = parseFloat(cs.getPropertyValue('--star-a')) || 1;
      makeSprite(); draw();
    }
    function draw() {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      const F = Math.max(W, H) * .5, cx = W / 2, cy = H / 2, sc = scrollY;
      for (const s of stars) {
        const k = 1 / s.z;
        let x = cx + s.x * F * k, y = cy + s.y * F * k - sc * .05 * k;
        y = ((y % (H + 40)) + H + 40) % (H + 40) - 20;
        if (x < -10 || x > W + 10) continue;
        const depth = 1 - (s.z - NEAR) / (FAR - NEAR);         // 1 near, 0 far
        const fadeIn = clamp((FAR - s.z) / .8, 0, 1);
        const tw = .82 + .18 * Math.sin(t * s.tw + s.ph);
        const a = (.16 + .7 * depth * depth) * fadeIn * tw * alpha;
        if (s.hero) {
          const r = 1.6 + 5.5 * depth;
          ctx.globalAlpha = Math.min(1, a * 1.15);
          ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
        } else {
          const r = .55 + 1.1 * depth * depth;
          ctx.globalAlpha = a; ctx.fillStyle = `rgb(${rgb})`;
          ctx.fillRect(x - r / 2, y - r / 2, r, r);
        }
      }
      ctx.globalAlpha = 1;
    }
    function frame(now) {
      raf = 0;
      const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now; t += dt;
      for (const s of stars) { s.z -= SPEED * dt; if (s.z < NEAR) spawn(s, true); }
      draw();
      if (!document.hidden && !reduced.matches) raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && !document.hidden && !reduced.matches) { last = 0; raf = requestAnimationFrame(frame); } }
    addEventListener('resize', resize);
    addEventListener('scroll', () => { if (reduced.matches || document.hidden) draw(); }, { passive: true });
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', () => { draw(); start(); });
    return { init() { recolor(); resize(); start(); }, recolor };
  })();
  sky.init();
  themeUI();

  /* ---------------- nav: scrolled edge, progress, section pill ---------------- */
  const nav = $('#nav'), links = $$('#links a'), pill = $('#links .pill');
  function placePill(a) {
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.left = a.offsetLeft + 'px'; pill.style.width = a.offsetWidth + 'px'; pill.style.opacity = 1;
  }
  let ticking = false;
  function onScroll() {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', scrollY > 8);
    nav.classList.toggle('over', scrollY < $('#top').offsetHeight - 70);
    root.style.setProperty('--sp', max > 0 ? (scrollY / max).toFixed(4) : 0);
    let on = null;
    for (const a of links) { const sec = $(a.hash); if (sec && sec.getBoundingClientRect().top < innerHeight * .4) on = a; }
    links.forEach(a => a.classList.toggle('on', a === on));
    placePill(on);
    rail();
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------------- reveal ---------------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.rv').forEach(el => io.observe(el));

  /* ---------------- arrival: Hyperspace → Return → Primary Idle ----------------
     The page opens inside the piece's own state machine. The first scroll (or the
     button) plays Return; the title lands in Idle and the stage becomes the player.
     Skipped on a second visit in the same session, with a hash, or for reduced motion. */
  const A = $('#top'), P = $('#player'), video = $('#stateVideo'), vHyper = $('#vHyper'), vReturn = $('#vReturn'), toggle = $('#playToggle'), h1 = $('.h1');
  const STATES = {
    idle:   { file: 'idle',  name: 'Primary Idle', dur: 180, loop: true },
    entry:  { file: 'entry', name: 'Entry',        dur: 5,   loop: false, next: 'cruise' },
    cruise: { file: 'cruise', name: 'Hyperspace',  dur: 170, loop: true },
    exit:   { file: 'exit',  name: 'Return',       dur: 5,   loop: false, next: 'idle' }
  };
  const tabs = $$('[data-state]');
  let current = 'idle', userPaused = reduced.matches, inView = true, token = 0, phase = 'landed';
  const setPhase = p => { phase = p; A.dataset.phase = p; };
  function tryPlay(v) { const p = v.play(); if (p) p.catch(() => ui()); return p; }

  function timing() {
    const d = Number.isFinite(video.duration) ? video.duration : STATES[current].dur, c = video.currentTime || 0;
    const tab = tabs.find(b => b.dataset.state === current); if (tab) tab.style.setProperty('--t', (c / d).toFixed(4));
  }
  function ui() {
    const playing = !video.paused && !video.ended;
    P.classList.toggle('playing', playing);
    toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${STATES[current].name}`);
  }
  function sync() {
    if (phase !== 'landed') return;
    if (document.hidden || userPaused || !inView) video.pause(); else tryPlay(video);
  }
  function setState(key) {
    if (!STATES[key]) return;
    const s = STATES[key], my = ++token; current = key;
    tabs.forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.state === key)); b.style.setProperty('--t', 0); });
    $('#playerError').hidden = true; $('#playerStatus').textContent = `${s.name} loading`;
    video.pause(); video.loop = s.loop; video.poster = `assets/${s.file}-poster.webp`;
    video.setAttribute('aria-label', `${s.name}, the full ${s.dur}-second render`);
    video.src = `assets/${s.file}.mp4`; $('#fallbackLink').href = video.src; video.load(); timing();
    video.addEventListener('loadeddata', () => { if (my !== token) return; $('#playerStatus').textContent = `${s.name} playing`; sync(); }, { once: true });
  }
  tabs.forEach(b => b.addEventListener('click', () => { userPaused = false; setState(b.dataset.state); }));
  video.addEventListener('ended', () => { const s = STATES[current]; if (s.next && !userPaused) setState(s.next); });
  video.addEventListener('timeupdate', timing); video.addEventListener('loadedmetadata', timing);
  video.addEventListener('play', ui); video.addEventListener('pause', ui);
  video.addEventListener('error', () => { if (phase === 'landed') { $('#playerError').hidden = false; $('#playerStatus').textContent = 'The preview could not load.'; } });
  toggle.addEventListener('click', () => { if (video.paused) { userPaused = false; tryPlay(video); } else { userPaused = true; video.pause(); } });
  $('#fullscreen').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
    else video.webkitEnterFullscreen?.();
  });
  new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); if (!inView) vHyper.pause(); else if (phase === 'hyper') tryPlay(vHyper); }, { threshold: .15 }).observe(A);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', e => { if (e.matches) { userPaused = true; video.pause(); } });

  function land() {
    if (phase === 'landed') return;
    setPhase('landed');
    root.classList.remove('locked');
    removeEventListener('wheel', onWheel); removeEventListener('touchstart', onTouchStart); removeEventListener('touchmove', onTouchMove); removeEventListener('keydown', onKey);
    try { sessionStorage.setItem('qbs-arrived', '1'); } catch (_) {}
    try { video.currentTime = 0; } catch (_) {}
    sync();
    setTimeout(() => h1.classList.add('in'), 260);
    setTimeout(() => { vHyper.pause(); vReturn.pause(); }, 1400);
    onScroll();
  }
  function startReturn() {
    if (phase !== 'hyper') return;
    setPhase('return');
    video.preload = 'auto';
    try { vReturn.currentTime = 0; } catch (_) {}
    const p = vReturn.play(); if (p) p.catch(land);
    vReturn.addEventListener('ended', land, { once: true });
    setTimeout(land, 7000); // never strand the visitor if Return stalls
  }
  function onWheel(e) { if (e.deltaY > 2) startReturn(); }
  let touchY = null;
  function onTouchStart(e) { touchY = e.touches[0].clientY; }
  function onTouchMove(e) { if (touchY !== null && touchY - e.touches[0].clientY > 18) { touchY = null; startReturn(); } }
  function onKey(e) {
    if (['ArrowDown', 'PageDown', 'End', ' ', 'Spacebar'].includes(e.key)) { e.preventDefault(); if (phase === 'hyper') startReturn(); else land(); }
    else if (e.key === 'Escape') land();
  }
  $('#arriveBtn').addEventListener('click', startReturn);
  $('#skipIntro').addEventListener('click', land);
  // a jump to a section before landing lands first, so the page can scroll
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a && phase !== 'landed' && a.hash !== '#top' && a.hash !== '#main') land(); }, true);

  let seen = false; try { seen = sessionStorage.getItem('qbs-arrived') === '1'; } catch (_) {}
  if (!reduced.matches && !seen && !location.hash && scrollY < 10) {
    setPhase('hyper');
    root.classList.add('locked');
    vHyper.preload = 'auto'; vReturn.preload = 'auto'; vReturn.load();
    tryPlay(vHyper);
    addEventListener('wheel', onWheel, { passive: true });
    addEventListener('touchstart', onTouchStart, { passive: true });
    addEventListener('touchmove', onTouchMove, { passive: true });
    addEventListener('keydown', onKey);
  } else {
    setPhase('landed');
    requestAnimationFrame(() => setTimeout(() => h1.classList.add('in'), 80));
    sync();
  }
  timing(); ui();

  /* ---------------- process rail ---------------- */
  const steps = $$('.step'), railItems = $$('#railList li'), railLine = $('.rail-line'), stepsBox = $('.steps');
  function rail() {
    if (!railLine || getComputedStyle($('.path-rail')).display === 'none') return;
    const mid = innerHeight * .45; let on = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) on = i; });
    railItems.forEach((li, i) => { li.classList.toggle('on', i === on); li.classList.toggle('done', i < on); });
    const r = stepsBox.getBoundingClientRect();
    railLine.style.setProperty('--rp', clamp((mid - r.top) / r.height, 0, 1).toFixed(4));
  }
  railItems.forEach(li => li.addEventListener('click', () => $('#' + li.dataset.to).scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' })));

  /* ---------------- styleframe comparison ---------------- */
  const cmp = $('#cmpFrame'), cmpRange = $('#cmpRange');
  const setX = v => { v = clamp(v, 0, 100); cmp.style.setProperty('--x', v + '%'); cmpRange.value = v; cmpRange.style.setProperty('--p', v + '%'); };
  let dragging = false;
  const fromEvent = e => { const r = cmp.getBoundingClientRect(); setX((e.clientX - r.left) / r.width * 100); };
  cmp.addEventListener('pointerdown', e => { dragging = true; cmp.setPointerCapture(e.pointerId); fromEvent(e); });
  cmp.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
  cmp.addEventListener('pointerup', () => { dragging = false; });
  cmp.addEventListener('pointercancel', () => { dragging = false; });
  cmpRange.addEventListener('input', () => setX(+cmpRange.value));
  setX(50);

  /* ---------------- inline clips: play in view, pairs together ---------------- */
  const solo = $$('video[data-inview]:not([data-sync])'), pair = $$('video[data-sync]');
  const clipIO = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduced.matches && !document.hidden) { if (v.preload === 'none') v.preload = 'auto'; tryPlay(v); } else v.pause();
  }), { threshold: .35 });
  solo.forEach(v => clipIO.observe(v));
  let pairIn = false;
  function pairSync(restart) {
    if (restart) pair.forEach(v => { v.currentTime = 0; });
    if (pairIn && !document.hidden && !reduced.matches) {
      const t0 = Math.min(...pair.map(v => v.currentTime || 0)); pair.forEach(v => { v.preload = 'auto'; v.currentTime = t0; tryPlay(v); });
    } else pair.forEach(v => v.pause());
  }
  if (pair.length) new IntersectionObserver(es => { pairIn = es[0].isIntersecting; pairSync(false); }, { threshold: .35 }).observe($('#refine'));
  $('#replayPair').addEventListener('click', () => { pairIn = true; pair.forEach(v => { v.currentTime = 0; v.preload = 'auto'; tryPlay(v); }); });
  [...solo, ...pair].forEach(v => v.addEventListener('click', () => { if (v.paused) tryPlay(v); else v.pause(); }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) [...solo, ...pair].forEach(v => v.pause()); });

  /* ---------------- guide pages ---------------- */
  const GUIDE = {
    micro: { file: 'guide-micro-stars', cap: '04 — Micro Stars · From the controller guide', alt: 'Guide page 04, Micro Stars: eleven controls, from Layout Variation and Density to Near and Far Opacity, each with what it shapes, a safe range, a sweet spot and guidance' },
    hyper: { file: 'guide-hyperspace', cap: '09 — Hyperspace · From the controller guide', alt: 'Guide page 09, Hyperspace: Variation, Speed, Depth Falloff, Twirl and Opacity, each with what it shapes, a safe range, a sweet spot and guidance' }
  };
  const gImg = $('#guideImg'), gZoom = $('#guideZoom');
  Object.values(GUIDE).forEach(g => { const i = new Image(); i.src = `assets/${g.file}-1200.webp`; });
  $$('[data-guide]').forEach(b => b.addEventListener('click', () => {
    const g = GUIDE[b.dataset.guide]; if (!g || b.getAttribute('aria-pressed') === 'true') return;
    $$('[data-guide]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    gImg.classList.add('swap');
    setTimeout(() => {
      gImg.srcset = `assets/${g.file}-1200.webp 1200w, assets/${g.file}-2400.webp 2400w`;
      gImg.src = `assets/${g.file}-2400.webp`; gImg.alt = g.alt;
      gZoom.dataset.src = `assets/${g.file}-2400.webp`; gZoom.dataset.cap = g.cap;
      const done = () => gImg.classList.remove('swap');
      if (gImg.complete) requestAnimationFrame(done); else gImg.addEventListener('load', done, { once: true });
    }, reduced.matches ? 0 : 260);
  }));

  /* ---------------- formats ---------------- */
  const FORMATS = {
    triple:   { img: 'triplewide.webp',     ar: 6480 / 3840, alt: 'Primary Idle at 6480 × 3840, across three portrait displays', div: true },
    portrait: { img: 'portrait.webp',       ar: 2160 / 3840, alt: 'Primary Idle at 2160 × 3840, on one portrait display' },
    wide:     { img: 'ultrawide-5120.webp', ar: 5120 / 1440, alt: 'Primary Idle at 5120 × 1440, ultrawide' },
    wide2:    { img: 'ultrawide-3840.webp', ar: 3840 / 1600, alt: 'Primary Idle at 3840 × 1600, ultrawide' }
  };
  const stage = $('#fmtStage'), box = $('#fmtBox'), fImg = $('#fmtImg'), fDiv = $('#fmtDiv');
  let fmt = 'triple';
  function fit() {
    const cs = getComputedStyle(stage), pw = parseFloat(cs.paddingLeft) * 2, ph = parseFloat(cs.paddingTop) * 2;
    const sw = stage.clientWidth - pw, sh = stage.clientHeight - ph, ar = FORMATS[fmt].ar;
    let w = sw, h = w / ar; if (h > sh) { h = sh; w = h * ar; }
    box.style.width = w + 'px'; box.style.height = h + 'px';
  }
  $$('[data-format]').forEach(b => b.addEventListener('click', () => {
    const f = FORMATS[b.dataset.format]; if (!f || fmt === b.dataset.format) return;
    fmt = b.dataset.format;
    $$('[data-format]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    fImg.style.opacity = 0; fDiv.hidden = !f.div;
    setTimeout(() => { fImg.src = `assets/${f.img}`; fImg.alt = f.alt; fit(); const show = () => { fImg.style.opacity = 1; }; if (fImg.complete) requestAnimationFrame(show); else fImg.addEventListener('load', show, { once: true }); }, reduced.matches ? 0 : 220);
  }));
  new ResizeObserver(fit).observe(stage); fit();

  /* ---------------- lightbox ---------------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbBody = $('#lbBody');
  $$('.zoom').forEach(b => b.addEventListener('click', () => {
    lbImg.src = b.dataset.src; lbImg.alt = b.dataset.cap || ''; $('#lbCap').textContent = b.dataset.cap || '';
    lbBody.classList.remove('full'); lb.showModal();
  }));
  lbBody.addEventListener('click', e => {
    if (lbImg.naturalWidth <= lbImg.clientWidth + 2 && !lbBody.classList.contains('full')) return;
    const r = lbImg.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    lbBody.classList.toggle('full');
    if (lbBody.classList.contains('full')) { lbBody.scrollLeft = fx * lbImg.clientWidth - lbBody.clientWidth / 2; lbBody.scrollTop = fy * lbImg.clientHeight - lbBody.clientHeight / 2; }
  });
  $('#lbClose').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  onScroll();
})();
