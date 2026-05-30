import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingFrames = [
  '/loading-frames/0to45.png',
  '/loading-frames/45to90.png',
  '/loading-frames/90to135.png',
  '/loading-frames/135to180.png',
  '/loading-frames/180to225.png',
  '/loading-frames/225to270.png',
  '/loading-frames/270to315.png',
];

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const frameDuration = 3000 / loadingFrames.length; // 3 seconds total

  useEffect(() => {
    const frameInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % loadingFrames.length);
    }, frameDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => {
      clearInterval(frameInterval);
      clearInterval(progressInterval);
    };
  }, [frameDuration]);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 800);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: 'var(--color-dominant)' }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-teal)',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Rotating Can Container */}
          <div className="relative w-64 h-64 mb-8">
            {/* Neon Circular Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
              {/* Progress ring - neon effect */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#neonGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-100"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255, 26, 60, 0.8)) drop-shadow(0 0 20px rgba(0, 212, 255, 0.5))',
                }}
              />
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff1a3c" />
                  <stop offset="50%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#ff1a3c" />
                </linearGradient>
              </defs>
            </svg>

            {/* Q Logo in center */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span
                className="text-5xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ff1a3c, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(255, 26, 60, 0.5))',
                }}
              >
                Q
              </span>
            </motion.div>

            {/* Rotating can */}
            <motion.div
              className="absolute inset-4 rounded-full overflow-hidden"
              style={{
                boxShadow: '0 0 60px rgba(0, 212, 255, 0.15), inset 0 0 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              <motion.img
                key={currentFrame}
                src={loadingFrames[currentFrame]}
                alt="QUORIN"
                className="w-full h-full object-cover"
                initial={{ opacity: 0.5, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>

          {/* Brand Name */}
          <motion.h1
            className="text-3xl font-bold tracking-[0.3em] mb-2"
            style={{ color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            QUORIN
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-sm tracking-[0.5em] mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            MADE FOR MAKERS
          </motion.p>

          {/* Progress Bar */}
          <div className="w-48 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #ff1a3c, #00d4ff)',
                boxShadow: '0 0 10px rgba(255, 26, 60, 0.5)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Progress percentage */}
          <motion.p
            className="mt-3 text-xs font-mono"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {progress}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
