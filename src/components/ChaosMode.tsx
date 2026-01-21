"use client";
import React, { useEffect, useRef, useState } from "react";

export function ChaosMode(): null {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const el = typeof document !== "undefined" ? document.documentElement : null;
    if (!el) return;
    if (enabled) el.classList.add("chaos-mode"); else el.classList.remove("chaos-mode");
  }, [enabled]);

  useEffect(() => {
    const points: { t: number; x: number; y: number }[] = [];
    const WINDOW_MS = 500;
    const THRESHOLD = 1200; // windows distance shake threshold
    const SUSTAIN_MS = 500; // must sustain for 500ms
    const COOLDOWN_MS = 800; // prevent immediate re-toggle

    const shakeTimer = { id: null as number | null };
    const cooldown = { active: false };
    const cooldownTimer = { id: null as number | null };

    function onMove(e: MouseEvent) {
      const t = performance.now();
      points.push({ t, x: e.clientX, y: e.clientY });
      while (points.length > 2 && t - points[0].t > WINDOW_MS) points.shift();

      if (points.length < 2) return;

      let sum = 0;
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        sum += Math.hypot(dx, dy);
      }

      const isViolent = sum > THRESHOLD;

      if (isViolent && !shakeTimer.id && !cooldown.active) {
        shakeTimer.id = window.setTimeout(() => {
          setEnabled((s) => !s);
          cooldown.active = true;
          if (cooldownTimer.id) clearTimeout(cooldownTimer.id);
          cooldownTimer.id = window.setTimeout(() => {
            cooldown.active = false;
            cooldownTimer.id = null;
          }, COOLDOWN_MS);
          shakeTimer.id = null;
        }, SUSTAIN_MS);
      } else if (!isViolent && shakeTimer.id) {
        clearTimeout(shakeTimer.id);
        shakeTimer.id = null;
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove as EventListener);
      if (shakeTimer.id) clearTimeout(shakeTimer.id);
      if (cooldownTimer.id) clearTimeout(cooldownTimer.id);
    };
  }, []);

  return null;
}
