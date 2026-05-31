import { useEffect, useRef } from 'react';

export default function PaintPoolLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({
    width: 0,
    height: 0,
    scrollY: 0,
    anims: [] as any[],
  });

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
      stateRef.current.width = window.innerWidth;
      stateRef.current.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onScroll = () => {
      stateRef.current.scrollY = window.scrollY || window.pageYOffset;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const draw = () => {
      const { width, height, scrollY, anims } = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      // draw background falling pool based on scroll progress
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const progress = Math.min(1, scrollY / maxScroll);

      // create mixed-color vertical gradient that deepens with progress
      const g = ctx.createLinearGradient(0, 0, 0, height);
      const mixA = `rgba(8,10,15,${0.2 + progress * 0.6})`;
      const mixB = `rgba(40,0,80,${0.05 + progress * 0.5})`;
      g.addColorStop(0, mixA);
      g.addColorStop(0.5, mixB);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      // subtle vertical drips based on progress
      for (let i = 0; i < 8; i++) {
        const x = (i / 8) * width * 0.6; // left side emphasis
        const dripTop = progress * height * (0.3 + i * 0.02);
        ctx.fillStyle = `rgba(${30 + i*20},${10 + i*10},${80 + i*5},${0.08 + progress*0.2})`;
        ctx.fillRect(x, 0, 40, dripTop);
      }

      // update anims (paint cans)
      for (let ai = anims.length - 1; ai >= 0; ai--) {
        const a = anims[ai];
        a.t++;
        const tt = Math.min(1, a.t / a.duration);
        // cubic bezier interpolation
        const inv = 1 - tt;
        const x = inv*inv*inv*a.start.x + 3*inv*inv*tt*a.ctrl1.x + 3*inv*tt*tt*a.ctrl2.x + tt*tt*tt*a.end.x;
        const y = inv*inv*inv*a.start.y + 3*inv*inv*tt*a.ctrl1.y + 3*inv*tt*tt*a.ctrl2.y + tt*tt*tt*a.end.y;

        // record path points
        a.pathPoints.push({ x, y });

        // draw paint trail as thick bezier/path using recorded points
        if (a.pathPoints.length > 2) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(a.pathPoints[0].x, a.pathPoints[0].y);
          for (let p = 1; p < a.pathPoints.length; p++) ctx.lineTo(a.pathPoints[p].x, a.pathPoints[p].y);
          ctx.lineWidth = 60;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          // gradient for the paint streak
          const lg = ctx.createLinearGradient(0,0,width,0);
          lg.addColorStop(0, a.color);
          lg.addColorStop(1, 'rgba(255,255,255,0.06)');
          ctx.strokeStyle = lg;
          ctx.globalAlpha = 0.85;
          ctx.stroke();
          ctx.restore();
        }

        // draw can as rectangle
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(tt * Math.PI * 2) * 0.3);
        ctx.fillStyle = '#333';
        ctx.fillRect(-18, -18, 36, 36);
        ctx.fillStyle = a.color;
        ctx.fillRect(-12, -12, 24, 24);
        ctx.restore();

        // splashes randomly when t passes threshold
        if (a.t === Math.floor(a.duration * 0.6)) {
          for (let s = 0; s < 6; s++) {
            const sx = x + (Math.random() - 0.5) * 80;
            const sy = y + (Math.random() - 0.5) * 40;
            const r = 6 + Math.random() * 18;
            const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
            grad.addColorStop(0, a.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fill();
            // small drips
            ctx.fillRect(sx, sy + r, 2, 10);
          }
        }

        if (a.t >= a.duration + 30) {
          // remove anim
          anims.splice(ai, 1);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 55 }} />
  );
}
