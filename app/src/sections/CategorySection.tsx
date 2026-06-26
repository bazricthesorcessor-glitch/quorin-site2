import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMedusaCatalog } from '@/lib/useMedusaCatalog';
import type { Category } from '@/data/products';

const categoryImages: Record<string, string> = {
  'resin-art': '/category-resin.jpg',
  'candle-making': '/category-candle.jpg',
  'soap-making': '/category-soap.jpg',
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
      className="relative w-full"
      style={{ scale, opacity, y }}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl group"
        style={{
          background: 'var(--color-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          height: '500px',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0, y: 0 });
        }}
        whileHover={{
          borderColor: 'rgba(255, 26, 60, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Background Image with Parallax */}
        <motion.div
          className="absolute inset-0 cursor-pointer"
          role="button"
          tabIndex={0}
          data-cursor="image"
          onClick={scrollToCategory}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              scrollToCategory();
            }
          }}
          animate={{
            x: mousePos.x,
            y: mousePos.y,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
          <img
            src={categoryImages[category.id]}
            alt={category.title}
            className="w-full h-full object-cover pointer-events-none"
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                to top,
                rgba(248, 245, 240, 0.95) 0%,
                rgba(248, 245, 240, 0.7) 40%,
                rgba(248, 245, 240, 0.1) 100%
              )`,
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          {/* Category Number */}
          <motion.span
            className="text-8xl font-black absolute top-6 right-6 opacity-10"
            style={{ color: 'var(--color-accent)' }}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          >
            0{index + 1}
          </motion.span>

          {/* Product Count */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <span
              className="px-3 py-1 rounded-full text-xs tracking-wider"
              style={{
                background: 'rgba(255, 26, 60, 0.15)',
                color: 'var(--color-accent)',
                border: '1px solid rgba(255, 26, 60, 0.2)',
              }}
            >
              {category.products.length} PRODUCTS
            </span>
          </motion.div>

          {/* Title */}
          <motion.h3
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            {category.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="text-sm leading-relaxed mb-6 max-w-md"
            style={{ color: 'var(--color-text-secondary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            {category.description}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            className="flex items-center gap-2 text-sm tracking-wider group/btn"
            style={{ color: 'var(--color-accent)' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            onClick={scrollToCategory}
          >
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-300 group-hover/btn:-translate-y-full">
                VIEW ALL
              </span>
              <span className="absolute top-full left-0 block transition-transform duration-300 group-hover/btn:-translate-y-full">
                VIEW ALL
              </span>
            </span>
            <motion.span
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight size={16} />
            </motion.span>
          </motion.button>
        </div>

        {/* Hover Border Glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? 'inset 0 0 0 1px rgba(255, 26, 60, 0.3), 0 0 40px rgba(255, 26, 60, 0.1)'
              : 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
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
              className="text-4xl md:text-6xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
