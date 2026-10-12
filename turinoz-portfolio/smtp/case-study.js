'use strict';
/* ==========================================================================
   smtp.dev — product film case study (Turinoz)
   One file, no libraries. In order:
     helpers · color strips · reveal & nav · label cursor · players (film + short)
     · beat by beat (with Turinoz's cursor) · refinement wipe · styleframes rail
     · lengths + logo scrubber · delivery terminal · hero (count, dust) · day / night · pause all
   Everything that moves sleeps off screen, in a hidden tab, while a film plays
   (for the muted loops), when "Pause all motion" is on, and for visitors who
   prefer reduced motion.
   ========================================================================== */
(() => {
  /* ---------- settings ---------- */
  const START_WITH_SOUND = false;   // films start muted; the sound button turns it on
  const THUMBS = { src: 'assets/film-thumbs.webp', perSec: 4, cols: 15, count: 210 };
  const LOGO = { frames: 88, fps: 30, cols: 11, rows: 8 };

  /* ---------- helpers ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const html = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = () => mqReduce.matches;
  const paused = () => html.classList.contains('paused');
  const fmt = t => { t = Math.max(0, t || 0); return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0'); };
  const fmt1 = t => { t = Math.max(0, t || 0); const s = t % 60; return Math.floor(t / 60) + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
  const fmtR = t => fmt(Math.round(t || 0));   // beat spans round, like the times in the beat list
  const status = $('#status');
  const say = msg => { if (status) status.textContent = msg; };
  const dpr = () => Math.min(2, window.devicePixelRatio || 1);
  const sleepers = new Set();                 // things with a sync() that decides whether they may move
  const syncAll = () => sleepers.forEach(s => s.sync());
  const films = [];                           // user-started films (only one plays at a time)
  const filmPlaying = () => films.some(p => p.film && !p.film.paused && !p.film.ended);

  // colors the canvases take from the page (they change with day / night)
  const tok = name => getComputedStyle(html).getPropertyValue(name).trim();
  const INK = { dim: tok('--strip-dim') || 'rgba(8,9,12,.6)', dust: tok('--dust') || '#C9D8FF' };
  const strips = new Set();

  /* ---------- the films' own colors ---------- */
  const COLORS = {};
  const raw = window.SMTP_COLORS || {};
  Object.keys(raw).forEach(k => { const s = raw[k], a = []; for (let i = 0; i + 6 <= s.length; i += 6) a.push('#' + s.slice(i, i + 6)); COLORS[k] = a; });

  // a strip of stripes; the base is drawn once per size, the played part on top of it
  class Strip {
    constructor(canvas, cols) {
      this.c = canvas; this.cols = cols || []; this.base = document.createElement('canvas'); this.p = null;
      if (!canvas) return;
      strips.add(this);
      new ResizeObserver(() => this.resize()).observe(canvas);
      this.resize();
    }
    resize() {
      const c = this.c, r = c.getBoundingClientRect(), d = dpr();
      const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
      c.width = this.base.width = w; c.height = this.base.height = h;
      const b = this.base.getContext('2d'), n = this.cols.length;
      b.clearRect(0, 0, w, h);
      if (n) for (let i = 0; i < n; i++) {
        const x0 = Math.floor(i / n * w), x1 = Math.ceil((i + 1) / n * w);
        b.fillStyle = this.cols[i]; b.fillRect(x0, 0, x1 - x0, h);
      } else { b.fillStyle = '#1b2233'; b.fillRect(0, 0, w, h); }
      const g = b.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.22)');
      b.fillStyle = g; b.fillRect(0, 0, w, h);
      this.draw(this.p);
    }
    range(a, b) {   // dim everything outside [a, b]
      this.p = null; this.r = [a, b];
      const c = this.c; if (!c) return;
      const x = c.getContext('2d'), w = c.width, h = c.height, xa = Math.round(a * w), xb = Math.round(b * w);
      x.clearRect(0, 0, w, h); x.drawImage(this.base, 0, 0);
      x.fillStyle = INK.dim; x.fillRect(0, 0, xa, h); x.fillRect(xb, 0, w - xb, h);
    }
    draw(p) {
      if (p == null && this.r) { this.range(this.r[0], this.r[1]); return; }
      this.p = p;
      const c = this.c; if (!c) return;
      const x = c.getContext('2d'), w = c.width, h = c.height;
      x.clearRect(0, 0, w, h); x.drawImage(this.base, 0, 0);
      if (p != null) { const px = Math.round(clamp(p, 0, 1) * w); x.fillStyle = INK.dim; x.fillRect(px, 0, w - px, h); }
    }
  }

  /* ---------- the film's beats (one source of truth: the beat list in the page) ---------- */
  const DUR = 52.57;
  const BEATS = $$('.beat').map((el, i) => ({
    el, i, t0: +el.dataset.t0, t1: +el.dataset.t1, name: el.dataset.name, x: +el.dataset.x, y: +el.dataset.y,
    tone: el.dataset.tone, say: el.dataset.say, still: el.dataset.still,
  }));
  const beatAt = t => { let k = 0; BEATS.forEach((b, i) => { if (t >= b.t0 - 0.001) k = i; }); return k; };

  /* ==========================================================================
     REVEAL · NAV · PROGRESS
     ========================================================================== */
  const reveal = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.rv').forEach(el => reveal.observe(el));

  const nav = $('#nav'), links = $$('#links a'), pill = $('#links .pill'), bar = $('.progress u');
  const secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  let onLink = null;
  const placePill = a => {
    if (!pill) return;
    if (!a) { pill.style.opacity = '0'; return; }
    pill.style.left = a.offsetLeft + 'px'; pill.style.width = a.offsetWidth + 'px'; pill.style.opacity = '1';
  };
  let scrollQueued = false;
  const onScroll = () => {
    scrollQueued = false;
    const y = scrollY, max = Math.max(1, html.scrollHeight - innerHeight);
    nav.classList.toggle('scrolled', y > 8);
    if (bar) bar.style.setProperty('--sp', (y / max).toFixed(4));
    let cur = null;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .42) cur = links[i]; });
    if (cur !== onLink) { links.forEach(a => a.classList.toggle('on', a === cur)); onLink = cur; placePill(cur); }
    beatsOnScroll();
  };
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { placePill(onLink); onScroll(); });

  /* ==========================================================================
     LABEL CURSOR — says what you're pointing at (fine pointers only)
     ========================================================================== */
  const lcur = $('.lcur'), lcurT = lcur && $('span', lcur);
  const LC = { x: -100, y: -100, tx: -100, ty: -100, el: null, run: false };
  const lcurTick = () => {
    LC.x += (LC.tx - LC.x) * .32; LC.y += (LC.ty - LC.y) * .32;
    lcur.style.transform = `translate3d(${LC.x.toFixed(1)}px,${LC.y.toFixed(1)}px,0)`;
    const label = LC.el && LC.el.dataset.cursor;
    if (label && lcurT.textContent !== label) lcurT.textContent = label;
    lcur.classList.toggle('on', !!label);
    if (Math.abs(LC.tx - LC.x) > .2 || Math.abs(LC.ty - LC.y) > .2 || label) requestAnimationFrame(lcurTick); else LC.run = false;
  };
  if (lcur) {
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !mqFine.matches) return;
      LC.tx = e.clientX; LC.ty = e.clientY;
      if (LC.x < -50) { LC.x = LC.tx; LC.y = LC.ty; }
      LC.el = e.target.closest ? e.target.closest('[data-cursor]') : null;
      if (!LC.run) { LC.run = true; requestAnimationFrame(lcurTick); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { LC.el = null; });
    addEventListener('blur', () => { LC.el = null; });
  }

  /* ==========================================================================
     PLAYERS — the main film (with its muted preview) and the short cut
     ========================================================================== */
  class Player {
    constructor(root) {
      this.root = root; this.kind = root.dataset.player; this.dur = +root.dataset.dur || 1;
      this.screen = $('.fp-screen', root); this.prev = $('.fp-prev', root); this.film = $('.fp-film', root);
      this.big = $('.fp-big', root); this.bigT = this.big && $('.lbl b', this.big);
      this.pp = $('.fp-pp', root); this.snd = $('.fp-snd', root); this.fs = $('.fp-fs', root);
      this.timeEl = $('.fp-time b', root); this.track = $('.fp-track', root); this.actsEl = $('.fp-acts', root);
      this.hov = $('.fp-hover', root); this.thumb = $('.fp-thumb', root); this.ht = $('.fp-ht', root);
      this.now = $('.fp-now', root);
      this.strip = new Strip($('.fp-colors', root), COLORS[this.kind] || []);
      this.isMain = this.kind === 'main';
      this.mode = this.prev ? 'preview' : 'film';
      this.visible = false; this.pending = null; this.dragging = false; this.lastAct = -1; this.raf = 0; this.aria = 0;
      this.sound = START_WITH_SOUND;
      if (!this.actsEl) this.track.classList.add('plain');
      this.film.muted = !this.sound;
      films.push(this);
      this.build(); this.bind(); this.ui(); this.paint();
      new IntersectionObserver(es => { this.visible = es[0].isIntersecting; this.sync(); if (this.visible) this.loop(); }, { threshold: .05 }).observe(root);
      sleepers.add(this);
    }
    get vid() { return this.mode === 'preview' ? this.prev : this.film; }
    build() {
      if (!this.actsEl) return;
      this.actsEl.innerHTML = '';
      this.acts = BEATS.map((b, i) => {
        const s = document.createElement('span'); s.className = 'act';
        s.style.left = (b.t0 / this.dur * 100) + '%'; s.style.width = ((b.t1 - b.t0 + (i === BEATS.length - 1 ? this.dur - b.t1 : 0)) / this.dur * 100) + '%';
        s.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b><span>${b.name}</span>`;
        this.actsEl.appendChild(s); return s;
      });
      const fit = () => this.acts.forEach(s => { s.classList.remove('tight'); if (s.scrollWidth > s.clientWidth + 1) s.classList.add('tight'); });
      new ResizeObserver(fit).observe(this.actsEl); fit();
    }
    bind() {
      const f = this.film;
      this.screen.addEventListener('click', e => { if (e.target.closest('.fp-big')) return; this.toggle(); });
      this.big && this.big.addEventListener('click', () => this.start(this.mode === 'preview' || f.ended ? 0 : f.currentTime));
      this.pp.addEventListener('click', () => this.toggle());
      this.snd.addEventListener('click', () => {
        this.sound = !this.sound;
        if (this.sound && this.mode === 'preview') { this.start(0); return; }   // the preview is silent: sound means "watch it properly"
        f.muted = !this.sound; if (this.sound && f.volume === 0) f.volume = 1;
        this.ui();
      });
      this.fs && this.fs.addEventListener('click', () => this.full());
      ['play', 'pause', 'ended', 'volumechange', 'seeking', 'waiting', 'playing'].forEach(ev => f.addEventListener(ev, () => {
        if (ev === 'play') { films.forEach(p => { if (p !== this && !p.film.paused) p.film.pause(); }); syncAll(); this.loop(); }
        if (ev === 'pause' || ev === 'ended') syncAll();
        if (ev === 'volumechange') this.sound = !f.muted && f.volume > 0;
        this.ui();
      }));
      f.addEventListener('loadedmetadata', () => { if (this.pending != null) { f.currentTime = Math.min(this.pending, f.duration - .05); this.pending = null; } });
      f.addEventListener('error', () => say('The film could not load. Try again in a moment.'));
      document.addEventListener('fullscreenchange', () => {
        const on = document.fullscreenElement === f || document.fullscreenElement === this.screen;
        f.controls = document.fullscreenElement === f; this.root.classList.toggle('is-full', on);
      });
      // the track: click or drag to seek, hover for a frame
      const tr = this.track;
      const at = e => { const r = tr.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1); };
      tr.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        e.preventDefault(); tr.setPointerCapture(e.pointerId); this.dragging = true;
        this.seekTo(at(e) * this.dur, true); this.hover(e);
      });
      tr.addEventListener('pointermove', e => { if (this.dragging) this.seekTo(at(e) * this.dur, false); if (e.pointerType === 'mouse') this.hover(e); });
      const up = () => { if (!this.dragging) return; this.dragging = false; };
      tr.addEventListener('pointerup', up); tr.addEventListener('pointercancel', up);
      tr.addEventListener('pointerleave', () => tr.classList.remove('hov'));
      tr.addEventListener('keydown', e => {
        const t = this.vid.currentTime || 0; let n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') n = t + (e.shiftKey ? 1 : 5);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') n = t - (e.shiftKey ? 1 : 5);
        else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = this.dur - .2;
        else if (e.key === ' ' || e.key === 'Enter' || e.key === 'k') { e.preventDefault(); this.toggle(); return; }
        if (n == null) return;
        e.preventDefault(); this.seekTo(clamp(n, 0, this.dur - .1), this.mode === 'preview');
      });
      if (this.thumb) { this.thumb.style.backgroundImage = `url(${THUMBS.src})`; }
    }
    hover(e) {
      const tr = this.track, r = tr.getBoundingClientRect(), hx = clamp((e.clientX - r.left) / r.width, 0, 1), t = hx * this.dur;
      tr.style.setProperty('--hx', hx.toFixed(4)); tr.classList.add('hov');
      if (this.thumb) {
        const w = this.thumb.offsetWidth, h = this.thumb.offsetHeight, i = clamp(Math.round(t * THUMBS.perSec), 0, THUMBS.count - 1);
        const rows = Math.ceil(THUMBS.count / THUMBS.cols);
        this.thumb.style.backgroundSize = `${THUMBS.cols * w}px ${rows * h}px`;
        this.thumb.style.backgroundPosition = `${-(i % THUMBS.cols) * w}px ${-Math.floor(i / THUMBS.cols) * h}px`;
      }
      this.ht.innerHTML = this.isMain ? `${fmt(t)} <span>· ${BEATS[beatAt(t)].name}</span>` : fmt(t);
      // keep the popup inside the card
      const pw = this.hov.offsetWidth || 120, rr = this.root.getBoundingClientRect(), cx = r.left + hx * r.width;
      const left = clamp(cx - pw / 2, rr.left + 6, rr.right - pw - 6);
      this.hov.style.setProperty('--hshift', (left - cx) + 'px');
    }
    start(t = 0) {
      const f = this.film;
      if (this.mode === 'preview') { this.mode = 'film'; this.root.classList.add('is-film'); if (this.prev) this.prev.pause(); }
      this.root.classList.add('is-film');
      f.preload = 'auto'; f.muted = !this.sound;
      const p = f.play();                       // play first: play() on an ended film would reset a fresh seek to zero
      if (f.readyState >= 1) f.currentTime = clamp(t, 0, (f.duration || this.dur) - .05); else this.pending = t;
      if (p && p.catch) p.catch(() => { say('Press play to start the film.'); this.ui(); });
      this.ui(); this.loop(); syncAll();
    }
    toggle() {
      const f = this.film;
      if (this.mode === 'preview' || f.ended) { this.start(0); return; }
      if (!this.root.classList.contains('is-film')) { this.start(0); return; }
      if (f.paused) { const p = f.play(); p && p.catch && p.catch(() => {}); } else f.pause();
    }
    seekTo(t, startIfPreview) {
      if (this.mode === 'preview') {
        if (startIfPreview) { this.start(t); return; }
        if (this.prev.readyState >= 1) this.prev.currentTime = t; this.paint(); return;
      }
      const f = this.film;
      if (!this.root.classList.contains('is-film')) { this.start(t); return; }
      if (f.readyState >= 1) f.currentTime = clamp(t, 0, (f.duration || this.dur) - .05); else this.pending = t;
      this.paint(t);
    }
    full() {
      const f = this.film;
      if (!this.root.classList.contains('is-film') || this.mode === 'preview') this.start(0);
      if (f.requestFullscreen) f.requestFullscreen().catch(() => {});
      else if (f.webkitEnterFullscreen) f.webkitEnterFullscreen();
    }
    ui() {
      const f = this.film, film = this.root.classList.contains('is-film');
      const playing = film && !f.paused && !f.ended;
      this.root.classList.toggle('is-playing', playing);
      this.root.classList.toggle('is-ended', film && f.ended);
      this.pp.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      this.snd.setAttribute('aria-pressed', String(this.sound));
      this.snd.setAttribute('aria-label', this.sound ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on');
      if (this.bigT) this.bigT.textContent = f.ended ? 'Play again' : (this.isMain ? 'Play the film' : 'Short cut');
      this.screen.dataset.cursor = !film || f.ended ? (this.isMain ? 'Play the film' : 'Play the short cut') : playing ? 'Pause' : 'Play';
    }
    paint(tOverride) {
      const v = this.vid, t = tOverride != null ? tOverride : (v && v.currentTime) || 0, p = clamp(t / this.dur, 0, 1);
      this.track.style.setProperty('--p', p.toFixed(5));
      this.strip.draw(p);
      if (this.timeEl) this.timeEl.textContent = fmt(t);
      if (this.isMain) {
        const k = beatAt(t);
        if (k !== this.lastAct) {
          this.lastAct = k;
          this.acts && this.acts.forEach((s, i) => s.classList.toggle('on', i === k));
          if (this.now) {
            $('b', this.now).textContent = String(k + 1).padStart(2, '0'); $('span', this.now).textContent = BEATS[k].name;
            this.now.classList.remove('swap'); void this.now.offsetWidth; this.now.classList.add('swap');
          }
        }
      }
      const now = performance.now();
      if (now - this.aria > 500) {
        this.aria = now;
        this.track.setAttribute('aria-valuenow', String(Math.round(t)));
        this.track.setAttribute('aria-valuetext', fmt(t) + (this.isMain ? ', ' + BEATS[beatAt(t)].name : ''));
      }
    }
    loop() {
      if (this.raf) return;
      const tick = () => {
        this.raf = 0;
        this.paint();
        const v = this.vid;
        if (this.visible && v && !v.paused) this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }
    sync() {   // the muted preview loops only when nothing else asks for attention
      if (!this.prev) return;
      const on = this.mode === 'preview' && this.visible && !reduce() && !paused() && !document.hidden && !filmPlaying();
      if (on) {
        if (this.prev.preload === 'none') this.prev.preload = 'auto';
        if (this.prev.paused) { const p = this.prev.play(); if (p && p.catch) p.catch(() => {}); }
        this.loop();
      } else if (!this.prev.paused) this.prev.pause();
    }
  }
  const players = $$('[data-player]').map(el => new Player(el));
  players.forEach(p => {
    if (p.prev) {
      p.prev.addEventListener('play', () => p.loop());
      p.prev.addEventListener('seeked', () => p.paint());
    }
  });

  /* ==========================================================================
     BEAT BY BEAT — the film plays each beat; Turinoz's cursor points at the detail
     ========================================================================== */
  const stage = $('#stage');
  const S = stage ? {
    frame: $('.bt-frame', stage), video: $('.bt-video', stage), still: $('.bt-still', stage),
    cur: $('.tcur', stage), bub: $('.tcur .bub', stage), tx: $('.tcur .tx', stage), tc: $('.bt-tc', stage),
    mini: $('.bt-mini', stage), range: $('.bt-range', stage), name: $('.bt-name', stage), span: $('.bt-span', stage),
    strip: null, active: -1, visible: false, raf: 0, token: 0, seeking: false,
  } : null;
  function beatsOnScroll() {
    if (!S || !BEATS.length) return;
    const narrow = innerWidth <= 900;
    let line = innerHeight * .52;
    if (narrow) { const b = stage.getBoundingClientRect().bottom; line = b + (innerHeight - b) * .38; }
    let k = 0;
    BEATS.forEach((b, i) => { if (b.el.getBoundingClientRect().top < line) k = i; });
    if (k !== S.active) setBeat(k);
  }
  function setBeat(k) {
    const b = BEATS[k], first = S.active === -1; S.active = k;
    BEATS.forEach((x, i) => x.el.classList.toggle('on', i === k));
    stage.dataset.tone = b.tone;
    S.mini.style.setProperty('--a', (b.t0 / DUR).toFixed(4)); S.mini.style.setProperty('--b', (b.t1 / DUR).toFixed(4));
    S.strip && S.strip.range(b.t0 / DUR, b.t1 / DUR);
    S.mini.style.setProperty('--p', (b.t0 / DUR).toFixed(4));
    S.name.textContent = b.name; S.span.textContent = `${fmtR(b.t0)} – ${fmtR(b.t1)}`;
    if (!first) [S.name, S.span].forEach(el => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
    // the still stands in while the film seeks, then fades
    S.frame.classList.remove('live');
    if (S.still.getAttribute('src') !== b.still) S.still.src = b.still;
    S.tc.textContent = fmt1(b.t0);
    playBeat();
    pointAt(b);
  }
  function stageMayMove() { return S.visible && !reduce() && !paused() && !document.hidden && !filmPlaying(); }
  function playBeat() {
    const v = S.video, b = BEATS[S.active]; if (!b) return;
    if (!stageMayMove()) { v.pause(); S.frame.classList.remove('live'); return; }
    if (v.preload === 'none') v.preload = 'auto';
    const go = () => {
      if (Math.abs(v.currentTime - b.t0) > .05 && (v.currentTime < b.t0 - .05 || v.currentTime > b.t1)) { S.seeking = true; v.currentTime = b.t0; }
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    };
    if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
    stageLoop();
  }
  function stageLoop() {
    if (S.raf) return;
    const tick = () => {
      S.raf = 0;
      const v = S.video, b = BEATS[S.active];
      if (!b) return;
      if (!v.paused) {
        if (v.currentTime >= b.t1 - .03 || v.currentTime < b.t0 - .4) { S.seeking = true; v.currentTime = b.t0; }
        if (!S.seeking && v.currentTime >= b.t0 - .05) S.frame.classList.add('live');
        S.tc.textContent = fmt1(v.currentTime);
        S.mini.style.setProperty('--p', (v.currentTime / DUR).toFixed(4));
        S.raf = requestAnimationFrame(tick);
      }
    };
    S.raf = requestAnimationFrame(tick);
  }
  // Turinoz's cursor: glides to the detail, taps, then says one line
  function pointAt(b) {
    const tok = ++S.token, cur = S.cur, fw = S.frame.clientWidth, fh = S.frame.clientHeight;
    const x = b.x / 100 * fw, y = b.y / 100 * fh;
    // measure the line first, then pick the side with room (and nudge it in if neither has)
    S.bub.classList.remove('on', 'typing'); S.tx.textContent = b.say || '';
    const bw = S.bub.offsetWidth + 4; S.tx.textContent = '';
    const right = x + 20 + bw <= fw - 6, leftOk = x - 12 - bw >= 6;
    const left = !right && leftOk;
    cur.classList.toggle('left', left); cur.classList.toggle('up', b.y > 74);
    let nudge = 0;
    if (!right && !leftOk) nudge = (fw - 6 - bw) - (x + 20);
    S.bub.style.marginLeft = nudge ? nudge.toFixed(0) + 'px' : '';
    if (reduce()) { cur.style.transition = 'opacity .3s'; }
    cur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    cur.classList.add('on');
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    (async () => {
      await wait(reduce() ? 60 : 980); if (tok !== S.token) return;
      cur.classList.add('press', 'clk'); await wait(160); cur.classList.remove('press');
      await wait(120); if (tok !== S.token) return;
      S.bub.classList.add('on', 'typing');
      const txt = b.say || '';
      if (reduce()) { S.tx.textContent = txt; }
      else for (let i = 1; i <= txt.length; i++) { if (tok !== S.token) return; S.tx.textContent = txt.slice(0, i); await wait(26 + (txt[i - 1] === ' ' ? 30 : 0)); }
      await wait(900); if (tok !== S.token) return;
      S.bub.classList.remove('typing'); cur.classList.remove('clk');
    })();
  }
  if (S) {
    S.strip = new Strip($('canvas', S.mini), COLORS.main);
    S.strip.r = [0, BEATS[0].t1 / DUR];
    S.video.addEventListener('seeked', () => { S.seeking = false; });
    S.video.addEventListener('playing', stageLoop);
    S.still.addEventListener('error', () => {});
    S.mini.addEventListener('click', e => {
      const r = S.mini.getBoundingClientRect(), t = clamp((e.clientX - r.left) / r.width, 0, 1) * DUR, k = beatAt(t);
      BEATS[k].el.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: innerWidth <= 900 ? 'start' : 'center' });
    });
    S.mini.setAttribute('data-cursor', 'Go to beat');
    new ResizeObserver(() => { if (S.active >= 0) { const b = BEATS[S.active]; S.cur.style.transition = 'none'; S.cur.style.transform = `translate3d(${(b.x / 100 * S.frame.clientWidth).toFixed(1)}px,${(b.y / 100 * S.frame.clientHeight).toFixed(1)}px,0)`; void S.cur.offsetWidth; S.cur.style.transition = ''; } }).observe(S.frame);
    const stageSync = () => { if (S.active < 0) return; if (stageMayMove()) playBeat(); else { S.video.pause(); S.frame.classList.remove('live'); } };
    new IntersectionObserver(es => { S.visible = es[0].isIntersecting; stageSync(); }, { rootMargin: '200px 0px' }).observe($('.bt'));
    S.sync = stageSync; sleepers.add(S);
    setBeat(0);
  }

  /* ==========================================================================
     REFINEMENT — drag to compare
     ========================================================================== */
  const wipe = $('#wipe');
  if (wipe) {
    const PAIRS = [
      { early: 'assets/styleframe-10.webp', final: 'assets/workflow-final.webp', l: 'Exploration · SF 10', r: 'Final film · 0:15',
        ea: 'Early styleframe: the domains screen as a floating glass panel with soft corners.', fa: 'Final film: the smtp.dev domains screen, flat and close to the real product.',
        ce: 'Floating glass, soft corners, a lot of blur and a caption on top.', cf: 'The real layout: flat, direct, the way it looks after signup.' },
      { early: 'assets/styleframe-15.webp', final: 'assets/start-testing-final.webp', l: 'Exploration · SF 15', r: 'Final film · 0:28',
        ea: 'Early styleframe: That’s it, start testing, as a toast over a blurred screen.', fa: 'Final film: Start testing, alone in its own frame.',
        ce: 'The last step tucked into a toast: That’s it, start testing.', cf: 'Given a frame of its own: That’s it. Then Start testing.' },
    ];
    const handle = $('.wipe-handle', wipe), imgF = $('.wipe-final', wipe), imgE = $('.wipe-early img', wipe);
    const lblL = $('.wipe-l span', wipe), lblR = $('.wipe-r span', wipe), capE = $('.cap-early'), capF = $('.cap-final');
    const seg = $('#refine .seg');
    let x = 50, touched = false, hinted = false, down = false;
    const set = v => { x = clamp(v, 0, 100); wipe.style.setProperty('--x', x.toFixed(2) + '%'); handle.setAttribute('aria-valuenow', String(Math.round(x))); };
    const from = e => { const r = wipe.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
    wipe.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      touched = true; down = true; wipe.classList.add('drag');
      if (e.pointerType === 'mouse') { e.preventDefault(); wipe.setPointerCapture(e.pointerId); }
      set(from(e));
    });
    wipe.addEventListener('pointermove', e => { if (down) set(from(e)); });
    const up = () => { down = false; wipe.classList.remove('drag'); };
    wipe.addEventListener('pointerup', up); wipe.addEventListener('pointercancel', up); wipe.addEventListener('lostpointercapture', up);
    // touch: a sideways swipe drags, a vertical one scrolls (touch-action: pan-y)
    handle.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 0;
      if (e.key === 'Home') { touched = true; set(0); e.preventDefault(); } else if (e.key === 'End') { touched = true; set(100); e.preventDefault(); }
      if (d) { e.preventDefault(); touched = true; set(x + d * (e.shiftKey ? 2 : 1)); }
    });
    // a one-time hint that it moves
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting || hinted) return; hinted = true; o.disconnect();
      if (reduce()) return;
      const keys = [[0, 50], [.42, 30], [1.05, 70], [1.55, 50]], t0 = performance.now() + 500;
      const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const tick = now => {
        if (touched) return;
        const t = (now - t0) / 1000; if (t < 0) { requestAnimationFrame(tick); return; }
        let k = 0; while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
        const [ta, va] = keys[k], [tb, vb] = keys[k + 1], p = clamp((t - ta) / (tb - ta), 0, 1);
        set(va + (vb - va) * ease(p));
        if (t < keys[keys.length - 1][0]) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: .5 }).observe(wipe);
    const show = i => {
      const P = PAIRS[i]; seg.dataset.on = String(i);
      if (!down) set(50);
      $$('button', seg).forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
      wipe.classList.add('swapping'); capE.style.opacity = capF.style.opacity = '0';
      setTimeout(() => {
        let n = 0; const done = () => { if (++n >= 2) { wipe.classList.remove('swapping'); } };
        imgF.onload = done; imgE.onload = done; imgF.onerror = done; imgE.onerror = done;
        imgF.src = P.final; imgE.src = P.early; imgF.alt = P.fa; imgE.alt = P.ea;
        lblL.textContent = P.l; lblR.textContent = P.r; capE.textContent = P.ce; capF.textContent = P.cf;
        capE.style.opacity = capF.style.opacity = '';
        if (imgF.complete && imgE.complete) wipe.classList.remove('swapping');
      }, 230);
    };
    $$('button', seg).forEach((b, i) => b.addEventListener('click', () => show(i)));
    seg.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const i = e.key === 'ArrowRight' ? 1 : 0; show(i); $$('button', seg)[i].focus();
    });
    set(50);
  }

  /* ==========================================================================
     STYLEFRAMES — a rail you can drag (mouse), swipe (touch) or step through
     ========================================================================== */
  const rail = $('#sfRail');
  if (rail) {
    const btns = $$('#frames .rbtn');
    const step = () => { const c = $('.sf', rail); return c ? c.offsetWidth + 16 : 400; };
    const upd = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      btns[0] && (btns[0].disabled = rail.scrollLeft <= 2);
      btns[1] && (btns[1].disabled = rail.scrollLeft >= max);
    };
    btns.forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.dir * step(), behavior: reduce() ? 'auto' : 'smooth' })));
    rail.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    let d = null, moved = false;
    rail.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      d = { x: e.clientX, s: rail.scrollLeft, id: e.pointerId }; moved = false;
    });
    addEventListener('pointermove', e => {
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      if (!moved && Math.abs(dx) > 4) { moved = true; rail.classList.add('drag'); }
      if (moved) rail.scrollLeft = d.s - dx;
    });
    addEventListener('pointerup', () => {
      if (!d) return; d = null;
      if (!moved) return;
      rail.classList.remove('drag');
      const s = step(), target = Math.round(rail.scrollLeft / s) * s;
      rail.scrollTo({ left: target, behavior: reduce() ? 'auto' : 'smooth' });
    });
    rail.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    rail.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
  }

  /* ==========================================================================
     ONE LANGUAGE — three lengths to scale, and the logo loop frame by frame
     ========================================================================== */
  $$('.len').forEach(a => {
    new Strip($('canvas', a), COLORS[a.dataset.colors] || []);
    const i = $('.len-bar i', a); if (i) i.style.setProperty('--d', a.dataset.dur + 's');
  });

  const lg = $('.lg-stage');
  if (lg) {
    const frameEl = $('.lg-frame', lg), fEl = $('.lg-f b', lg), modeEl = $('.lg-mode span', lg), rail2 = $('.lg-rail', lg), keys = $$('.lg-keys button');
    const L = { f: 0, scrub: false, visible: false, raf: 0, t0: 0, hold: 0 };
    const KEYF = keys.map(k => +k.dataset.f);
    const sizeKeys = () => keys.forEach(k => {
      const s = $('span', k), w = s.offsetWidth, f = +k.dataset.f;
      s.style.backgroundSize = `${LOGO.cols * w}px ${LOGO.rows * w}px`;
      s.style.backgroundPosition = `${-(f % LOGO.cols) * w}px ${-Math.floor(f / LOGO.cols) * w}px`;
    });
    const render = f => {
      f = ((Math.round(f) % LOGO.frames) + LOGO.frames) % LOGO.frames; L.f = f;
      const W = lg.clientWidth, H = lg.clientHeight, S2 = Math.max(W, H);
      frameEl.style.backgroundSize = `${LOGO.cols * S2}px ${LOGO.rows * S2}px`;
      frameEl.style.backgroundPosition = `${(-(f % LOGO.cols) * S2 - (S2 - W) / 2).toFixed(1)}px ${(-Math.floor(f / LOGO.cols) * S2 - (S2 - H) / 2).toFixed(1)}px`;
      fEl.textContent = String(f).padStart(2, '0');
      rail2.style.setProperty('--lp', (f / (LOGO.frames - 1)).toFixed(4));
      lg.setAttribute('aria-valuenow', String(f));
      let near = 0; KEYF.forEach((k, i) => { if (f >= k) near = i; });
      keys.forEach((k, i) => k.classList.toggle('on', i === near));
    };
    const mayPlay = () => L.visible && !L.scrub && !reduce() && !paused() && !document.hidden;
    const tick = now => {
      L.raf = 0;
      if (!mayPlay()) return;
      render((now - L.t0) / 1000 * LOGO.fps);
      L.raf = requestAnimationFrame(tick);
    };
    const resume = () => { L.t0 = performance.now() - L.f / LOGO.fps * 1000; if (!L.raf && mayPlay()) L.raf = requestAnimationFrame(tick); };
    const setMode = s => { L.scrub = s; lg.classList.toggle('scrub', s); modeEl.textContent = s ? 'Scrubbing' : (reduce() || paused() ? 'Paused' : 'Playing'); if (!s) resume(); };
    L.sync = () => { setMode(L.scrub); if (!mayPlay() && L.raf) { cancelAnimationFrame(L.raf); L.raf = 0; } };
    sleepers.add(L);
    const fromX = e => { const r = lg.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1) * (LOGO.frames - 1); };
    lg.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse' || e.buttons) { clearTimeout(L.hold); if (!L.scrub) setMode(true); render(fromX(e)); }
    });
    lg.addEventListener('pointerdown', e => { clearTimeout(L.hold); setMode(true); render(fromX(e)); });
    lg.addEventListener('pointerleave', () => { clearTimeout(L.hold); L.hold = setTimeout(() => setMode(false), 500); });
    lg.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') { clearTimeout(L.hold); L.hold = setTimeout(() => setMode(false), 1600); } });
    lg.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault(); clearTimeout(L.hold); setMode(true);
      render(e.key === 'Home' ? 0 : e.key === 'End' ? LOGO.frames - 1 : L.f + d * (e.shiftKey ? 5 : 1));
    });
    lg.addEventListener('blur', () => { clearTimeout(L.hold); L.hold = setTimeout(() => setMode(false), 400); });
    keys.forEach(k => k.addEventListener('click', () => { clearTimeout(L.hold); setMode(true); render(+k.dataset.f); L.hold = setTimeout(() => setMode(false), 1800); }));
    new ResizeObserver(() => { sizeKeys(); render(L.f); }).observe(lg);
    new IntersectionObserver(es => { L.visible = es[0].isIntersecting; L.sync(); if (L.visible) resume(); }, { threshold: .1 }).observe(lg);
    sizeKeys(); render(0);
  }

  /* ==========================================================================
     DELIVERED — the terminal types its listing once it's on screen
     ========================================================================== */
  const term = $('#term');
  if (term && !reduce()) {
    const lines = $$('.term-body .ln', term);
    term.classList.add('typing');
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return; o.disconnect();
      lines.forEach((l, i) => setTimeout(() => l.classList.add('on'), 260 + i * (i === 0 ? 0 : 150) + (i > 0 ? 320 : 0)));
    }, { threshold: .4 }).observe(term);
  }

  /* ==========================================================================
     HERO — the title counts to 53; a little dust drifts in the light, like the film
     ========================================================================== */
  const count = $('.h1 .count');
  const heroIn = () => {
    $$('.h1').forEach(h => h.classList.add('in'));
    if (!count || reduce()) return;
    const to = +count.dataset.to, t0 = performance.now() + 120, dur = 1300;
    count.textContent = '00';
    const step = now => {
      const p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      count.textContent = String(Math.round(to * e)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(() => requestAnimationFrame(heroIn));

  const dust = $('.dust');
  if (dust) {
    const ctx = dust.getContext('2d'), P = [];
    let W = 0, H = 0, visible = true, raf = 0;
    const seed = () => {
      const r = dust.getBoundingClientRect(), d = dpr();
      W = dust.width = Math.round(r.width * d); H = dust.height = Math.round(r.height * d);
      P.length = 0;
      const n = Math.round(clamp(r.width / 22, 24, 70));
      for (let i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.1 + .45) * d, a: Math.random() * .45 + .1, s: (Math.random() * .12 + .04) * d, ph: Math.random() * 6.28 });
      draw(performance.now());
    };
    const draw = now => {
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        const tw = .55 + .45 * Math.sin(now / 1400 + p.ph);
        const fall = Math.min(1, (H - p.y) / (H * .5));          // fade out lower down
        ctx.globalAlpha = p.a * tw * fall;
        ctx.fillStyle = INK.dust;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const tick = now => {
      raf = 0;
      for (const p of P) { p.y -= p.s; p.x += Math.sin(now / 3000 + p.ph) * .04; if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; } }
      draw(now);
      if (D.may()) raf = requestAnimationFrame(tick);
    };
    const D = { may: () => visible && !reduce() && !paused() && !document.hidden, sync: () => { if (D.may() && !raf) raf = requestAnimationFrame(tick); else if (!raf) draw(performance.now()); } };
    sleepers.add(D);
    new ResizeObserver(seed).observe(dust);
    new IntersectionObserver(es => { visible = es[0].isIntersecting; D.sync(); }).observe(dust);
  }

  /* "Watch the film" goes to the film and starts it */
  const mainP = players.find(p => p.isMain);
  $$('[data-play-film]').forEach(a => a.addEventListener('click', e => {
    if (!mainP || !mainP.big) return;
    e.preventDefault();
    $('#film').scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'center' });
    mainP.big.click();
  }));

  /* ==========================================================================
     DAY / NIGHT — the same choice as the portfolio's home page (tz-theme)
     ========================================================================== */
  const tm = $('#tm'), mqDark = matchMedia('(prefers-color-scheme: dark)');
  const mode = () => html.dataset.theme || (mqDark.matches ? 'dark' : 'light');
  const themed = () => {
    const label = mode() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    if (tm) { tm.setAttribute('aria-label', label); tm.title = label; }
    INK.dim = tok('--strip-dim') || INK.dim; INK.dust = tok('--dust') || INK.dust;
    strips.forEach(st => st.draw(st.p));
    syncAll();
  };
  tm && tm.addEventListener('click', () => {
    const next = mode() === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    try { localStorage.setItem('tz-theme', next); } catch (_) {}
  });
  mqDark.addEventListener && mqDark.addEventListener('change', themed);
  new MutationObserver(themed).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  themed();

  /* ==========================================================================
     PAUSE ALL MOTION · visibility · reduced motion
     ========================================================================== */
  const ppAll = $('#pp');
  ppAll && ppAll.addEventListener('click', () => {
    const on = !paused();
    html.classList.toggle('paused', on);
    ppAll.setAttribute('aria-pressed', String(on));
    ppAll.setAttribute('aria-label', on ? 'Play all motion' : 'Pause all motion');
    ppAll.title = on ? 'Play all motion' : 'Pause all motion';
    if (on) films.forEach(p => p.film.pause());
    syncAll();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) films.forEach(p => p.film.pause()); syncAll(); });
  mqReduce.addEventListener && mqReduce.addEventListener('change', syncAll);

  onScroll();
})();
