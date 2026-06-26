import { useEffect, useRef } from 'react';

type FloatParticle = {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
};

export default function ExplosionLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<FloatParticle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createParticles = (x: number, y: number) => {
      const count = 12;
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'absolute rounded-full pointer-events-none';
        const size = 4 + Math.random() * 6;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.background = `rgba(201, 169, 110, ${0.3 + Math.random() * 0.4})`;
        el.style.boxShadow = `0 0 ${size}px rgba(201, 169, 110, 0.3)`;
        el.style.transition = 'opacity 0.6s ease-out';
        container.appendChild(el);

        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;

        particlesRef.current.push({
          el,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          size,
          opacity: 0.6 + Math.random() * 0.4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 4,
          life: 60 + Math.random() * 40,
        });
      }
    };

    const animate = () => {
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.05;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= 1;

        const fadeProgress = Math.max(0, p.life / 60);
        const currentOpacity = p.opacity * fadeProgress;

        p.el.style.transform = `translate(${p.x - parseFloat(p.el.style.left) || 0}px, ${p.y - parseFloat(p.el.style.top) || 0}px) rotate(${p.rotation}deg)`;
        p.el.style.opacity = String(currentOpacity);

        if (p.life <= 0) {
          p.el.style.opacity = '0';
          setTimeout(() => p.el.remove(), 600);
          particles.splice(i, 1);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { x, y } = customEvent.detail || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      createParticles(x, y);
    };

    window.addEventListener('quorin:addedToCart', handler as EventListener);

    return () => {
      window.removeEventListener('quorin:addedToCart', handler as EventListener);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      particlesRef.current.forEach(p => p.el.remove());
      particlesRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ overflow: 'hidden' }}
    />
  );
}
