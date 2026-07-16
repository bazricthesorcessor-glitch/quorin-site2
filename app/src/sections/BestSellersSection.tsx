import ProductShowcase from './ProductShowcase';
import type { Category, Product } from '@/data/products';

interface BestSellersSectionProps {
  categories: Category[];
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
}

export default function BestSellersSection({ categories, onAddToCart, onPreview }: BestSellersSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <span className="text-[9px] uppercase tracking-[.42em] text-[var(--color-accent,#C79B50)]">Top Picks</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Best <span style={{ color: 'var(--color-accent,#C99A4D)' }}>Sellers</span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Our most loved products across all categories.
          </p>
        </div>
      </div>
      <ProductShowcase categories={categories} onAddToCart={onAddToCart} onPreview={onPreview} />
    </section>
  );
}
