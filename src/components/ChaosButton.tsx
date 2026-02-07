"use client";

import { useState } from "react";

export function ChaosButton() {
  const [armed, setArmed] = useState(false);

  const unleashChaos = () => {
    // Minor safety: prevent repeated spamming
    if (armed) return;
    setArmed(true);

    // 1) Open Doom in a new window/tab (and keep opening a few more)
    try {
      window.open('/doom.html', 'doom', 'width=640,height=480');
    } catch (e) {
      // ignore
    }

    // 2) Inject the public fartscroll script if present
    try {
      const s = document.createElement('script');
      s.src = '/fartscroll.js';
      s.async = true;
      document.body.appendChild(s);
    } catch (e) {
      // ignore
    }

    // 3) Start an aggressive visual storm: continuously spawn images and keep flashing for longer
    try {
      // spawn dickbutt images repeatedly for ~25s
      const imgInterval = setInterval(() => {
        const img = document.createElement('img');
        img.src = '/dickbutt.gif';
        img.style.position = 'fixed';
        img.style.left = Math.random() * 80 + 'vw';
        img.style.top = Math.random() * 80 + 'vh';
        img.style.width = Math.random() * 160 + 40 + 'px';
        img.style.zIndex = '999999';
        img.style.pointerEvents = 'none';
        img.style.opacity = '0.95';
        document.body.appendChild(img);
        setTimeout(() => img.remove(), 12000);
      }, 300);
      setTimeout(() => clearInterval(imgInterval), 25000);

      // Flashy color invert/hue effects for ~25s
      let flashes = 0;
      const flashInterval = setInterval(() => {
        const v = flashes % 2 === 0 ? 'invert(1) hue-rotate(90deg) saturate(1.6)' : 'none';
        document.documentElement.style.filter = v;
        flashes += 1;
        if (flashes > 70) {
          clearInterval(flashInterval);
          document.documentElement.style.filter = '';
        }
      }, 350);
    } catch (e) {
      // ignore
    }

    // 4) Extra chaotic features: confetti, sound, favicon swap, title spam
    try {
      // Confetti-ish rectangles, spawned periodically for ~20s
      const confettiSpawner = setInterval(() => {
        const confettiCount = 16;
        for (let i = 0; i < confettiCount; i++) {
          const d = document.createElement('div');
          d.style.position = 'fixed';
          d.style.left = Math.random() * 100 + 'vw';
          d.style.top = Math.random() * -40 + 'vh';
          d.style.width = Math.random() * 18 + 6 + 'px';
          d.style.height = Math.random() * 10 + 6 + 'px';
          d.style.background = `hsl(${Math.random() * 360},80%,60%)`;
          d.style.opacity = '0.95';
          d.style.zIndex = '999998';
          d.style.pointerEvents = 'none';
          d.style.transform = `rotate(${Math.random() * 360}deg)`;
          d.style.transition = `transform 4s linear, top 4s linear, left 4s linear, opacity 4s linear`;
          document.body.appendChild(d);
          requestAnimationFrame(() => {
            d.style.top = 110 + Math.random() * 60 + 'vh';
            d.style.left = (parseFloat(d.style.left) + (Math.random() - 0.5) * 40) + 'vw';
            d.style.opacity = '0.0';
          });
          setTimeout(() => d.remove(), 6000 + Math.random() * 3000);
        }
      }, 600);
      setTimeout(() => clearInterval(confettiSpawner), 20000);

      // WebAudio chaotic melody (plus hit the MidiPlayer source)
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, dur = 0.12, when = 0) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'square';
          o.frequency.value = freq;
          g.gain.value = 0.0001;
          o.connect(g);
          g.connect(ctx.destination);
          const t = ctx.currentTime + when;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
          o.start(t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.stop(t + dur + 0.02);
        };
        // playful chaotic arpeggio
        const base = 110;
        for (let i = 0; i < 14; i++) {
          playTone(base * (1 + Math.random() * 8), 0.08, i * 0.08);
        }

        // Also try to play the site's MidiPlayer audio source directly
        try {
          const existing = document.getElementById('openchaos-mp') as HTMLAudioElement | null;
          if (!existing) {
            const a = document.createElement('audio');
            a.id = 'openchaos-mp';
            a.src = '/openchaos.mp3';
            a.loop = true;
            a.autoplay = true;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.play().catch(() => {});
          } else {
            existing.play().catch(() => {});
          }
        } catch (e) {}
      } catch (e) {
        /* ignore audio failures */
      }

      // Favicon swap to a random emoji via data URL
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const cx = canvas.getContext('2d')!;
        cx.fillStyle = '#ffffff';
        cx.fillRect(0, 0, 64, 64);
        cx.font = '48px serif';
        const emoji = ['💥','🔥','☢️','🤡','👾','🧨','💣'][Math.floor(Math.random()*7)];
        cx.fillText(emoji, 8, 48);
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.setAttribute('rel', 'icon');
        link.setAttribute('href', canvas.toDataURL('image/png'));
        document.head.appendChild(link);
      } catch (e) {}

      // Title spam / marquee
      try {
        const orig = document.title;
        const frames = ['✨ CHAOS ✨','💥 MERGED 💥','🔥 WILD 🔥','😈 OPENCHAOS 😈'];
        let idx = 0;
        const titleInt = setInterval(() => {
          document.title = frames[idx % frames.length];
          idx++;
          if (idx > 16) {
            clearInterval(titleInt);
            document.title = orig;
          }
        }, 220);
      } catch (e) {}
      
      // Hard-mode: repeatedly spawn windows and alerts (limited to avoid permanent lock)
      try {
        let opens = 0;
        const openInterval = setInterval(() => {
          try {
            window.open('/doom.html', `doom-${Date.now()}`,'width=480,height=320');
          } catch (e) {}
          opens += 1;
          if (opens > 10) clearInterval(openInterval);
        }, 2500);

        // alerts: chain a few spaced alerts (note: alerts block JS until dismissed)
        const alertCount = 4;
        for (let i = 0; i < alertCount; i++) {
          setTimeout(() => {
            try {
              alert(['CHAOS!', 'MERGE NOW!', 'YOU BROKE IT', 'ENJOY'][i % 4]);
            } catch (e) {}
          }, 1800 + i * 2600);
        }
      } catch (e) {}
    } catch (e) {
      // ignore
    }

    // 4) A cheeky alert to remind humans who's in charge
    setTimeout(() => {
      try {
        alert("Chaos unleashed. Have fun, and maybe refresh if your browser melts.");
      } catch (e) {}
      setArmed(false);
    }, 1200);
  };

  return (
    <button
      onClick={unleashChaos}
      title="Unleash chaos"
      className="ie6-toolbar-button"
      aria-pressed={armed}
    >
      <span className="ie6-button-icon" style={{ fontSize: 18 }}>☢️</span>
      <span className="ie6-button-label">Chaos</span>
    </button>
  );
}
