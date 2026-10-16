# Quiet Between Stars

The case study for the ambient motion system made for Petie Clark. Plain HTML, CSS and
JavaScript, no build step. Serve the portfolio folder and open `/quiet-between-stars/`.

## Look

- It lives in the piece's own world. Night is true black, a cold blue haze and the
  controller guide's yellow (`#FFD405`). Day is the guide on paper: white, ink and the
  guide's blue (`#1700FF`). Day/night is the portfolio's shared `tz-theme` choice.
- Anything that shows the work (the player, stills, screenshots, the formats stage, the
  lightbox) stays night in both modes.
- Behind the page is a slow star field on a `<canvas>`: seeded, drifting toward the viewer,
  with a little scroll parallax. It stops for reduced motion and when the tab is hidden.
- Same bones as the other case studies: sticky nav with back, brand, section links and the
  day/night button; `01 — Name` kickers; credits card; next project; footer; FOUC guard.

## Story, top to bottom

1. **Quality note** first: made for OLED at 6480 × 3840, 10-bit; this page plays an 8-bit
   web copy, so any crushed black or banding comes from that.
2. **Player**: the four delivered states (Primary Idle, Entry, Hyperspace, Return). Entry
   hands over to Hyperspace and Return to Idle on their own.
3. **01 Brief**: what Petie asked for, the six rules, and his "still water / smooth current".
4. **02 Process**: who did what, then seven steps (Test, Direction, System, Weight,
   Hyperspace, Refinement, Handover). Each step ends with "My call" and Petie's answer, so
   the decisions read at a glance. A sticky rail on the left tracks the step on desktop.
5. **03 System**: key numbers, the `CTRL_CENTER` layer list, two pages of the controller
   guide (Micro Stars / Hyperspace, zoomable), the seed logic, the OLED safety controls and
   the star layers.
6. **04 Formats**: one viewer for the triple, portrait and two ultrawide idle stills.
7. **05 Delivery**: what was handed over, credits, next project (Storm).

Copy rules that apply here: no project length or date range; nothing from payments,
budgets, connectivity, private emails or draft testimonials. The one quote is Petie's own
line about the guide.

## Files

- `case-study.css`, `case-study.js`: this page only.
- `tile.html`: the passive preview in the home page's Selected work (full row, fifth tile).
  It plays `assets/preview.mp4`, a 22-second edit labelled Selected moments.
- `assets/media-manifest.json`: source paths and encode settings for every asset.
- `assets/guide-*-1200/2400.webp`, `ctrl-center.webp`: from Turinoz's own screenshots of
  the guide and the After Effects project. `oled-safety.webp` is a crop of the development
  controller screenshot.

Videos are H.264, 8-bit, 1440 px wide, 24 fps, silent, all under Cloudflare's 25 MiB
per-file limit. The masters stay outside the site. A better web copy (10-bit HEVC or AV1)
would need to be encoded from those masters.

## Behavior

- Videos pause off screen and when the tab is hidden; reduced motion starts the player
  paused. Primary Idle loads first; the large Hyperspace file loads only when chosen.
- The before/after refinement pair plays in sync and has a Replay together button.
- The A01/A02 compare works with drag and keyboard (range input).
- Zoomable images open in a lightbox; clicking the image shows it at full size around the
  click point.
