import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quorinData } from '@/data/products';

interface LoadingScreenProps {
  onComplete: () => void;
}

const logoSrc = '/favicon.webp';

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [shimmerAngle, setShimmerAngle] = useState(0);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, size: number, delay: number}[]>([]);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Generate floating dust particles
  useEffect(() => {
    const pts = Array.from({length: 8}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 1.5,
      delay: Math.random() * 4,
    }));
    setParticles(pts);
  }, []);

  // Shimmer animation loop
  useEffect(() => {
    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      setShimmerAngle((elapsed * 0.05) % 360);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Progress animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(progressInterval);
  }, []);

  // Exit animation
  useEffect(() => {
    if (progress >= 100 && logoLoaded) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 800);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [progress, logoLoaded, onComplete]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const glowOpacity = Math.min(progress / 100, 1) * 0.35;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#2B211A' }}
          exit={{ opacity: 0, scale: 1.02, pointerEvents: 'none' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Radial background glow - subtle gold */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(212,167,74,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Floating dust particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                background: 'rgba(212,167,74,0.25)',
              }}
              animate={{
                y: [-3, 3, -3],
                opacity: [0.05, 0.4, 0.05],
              }}
              transition={{
                duration: 4 + p.delay,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Logo container with progress ring */}
          <div className="relative w-72 h-72 mb-10">
            {/* SVG ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 120 120"
            >
              {/* Faint ivory track - very subtle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="rgba(255,245,230,0.08)"
                strokeWidth="6"
              />

              {/* Main progress ring with metallic gold gradient */}
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4A74A" />
                  <stop offset="50%" stopColor="#E8C36A" />
                  <stop offset="100%" stopColor="#D4A74A" />
                </linearGradient>
                {/* Glow filter for active stroke */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Progress ring with glow */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ filter: 'url(#goldGlow)' }}
                animate={{
                  strokeDashoffset,
                  opacity: 0.9,
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Shimmer highlight - travels along the ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="rgba(255,235,180,0.5)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="6 280"
                style={{
                  transformOrigin: '60px 60px',
                  transform: `rotate(${shimmerAngle}deg)`,
                  opacity: Math.min(progress / 30, 0.8),
                }}
              />
            </svg>

            {/* Logo image */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'transparent',
              }}
              animate={{ scale: [0.985, 1.0, 0.985] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src={logoSrc}
                alt="QUORIN"
                className="w-44 h-44 object-contain"
                onLoad={() => setLogoLoaded(true)}
                style={{
                  filter: `drop-shadow(0 0 ${8 + progress * 0.1}px rgba(212,167,74,${0.15 + glowOpacity}))`,
                }}
              />
            </motion.div>
          </div>

          {/* Brand Name */}
          <motion.h1
            className="text-2xl font-bold tracking-[0.25em] mb-2"
            style={{ color: '#C89B52' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {quorinData.brand}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-xs tracking-[0.4em] mb-8 font-semibold"
            style={{ color: 'rgba(232,226,217,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            MADE FOR MAKERS
          </motion.p>

          {/* Progress Bar - thinner, more refined */}
          <div className="w-40 h-[1px] rounded-full overflow-hidden" style={{ background: 'rgba(232,226,217,0.1)' }}>
            <motion.div
              className="h-full"
              style={{
                background: 'linear-gradient(90deg, #D4A74A, #E8C36A)',
                boxShadow: `0 0 8px rgba(212,167,74,${glowOpacity})`,
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Progress percentage */}
          <motion.p
            className="mt-3 text-[10px] font-light tracking-wider"
            style={{ color: 'rgba(232,226,217,0.35)', fontFamily: 'system-ui' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {progress}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
