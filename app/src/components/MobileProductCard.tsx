import { useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/data/products';
import { toast } from 'sonner';

interface MobileProductCardProps { product: Product; onAddToCart: (product: Product) => void; onClick: () => void; }
const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="#F8F5EF"><rect width="400" height="400"/><text x="200" y="200" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="48" fill="#C9A96E">Q</text></svg>')}`;
function getProductImage(product: Product): string { if (product.images_local?.length) return product.images_local[0]; if (product.images?.length) { const img = product.images[0]; const url = typeof img === 'string' ? img : img?.url; if (url && !url.includes('localhost:9000') && !url.includes('unsplash')) return url; } return PLACEHOLDER_IMAGE; }

export default function MobileProductCard({ product, onAddToCart, onClick }: MobileProductCardProps) {
  const dragX = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const dragged = useRef(false);
  const backgroundOpacity = useTransform(dragX, [0, 80], [0, 1]);
  const backgroundScale = useTransform(dragX, [0, 80], [0.8, 1]);
  const discount = parseInt(product.discount ?? '0');
  const image = getProductImage(product);
  const soldOut = typeof product.stock === 'number' && product.stock <= 0;
  const add = () => { if (soldOut) { toast.error(`${product.name} is currently out of stock.`); return; } onAddToCart(product); toast.success(`Added ${product.name} to cart!`); };
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => { setIsDragging(false); dragged.current = Math.abs(info.offset.x) > 8; if (info.offset.x > 80) add(); window.setTimeout(() => { dragged.current = false; }, 0); };
  const handleClick = () => { if (!isDragging && !dragged.current) onClick(); };

  return <motion.article className="relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-[0_4px_16px_var(--shadow-card)] h-full" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.4 }} aria-label={product.name}>
    <motion.div className="absolute inset-y-0 left-0 bg-[var(--color-action)] flex items-center justify-start pl-6 rounded-l-2xl z-0 pointer-events-none" style={{ width: '100%', opacity: backgroundOpacity, scale: backgroundScale, transformOrigin: 'left center' }} aria-hidden="true"><div className="flex flex-col items-center gap-0.5 text-white"><ShoppingCart size={20} /><span className="text-[9px] font-bold tracking-wider">ADD</span></div></motion.div>
    <motion.div drag={soldOut ? false : 'x'} dragConstraints={{ left: 0, right: 120 }} dragElastic={{ left: 0, right: 0.15 }} dragSnapToOrigin onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd} onClick={handleClick} className="bg-[var(--color-surface)] p-3 z-10 relative flex flex-col h-full cursor-pointer select-none active:scale-[0.98] transition-transform duration-100" role="button" tabIndex={0} aria-label={`View ${product.name}`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); } }}>
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[var(--color-background)]"><img src={image} alt={product.name} className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" onError={(event) => { const target = event.currentTarget; if (!target.dataset.fallback) { target.dataset.fallback = 'true'; target.src = PLACEHOLDER_IMAGE; } }} />{discount > 0 && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[var(--color-accent)] text-white shadow-sm">{product.discount} OFF</div>}{soldOut && <div className="absolute inset-0 flex items-center justify-center bg-black/35"><span className="px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-[10px] font-bold tracking-wider text-[var(--color-text-primary)]">OUT OF STOCK</span></div>}</div>
      <h4 className="text-xs font-semibold line-clamp-2 text-[var(--color-text-primary)] mb-1 flex-grow">{product.name}</h4>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-border-subtle)]"><div className="flex flex-col"><span className="text-xs font-bold text-[var(--color-text-primary)]">₹{product.price}</span>{product.mrp > product.price && <span className="text-[9px] line-through text-[var(--color-text-muted)]">₹{product.mrp}</span>}</div>{soldOut ? <span className="text-[8px] font-semibold tracking-wider text-[var(--color-text-muted)]">Unavailable</span> : <button type="button" className="text-[8px] font-medium tracking-wider text-[var(--color-accent)] border border-[var(--color-accent-soft)] px-2 py-1 rounded-full bg-[var(--color-accent-soft)]" aria-label={`Add ${product.name} to cart`} onClick={(event) => { event.stopPropagation(); add(); }}>Swipe ➔</button>}</div>
    </motion.div>
  </motion.article>;
}
