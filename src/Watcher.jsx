import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useId,
} from "react";

const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const R = 50;

const STYLES = {
  Slant: { w: 9, h: 15, r: 4.5 },
  Dots: { w: 11, h: 11, r: 5.5 },
  Squares: { w: 12, h: 12, r: 3.5 },
};

const GAP = 0.19;
const TILT = 64;

const clamp = (v, a, b) =>
  Math.min(b, Math.max(a, v));
