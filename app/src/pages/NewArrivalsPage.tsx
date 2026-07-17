import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import ProductShowcase from '@/sections/ProductShowcase';
import BestSellersSection from '@/sections/BestSellersSection';
import type { Category, Product } from '@/data/products';

interface NewArrivalsPageProps {
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
  categories: Category[];
}

export default function NewArrivalsPage({ onAddToCart, onPreview, categories }: NewArrivalsPageProps) {
  const navigate = useNavigate();

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

        <h1 className="text-3xl md:text-5xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>New Arrivals</h1>
        <p className="max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>Discover the latest products added to our collection.</p>
      </section>

      <ProductShowcase categories={categories} onAddToCart={onAddToCart} onPreview={onPreview} />

      <BestSellersSection categories={categories} onAddToCart={onAddToCart} onPreview={onPreview} />
    </main>
  );
}
