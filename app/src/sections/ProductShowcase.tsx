import { useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, Sparkles } from 'lucide-react';
import type { Category, Product } from '@/data/products';

const fallbackImage = '/product-resin-kit.jpg';

function getProductImage(product: Product): string {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return fallbackImage;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
}

function ProductCard({ product, index, onAddToCart, onPreview }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    setMousePos({ x, y });
  };

  const discount = parseInt(product.discount);
  const image = getProductImage(product);

  return (
    <motion.div
      ref={cardRef}
      style={{ y, scale, opacity }}
      className="group"
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl ivory-card"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0, y: 0 });
        }}
        whileHover={{
          y: -4,
          borderColor: 'var(--color-accent)',
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => onPreview?.(product)}>
          <motion.div
            className="absolute inset-0"
            animate={{
              x: mousePos.x,
              y: mousePos.y,
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 100 }}
          >
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Soft gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 50%, rgba(248, 245, 240, 0.5) 100%)',
            }}
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'var(--color-accent)',
                color: 'white',
              }}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2 + index * 0.05, type: 'spring', stiffness: 300 }}
            >
              {product.discount} OFF
            </motion.div>
          )}

          {/* Quick Add Button */}
          <motion.button
            className="absolute bottom-3 right-3 p-2.5 rounded-full"
            style={{
              background: 'var(--color-accent)',
              color: 'white',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          >
            <ShoppingCart size={16} color="white" />
          </motion.button>

          {/* Tags */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end max-w-[50%]">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px] tracking-wider font-medium"
                style={{
                  background: 'rgba(201, 169, 110, 0.1)',
                  color: 'var(--color-accent)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Product Name */}
          <div className="overflow-hidden mb-2">
            <motion.h4
              className="text-sm font-medium leading-snug"
              style={{ color: 'var(--color-text-primary)' }}
              animate={{ y: isHovered ? -2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {product.name}
            </motion.h4>
          </div>

          {/* Variant & Size */}
          {(product.variant || product.size) && (
            <div className="flex items-center gap-2 mb-3">
              {product.variant && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {product.variant}
                </span>
              )}
              {product.size && (
                <span
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    background: 'rgba(201, 169, 110, 0.08)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {product.size}
                </span>
              )}
            </div>
          )}

          {/* Features */}
          {product.features && (
            <div className="flex flex-wrap gap-2 mb-3">
              {product.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="flex items-center gap-1 text-[10px] font-medium"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Sparkles size={10} style={{ color: 'var(--color-accent)' }} />
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              ₹{product.price}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              ₹{product.mrp}
            </span>
            <span className="text-xs font-medium" style={{ background: 'rgba(201, 169, 110, 0.1)', color: 'var(--color-accent)' }}>
              Save ₹{product.mrp - product.price}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface CategoryProductsProps {
  category: Category;
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
}

function CategoryProducts({ category, onAddToCart, onPreview }: CategoryProductsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id={category.id}
      data-category-id={category.id}
      className="py-24 px-4 md:px-8"
      style={{ background: 'var(--color-dominant)' }}
    >
      {/* Section Header */}
      <motion.div
        className="max-w-7xl mx-auto mb-12"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <motion.span
              className="text-xs tracking-[0.3em] mb-3 block"
              style={{ color: 'var(--color-accent)' }}
            >
              {category.products.length} PRODUCTS
            </motion.span>
            <motion.h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {category.title}
            </motion.h2>
          </div>
          <motion.p
            className="text-sm max-w-md leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {category.description}
          </motion.p>
        </div>

        {/* Divider */}
        <motion.div
          className="mt-8 h-[1px]"
          style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </motion.div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {category.products.map((product, index) => (
          <ProductCard
            key={`${product.name}-${index}`}
            product={product}
            index={index}
            onAddToCart={onAddToCart}
            onPreview={onPreview}
          />
        ))}
      </div>
    </section>
  );
}

interface ProductShowcaseProps {
  onAddToCart: (product: Product) => void;
  onPreview?: (product: Product) => void;
  categories: Category[];
  categoryId?: string;
}

export default function ProductShowcase({ onAddToCart, onPreview, categories, categoryId }: ProductShowcaseProps) {
  const filtered = categoryId
    ? categories.filter((category) => category.id === categoryId)
    : categories;

  return (
    <div>
      {filtered.map((category) => (
        <CategoryProducts
          key={category.id}
          category={category}
          onAddToCart={onAddToCart}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}
