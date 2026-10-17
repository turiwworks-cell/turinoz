# Quiet Between Stars

The case study for the ambient motion system made for Petie Clark. Plain HTML, CSS and
JavaScript, no build step. Serve the portfolio folder and open `/quiet-between-stars/`.

## Look

- It lives in the piece's own world, night only (no day mode, no theme button): true black,
  a cold blue haze and the controller guide's yellow (`#FFD405`).
- Same bones as the other case studies: sticky nav with back and the name; `01 — Name` kickers; credits card; next project; footer; FOUC guard.

## Story, top to bottom

1. **Arrival**: the page opens in Hyperspace, plays Return on the first scroll and lands in
   Primary Idle. The first screen is the watching screen: the title on top, the four states
   as poster cards (a card plays its state on the stage), a readable note that this is an
   8-bit web copy of a 6480 × 3840 10-bit OLED master, "Scroll for the case study" and small
   play/fullscreen controls.
2. **Nav**: on the first screen only the name, centered. Past the stage it moves to its
   corner and the section links appear.
3. **01 Brief**: what Petie asked for, the six rules and his "still water / smooth current".
4. **02 Primary Idle**: how the idle state was built. The main piece is the 3D mockup in
   `layer-diagram.html` (from `qbs/layer-diagram.html` on branch `qbs-layer-diagram`),
   embedded as an iframe (stage only, 16:9, square on phones); three.js r128 is vendored in
   `assets/three.min.js`. Under it: three short facts (120 hero + 400 micro stars as shape
   layers with expressions, clouds and nebula merged into a few depth layers, all native)
   and the render-weight problem with its fixes and render times.
5. **03 Hyperspace**: same layout as Primary Idle. The mockup is `hyperspace-diagram.html`
   (plain WebGL, no library): Map, Tunnel, Final, with Speed, Twirl and Falloff. Facts and
   the loop problem come from the project package (`QBS_Agent_Package.zip`): one 170 s loop
   from 5 s to 175 s, speed rounded to whole passes, no keyframes inside the loop.
6. **04 Transitions**: same layout. `transitions-diagram.html` plays the real Entry and Return
   renders with the nine `KF_TRANSITIONS` sliders read out at the playhead (key times and
   values from the project, curves between keys approximate) and an Entry order chart.
7. **05 Process**: Handover only, for now.
8. **06 System**: key numbers, the nine control groups, and two of their guide pages as
   small, zoomable examples.
9. **07 Delivery**: the four things handed over, each with a small picture of it, credits
   set like a film's end credits, next project (Storm).

Copy rules that apply here: no project length or date range; nothing from payments,
budgets, connectivity, private emails or draft testimonials. The one quote is Petie's own
line about the guide.

## Files

- `case-study.css`, `case-study.js`: this page only.
- `tile.html`: the passive preview in the home page's Selected work (full row, fifth tile).
  It plays `assets/preview.mp4`, a 22-second edit labelled Selected moments.
- `assets/media-manifest.json`: source paths and encode settings for every asset.
- `assets/guide-*-1200/2400.webp`, `ctrl-center.webp`, `expressions.webp`,
  `star-system.webp`: from Turinoz's own screenshots of the guide and the After Effects
  project.

Videos are H.264, 8-bit, 1440 px wide, 24 fps, silent, all under Cloudflare's 25 MiB
per-file limit. The masters stay outside the site. A better web copy (10-bit HEVC or AV1)
would need to be encoded from those masters.

## Behavior

- Videos pause off screen and when the tab is hidden; reduced motion starts the player
  paused. Primary Idle loads first; the large Hyperspace file loads only when chosen.
- Zoomable images open in a lightbox; clicking the image shows it at full size around the
  click point.
