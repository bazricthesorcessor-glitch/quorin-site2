import { useEffect, useRef, useState, useCallback } from 'react';
import starManager from '@/utils/starManager';
import { motion } from 'framer-motion';
import { quorinData } from '@/data/products';
import { useIsMobile } from '@/hooks/use-mobile';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  alpha: number;
  speed: number;
  angle: number;
  distance: number;
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // detect mobile to limit stars
  const isMobile = useIsMobile();

  // Initialize particles
  const initParticles = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const particles: Particle[] = [];
    const desired = isMobile ? 25 : 100;
    // release previous reservation if re-init
    const prevReserved = (particlesRef as any).reservedStars || 0;
    if (prevReserved > 0) {
      starManager.release(prevReserved);
      (particlesRef as any).reservedStars = 0;
    }

    const allowed = starManager.requestReserve(desired);

    for (let i = 0; i < allowed; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? '#ff1a3c' : '#00d4ff',
        alpha: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 100 + 50,
      });
    }
    // record how many stars this Hero instance reserved so we can release on unmount/resize
    (particlesRef as any).reservedStars = allowed;
    particlesRef.current = particles;
    setDimensions({ width: rect.width, height: rect.height });
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      const mouse = mouseRef.current;

      particlesRef.current.forEach((p) => {
        // Distance from mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        // Particle behavior
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          // gently repel particles from the mouse for a smooth trail
          const damp = 2.0;
          p.x -= (dx / (dist || 1)) * force * damp;
          p.y -= (dy / (dist || 1)) * force * damp;
          p.alpha = Math.min(0.9, p.alpha + 0.03);
        } else {
          // Return to origin faster so trails don't linger
          p.x += (p.originX - p.x) * 0.12;
          p.y += (p.originY - p.y) * 0.12;
          p.alpha = Math.max(0.15, p.alpha - 0.05);
        }

        // Floating motion
        p.angle += 0.01;
        p.y += Math.sin(p.angle) * 0.3;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Glow for larger particles
        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = p.alpha * 0.3;
          ctx.fill();
        }
      });



      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    if (dimensions.width > 0) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      // release reserved stars when component unmounts
      const reserved = (particlesRef as any).reservedStars || 0;
      if (reserved > 0) starManager.release(reserved);
    };
  }, [dimensions]);

  useEffect(() => {
    initParticles();

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleResize = () => {
      initParticles();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [initParticles]);

  // Canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
  }, [dimensions]);

  const brandLetters = quorinData.brand.split('');

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-dominant)' }}
    >
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* Brand Typography */}
        <motion.div
          className="flex justify-center items-center gap-1 md:gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {brandLetters.map((letter, index) => (
            <motion.span
              key={index}
              className="quorin-brand text-[12vw] md:text-[10vw] lg:text-[8vw] font-black leading-none select-none"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #8a8a9a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(255, 26, 60, 0.3))',
              }}
              initial={{ opacity: 0, y: 100, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.1 * index,
                ease: [0.76, 0, 0.24, 1],
              }}
              whileHover={{
                scale: 1.1,
                rotateY: 10,
                color: '#ff1a3c',
                transition: { duration: 0.3 },
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-lg md:text-xl tracking-[0.8em] mb-12"
          style={{ color: 'var(--color-text-secondary)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          {quorinData.tagline.toUpperCase()}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base max-w-xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.0 }}
        >
          Premium crafting supplies for resin art, candle making, and soap making.
          Everything you need to bring your creative vision to life.
        </motion.p>

      </div>
    </section>
  );
}
