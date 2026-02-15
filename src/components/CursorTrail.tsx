"use client";

import { useEffect, useRef, useState } from "react";

interface CursorPoint {
  id: number;
  x: number;
  y: number;
  persistent?: boolean;
  direction?: "left" | "right" | "top" | "bottom";
  tx?: number; // target x offset (px)
  ty?: number; // target y offset (px)
}

const ASCII_BUTTERFLIES = ["<><", "/\\/", "\\/\\", "<*>"];
const DEFAULT_BUTTERFLY = ASCII_BUTTERFLIES[0];
const KONAMI_BULLET = "[BANG]";

export function CursorTrail() {
  const [cursors, setCursors] = useState<CursorPoint[]>([]);
  const [emoji, setEmoji] = useState(DEFAULT_BUTTERFLY);
  const butterflyCount = useRef(0);
  const FLY_DURATION = 8000; // ms (4x slower - quarter speed)

  // stable id so we can spawn persistent butterflies from keyboard/debug handlers
  const cursorIdRef = useRef(0);
  // track last mouse pos for debug spawning
  const lastMouse = useRef({ x: 0, y: 0 });
  const konamiResetTimer = useRef<NodeJS.Timeout | null>(null);

  const spawnPersistent = (x: number, y: number) => {
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const leftDist = x;
    const rightDist = windowW - x;
    const topDist = y;
    const bottomDist = windowH - y;

    const min = Math.min(leftDist, rightDist, topDist, bottomDist);
    let baseAngle = 0; // radians; 0 = right
    if (min === rightDist) baseAngle = 0;
    else if (min === leftDist) baseAngle = Math.PI;
    else if (min === topDist) baseAngle = -Math.PI / 2;
    else if (min === bottomDist) baseAngle = Math.PI / 2;

    // randomness +/- 135deg
    const variance = (Math.random() - 0.5) * (Math.PI * 1.5);
    const angle = baseAngle + variance;
    const distance = Math.max(windowW, windowH) * 2.5;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    const id = cursorIdRef.current++;
    const specialCursor: CursorPoint = { id, x, y, persistent: true, tx, ty };

    setCursors((prev) => [...prev, specialCursor]);

    // Remove after animation
    setTimeout(() => {
      setCursors((prev) => prev.filter((c) => c.id !== specialCursor.id));
    }, FLY_DURATION + 500);
  };

  useEffect(() => {
    // cursor id is persisted across handlers

    const handleMouseMove = (e: MouseEvent) => {
      const isButterfly = ASCII_BUTTERFLIES.includes(emoji);

      // update last known mouse position
      lastMouse.current = { x: e.clientX, y: e.clientY };

      const baseCursor: CursorPoint = {
        id: cursorIdRef.current++,
        x: e.clientX,
        y: e.clientY
      };

      if (isButterfly) {
        butterflyCount.current++;
      }

      // Every 12th butterfly persists and flies unpredictably toward an edge with randomized angle
      if (isButterfly && butterflyCount.current % 12 === 0) {
        spawnPersistent(e.clientX, e.clientY);
        return;
      }

      // Normal transient cursor
      setCursors((prev) => [...prev, baseCursor]);

      setTimeout(() => {
        setCursors((prev) => prev.filter((c) => c.id !== baseCursor.id));
      }, 800);
    };

    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        handleMouseMove(e);
        throttleTimer = null;
      }, 50);
    };

    window.addEventListener("mousemove", throttledMouseMove);

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [emoji]);

  useEffect(() => {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let pos = 0;

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === code[pos] || e.key === code[pos]) {
        pos++;
        if (pos === code.length) {
          setEmoji(KONAMI_BULLET);
          if (konamiResetTimer.current) clearTimeout(konamiResetTimer.current);
          konamiResetTimer.current = setTimeout(() => {
            setEmoji(DEFAULT_BUTTERFLY);
          }, 1500);
          pos = 0;
        }
      } else {
        pos = 0;
      }
    };

    window.addEventListener("keydown", handleKey);

    // debug: press 'p' to spawn a persistent butterfly at the last mouse position
    const debugSpawn = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p') {
        const { x, y } = lastMouse.current;
        spawnPersistent(x, y);
      }
    };
    window.addEventListener('keydown', debugSpawn);

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener('keydown', debugSpawn);
      if (konamiResetTimer.current) clearTimeout(konamiResetTimer.current);
    };
  }, []);

  return (
    <div style={{ pointerEvents: "none", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999 }}>

      {cursors.map((cursor) => {
          const style: React.CSSProperties = {
            position: "absolute",
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-50%, -50%)",
            fontSize: "20px",
            fontFamily: "'Courier New', 'Lucida Console', monospace",
            whiteSpace: "nowrap",
            userSelect: "none"
          };
        if (cursor.persistent) {
          (style as any)["--fly-duration"] = `${FLY_DURATION}ms`;
          (style as any)["--tx"] = `${cursor.tx ?? 0}px`;
          (style as any)["--ty"] = `${cursor.ty ?? 0}px`;
        }

        return (
          <div
            key={cursor.id}
            className={`cursor-trail-emoji ${cursor.persistent ? "persistent fly-random" : ""}`}
            style={style}
          >
            {emoji}
          </div>
        );
      })}
    </div>
  );
}
