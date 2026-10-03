import React, { useEffect, useRef, useState } from "react";

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

function MayaOrb() {
  const orbRef = useRef(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const orb = orbRef.current;
      if (!orb) return;

      const rect = orb.getBoundingClientRect();

      const dx =
        (event.clientX - (rect.left + rect.width / 2)) /
        (rect.width / 2);

      const dy =
        (event.clientY - (rect.top + rect.height / 2)) /
        (rect.height / 2);

      setLook({
        x: clamp(dx, -1, 1),
        y: clamp(dy, -1, 1),
      });
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () =>
      window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    const blink = () => {
      setBlinking(true);

      setTimeout(() => {
        setBlinking(false);
      }, 130);
    };

    const interval = setInterval(
      blink,
      3500 + Math.random() * 2500
    );

    return () => clearInterval(interval);
  }, []);

  const pupilX = look.x * 13;
  const pupilY = look.y * 9;

  return (
    <div className="maya-stage">
      <div
        ref={orbRef}
        className="maya-orb"
        aria-label="Maya AI assistant"
      >
        <div className="orb-glow" />

        <div className="eyes">
          {[0, 1].map((eye) => (
            <div
              className={`eye ${blinking ? "blink" : ""}`}
              key={eye}
            >
              <div
                className="pupil"
                style={{
                  transform: `translate(
                    calc(-50% + ${pupilX}px),
                    calc(-50% + ${pupilY}px)
                  )`,
                }}
              />
              <div className="eye-highlight" />
            </div>
          ))}
        </div>
      </div>

      <div className="maya-status">
        <span className="status-dot" />
        <span>MAYA</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <main className="maya-app">
      <MayaOrb />
    </main>
  );
}
