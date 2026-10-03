import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useId,
} from "react";

/* ── motion preference ───────────────────────────────────── */

const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const R = 50;

/* ── eyes ───────────────────────────────────────────────── */

const STYLES = {
  Slant: { w: 9, h: 15, r: 4.5 },
  Dots: { w: 11, h: 11, r: 5.5 },
  Squares: { w: 12, h: 12, r: 3.5 },
};

const GAP = 0.19;
const TILT = 64;

const clamp = (v, a, b) =>
  Math.min(b, Math.max(a, v));

/* ── body shapes ────────────────────────────────────────── */

const SHAPES = {
  Ball: "M50 0 A50 50 0 1 1 49.99 0 Z",

  Circle:
    "M50 7 A43 43 0 1 1 49.99 7 Z",

  Cube:
    "M30 6 H70 A24 24 0 0 1 94 30 V70 A24 24 0 0 1 70 94 H30 A24 24 0 0 1 6 70 V30 A24 24 0 0 1 30 6 Z",

  Pill:
    "M34 17 H66 A33 33 0 0 1 66 83 H34 A33 33 0 0 1 34 17 Z",

  Hexagon:
    "M59.53 8.50 L81.18 21.00 Q90.70 26.50 90.70 37.50 L90.70 62.50 Q90.70 73.50 81.18 79.00 L59.53 91.50 Q50.00 97.00 40.47 91.50 L18.82 79.00 Q9.30 73.50 9.30 62.50 L9.30 37.50 Q9.30 26.50 18.82 21.00 L40.47 8.50 Q50.00 3.00 59.53 8.50 Z",

  "Hex flat":
    "M91.50 59.53 L79.00 81.18 Q73.50 90.70 62.50 90.70 L37.50 90.70 Q26.50 90.70 21.00 81.18 L8.50 59.53 Q3.00 50.00 8.50 40.47 L21.00 18.82 Q26.50 9.30 37.50 9.30 L62.50 9.30 Q73.50 9.30 79.00 18.82 L91.50 40.47 Q97.00 50.00 91.50 59.53 Z",
};

/* ── shape measuring / morphing ─────────────────────────── */

const RAYS = 120;
const radii = new Map();

function measure(shape) {
  const hit = radii.get(shape);

  if (hit) return hit;

  const ns = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(ns, "svg");

  svg.setAttribute("viewBox", "0 0 100 100");

  svg.style.cssText =
    "position:absolute;width:0;height:0;overflow:hidden";

  const path = document.createElementNS(ns, "path");

  path.setAttribute(
    "d",
    SHAPES[shape] ?? SHAPES.Ball
  );

  svg.appendChild(path);
  document.body.appendChild(svg);

  const pt = svg.createSVGPoint();
  const out = [];

  for (let i = 0; i < RAYS; i++) {
    const a =
      (i / RAYS) * Math.PI * 2 -
      Math.PI / 2;

    let lo = 0;
    let hi = 60;

    for (let k = 0; k < 16; k++) {
      const mid = (lo + hi) / 2;

      pt.x = 50 + Math.cos(a) * mid;
      pt.y = 50 + Math.sin(a) * mid;

      if (path.isPointInFill(pt)) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    out.push(lo);
  }

  svg.remove();

  radii.set(shape, out);

  return out;
}

function outline(r) {
  let d = "";

  r.forEach((v, i) => {
    const a =
      (i / r.length) * Math.PI * 2 -
      Math.PI / 2;

    d += `${i ? "L" : "M"}${(
      50 + Math.cos(a) * v
    ).toFixed(2)} ${(
      50 + Math.sin(a) * v
    ).toFixed(2)}`;
  });

  return d + "Z";
}

/* ── WATCHER ─────────────────────────────────────────────── */

export function Watcher({
  follow = 60,
  bounce = 30,
  size = 100,
  shape = "Cube",
  eyes: look = "Slant",
  eyeScale = 1,
  eyeWidth = 1,
  eyeRound = 1,
  eyeHeight = 1,
  idle = false,
} = {}) {
  const still = stillness();

  const box = useRef(null);

  const eyes = useRef([]);

  const knobs = useRef({
    follow,
    bounce,
    eyeScale,
  });

  knobs.current = {
    follow,
    bounce,
    eyeScale,
  };

  const base =
    STYLES[look] ?? STYLES.Slant;

  const eye = {
    w: base.w * eyeScale * eyeWidth,
    h: base.h * eyeScale * eyeHeight,
    r:
      base.r *
      eyeScale *
      eyeWidth *
      eyeRound,
  };

  const eyeNow = useRef(eye);

  eyeNow.current = eye;

  /* ── cursor / eye animation ───────────────────────────── */

  useEffect(() => {
    const el = box.current;

    if (!el) return;

    const t = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
    };

    let raf = 0;
    let prev = 0;
    let blink = 0;

    let nextBlink =
      performance.now() + 2200;

    const draw = (now) => {
      /* blink */

      let lid = 1;

      if (now > nextBlink) {
        blink = now;

        nextBlink =
          now +
          (idle
            ? 2000
            : 2600 +
              Math.random() * 3200);
      }

      const since = now - blink;

      if (since < 160) {
        lid =
          1 -
          0.9 *
            Math.sin(
              (since / 160) * Math.PI
            );
      }

      /* turn */

      const as = (v) =>
        Math.asin(
          clamp(v, -0.92, 0.92)
        );

      const yaw = as(t.x);
      const pitch = -as(t.y);

      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);

      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);

      const tilt =
        TILT * t.x * t.y;

      const g0 =
        GAP *
        Math.max(
          1,
          knobs.current.eyeScale * 0.8
        );

      [-g0, g0].forEach((x0, i) => {
        const g = eyes.current[i];

        if (!g) return;

        const z0 =
          Math.sqrt(
            1 - x0 * x0
          );

        const x1 =
          x0 * cy +
          z0 * sy;

        const z1 =
          -x0 * sy +
          z0 * cy;

        const y2 =
          -z1 * sp;

        const z2 =
          z1 * cp;

        const near =
          clamp(z2, 0, 1);

        const k =
          0.45 +
          0.55 * near;

        const sx =
          k *
          (0.7 + 0.3 * near);

        const e0 =
          eyeNow.current;

        const w =
          e0.w * sx;

        const h =
          Math.max(
            0.6,
            e0.h * k * lid
          );

        const rect =
          g.firstElementChild;

        if (rect) {
          rect.setAttribute(
            "x",
            (-w / 2).toFixed(2)
          );

          rect.setAttribute(
            "y",
            (-h / 2).toFixed(2)
          );

          rect.setAttribute(
            "width",
            w.toFixed(2)
          );

          rect.setAttribute(
            "height",
            h.toFixed(2)
          );

          rect.setAttribute(
            "rx",
            Math.min(
              e0.r,
              w / 2,
              h / 2
            ).toFixed(2)
          );
        }

        g.setAttribute(
          "transform",
          `translate(${(
            50 + x1 * R
          ).toFixed(2)} ${(
            50 + y2 * R
          ).toFixed(2)}) rotate(${tilt.toFixed(
            2
          )})`
        );

        g.style.opacity =
          z2 < 0.05 ? "0" : "1";
      });
    };

    const tick = (now) => {
      const dt = prev
        ? Math.min(
            2.5,
            (now - prev) / 16.67
          )
        : 1;

      prev = now;

      if (still) {
        t.x = t.tx;
        t.y = t.ty;
      } else {
        const k = 0.06;

        const d =
          0.34 -
          (clamp(
            knobs.current.bounce,
            0,
            100
          ) /
            100) *
            0.22;

        t.vx +=
          ((t.tx - t.x) * k -
            t.vx * d) *
          dt;

        t.vy +=
          ((t.ty - t.y) * k -
            t.vy * d) *
          dt;

        t.x += t.vx * dt;
        t.y += t.vy * dt;
      }

      draw(now);

      raf =
        requestAnimationFrame(tick);
    };

    raf =
      requestAnimationFrame(tick);

    /* ── pointer following ──────────────────────────────── */

    const frame =
      el.closest(
        ".bench-card, .dtl-block, .board, .sf-thumb"
      ) ?? el;

    const aim = (e) => {
      const f =
        frame.getBoundingClientRect();

      if (
        e.clientX < f.left ||
        e.clientX > f.right ||
        e.clientY < f.top ||
        e.clientY > f.bottom
      ) {
        t.tx = 0;
        t.ty = 0;
        return;
      }

      const r =
        el.getBoundingClientRect();

      const dx =
        e.clientX -
        (r.left + r.width / 2);

      const dy =
        e.clientY -
        (r.top + r.height / 2);

      const d =
        Math.hypot(dx, dy) || 1;

      const reach =
        Math.max(
          60,
          Math.min(
            f.width,
            f.height
          ) * 0.28
        );

      const far =
        Math.min(
          0.85,
          Math.tanh(d / reach) *
            (clamp(
              knobs.current.follow,
              0,
              100
            ) /
              100) *
            1.5
        );

      t.tx =
        (dx / d) * far;

      t.ty =
        (dy / d) * far;
    };

    const rest = () => {
      t.tx = 0;
      t.ty = 0;
    };

    /* ── idle behavior ─────────────────────────────────── */

    if (idle) {
      let glance = 0;

      const lookAround = () => {
        const a =
          Math.random() *
          Math.PI *
          2;

        const far =
          0.45 +
          Math.random() * 0.25;

        t.tx =
          Math.cos(a) * far;

        t.ty =
          Math.sin(a) * far;

        glance =
          window.setTimeout(
            () => {
              rest();

              glance =
                window.setTimeout(
                  lookAround,
                  5000 - 900
                );
            },
            900
          );
      };

      glance =
        window.setTimeout(
          lookAround,
          5000
        );

      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(glance);
      };
    }

    window.addEventListener(
      "pointermove",
      aim,
      { passive: true }
    );

    document.documentElement.addEventListener(
      "pointerleave",
      rest
    );

    return () => {
      cancelAnimationFrame(raf);

      window.removeEventListener(
        "pointermove",
        aim
      );

      document.documentElement.removeEventListener(
        "pointerleave",
        rest
      );
    };
  }, [still, idle]);

  /* ── body / shape ────────────────────────────────────── */

  const s = clamp(
    size,
    16,
    180
  );

  const body =
    SHAPES[shape] ??
    SHAPES.Ball;

  const clip =
    `eyt-clip-${useId().replace(
      /:/g,
      ""
    )}`;

  const bodyEl =
    useRef(null);

  const clipEl =
    useRef(null);

  const shown =
    useRef(null);

  const from =
    useRef(shape);

  /* ── shape morph ─────────────────────────────────────── */

  useLayoutEffect(() => {
    if (from.current === shape) {
      return;
    }

    const start =
      shown.current ??
      measure(from.current);

    const end =
      measure(shape);

    from.current =
      shape;

    if (still) {
      shown.current =
        end;

      const d =
        outline(end);

      bodyEl.current?.setAttribute(
        "d",
        d
      );

      clipEl.current?.setAttribute(
        "d",
        d
      );

      return;
    }

    const t0 =
      performance.now();

    const ms = 520;

    let raf = 0;

    const step = (now) => {
      const u =
        Math.min(
          1,
          (now - t0) / ms
        );

      const c = 1.3;

      const e =
        1 +
        (c + 1) *
          Math.pow(
            u - 1,
            3
          ) +
        c *
          Math.pow(
            u - 1,
            2
          );

      const r =
        start.map(
          (a, i) =>
            a +
            (end[i] - a) * e
        );

      shown.current =
        r;

      const d =
        outline(r);

      bodyEl.current?.setAttribute(
        "d",
        d
      );

      clipEl.current?.setAttribute(
        "d",
        d
      );

      if (u < 1) {
        raf =
          requestAnimationFrame(
            step
          );
      }
    };

    raf =
      requestAnimationFrame(step);

    return () =>
      cancelAnimationFrame(raf);
  }, [shape, still]);

  /* ── render ───────────────────────────────────────────── */

  return (
    <div
      className="eyt"
      ref={box}
      style={{
        "--eyt-size": `${s}px`,
      }}
      role="img"
      aria-label="A ball with two eyes that follows the cursor"
    >
      <svg
        className="eyt-ball"
        viewBox="0 0 100 100"
      >
        <defs>
          <clipPath id={clip}>
            <path
              ref={clipEl}
              d={
                shown.current
                  ? outline(
                      shown.current
                    )
                  : body
              }
            />
          </clipPath>
        </defs>

        <path
          ref={bodyEl}
          className="eyt-body"
          d={
            shown.current
              ? outline(
                  shown.current
                )
              : body
          }
        />

        <g
          clipPath={`url(#${clip})`}
        >
          {[0, 1].map((i) => (
            <g
              key={i}
              ref={(node) => {
                eyes.current[i] =
                  node;
              }}
            >
              <rect
                className="eyt-eye"
                x={-eye.w / 2}
                y={-eye.h / 2}
                width={eye.w}
                height={eye.h}
                rx={eye.r}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default Watcher;
