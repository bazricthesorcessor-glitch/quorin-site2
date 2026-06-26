import { useEffect, useRef } from 'react';

export default function PaintPoolLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createAmbientGradient = () => {
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const progress = Math.min(1, (window.scrollY || window.pageYOffset) / maxScroll);

      const goldTop = `rgba(248, 246, 242, ${0.95 + progress * 0.05})`;
      const goldMid = `rgba(201, 169, 110, ${0.03 + progress * 0.04})`;
      const goldBot = `rgba(180, 155, 110, ${0.02 + progress * 0.03})`;

      container.style.background = `linear-gradient(180deg, ${goldTop} 0%, ${goldMid} 50%, ${goldBot} 100%)`;
    };

    const onScroll = () => {
      requestAnimationFrame(createAmbientGradient);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    createAmbientGradient();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[55]"
      style={{
        background: 'linear-gradient(180deg, rgba(248, 246, 242, 0.95) 0%, rgba(201, 169, 110, 0.03) 50%, rgba(180, 155, 110, 0.02) 100%)',
      }}
    />
  );
}
