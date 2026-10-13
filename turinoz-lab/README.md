# lab.turinoz.co

The experiments from turinoz.co, each on its own page. There is no index page: the tiles on
turinoz.co link straight to a piece, and lab.turinoz.co itself redirects to the Experiments
on turinoz.co (`_redirects`). Anything else that doesn't exist gets `404.html`.

```
digitigrade/      Digitigrade (the .riv is inline in the page; fonts inside)
eye-planet/       Eye & Planet (its own .riv files, fonts and Rive runtime inside; icon design by Lucas Fields)
rive/vendor/      the Rive runtime digitigrade/ uses
_redirects        / → turinoz.co/#experiments
_headers          security headers and caching
404.html          the not-found page
wrangler.jsonc    Cloudflare Worker "turinoz-lab"
```

Every page has a day / night switch. It remembers the choice on this site (`tz-theme`), and a
`?theme=light` or `?theme=dark` from a turinoz.co tile carries the choice over from there.
The piece itself always sits on its dark artboard colour.

## Deploy

A second Worker, next to "turinoz", in the same Cloudflare account:

1. Workers & Pages → Create → Import a repository → this repo.
2. Project name `turinoz-lab`, root directory `turinoz-lab`, no build command.
3. Once it builds, Settings → Domains & Routes → add the custom domain `lab.turinoz.co`.
   That needs turinoz.co's DNS on Cloudflare (see the turinoz.co move).

Not here yet: the Interactive Sphere page (lab.turinoz.co/sphere/), which the Sphere tile on
turinoz.co opens. Add it before lab.turinoz.co points at this Worker.
