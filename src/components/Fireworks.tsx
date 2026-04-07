"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
  decay: number;
}

interface Burst {
  x: number;
  y: number;
  particles: Particle[];
}

const COLORS = [
  "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96E6A1",
  "#DDA0DD", "#F7DC6F", "#FF8C00", "#00CED1", "#FF69B4",
  "#7B68EE", "#FFA07A", "#98FB98", "#87CEEB", "#FFB6C1",
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createBurst(x: number, y: number): Burst {
  const particles: Particle[] = [];
  const count = 40 + Math.floor(Math.random() * 30);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      color: randomColor(),
      size: 2 + Math.random() * 2.5,
      gravity: 0.03 + Math.random() * 0.02,
      decay: 0.008 + Math.random() * 0.008,
    });
  }
  return { x, y, particles };
}

export default function Fireworks({ duration = 3500 }: { duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const bursts: Burst[] = [];
    let animId: number;
    let elapsed = 0;
    let lastTime = performance.now();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const spawnBurst = () => {
      const x = w * 0.15 + Math.random() * w * 0.7;
      const y = h * 0.1 + Math.random() * h * 0.45;
      bursts.push(createBurst(x, y));
    };

    spawnBurst();
    spawnBurst();
    spawnBurst();

    let nextSpawn = 300;

    const animate = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      elapsed += dt;

      ctx.clearRect(0, 0, w, h);

      if (elapsed < duration - 800) {
        nextSpawn -= dt;
        if (nextSpawn <= 0) {
          spawnBurst();
          if (Math.random() > 0.5) spawnBurst();
          nextSpawn = 250 + Math.random() * 400;
        }
      }

      const globalAlpha = elapsed > duration - 800
        ? Math.max(0, 1 - (elapsed - (duration - 800)) / 800)
        : 1;

      for (let b = bursts.length - 1; b >= 0; b--) {
        const burst = bursts[b];
        let alive = false;
        for (const p of burst.particles) {
          if (p.life <= 0) continue;
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.99;
          p.life -= p.decay;

          const alpha = Math.max(0, p.life) * globalAlpha;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();

          if (p.life > 0.3) {
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (!alive) bursts.splice(b, 1);
      }

      ctx.globalAlpha = 1;

      if (elapsed < duration) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
