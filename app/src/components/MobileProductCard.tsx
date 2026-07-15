import { useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'framer-motion';
import { Check, ShoppingCart } from 'lucide-react';
import type { Product } from '@/data/products';
import { toast } from 'sonner';

interface MobileProductCardProps { product: Product; onAddToCart: (product: Product) => void; onClick: () => void; }
const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="#F8F5EF"><rect width="400" height="400"/><text x="200" y="200" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="48" fill="#C9A96E">Q</text></svg>')}`;
const SWIPE_COMMIT = 92;
function getProductImage(product: Product): string { if (product.images_local?.length) return product.images_local[0]; if (product.images?.length) { const img = product.images[0]; const url = typeof img === 'string' ? img : img?.url; if (url && !url.includes('localhost:9000') && !url.includes('unsplash')) return url; } return PLACEHOLDER_IMAGE; }

export default function MobileProductCard({ product, onAddToCart, onClick }: MobileProductCardProps) {
  const dragX = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [added, setAdded] = useState(false);
  const dragged = useRef(false);
  const resetTimer = useRef<number | null>(null);
  const revealOpacity = useTransform(dragX, [0, 36, SWIPE_COMMIT], [0, .55, 1]);
  const revealScale = useTransform(dragX, [0, SWIPE_COMMIT], [.82, 1]);
  const discount = parseInt(product.discount ?? '0');
  const image = getProductImage(product);
  const soldOut = typeof product.stock === 'number' && product.stock <= 0;
  const add = () => {
    if (soldOut) { toast.error(`${product.name} is currently out of stock.`); return; }
    onAddToCart(product);
    setAdded(true);
    toast.success(`Added ${product.name} to cart!`);
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setAdded(false), 1400);
  };
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const horizontalIntent = Math.abs(info.offset.x) > Math.abs(info.offset.y) * 1.35;
    dragged.current = horizontalIntent && Math.abs(info.offset.x) > 10;
    if (horizontalIntent && (info.offset.x >= SWIPE_COMMIT || (info.velocity.x > 650 && info.offset.x > 48))) add();
    window.setTimeout(() => { dragged.current = false; }, 0);
  };
  const handleClick = () => { if (!isDragging && !dragged.current) onClick(); };

  return <motion.article className="relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-[0_4px_16px_var(--shadow-card)] h-full" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .35 }} aria-label={product.name}>
    <motion.div className="absolute inset-0 bg-[var(--color-action)] flex items-center justify-start pl-6 z-0 pointer-events-none" style={{ opacity: revealOpacity }} aria-hidden="true"><motion.div style={{ scale: revealScale }} className="flex flex-col items-center gap-1 text-white">{added ? <Check size={21} /> : <ShoppingCart size={21} />}<span className="text-[9px] font-bold tracking-[.12em]">{added ? 'ADDED' : 'ADD'}</span></motion.div></motion.div>
    <motion.div drag={soldOut || reduceMotion ? false : 'x'} dragDirectionLock dragConstraints={{ left: 0, right: 132 }} dragElastic={{ left: 0, right: .12 }} dragSnapToOrigin onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd} onClick={handleClick} className="bg-[var(--color-surface)] p-3 z-10 relative flex flex-col h-full cursor-pointer select-none touch-pan-y active:scale-[.985] transition-transform duration-100" role="button" tabIndex={0} aria-label={`View ${product.name}. ${soldOut ? 'Out of stock.' : 'Swipe right or use Add to cart.'}`} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); } }}>
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[var(--color-background)]"><img src={image} alt={product.name} className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" onError={(event) => { const target = event.currentTarget; if (!target.dataset.fallback) { target.dataset.fallback = 'true'; target.src = PLACEHOLDER_IMAGE; } }} />{discount > 0 && <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[var(--color-accent)] text-white shadow-sm">{product.discount} OFF</div>}{soldOut && <div className="absolute inset-0 flex items-center justify-center bg-black/35"><span className="px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-[10px] font-bold tracking-wider text-[var(--color-text-primary)]">OUT OF STOCK</span></div>}</div>
      <h4 className="text-xs font-semibold line-clamp-2 text-[var(--color-text-primary)] mb-1 flex-grow">{product.name}</h4>
      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-[var(--color-border-subtle)]"><div className="flex flex-col"><span className="text-xs font-bold text-[var(--color-text-primary)]">₹{product.price}</span>{product.mrp > product.price && <span className="text-[9px] line-through text-[var(--color-text-muted)]">₹{product.mrp}</span>}</div>{soldOut ? <span className="text-[8px] font-semibold tracking-wider text-[var(--color-text-muted)]">Unavailable</span> : <button type="button" className="min-h-8 text-[9px] font-semibold tracking-wide text-[var(--color-accent)] border border-[var(--color-accent-soft)] px-2.5 py-1 rounded-full bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]" aria-label={`Add ${product.name} to cart`} onClick={(event) => { event.stopPropagation(); add(); }}>{added ? 'Added ✓' : reduceMotion ? 'Add to cart' : 'Add / Swipe →'}</button>}</div>
    </motion.div>
  </motion.article>;
}
