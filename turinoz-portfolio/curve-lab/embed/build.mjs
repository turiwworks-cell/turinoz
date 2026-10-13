// Builds curve-lab.js (the CDN file) from ../app.html: node build.mjs <out.js> <version>
import { readFileSync, writeFileSync } from "node:fs";
const here = new URL(".", import.meta.url);
const [out = "curve-lab.js", version = "dev"] = process.argv.slice(2);
const html = readFileSync(new URL("../app.html", here), "utf8");
// "<" before "!--", "script" or "/script" is escaped, so the bundle also works pasted inline in a script tag
const lit = JSON.stringify(html).replace(/<(?=!--|\/?script)/gi, "\\x3C");
const js = readFileSync(new URL("loader.js", here), "utf8").replace("__CURVE_LAB_HTML__", () => lit).replace("__VERSION__", version);
writeFileSync(out, js);
console.log(out, (js.length / 1024).toFixed(0) + " KB");
