import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ProductShowcase from '@/sections/ProductShowcase';
import BestSellersSection from '@/sections/BestSellersSection';
import MobileProductCard from '@/components/MobileProductCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { getProductId, type Category, type Product } from '@/data/products';

const VIRTUAL_CATEGORIES: Record<string, { title: string; description: string; tag: string }> = {
  tools: { title: 'Tools', description: 'Essential tools for resin, candle, and soap making.', tag: 'tools' },
  'craft-supplies': { title: 'Craft Supplies', description: 'Pigments, glitters, moulds, and more for your creative projects.', tag: 'crafting' },
  kits: { title: 'Kits', description: 'Complete starter kits and bundles to begin your creative journey.', tag: 'kit' },
};

interface CategoryPageProps {
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
  categories: Category[];
  onToggleWishlist?: (product: Product) => void;
  currentAccountWishlist?: string[];
}

export default function CategoryPage({ onAddToCart, onPreview, categories, onToggleWishlist, currentAccountWishlist }: CategoryPageProps) {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const isMobile = useIsMobile();

  const allProducts = useMemo(() => categories.flatMap((c) => c.products), [categories]);

  const category = useMemo(() => {
    const found = categories.find((item) => item.id === categoryId);
    if (found) return found;
    const virtual = VIRTUAL_CATEGORIES[categoryId ?? ''];
    if (!virtual) return null;
    return {
      id: categoryId!,
      title: virtual.title,
      description: virtual.description,
      products: allProducts.filter((p) => p.tags.some((t) => t.toLowerCase().includes(virtual.tag))),
    };
  }, [categories, categoryId, allProducts]);

  if (!category) {
    return (
      <main className="pt-28 max-w-7xl mx-auto px-4 md:px-8 text-center">
        <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Category not found</h1>
        <button onClick={() => navigate('/')} className="text-sm underline" style={{ color: 'var(--color-accent)' }}>Go back home</button>
      </main>
    );
  }

  if (isMobile) {
    return (
      <main className="pt-16 pb-24 bg-[var(--color-background)] min-h-screen">
        <section className="px-4 pb-6">
          <button
            onClick={() => navigate('/')}
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
              onToggleWishlist={onToggleWishlist}
              inWishlist={currentAccountWishlist?.includes(getProductId(product))}
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

      <ProductShowcase categoryId={category.id} onAddToCart={onAddToCart} onPreview={onPreview} categories={[category as Category]} />

      <BestSellersSection categories={categories} onAddToCart={onAddToCart} onPreview={onPreview} />
    </main>
  );
}
