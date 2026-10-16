# Validation

The case study and its prepared media passed the following checks during this
delivery. The home-page integration was subsequently reconciled with main at
`cef58d27d675c8767f3eaf307054af2b4faae120`; static checks were rerun after that change.

## Page and assets

- Local references, internal anchors, unique IDs, one H1 per HTML page,
  JavaScript selectors and JavaScript syntax: passed.
- Media manifest references and existence of all 25 asset files: passed.
- All case-study assets are below 25 MiB each. The handoff ZIP lives outside
  the website directory and is larger than this per-site-file limit.
- All seven derived H.264 MP4 videos were fully decoded and their fast-start
  placement checked.
- ZIP member integrity/CRC checked after packaging.

## Browser checks

At desktop size and 390 × 844:

- Idle, Entry, Hyperspace and Return playback.
- Automatic Entry → Hyperspace and Return → Idle handovers.
- Styleframe comparison, including keyboard input.
- System tabs and image enlargement.
- Portrait format sizing, light/dark modes and horizontal overflow.
- No browser console warnings or errors reported for the case-study page.

The browser checks cover web derivatives and page behaviour. They are not an
execution test of the customer's After Effects project, an installation test,
or an independent render-performance benchmark.

The README describes how to preview the page locally. `manifest.json` records
byte sizes and SHA-256 hashes of the uploaded deliverables and site files.
