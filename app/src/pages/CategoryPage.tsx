import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ProductShowcase from '@/sections/ProductShowcase';
import type { Category, Product } from '@/data/products';

interface CategoryPageProps {
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
  categories: Category[];
}

export default function CategoryPage({ onAddToCart, onPreview, categories }: CategoryPageProps) {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const category = useMemo(
    () => categories.find((item) => item.id === categoryId),
    [categories, categoryId]
  );

  useEffect(() => {
    if (!category) {
      navigate('/', { replace: true });
    }
  }, [category, navigate]);

  if (!category) {
    return null;
  }

  return (
    <main className="pt-28">
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
        <motion.button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--color-text-primary)',
          }}
          whileHover={{ x: -4 }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          Back Home
        </motion.button>

        <h1 className="text-4xl md:text-6xl font-bold mb-4">{category.title}</h1>
        <p className="max-w-2xl text-[var(--color-text-secondary)]">{category.description}</p>
      </section>

      <ProductShowcase categoryId={category.id} onAddToCart={onAddToCart} onPreview={onPreview} categories={categories} />
    </main>
  );
}
