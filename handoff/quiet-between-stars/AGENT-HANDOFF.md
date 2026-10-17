# Quiet Between Stars — agent handoff

This branch adds a complete Selected Work case study to the existing Turinoz
portfolio. It includes the page, actual rendered media, home-page integration,
an overlay ZIP, the English case-study copy, and the full Persian research report.

## Start here

1. Read `CASE-STUDY.md` for the editorial narrative.
2. Read `Quiet-Between-Stars-Research-Report.md` for evidence, source links,
   project history and the limits of what was inspected.
3. Open `turinoz-portfolio/quiet-between-stars/index.html` from the repository root,
   or serve the website directory as shown below.

The implemented page is the source of truth for layout, interactions and media.
The Markdown copy is a convenient editorial companion. The research report
contains internal production context; it is not the copy for the public page.

## Branch and integration

- Branch: `quiet-between-stars-handoff`.
- Original design/research base: `4e9fce0504e67e93337e5f82343b5c8996b2af0e`.
- Integration base: `cef58d27d675c8767f3eaf307054af2b4faae120`.
- The later main-branch header, favicon and existing-project edits are preserved.
- Added page: `turinoz-portfolio/quiet-between-stars/`.
- Existing files changed: `turinoz-portfolio/index.html` and
  `turinoz-portfolio/README.md`.
- Handoff documents and ZIP live outside the deployed website directory.

Review this branch and its diff against `main` before merging. To bring it into
another checkout, fetch `quiet-between-stars-handoff` from this repository and
inspect its changes. No merge or production deployment was performed as part
of this handoff.

The ZIP is an overlay for the **website directory**, `turinoz-portfolio/`, not
the repository root. It contains `index.html`, `README.md` and
`quiet-between-stars/**`. Existing fonts and the other projects come from the
existing site. If the home page has changed after the integration base, apply
`site-integration.patch` selectively instead of replacing the whole home page.
It contains only the two existing-file edits; the new page/assets are on this branch.

## Run locally

From the repository root:

```sh
python -m http.server 8000 --directory turinoz-portfolio
```

Visit `http://localhost:8000/quiet-between-stars/` for the case study and
`http://localhost:8000/` for the fifth Selected Work entry. There is no build
step, package installation or external runtime service for this page.

## What is implemented

- Existing Archivo, Inter and JetBrains Mono fonts; shared `tz-theme` preference.
- Responsive light/dark page with an English first-person narrative matching
  the existing Selected Work approach.
- Real Idle, Entry, Hyperspace and Return renders. Entry hands over to
  Hyperspace; Return hands over to Idle.
- A01/A02 comparison, alternate styleframes, system screenshots, seed logic,
  before/after motion comparison, four output formats and delivery/credits.
- Seek, play/pause, fullscreen, image enlargement, keyboard comparison input,
  reduced-motion handling and off-screen playback suspension.
- A passive home-page tile using a labelled 22-second selected-moments edit.

`assets/media-manifest.json` records relative source paths and web encoding
settings. The original AE project and installation masters are not required
to run this page. The browser presents rendered work and documentation.

## Keep the evidence precise

- The four main web renders come from the delivered v02 masters; the format
  stills are explicitly identified as v01.
- The idle before/after change is subtle and shown at normal speed.
- Production render times were reported on different machines. They are
  observations, not a controlled benchmark or guaranteed performance.
- Petie built the later web control layer himself. Do not attribute that app
  to Turinoz.
- The report distinguishes source text, file inventory, metadata, visual
  inspection and inference. It does not claim every binary or all 59 videos
  were fully read/watched.
- Do not turn draft testimonial text from local notes into a client quote.
  The page's short guide quote is supported by the email conversation.
- There is no verified claim of a completed physical installation, final
  payment, or re-rendering every v02 format. Financial detail belongs to the
  research context, not the case-study page.

See `VALIDATION.md` and `manifest.json` for checks and file hashes.
