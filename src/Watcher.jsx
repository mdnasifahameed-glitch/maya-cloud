import React, { useEffect, useRef } from "react";

export default function Watcher({
  size = 300,
  follow = 70,
  bounce = 30,
}) {
  const boxRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const left = leftRef.current;
    const right = rightRef.current;

    if (!box || !left || !right) return;

    let frame;
    let blinkTimer;

    const state = {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      vx: 0,
      vy: 0,
    };

    const move = (e) => {
      const r = box.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.hypot(dx, dy) || 1;

      const strength = Math.min(follow / 100, 1);

      state.tx = Math.max(-1, Math.min(1, dx / distance)) * strength;
      state.ty = Math.max(-1, Math.min(1, dy / distance)) * strength;
    };

    const animate = () => {
      state.vx += (state.tx - state.x) * 0.08;
      state.vy += (state.ty - state.y) * 0.08;

      state.vx *= 0.78 - bounce * 0.001;
      state.vy *= 0.78 - bounce * 0.001;

      state.x += state.vx;
      state.y += state.vy;

      const ox = state.x * 15;
      const oy = state.y * 11;

      left.setAttribute(
        "transform",
        `translate(${37 + ox} ${50 + oy})`
      );

      right.setAttribute(
        "transform",
        `translate(${63 + ox} ${50 + oy})`
      );

      frame = requestAnimationFrame(animate);
    };

    const blink = () => {
      left.style.transformOrigin = "center";
      right.style.transformOrigin = "center";

      left.animate(
        [
          { transform: "scaleY(1)" },
          { transform: "scaleY(0.08)" },
          { transform: "scaleY(1)" },
        ],
        {
          duration: 180,
          easing: "ease-in-out",
        }
      );

      right.animate(
        [
          { transform: "scaleY(1)" },
          { transform: "scaleY(0.08)" },
          { transform: "scaleY(1)" },
        ],
        {
          duration: 180,
          easing: "ease-in-out",
        }
      );

      blinkTimer = setTimeout(blink, 3500 + Math.random() * 3000);
    };

    window.addEventListener("pointermove", move, { passive: true });

    frame = requestAnimationFrame(animate);
    blinkTimer = setTimeout(blink, 2500);

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
      clearTimeout(blinkTimer);
    };
  }, [follow, bounce]);

  return (
    <div
      ref={boxRef}
      className="maya-watcher"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="mayaBodyGradient"
            cx="35%"
            cy="30%"
            r="70%"
          >
            <stop offset="0%" stopColor="#1b3154" />
            <stop offset="100%" stopColor="#050b16" />
          </radialGradient>
        </defs>

        <circle
          cx="50"
          cy="50"
          r="47"
          fill="url(#mayaBodyGradient)"
        />

        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="#29466f"
          strokeWidth="1"
        />

        <g ref={leftRef}>
          <rect
            x="-5"
            y="-9"
            width="10"
            height="18"
            rx="5"
            fill="#168cff"
          />
          <circle
            cx="0"
            cy="0"
            r="2.5"
            fill="#05070d"
          />
        </g>

        <g ref={rightRef}>
          <rect
            x="-5"
            y="-9"
            width="10"
            height="18"
            rx="5"
            fill="#168cff"
          />
          <circle
            cx="0"
            cy="0"
            r="2.5"
            fill="#05070d"
          />
        </g>
      </svg>
    </div>
  );
}
