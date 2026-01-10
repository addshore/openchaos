"use client";

import { useState, useEffect } from "react";

function getNextSunday8PM(): Date {
  const now = new Date();
  const target = new Date(now);

  // Set to next Sunday
  const daysUntilSunday = (7 - now.getUTCDay()) % 7;
  target.setUTCDate(now.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));

  // Set to 09:00 UTC
  target.setUTCHours(9, 0, 0, 0);

  // If it's Sunday but before 09:00 UTC, use today
  if (now.getUTCDay() === 0 && now.getUTCHours() < 9) {
    target.setUTCDate(now.getUTCDate());
  }

  return target;
}

function getTimeRemaining(target: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
} {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());

  const milliseconds = diff % 1000;
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  return { days, hours, minutes, seconds, milliseconds };
}

function pad(n: number, count: number = 2): string {
  return n.toString().padStart(count, "0");
}

export function Countdown() {
  const [target] = useState(() => getNextSunday8PM());
  const [time, setTime] = useState(() => getTimeRemaining(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(getTimeRemaining(target));
    }, 53); // just a prime number

    return () => clearInterval(interval);
  }, [target]);

  if (!mounted) {
    return (
      <div className="text-center">
        <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tight">
          --d --h --m --s
        </div>
        <p className="mt-4 text-zinc-500 text-lg">until next merge</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tight">
        {time.days}d {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s {pad(time.milliseconds, 4)}ms
      </div>
      <p className="mt-4 text-zinc-400 text-lg">until next merge</p>
    </div>
  );
}
