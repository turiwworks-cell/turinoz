/* Section menu pill, shared by the case-study pages (Sitemate, Scoreline, smtp.dev).
 *
 * <nav class="links" id="links" data-spy=".42" data-hide-top="0"> <i class="pill"></i> <a href="#id">…</a> … </nav>
 *   data-spy       a section is current once its top passes this share of the screen height (default .42)
 *   data-hide-top  above this scroll position no section is current and the pill hides (default 0 = never)
 *
 * - A click goes straight to the section: the pill moves once to the link and waits there
 *   while the page scrolls, instead of stepping over every section in between.
 * - Hover only washes the link (CSS --nav-hover); the pill stays on the section you are reading.
 * - On narrow screens the menu is a scrolling row and the active link slides to its middle.
 * - The pill can be dragged to another link; letting go opens that section.
 */
(() => {
  const menu = document.getElementById('links');
  if (!menu) return;
  const pill = menu.querySelector('.pill');
  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const secs = links.map(a => document.getElementById(decodeURIComponent(a.hash.slice(1))));
  const line = parseFloat(menu.dataset.spy) || .42;
  const hideTop = parseFloat(menu.dataset.hideTop) || 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const how = () => (reduce.matches ? 'auto' : 'smooth');

  const css = document.createElement('style');
  css.textContent =
    '.links a{white-space:nowrap}' +
    '.links a:not(.on):hover{background-color:var(--nav-hover,rgba(127,127,127,.08))}' +
    '.links a.on{touch-action:none}' +
    '.links.np-drag,.links.np-drag a{user-select:none;-webkit-user-select:none}' +
    '.links.np-drag a{background-color:transparent!important}' +
    '.links.np-drag a.on:not(.np-near){color:var(--ink-2)}.links a.np-near{color:var(--ink)}' +
    '.links.np-drag .pill{transition:opacity .3s,transform .2s!important;transform:scale(1.04)}' +
    '.links.np-still .pill{transition:none!important}';
  document.head.appendChild(css);

  let on;                 // the link the pill sits on (undefined until the first pass)
  let travel = null;      // a clicked link the page is scrolling to
  let pinned = null;      // the clicked link, kept until the reader scrolls on their own
  let pinY = 0, settle = 0, drag = null, justDragged = false, queued = false;

  function place(a, still) {
    if (!pill) return;
    if (!a || !a.offsetWidth) { pill.style.opacity = '0'; return; }
    if (still) menu.classList.add('np-still');
    pill.style.left = a.offsetLeft + 'px';
    pill.style.width = a.offsetWidth + 'px';
    pill.style.opacity = '1';
    if (still) { void pill.offsetWidth; menu.classList.remove('np-still'); }
  }
  function center(a) {
    if (!a || menu.scrollWidth <= menu.clientWidth + 1) return;
    menu.scrollTo({ left: a.offsetLeft - (menu.clientWidth - a.offsetWidth) / 2, behavior: how() });
  }
  function mark(a) {
    if (a === on) return;
    const first = on === undefined || (pill && pill.style.opacity !== '1');
    on = a;
    links.forEach(x => {
      x.classList.toggle('on', x === a);
      if (x === a) x.setAttribute('aria-current', 'location'); else x.removeAttribute('aria-current');
    });
    place(a, first);          // the first placement (or a reappearance) lands without sliding in from the left
    center(a);
  }
  function current() {
    if (scrollY < hideTop) return null;
    let cur = null;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * line) cur = links[i]; });
    return cur;
  }
  function spy() {
    queued = false;
    if (travel || drag) return;
    if (pinned && Math.abs(scrollY - pinY) > 4) pinned = null;
    mark(pinned || current());
  }
  function arrive() {
    clearTimeout(settle);
    if (!travel) return;
    pinned = travel; pinY = scrollY; travel = null;
    spy();
  }
  addEventListener('scroll', () => {
    if (travel) { clearTimeout(settle); settle = setTimeout(arrive, 160); return; }
    if (!queued) { queued = true; requestAnimationFrame(spy); }
  }, { passive: true });
  addEventListener('scrollend', () => { if (travel) arrive(); });
  // a wheel, a touch or a key during the trip hands the page back to the reader
  const handBack = () => { if (travel) { travel = null; pinned = null; clearTimeout(settle); spy(); } };
  addEventListener('wheel', handBack, { passive: true });
  addEventListener('touchstart', e => { if (!menu.contains(e.target)) handBack(); }, { passive: true });
  addEventListener('keydown', e => { if (/^(Arrow|Page|Home|End| )/.test(e.key) && !e.target.closest('input,textarea,[contenteditable]')) handBack(); });
  addEventListener('resize', () => { place(on, true); if (!travel) { pinned = null; spy(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => place(on, true));

  function go(a) {
    const sec = secs[links.indexOf(a)];
    if (!sec) return;
    pinned = null; travel = a; mark(a);
    const y0 = scrollY;
    sec.scrollIntoView({ behavior: how(), block: 'start' });   // honours the page's scroll-padding-top
    if (history.replaceState) history.replaceState(null, '', a.hash);
    clearTimeout(settle);
    // no scroll happened (already there) → settle now; otherwise a safety net in case scroll events stop early
    requestAnimationFrame(() => { if (travel && Math.abs(scrollY - y0) < 1) settle = setTimeout(arrive, 120); else if (travel) settle = setTimeout(arrive, 1800); });
  }
  links.forEach(a => a.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (justDragged) return;
    go(a);
  }));

  /* ---------- drag the pill ---------- */
  const nearest = x => links.reduce((b, a) =>
    Math.abs(a.offsetLeft + a.offsetWidth / 2 - x) < Math.abs(b.offsetLeft + b.offsetWidth / 2 - x) ? a : b, links[0]);
  menu.addEventListener('dragstart', e => e.preventDefault());   // no native link drag
  menu.addEventListener('pointerdown', e => {
    if (!pill || e.button !== 0 || pill.style.opacity !== '1') return;
    const a = e.target.closest('a');
    if (!a || a !== on) return;
    drag = { x0: e.clientX, left0: pill.offsetLeft, w: pill.offsetWidth, id: e.pointerId, moved: false, near: a };
  });
  menu.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 5) return;
      drag.moved = true;
      try { menu.setPointerCapture(e.pointerId); } catch (_) {}
      menu.classList.add('np-drag');
      travel = null; clearTimeout(settle);
    }
    const left = Math.max(0, Math.min(menu.scrollWidth - drag.w, drag.left0 + dx));
    const n = nearest(left + drag.w / 2);
    drag.w += (n.offsetWidth - drag.w) * .25;     // the width eases toward the link underneath
    pill.style.left = left + 'px';
    pill.style.width = drag.w + 'px';
    if (n !== drag.near) { drag.near.classList.remove('np-near'); n.classList.add('np-near'); drag.near = n; }
    // keep the dragged pill in view inside a scrolling menu
    if (menu.scrollWidth > menu.clientWidth) {
      if (left < menu.scrollLeft + 8) menu.scrollLeft = left - 8;
      else if (left + drag.w > menu.scrollLeft + menu.clientWidth - 8) menu.scrollLeft = left + drag.w - menu.clientWidth + 8;
    }
  });
  const drop = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.moved) return;
    menu.classList.remove('np-drag');
    d.near.classList.remove('np-near');
    justDragged = true; setTimeout(() => { justDragged = false; }, 0);   // swallow the click the release makes
    on = null;                                    // let mark() run even when it lands on the same link
    if (e.type === 'pointercancel') { spy(); return; }
    go(d.near);
    place(d.near);                                // slide from where it was let go
  };
  menu.addEventListener('pointerup', drop);
  menu.addEventListener('pointercancel', drop);

  spy();
})();
