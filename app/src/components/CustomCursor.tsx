import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorVariant, setCursorVariant] = useState<'default' | 'text' | 'image'>('default');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const glowSpringConfig = { damping: 30, stiffness: 200, mass: 0.8 };

  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const glowXSpring = useSpring(cursorX, glowSpringConfig);
  const glowYSpring = useSpring(cursorY, glowSpringConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [data-cursor="pointer"]')) {
        setIsHovering(true);
        setCursorVariant('default');
      }
      if (target.closest('[data-cursor="text"]')) {
        setIsHovering(true);
        setCursorVariant('text');
      }
      if (target.closest('[data-cursor="image"]')) {
        setIsHovering(true);
        setCursorVariant('image');
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setCursorVariant('default');
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [cursorX, cursorY]);

  const getCursorSize = () => {
    if (!isHovering) return 12;
    if (cursorVariant === 'text') return 4;
    if (cursorVariant === 'image') return 80;
    return 40;
  };

  const getGlowSize = () => {
    if (!isHovering) return 300;
    if (cursorVariant === 'image') return 500;
    return 400;
  };

  return (
    <>
      {/* Main cursor ring */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="rounded-full border-2"
          style={{
            borderColor: isHovering ? 'var(--color-accent)' : 'var(--color-teal)',
            boxShadow: isHovering
              ? '0 0 20px rgba(255, 26, 60, 0.4), inset 0 0 20px rgba(255, 26, 60, 0.1)'
              : '0 0 10px rgba(0, 212, 255, 0.3)',
          }}
          animate={{
            width: getCursorSize(),
            height: getCursorSize(),
            x: -getCursorSize() / 2,
            y: -getCursorSize() / 2,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        />
      </motion.div>

      {/* Cursor dot */}
      <motion.div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      >
        <motion.div
          className="rounded-full"
          style={{
            background: isHovering ? 'var(--color-accent)' : 'var(--color-teal)',
            boxShadow: isHovering
              ? '0 0 10px rgba(255, 26, 60, 0.8)'
              : '0 0 6px rgba(0, 212, 255, 0.6)',
          }}
          animate={{
            width: isHovering ? 0 : 6,
            height: isHovering ? 0 : 6,
            x: isHovering ? 0 : -3,
            y: isHovering ? 0 : -3,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        />
      </motion.div>

      {/* Glow aura */}
      <motion.div
        ref={cursorGlowRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: glowXSpring,
          y: glowYSpring,
        }}
      >
        <motion.div
          className="rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 26, 60, 0.12) 0%, rgba(0, 212, 255, 0.05) 40%, transparent 70%)',
          }}
          animate={{
            width: getGlowSize(),
            height: getGlowSize(),
            x: -getGlowSize() / 2,
            y: -getGlowSize() / 2,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 150 }}
        />
      </motion.div>

      {/* Hide default cursor on all interactive elements */}
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
