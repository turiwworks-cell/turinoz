/*! Curve Lab embed · https://turinoz.co/curve-lab/
 * One script tag puts Curve Lab's Curve panel in any page, and the page reads the curve live.
 *
 *   const lab = CurveLab.mount("#panel", { height: 640 });
 *   lab.ease(t)        // eased value for t in 0..1, as the curve is now
 *   lab.duration       // ms, from the panel's frames and fps
 *   lab.css()          // cubic-bezier(...) for one segment, else linear(...)
 *   lab.onChange(fn)   // runs on every change, live while dragging
 */
(() => {
  const HTML = __CURVE_LAB_HTML__;
  const BOOT = "<script>window.__clEmbed=1<\/script>";

  function mount(target, opts = {}) {
    const host = typeof target === "string" ? document.querySelector(target) : target;
    if (!host) throw new Error("CurveLab.mount: no element " + target);
    const frame = document.createElement("iframe");
    frame.title = "Curve Lab";
    frame.style.cssText =
      "display:block;width:100%;border:0;background:#0e0e10;" +
      "height:" + (opts.height || 640) + "px;border-radius:" + (opts.radius == null ? 12 : opts.radius) + "px";
    frame.srcdoc = HTML.replace(/<head>/i, "<head>" + BOOT);
    host.append(frame);

    let state = { samples: [0, 1], duration: 1000, frames: 60, fps: 60, mode: "bezier", bezier: [0, 0, 1, 1] };
    const subs = new Set();
    addEventListener("message", (e) => {
      if (e.source !== frame.contentWindow || !e.data || e.data.curveLab !== "change") return;
      state = e.data;
      subs.forEach((fn) => {
        try {
          fn(api);
        } catch (err) {
          console.error(err);
        }
      });
    });

    const api = {
      el: frame,
      get state() {
        return state;
      },
      get duration() {
        return state.duration;
      },
      get frames() {
        return state.frames;
      },
      get fps() {
        return state.fps;
      },
      ease(t) {
        const s = state.samples,
          x = Math.min(1, Math.max(0, +t || 0)) * (s.length - 1),
          i = Math.min(s.length - 2, Math.floor(x));
        return s[i] + (s[i + 1] - s[i]) * (x - i);
      },
      css(points = 40) {
        if (state.bezier) return "cubic-bezier(" + state.bezier.map((n) => +n.toFixed(4)).join(", ") + ")";
        const out = [];
        for (let i = 0; i <= points; i++) out.push(+api.ease(i / points).toFixed(4));
        return "linear(" + out.join(", ") + ")";
      },
      onChange(fn) {
        subs.add(fn);
        return () => subs.delete(fn);
      },
    };
    return api;
  }

  window.CurveLab = { mount, version: "__VERSION__" };
})();
