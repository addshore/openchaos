"use client";
import React, { useEffect, useState } from "react";

export function ChaosMode(): null {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const el = typeof document !== "undefined" ? document.documentElement : null;
    if (!el) return;
    if (enabled) el.classList.add("chaos-mode"); else el.classList.remove("chaos-mode");
  }, [enabled]);

  useEffect(() => {
    const mousePoints: { t: number; x: number; y: number }[] = [];
    const motionPoints: { t: number; mag: number }[] = [];

    const WINDOW_MS = 500;
    const MOUSE_THRESHOLD = 1200; // sum of distances in window required to consider as violent
    const MOTION_THRESHOLD = 12; // sensitivity for device motion
    const SUSTAIN_MS = 500; // must sustain for 500ms
    const COOLDOWN_MS = 800; // prevent immediate re-toggle

    let shakeTimer: number | null = null;
    let cooldown = false;
    let cooldownTimer: number | null = null;

    function triggerToggle() {
      setEnabled((s) => !s);
      cooldown = true;
      if (cooldownTimer) clearTimeout(cooldownTimer);
      cooldownTimer = window.setTimeout(() => {
        cooldown = false;
        cooldownTimer = null;
      }, COOLDOWN_MS);
    }

    function onMouseMove(e: MouseEvent) {
      const t = performance.now();
      mousePoints.push({ t, x: e.clientX, y: e.clientY });
      while (mousePoints.length > 2 && t - mousePoints[0].t > WINDOW_MS) mousePoints.shift();

      if (mousePoints.length < 2) {
        if (shakeTimer) {
          clearTimeout(shakeTimer);
          shakeTimer = null;
        }
        return;
      }

      let sum = 0;
      for (let i = 1; i < mousePoints.length; i++) {
        const dx = mousePoints[i].x - mousePoints[i - 1].x;
        const dy = mousePoints[i].y - mousePoints[i - 1].y;
        sum += Math.hypot(dx, dy);
      }

      const isViolent = sum > MOUSE_THRESHOLD;

      if (isViolent && !shakeTimer && !cooldown) {
        shakeTimer = window.setTimeout(() => {
          triggerToggle();
          shakeTimer = null;
        }, SUSTAIN_MS);
      } else if (!isViolent && shakeTimer) {
        clearTimeout(shakeTimer);
        shakeTimer = null;
      }
    }

    function onDeviceMotion(ev: DeviceMotionEvent) {
      const acc = (ev.accelerationIncludingGravity ?? ev.acceleration) as DeviceMotionEvent['acceleration'] | null;
      if (!acc) return;
      const ax = acc.x ?? 0;
      const ay = acc.y ?? 0;
      const az = acc.z ?? 0;
      const mag = Math.hypot(ax, ay, az);
      const t = performance.now();

      motionPoints.push({ t, mag });
      while (motionPoints.length > 2 && t - motionPoints[0].t > WINDOW_MS) motionPoints.shift();

      if (motionPoints.length < 2) {
        if (shakeTimer) {
          clearTimeout(shakeTimer);
          shakeTimer = null;
        }
        return;
      }

      let sumDelta = 0;
      for (let i = 1; i < motionPoints.length; i++) {
        sumDelta += Math.abs(motionPoints[i].mag - motionPoints[i - 1].mag);
      }

      const isViolentMotion = sumDelta > MOTION_THRESHOLD;

      if (isViolentMotion && !shakeTimer && !cooldown) {
        shakeTimer = window.setTimeout(() => {
          triggerToggle();
          shakeTimer = null;
        }, SUSTAIN_MS);
      } else if (!isViolentMotion && shakeTimer) {
        clearTimeout(shakeTimer);
        shakeTimer = null;
      }
    }

    function requestMotionPermissionOnce() {
      try {
        const DME: any = (DeviceMotionEvent as any);
        if (DME && typeof DME.requestPermission === "function") {
          DME.requestPermission().catch(() => {});
        }
      } catch (e) {
        // ignore
      }
      window.removeEventListener("touchstart", requestMotionPermissionOnce);
      window.removeEventListener("click", requestMotionPermissionOnce);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("devicemotion", onDeviceMotion as EventListener, { passive: true });
    window.addEventListener("touchstart", requestMotionPermissionOnce, { passive: true });
    window.addEventListener("click", requestMotionPermissionOnce, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove as EventListener);
      window.removeEventListener("devicemotion", onDeviceMotion as EventListener);
      window.removeEventListener("touchstart", requestMotionPermissionOnce as EventListener);
      window.removeEventListener("click", requestMotionPermissionOnce as EventListener);
      if (shakeTimer) clearTimeout(shakeTimer);
      if (cooldownTimer) clearTimeout(cooldownTimer);
    };
  }, []);

  return null;
}
