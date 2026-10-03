import React, { useEffect, useRef, useId } from "react";

const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

export default function Watcher({
  size = 180,
  follow = 70,
  bounce = 30,
}) {
  const boxRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const clipId = useId();

  useEffect(() => {
    const box = boxRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!box || !leftEye || !rightEye) return;

    let animationFrame = 0;

    const state = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      vx: 0,
      vy: 0,
      last: performance.now(),
    };

    const handlePointerMove = (event) => {
      const rect = box.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;

      const distance = Math.hypot(dx, dy) || 1;

      const maxDistance = Math.max(
        window.innerWidth,
        window.innerHeight
      );

      const amount = clamp(
        distance / maxDistance,
        0,
        1
      );

      const strength = clamp(follow / 100, 0, 1);

      state.targetX =
        (dx / distance) *
        amount *
        strength;

      state.targetY =
        (dy / distance) *
        amount *
        strength;
    };

    const handlePointerLeave = () => {
      state.targetX = 0;
      state.targetY = 0;
    };

    const animate = (now) => {
      const dt = Math.min(
        2,
        (now - state.last) / 16.67
      );

      state.last = now;

      const stiffness = 0.08;
      const damping =
        0.25 -
        (clamp(bounce, 0, 100) / 100) * 0.12;

      state.vx +=
        (state.targetX - state.x) *
          stiffness *
          dt -
        state.vx * damping * dt;

      state.vy +=
        (state.targetY - state.y) *
          stiffness *
          dt -
        state.vy * damping * dt;

      state.x += state.vx * dt;
      state.y += state.vy * dt;

      const eyeOffsetX = state.x * 18;
      const eyeOffsetY = state.y * 13;

      const tilt = state.x * state.y * 35;

      leftEye.setAttribute(
        "transform",
        `translate(${37 + eyeOffsetX} ${
          50 + eyeOffsetY
        }) rotate(${tilt})`
      );

      rightEye.setAttribute(
        "transform",
        `translate(${63 + eyeOffsetX} ${
          50 + eyeOffsetY
        }) rotate(${tilt})`
      );

      animationFrame =
        requestAnimationFrame(animate);
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );

      cancelAnimationFrame(animationFrame);
    };
  }, [follow, bounce]);

  return (
    <div
      ref={boxRef}
      className="maya-watcher"
      style={{
        width: size,
        height: size,
      }}
      aria-label="Maya"
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
      >
        <defs>
          <radialGradient
            id={`${clipId}-body`}
            cx="35%"
            cy="30%"
            r="70%"
          >
            <stop
              offset="0%"
              stopColor="#1d3154"
            />
            <stop
              offset="100%"
              stopColor="#08101f"
            />
          </radialGradient>
        </defs>

        <circle
          cx="50"
          cy="50"
          r="47"
          fill={`url(#${clipId}-body)`}
        />

        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="#263c61"
          strokeWidth="1"
        />

        <g ref={leftEyeRef}>
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
            cy="-2"
            r="2.4"
            fill="#05070d"
          />
        </g>

        <g ref={rightEyeRef}>
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
            cy="-2"
            r="2.4"
            fill="#05070d"
          />
        </g>
      </svg>
    </div>
  );
}
