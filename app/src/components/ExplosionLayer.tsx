import { useEffect, useRef } from 'react';
import starManager from '@/utils/starManager';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
  type?: 'star' | 'spark';
};

export default function ExplosionLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastClickRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      lastClickRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointerdown', handlePointerDown, { capture: true });

    return () => window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const maxStars = () => (window.innerWidth <= 768 ? 25 : 100);
    // ensure starManager is available
    try { /* noop */ } catch (e) {};

    const spawnExplosion = (x: number, y: number) => {
      // sparks
      const sparks = 18;
      for (let i = 0; i < sparks; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 1.5),
          life: 40 + Math.random() * 30,
          size: 2 + Math.random() * 3,
          color: `hsl(${Math.floor(Math.random() * 50 + 350)}, 90%, ${50 + Math.random() * 20}%)`,
          type: 'spark',
        });
      }

      // stars pop
      const extraStars = 8;
      let currentStars = particlesRef.current.filter(p => p.type === 'star').length;
      const cap = maxStars();
      // ask starManager how many stars we can actually spawn
      const allowed = Math.max(0, starManager.requestReserve(extraStars));
      for (let i = 0; i < allowed; i++) {
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.8,
          vy: - (1 + Math.random() * 1.5),
          life: 80 + Math.random() * 120,
          size: 1 + Math.random() * 3,
          color: `#fff`,
          type: 'star',
        });
      }
    };

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        // physics
        p.vy += p.type === 'star' ? 0.03 : 0.18; // gravity gentle for stars
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        const alpha = Math.max(0, p.life / 100);

        if (p.type === 'star') {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          // simple star as filled circle for perf
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // spark
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.max(0, alpha);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
          g.addColorStop(0, p.color);
          g.addColorStop(0.2, 'rgba(255,200,150,0.7)');
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (p.life <= 0 || p.y > window.innerHeight + 100) {
          // if this was a star, release reservation
          if (p.type === 'star') starManager.release(1);
          particles.splice(i, 1);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handler = (e: Event) => {
      const detail: any = (e as CustomEvent).detail || {};
      // spawn at last click position if available
      const pos = lastClickRef.current || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      spawnExplosion(pos.x, pos.y);
    };

    window.addEventListener('quorin:addedToCart', handler as EventListener);

    return () => {
      window.removeEventListener('quorin:addedToCart', handler as EventListener);
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Render canvas
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 60 }}
    />
  );
}
