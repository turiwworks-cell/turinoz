# TURINOZ — portfolio (turinoz.co)

A static site: plain HTML, CSS and JavaScript, no build step. It no longer needs
anything from the lab site; every file it uses is in this folder.

```
index.html              the portfolio (tiles + the study pages behind the study tiles)
netlify.toml            headers and caching
robots.txt
fonts/                  Archivo, Inter, Roboto, JetBrains Mono (licenses inside)
vendor/lottie.min.js    Lottie player for the Sitemate tile
rive/                   Rive files for the live tiles
  sphere.riv            Interactive Sphere tile
  eye_icon.riv          Eye & Planet tile (same files as lab.turinoz.co/eye-planet/)
  planet_icon.riv
  vendor/               the Rive runtime (rive.js + .wasm), shared by both tiles;
                        file-mode.js is only fetched when the page is opened by double-click
media/                  client videos
  smtp-logo-loop.av1.mp4   AV1, 10-bit (most browsers pick this one, ~140 KB)
  smtp-logo-loop.mp4       H.264 fallback (Safari / older devices)
  smtp-logo-loop-poster.jpg
sitemate/               Storm motion system page (the Sitemate case study)
  films/, sprites/      its videos and sketch sheets, loaded only when scrolled to
```

## Deploying to Netlify

Drag this whole folder onto https://app.netlify.com/drop, or connect it as a repo
with no build command and the root as the publish directory (set in `netlify.toml`).

## Previewing locally

Run a local server from this folder and open http://localhost:8000:

```
python -m http.server 8000
```

## The tiles that changed

- **smtp.dev logo loop** (replaces "Agent, appear"). Muted, loops, no sound track in
  the file. Nothing downloads until the tile is near the screen; it plays only while
  visible and pauses behind a study or a hidden tab. With reduced motion turned on it
  shows the poster and plays on hover. The original was 3200 × 2400 HEVC 10-bit, which
  Chrome and Firefox can't play everywhere; these are 1080 × 1080 centre crops.
- **Eye & Planet** now runs the real Rive icons. They only react while the pointer is
  inside the tile; outside it they're left alone and drift into their own idle motion.
  The chip in the top-left shows the state for both: Idle, Watching, Poked, Holding,
  Dragging, Spinning, Thrown. "Open" goes to https://lab.turinoz.co/eye-planet/.
  If the browser has no hardware WebGL2, the old JS drawing takes over.
- Settings for the Eye & Planet tile (icon size, positions) are in `RIVE_EP` near the
  end of the main script in `index.html`.

## Sitemate tile

- The first tile is the real Storm composer from Sitemate's product. Pressing Build
  steps it back with the product's own ease (.45s cubic-bezier(.2,.8,.2,1)), the agent
  spins once, then the tile opens into the motion system (six states feeding the icon).
- The prompt it types is `PROMPT` in the "SITEMATE TILE" script at the end of
  `index.html`. The Lottie clips are the JSON block `#smClips` just above it.
- "View project", the tile title and "See the full system" all open `sitemate/`.
