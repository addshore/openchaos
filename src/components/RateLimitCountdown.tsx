"use client";

import { useState, useEffect } from "react";

interface RateLimitCountdownProps {
  resetTime: Date;
}

function getTimeUntilReset(resetTime: Date) {
  const now = new Date();
  const diff = Math.max(0, resetTime.getTime() - now.getTime());

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  return { days, hours, minutes, seconds, total: diff };
}

function formatTimeRemaining(
  days: number,
  hours: number,
  minutes: number,
  seconds: number
): string {
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function RateLimitCountdown({ resetTime }: RateLimitCountdownProps) {
  const [time, setTime] = useState(() => getTimeUntilReset(resetTime));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(getTimeUntilReset(resetTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTime]);

  if (!mounted) {
    return (
      <div className="w-full max-w-xl text-center py-8" suppressHydrationWarning>
        <p className="text-red-500 font-semibold">Rate limited by GitHub API</p>
        <p className="mt-2 text-sm text-zinc-600">Resets soon...</p>
      </div>
    );
  }

  if (time.total <= 0) {
    return (
      <div className="w-full max-w-xl text-center py-8">
        <p className="text-amber-500">Rate limit has reset. Refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl text-center py-8">
      <p className="text-red-500 font-semibold">Rate limited by GitHub API</p>
      <p className="mt-2 text-zinc-500" suppressHydrationWarning>
        Resets in <span className="font-mono font-bold text-red-400">{formatTimeRemaining(time.days, time.hours, time.minutes, time.seconds)}</span>
      </p>
      <p className="mt-2 text-xs text-zinc-600">
        Refresh the page after the timer expires
      </p>
    </div>
  );
}
