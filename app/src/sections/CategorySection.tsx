import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMedusaCatalog } from '@/lib/useMedusaCatalog';
import type { Category } from '@/data/products';

const categoryArt: Record<string, { src: string; position: string }> = {
  'resin-art': { src: '/resin_category.webp', position: 'center 42%' },
  'candle-making': { src: '/candle_category.webp', position: 'center 48%' },
  'soap-making': { src: '/soap_category.webp', position: 'center 50%' },
};

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const navigate = useNavigate();
  const art = categoryArt[category.id];

  return (
    <motion.button
      type="button"
      onClick={() => navigate(`/category/${category.id}`)}
      className="group relative w-full overflow-hidden rounded-[22px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
      style={{
        minHeight: 'clamp(148px, 24vw, 420px)',
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-surface)',
        boxShadow: '0 14px 40px rgba(52, 39, 20, 0.08)',
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      aria-label={`Explore ${category.title}`}
    >
      {art && (
        <img
          src={art.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          style={{ objectPosition: art.position }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(22,18,14,.72) 0%, rgba(22,18,14,.38) 48%, rgba(22,18,14,.08) 78%, transparent 100%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent md:hidden" />

      <div className="relative z-10 flex min-h-[148px] h-full flex-col justify-end p-5 sm:p-6 md:min-h-[360px] md:p-8">
        <span className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/70">
          Explore collection
        </span>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[clamp(1.35rem,3vw,2rem)] font-medium tracking-[0.08em] text-white">
              {category.title}
            </h3>
            <p className="mt-2 hidden max-w-xs text-sm leading-relaxed text-white/78 md:block">
              {category.description}
            </p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-neutral-900 shadow-lg transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight size={18} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function CategorySection() {
  const { categories, loading, error } = useMedusaCatalog();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-120px' });

  return (
    <section
      ref={sectionRef}
      id="categories"
      data-section="categories"
      className="relative px-4 py-16 sm:px-6 md:px-8 md:py-24"
      style={{ background: 'var(--color-dominant)' }}
    >
      <div className="mx-auto mb-8 max-w-7xl md:mb-12">
        <motion.div
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          <div>
            <span className="mb-3 block text-[10px] font-medium tracking-[0.3em]" style={{ color: 'var(--color-accent)' }}>
              WHAT WE SELL
            </span>
            <h2 className="text-3xl font-medium tracking-[0.08em] text-[var(--color-text-primary)] sm:text-4xl md:text-5xl">
              OUR <span style={{ color: 'var(--color-accent)' }}>CATEGORIES</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            From crystal-clear resins to aromatic candle supplies — find everything you need for your next creative project.
          </p>
        </motion.div>
      </div>

      {loading && (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[148px] animate-pulse rounded-[22px] md:h-[360px]" style={{ background: 'var(--color-surface)' }} />
          ))}
        </div>
      )}

      {error && <div className="py-16 text-center text-sm" style={{ color: 'var(--color-accent)' }}>{error}</div>}

      {!loading && !error && (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
          {categories.slice(0, 3).map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
