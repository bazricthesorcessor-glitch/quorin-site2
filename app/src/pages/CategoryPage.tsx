import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ProductShowcase from '@/sections/ProductShowcase';
import MobileProductCard from '@/components/MobileProductCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { getProductId, type Category, type Product } from '@/data/products';

interface CategoryPageProps {
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
  categories: Category[];
}

export default function CategoryPage({ onAddToCart, onPreview, categories }: CategoryPageProps) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <main className="pt-16 pb-24 bg-[var(--color-background)] min-h-screen">
        <section className="px-4 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] mb-4 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{category.title}</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">{category.description}</p>
        </section>
        
        <div className="grid grid-cols-2 gap-4 px-4 mt-2">
          {category.products.map((product, idx) => (
            <MobileProductCard
              key={`${product.name}-${idx}`}
              product={product}
              onAddToCart={onAddToCart}
              onClick={() => navigate(`/product/${getProductId(product)}`)}
            />
          ))}
        </div>
      </main>
    );
  }

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

        <h1 className="text-3xl md:text-5xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>{category.title}</h1>
        <p className="max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>{category.description}</p>
      </section>

      <ProductShowcase categoryId={category.id} onAddToCart={onAddToCart} onPreview={onPreview} categories={categories} />
    </main>
  );
}
