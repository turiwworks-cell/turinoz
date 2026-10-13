# TURINOZ — portfolio (turinoz.co)

A static site: plain HTML, CSS and JavaScript, no build step. It no longer needs
anything from the lab site; every file it uses is in this folder.

```
index.html              the portfolio (tiles + the study pages behind the study tiles)
_headers                headers and caching (Cloudflare Pages and Netlify both read it)
_redirects              the Scoreline demo's single-page-app rule
robots.txt
fonts/                  Archivo, Inter, Roboto, JetBrains Mono (licenses inside)
vendor/lottie.min.js    Lottie player for the Sitemate tile
vendor/hls.min.js       hls.js 1.5.20 (Apache-2.0): plays the smtp.dev films' HLS streams
rive/                   Rive files for the live tiles
  sphere.riv            Interactive Sphere tile
  eye_icon.riv          Eye tile and Planet tile (same files as lab.turinoz.co/eye-planet/)
  planet_icon.riv
  digitigrade.riv       Digitigrade tile (the same file the digitigrade/ page carries inline)
  vendor/               the Rive runtime (rive.js + .wasm), shared by all three tiles and by
                        digitigrade/; file-mode.js is only fetched when the page is opened by
                        double-click
curve-lab/              the Curve Lab website and what its tile shows
  index.html            the website, with the tool built in (works from any folder, even by double-click)
  app.html              the tool on its own; the website's "Open" buttons go here
  also-inside.html      one section of the website, playing by itself, for the Curve Lab tile
digitigrade/            Digitigrade's own page ("Open" on its tile); its fonts are inside,
                        the Rive runtime is ../rive/vendor/
spectra/
  tile.html             the Spectra game, laid out for its tile and played by Turinoz's cursor
                        (uses ../fonts/; nothing else)
media/                  client videos
  smtp-logo-loop.av1.mp4      AV1, 10-bit (most browsers pick this one, ~140 KB)
  smtp-logo-loop.mp4          H.264 fallback (Safari / older devices)
  smtp-logo-loop-poster.jpg
  smtp-film-preview.av1.mp4   the whole smtp.dev film, muted, 1280 × 720, 30 fps, AV1 10-bit (~1.3 MB)
  smtp-film-preview.mp4       the same in H.264 (~2.5 MB). Used by the case study's Beat by beat and the home tile
smtp/                   smtp.dev product film case study
  index.html            the page
  case-study.css        its styles (dark, in the film's own light)
  case-study.js         its behaviour: player, beats, frames, logo loop
  film-data.js          the colors of the three films, measured from their frames
  assets/               the full films, stills, styleframes, thumbnails; media-manifest.json lists them
sitemate/               Storm motion system page (the Sitemate case study)
  films/, sprites/      its videos and sketch sheets, loaded only when scrolled to
scoreline/              Scoreline case study (the live football app), and the app itself
  index.html            the page
  case-study.css        its styles (black, in the app's own night and spectra)
  case-study.js         its behaviour: the phone, decisions, curves, timing stage, touch, race,
                        Rive, process, terminal
  assets/               stills from the real app (posters, phone shots for small screens, the
                        desktop, the tile's poster) and share-cover.jpg
  app/                  the real Scoreline build (scoreline-brain, SCORELINE_BASE=/scoreline/app/):
                        the phone on the page and the grid tile both run this copy
```

## Deploying

Cloudflare Pages: Workers & Pages › Create › Pages › Upload assets (drag the folder, or a zip
of it). No build command. Direct Upload takes at most 1,000 files and 25 MiB per file. Netlify
works the same way (drag the folder onto https://app.netlify.com/drop): it reads `_headers`
and `_redirects` too.

## Previewing locally

Run a local server from this folder and open http://localhost:8000:

```
python -m http.server 8000
```

## The home page

- It opens straight on the work (the chat intro and the Commentary corner are gone).
- Two tiers, so a client gets the serious work at a glance and a designer can keep scrolling:
  - **Selected work**: the four main projects, big, two to a row, in this order: Sitemate (Storm),
    Curve Lab, smtp.dev product film, Scoreline (`.grid--main`).
  - **Experiments**: everything else, four to a row, square, with smaller captions
    (`.grid--more`): Interactive Sphere, Density curve, Digitigrade (two columns wide), smtp.dev
    logo loop, Planet, Eye, Spectra. The parked tiles are commented out at the end of this grid.
  - Below 1100 px the main tier is one to a row (16:9) and the experiments two to a row; on
    phones everything is one to a row.
- **Day / night**: the button next to the email in the header. With nothing chosen, the page
  follows the system; a choice is remembered on this device (`tz-theme` in localStorage). The
  canvas tiles, the Curve Lab and Spectra tiles and the Storm motion system all follow it.
- **Contact** on the right edge opens an email.

## The tiles that changed

- **smtp.dev product film** (main tier) shows the case study's Beat by beat section playing on
  its own (`smtp/beats-tile.html`, like the Curve Lab tile): the stage stays still where the first
  screen puts it, the notes scroll past, each move between beats follows Turinoz's own ease
  (`cubic-bezier(.71, 0, .14, 1)`, 2.2 s) on top of a slow speed, so it slows right down at each beat
  (0.1 s at 16 px/s) and never stops; the title screen holds 1 s; after beat 07 it fades and starts
  again. The film beside the notes plays each beat, as in the case study. The numbers are `T` near the
  top of that file. Drawn at one size and scaled to the frame; light or dark like the home page; it
  sleeps off screen, behind a study or in a hidden tab; with reduced motion the beats just take
  turns. Not interactive: the whole tile opens `smtp/`. The beat notes are a copy of the case
  study's, so a change there goes in both files.
- **smtp.dev logo loop** stays where it was (row 2, first column) and is a Shot again, not a
  link to the case study. Its caption links to the film.
- **Eye** moved down to row 4, in the place of "Agent, spin". **Numerals** and **Agent, spin**
  are parked in comments next to where they were, so either can come back as it was.
- **Planet** and **Eye** are two tiles, each icon alone and centred. Both run the real Rive icons
  and only react while the pointer is inside their own tile. Each chip shows its icon's
  state: Idle, Watching, Poked (eye), Holding, Dragging, Spinning, Thrown (planet).
  "Open" on both goes to https://lab.turinoz.co/eye-planet/.
  If the browser has no hardware WebGL2, the old JS drawing takes over, one icon per tile.
- Settings (icon size alone in a tile: `one`, two in a tile: `icon` and `at`) are in
  `RIVE_EP` near the end of the main script in `index.html`.

## Curve Lab tile

- Shows website design, not the tool: one section of the Curve Lab website ("Also inside"),
  in `curve-lab/also-inside.html`, playing by itself in an iframe. On the site, scroll moves
  its playhead; here time does: each of the eight features rests about a second, then the
  next curve is written over it in about two (`SEG` in that file), and after the eighth it
  starts over. Nothing in the tile reacts to the pointer.
- It is drawn at one size and scaled to the tile; tall frames (phones) get a two-column
  version. Light or dark follows this page. It sleeps while off screen, behind a study, or in
  a hidden tab.
- "Open website" and the title open `curve-lab/` in a new tab. The old Curve Lab study page
  is still in `index.html` (`#curve-lab`), just no longer linked from the grid.

## Digitigrade tile (replaces Spectra's place in row 3)

- The real `digitigrade.riv`, two columns wide. The .riv also draws readouts in its four
  corners; the tile is framed on the walker's band (legs, numerals, ruler), so those stay
  outside it. The band and sizes are `RIVE_DG` in the main script of `index.html`.
- As on its own page, the whole page is its touchpad: a mouse steers it from anywhere, a
  finger only inside the tile. With the pointer or focus on the tile, digits 0–9 send it to
  that numeral.
- Three controls in the tile: the status chip top-left ("Following you" / "Avoiding you"
  while you steer it, "On its own" after 2 s without a move), Sound top-centre, and
  Follow / Avoid at the bottom (Avoid is the file's own `countMeOut` switch).
- Sound starts on. Once the cursor has been off the page for 5 seconds it switches itself off
  (and stays off until switched back on). It is silent while the tile is off screen, behind a
  study, or in a hidden tab.
- "Open" goes to `digitigrade/`, in a new tab, like Eye and Planet.
- If the browser has no hardware WebGL2, the old JS leg drawing takes over.
- Spectra moved to the slot in row 4 where the old Digitigrade stand-in was, one column wide
  (see "Spectra tile" below).

## Spectra tile

- Shows the game itself, not a drawing of it: `spectra/tile.html`, the plain-canvas build of
  Spectra (the same code as the Telegram version) laid out again for the tile. Everything is
  drawn on a 320 × 400 board and scaled to the frame; square frames (phones) get side margins.
  Light or dark follows this page.
- Turinoz's cursor plays it: the tour cursor from the Curve Lab website, with his mark in the
  caption. It plays a run of three colours, plays with the cards it kept (fans them, brings one
  forward, flicks one away, copies a hex), reads its score, and starts again. Its lines are `SAY`
  near the top of that file. It never touches the visitor's clipboard.
- "Play yourself" (top right of the frame) hands the game over: the frame takes the pointer, the
  cursor says so and leaves. "Watch demo" gives it back; so does 35 s without a touch
  (`IDLE_SECONDS`). On a narrow tile the button reads "Play" / "Watch".
- One clock runs the game and the cursor, so it sleeps as a whole while off screen, behind a
  study, or in a hidden tab, and picks up where it was.
- With reduced motion turned on there is no tour: a finished round stands still, and
  "Play yourself" still works.
- "Open" goes into the Spectra study (`#spectra`), like the old tile did; the study's hero is
  still the old drawing (`R.spectra`).

## Sitemate tile (Storm Motion System)

- The first tile opens on Storm's motion system, already playing: six states feeding the icon,
  with the diagram in the middle of the tile and the icon on a plain square.
- Replay (top right, next to "Live in Sitemate") brings back the real Storm composer from
  Sitemate's product, centred in the tile, and it types its prompt. Pressing Build steps it back
  with the product's own ease (.45s cubic-bezier(.2,.8,.2,1)), the agent spins once, then the
  motion system comes back.
- The prompt it types is `PROMPT` in the "SITEMATE TILE" script at the end of
  `index.html`. The Lottie clips are the JSON block `#smClips` just above it.
- The motion system has a night version (the `--sy-*` colours on `.st`); the composer stays as
  it is in the product.
- "View project" and the tile title open `sitemate/`.

## smtp.dev case study (`smtp/`)

- Night and day: dark takes on the film's light; the light mode uses smtp.dev's own light
  palette. The sun/moon button in the header is the same choice as the home page (`tz-theme`);
  with nothing saved the page follows the system. Players, stills and the delivery terminal
  stay dark in both. Same fonts as the portfolio (Archivo, Inter, JetBrains Mono, from `../fonts/`).
- **Header and hero**: the header shows smtp.dev's static logo (from their brand sheet, the
  `smtpLogo` symbol at the top of `index.html`). The hero is centered: a capsule that links to
  smtp.dev (underlined name and an arrow, no glow), the title, one line about the film and the
  facts in mono. The hero light sits high above the frame, with the
  dust rising through it. "clarity." is smtp.dev's blue gradient at night and one solid blue
  by day (`--grad`).
- **The film**: it opens on its end card (`assets/film-end.webp`: mark, wordmark, tagline) and
  nothing plays until the page has loaded, the visitor has scrolled and the player has been fully
  on screen for about a second; then a muted preview loops until someone presses play, and the full film streams
  as HLS (`assets/hls/main/master.m3u8`, 540p to 4K at 60 fps, 6 s segments, H.264 8-bit; the
  audio is the master's own AAC, copied untouched) and the player picks the size for the
  screen and the connection (`capLevelToPlayerSize`, so fullscreen on a 4K screen gets 4K).
  Safari plays HLS itself; the other browsers load `vendor/hls.min.js` on the first press of
  play, so nothing streams before that. If the stream can't start, the plain 1080p file
  (`assets/main-film-v1.mp4`, the `data-mp4` attribute) plays instead. The short cut works
  the same way (`assets/hls/short/`). To re-make a stream: `ffmpeg` per size from the 4K
  master (a 5-step ladder, 12 / 6 / 3.5 / 1.8 / 1.0 Mbit/s, `-hls_segment_type fmp4`); if
  you replace the files, give the folder a new name because `_headers` caches it for a year. Sound starts off; the
  sound button turns it on (in the preview it starts the film from the top). To start with
  sound, set `START_WITH_SOUND` at the top of `case-study.js`. The seek bar is the film's own
  colors, split into its seven beats; hovering shows the frame (`assets/film-thumbs.webp`).
- **Beat by beat**: seven beats, each with a note. The film plays that beat on a loop beside
  it, with nothing drawn over the frame (the old pointing cursor and its comments are gone;
  `data-x`, `data-y` and `data-say` are left on each `<li>` but unused). A beat's times are
  `data-t0` and `data-t1` on its `<li>` in `index.html`.
  `data-loop` ends the loop earlier than the beat when the next scene bleeds in (beat 01
  loops to 1.45 s, before the light turns red).
  The seek bar's beat names come from the same list.
- **Styleframes**: six frames, numbered SF 01 to 06 in film order, each with one line. The rail
  is a loop (the script puts three copies in a track; the copies are hidden from screen readers)
  that drifts slowly by itself and stops while the pointer is on it. Drag or swipe it and it
  keeps a short, light glide and stops where it ends (no snap); only the card under the
  pointer shrinks a little while it is held; the arrows and arrow keys step one card.
- **One language**: the three films to scale, each bar drawn from its own colors with a
  playhead in real time; the short cut player; the logo loop: a 1440 px video
  of the LogoLoop master's centre (`assets/logo-loop-v1.av1.mp4`, with an H.264 copy; 86
  frames) that just loops (no scrubbing), with a frame counter, and a sprite sheet
  (`assets/logo-frames.webp`) that draws the five key-pose pictures under it (not clickable).
- Everything that moves sleeps off screen, in a hidden tab, while a film plays, and for visitors who prefer reduced motion (stills instead of loops).
- Removed in the redesign (no longer used by the page): the old hook/workflow/outro loops and
  their posters, the six story stills, the 16:9 logo loop copy and the old main posters
  (`film-poster.webp` too, replaced by the end card). Later
  also the Refinement comparison (with its two final-film stills, `workflow-final.webp` and
  `start-testing-final.webp`) and the closing quote under the credits.
- Previewing locally needs a server that answers byte ranges, or the films can't seek
  (Python's `http.server` doesn't; `npx serve` or Netlify do).
- After deploying, set `og:image` in `smtp/index.html` to the absolute URL of
  `smtp/assets/share-cover-v1.jpg`.


## Scoreline tile (row 4, two columns, in the Live score concept's place)

- The real app, not a picture of it: `scoreline/app/` runs its demo evening in an iframe. It loads when
  the tile nears the screen and is drawn at a fixed size, scaled to the frame: two panes (at least 540
  tall, so the live cards keep their minutes) when the frame is wide, the phone when it's narrow. On
  phones the frame is 4:5.
- It takes no pointer; the whole frame, the title and "View case study" open `scoreline/`.
- Through the app's own review bridge (same origin, `window.scorelineReviewHost`) a goal, a red card
  and another goal play once each while the tile is on screen (`MOMENTS` in the "Scoreline tile"
  script). The evening pauses off screen, behind a study, or in a hidden tab.
- The poster (`scoreline/assets/tile.webp`) shows until the app has painted.
- The Live score concept tile is parked in a comment next to it, and its study is still in the study
  layer (`#live-score`), no longer linked from the grid. Spectra's "Next" now goes to Scoreline.

## Scoreline case study (`scoreline/`)

- Black on purpose: the page takes on the app's night, its five spectrum gradients and its live green.
  Same fonts as the other studies (Archivo, Inter, JetBrains Mono from `../fonts/`), plus Hanken
  Grotesk (the app's face, from `app/fonts/`) where it shows the app's type. The page moves on the
  app's own curves.
- **The phone**: one live copy of the app (`app/`) the whole way down. It sits beside the sections
  marked `data-dock="phone"` (hero, roles, decisions, try it) and steps aside for the wide ones; the
  "Try the demo" pill brings it back from anywhere. Goal, Red card, Pause, Restart and Take control
  are the app's own review calls. The page moves the app between screens through its router without
  adding history, and Turinoz's cursor points at the detail each decision is about.
- **Decisions**: twelve, each with its goal. A decision's screen, where to look and the cursor's line
  are the `data-` attributes on its `<li>` (`data-route`, `data-point`, `data-scroll`, `data-say`).
  On small screens each one has a still and a "Show me in the demo" button instead.
- **Motion**: the ten curves with their four numbers, each drawn against the browser's `ease`; the
  fourteen section timings, played with their exact numbers on the stage; the touch tier (hover light,
  press, letter roll) at the app's values; a race against the default.
- **Rive**: the two real files (`app/rive/live-icon.riv`, `app/rive/moments.riv`) on the portfolio's
  shared runtime (`../rive/vendor/`): Live on/off and the count; GOAAAL in any team's colours, or RED
  CARD, with the phases on a timeline.
- **Build**: the honest status. The demo is complete; the real-API mode is wired and tested against a
  stand-in backend; no real provider, accounts or device testing yet.
- Needs a server (the app is ES modules); `python -m http.server` is enough for the page. The
  `[[redirects]]` rule in `netlify.toml` lets a reload on one of the app's screens find its page.
- Rebuilding the app: in scoreline-brain, `SCORELINE_BASE=/scoreline/app/ npm run build`, then copy
  `dist/` to `scoreline/app/` (without `_redirects`).
- After deploying, set `og:image` in `scoreline/index.html` to the absolute URL of
  `scoreline/assets/share-cover.jpg`.
