# Quiet Between Stars

A case study for the existing Turinoz portfolio. Plain HTML, CSS and JavaScript;
no build step or external service is needed. Open `index.html` directly, or serve
the portfolio directory and visit `/quiet-between-stars/`.

The page uses the portfolio's Archivo, Inter and JetBrains Mono fonts and its
`tz-theme` day/night preference. The artwork stays dark in both themes.

## What runs

- The real delivered renders: Primary Idle (180 s), Entry (5 s), Hyperspace
  (170 s) and Return (5 s). Entry continues into Hyperspace; Return into Idle.
- A keyboard-accessible seek bar, play/pause and fullscreen control.
- A01/A02 styleframe comparison, with B01/C01 available at full size.
- Four views into the actual After Effects project and controller guide.
- The same 25 seconds from the first and refined idle deliveries.
- Four aspect-ratio stills from the delivered v01 idle exports.
- The architecture page from the delivered guide, enlarged in a modal.

The browser does not run the After Effects project. All artwork is actual
rendered media. System views show screenshots and documentation.

Motion pauses off screen and when the browser tab is hidden. Reduced-motion
preferences start the page paused. The global motion button can resume it.
Primary Idle loads first; the larger Hyperspace file loads when selected.

## Files

`case-study.css` and `case-study.js` belong to this page. `tile.html` is the
passive Selected Work preview. Its 22-second edit is labelled Selected moments;
it retains both full five-second transitions and uses excerpts of the loops.

`assets/media-manifest.json` records source-relative paths, native metadata and
web derivative settings. Videos are H.264 at 24 fps with no audio; all are under
Cloudflare's 25 MiB per-file limit. The original installation masters remain
outside this website package.

The home page's fifth Selected Work entry points here. Existing projects and
their assets are retained. The next-project link returns to Storm.

## Verification

Checked in the browser at the normal desktop size and at 390 × 844: state
playback and automatic handovers, comparison keyboard input, system views,
image modal, portrait format, light/dark modes and horizontal overflow. The
browser reported no warnings or errors on this case-study page. Static checks
cover references, anchors, unique IDs, script selectors and JavaScript syntax.

Performance times in the copy are attributed production observations, not a
controlled comparison. The before/after change is subtle. Format stills are
identified as v01; they do not claim that all v02 formats were re-rendered.
