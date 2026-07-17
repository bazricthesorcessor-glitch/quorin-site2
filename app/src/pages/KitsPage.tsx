import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import ProductShowcase from '@/sections/ProductShowcase';
import BestSellersSection from '@/sections/BestSellersSection';
import type { Category, Product } from '@/data/products';

interface KitsPageProps {
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
  categories: Category[];
}

export default function KitsPage({ onAddToCart, onPreview, categories }: KitsPageProps) {
  const navigate = useNavigate();

  const virtualCategory = useMemo(() => ({
    id: 'kits',
    title: 'Kits',
    description: 'Complete starter kits and bundles to begin your creative journey.',
    products: categories.flatMap((c) => c.products).filter((p) => p.tags.some((t) => t.toLowerCase().includes('kit'))),
  }), [categories]);

  return (
    <main className="pt-28">
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
        <motion.button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm"
          style={{
            background: 'var(--color-ivory)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-subtle)',
          }}
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          Back Home
        </motion.button>

        <div className="flex items-center gap-3 mb-3">
          <span className="grid h-10 w-10 rounded-full bg-[var(--color-accent)] text-white"><Sparkles size={20} className="m-auto" /></span>
          <h1 className="text-3xl md:text-5xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Kits</h1>
        </div>
        <p className="max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>Complete starter kits and bundles to begin your creative journey.</p>
      </section>

      <ProductShowcase categories={[virtualCategory as Category]} onAddToCart={onAddToCart} onPreview={onPreview} />

      <BestSellersSection categories={categories} onAddToCart={onAddToCart} onPreview={onPreview} />
    </main>
  );
}
