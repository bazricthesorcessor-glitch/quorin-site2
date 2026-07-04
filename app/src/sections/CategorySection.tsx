import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMedusaCatalog } from '@/lib/useMedusaCatalog';
import type { Category } from '@/data/products';

const categoryImages: Record<string, string> = {
  'resin-art': '/resin_category.webp',
  'candle-making': '/candle_category.webp',
  'soap-making': '/soap_category.webp',
};

interface CategoryCardProps {
  category: Category;
  index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const scrollToCategory = () => {
    navigate(`/category/${category.id}`);
  };

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative w-full cursor-pointer"
      style={{ scale, opacity, y }}
      onClick={scrollToCategory}
    >
      <motion.div
        className="relative overflow-hidden rounded-[24px] group"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
          aspectRatio: '9/10',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0, y: 0 });
        }}
        whileHover={{
          y: -8,
          scale: 1.02,
          borderColor: 'var(--color-accent)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Background Image with Parallax */}
        <motion.div
          className="absolute inset-0"
          data-cursor="image"
          animate={{
            x: mousePos.x,
            y: mousePos.y,
            scale: isHovered ? 1.03 : 1,
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
          <img
            src={categoryImages[category.id]}
            alt={category.title}
            className="w-full h-full object-cover pointer-events-none"
          />
          {/* Bottom Gradient Overlay - 45% opacity */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none" />
          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                to top,
                rgba(0, 0, 0, 0.85) 0%,
                rgba(0, 0, 0, 0.45) 40%,
                rgba(0, 0, 0, 0.05) 100%
              )`,
            }}
            animate={{ opacity: isHovered ? 0.7 : 0.4 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-7">
{/* Title */}
          <motion.h3
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: '#FFFFFF' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            {category.title}
          </motion.h3>

          {/* Description - reveal on hover */}
          <motion.p
            className="text-sm leading-relaxed mb-4 max-w-md"
            style={{ color: 'rgba(255,255,255,0.85)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 10,
            }}
            transition={{ duration: 0.25 }}
          >
            {category.description}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            className="flex items-center gap-2 text-xs tracking-widest uppercase group/btn"
            style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            whileHover={{ color: '#FFFFFF' }}
            onClick={scrollToCategory}
          >
            <span>EXPLORE COLLECTION</span>
            <motion.span
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight size={14} />
            </motion.span>
          </motion.button>
        </div>

        {/* Hover Border Glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? `inset 0 0 0 1px var(--color-accent), 0 0 40px var(--halo-gold)`
              : 'inset 0 0 0 1px var(--color-border-subtle)',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function CategorySection() {
  const { categories, loading, error } = useMedusaCatalog();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-200px' });

  return (
    <section
      ref={sectionRef}
      id="categories"
      data-section="categories"
      className="relative py-32 px-4 md:px-8"
      style={{ background: 'var(--color-dominant)' }}
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-20">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div>
            <motion.span
              className="text-xs tracking-[0.3em] mb-4 block"
              style={{ color: 'var(--color-accent)' }}
            >
              WHAT WE SELL
            </motion.span>
            <motion.h2
              className="text-4xl md:text-6xl font-bold text-[var(--color-text-primary)]"
              style={{ isolation: 'isolate' }}
            >
              Our{' '}
              <span
                style={{ color: 'var(--color-accent)' }}
              >
                Categories
              </span>
            </motion.h2>
          </div>
          <motion.p
            className="text-sm max-w-md leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            From crystal-clear resins to aromatic candle supplies — find everything
            you need for your next creative project.
          </motion.p>
        </motion.div>
      </div>

      {loading && (
        <div className="text-center py-20 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading catalog...
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-sm" style={{ color: 'var(--color-accent)' }}>
          {error}
        </div>
      )}

      {/* Category Cards Grid */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-[32px]">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
