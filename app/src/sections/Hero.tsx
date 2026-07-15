import { motion } from 'framer-motion';
import { ArrowRight, Search, ShoppingBag, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { quorinData, getProductId, type Category } from '@/data/products';

const featuredCategories = quorinData.categories.slice(0, 3);
const featuredProducts = featuredCategories.flatMap((category) => category.products.slice(0, 1));

const categoryArt: Record<string, { src: string; position: string }> = {
  'resin-art': { src: '/resin_category.webp', position: 'center 42%' },
  'candle-making': { src: '/candle_category.webp', position: 'center 48%' },
  'soap-making': { src: '/soap_category.webp', position: 'center 50%' },
};

const getCategoryPreviewImage = (category: Category) => categoryArt[category.id]?.src ?? category.products[0]?.images_local?.[0] ?? category.products[0]?.images?.[0] ?? '';
const getHeroImage = (index: number) => featuredProducts[index]?.images_local?.[0] ?? featuredProducts[index]?.images?.[0] ?? '';

export default function Hero() {
  const navigate = useNavigate();
  const productImage = getHeroImage(0);
  return <section className="relative overflow-hidden px-3 pb-7 pt-3 sm:px-4 md:px-8 md:pb-10 md:pt-5">
    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 18% 15%, rgba(201,169,110,.12), transparent 26%), radial-gradient(circle at 82% 28%, rgba(61,43,31,.08), transparent 24%)' }} />
    <div className="mx-auto max-w-[1400px]"><div className="overflow-hidden rounded-[24px] border border-[rgba(232,226,217,.95)] bg-[rgba(255,252,247,.86)] shadow-[0_22px_60px_rgba(42,33,24,.08)]">
      <div className="grid lg:grid-cols-[.88fr_1.12fr]">
        <div className="px-5 pb-7 pt-5 md:px-8 md:py-10 lg:px-12 lg:py-14">
          <div className="mb-7 flex items-center justify-between lg:hidden"><button type="button" aria-label="Open search" onClick={() => navigate('/search')} className="grid h-11 w-11 place-items-center rounded-2xl border border-[rgba(201,169,110,.12)] bg-white/90"><Search size={18} /></button><div className="quorin-brand text-[1.7rem] tracking-[.18em] text-[var(--color-accent)]">QUORIN</div><div className="flex gap-1.5"><button type="button" aria-label="Open shopping bag" onClick={() => window.dispatchEvent(new CustomEvent('quorin:openCart'))} className="grid h-11 w-11 place-items-center rounded-2xl border border-[rgba(201,169,110,.12)] bg-white/90"><ShoppingBag size={18} /></button><button type="button" aria-label="Open account" onClick={() => window.dispatchEvent(new CustomEvent('quorin:openLogin'))} className="grid h-11 w-11 place-items-center rounded-2xl border border-[rgba(201,169,110,.12)] bg-white/90"><User size={18} /></button></div></div>
          <motion.p className="mb-3 text-[10px] uppercase tracking-[.4em] text-[var(--color-text-muted)]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>Made for Makers</motion.p>
          <motion.h1 className="quorin-brand text-[clamp(3.4rem,9vw,7rem)] leading-[.88] tracking-tight text-[var(--color-accent)]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>QUORIN</motion.h1>
          <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-[var(--color-text-secondary)] md:text-[17px]">Premium crafting supplies for resin art, candle making, and soap making. Everything you need to bring your creative vision to life.</p>
          <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => navigate('/search')} className="inline-flex h-12 items-center gap-3 rounded-full bg-[#D0A85A] px-6 text-[11px] font-semibold uppercase tracking-[.24em] text-white shadow-[0_10px_26px_rgba(201,169,110,.25)]">Explore Collection <ArrowRight size={16} /></button><button type="button" onClick={() => navigate('/search')} className="inline-flex h-12 items-center rounded-full border border-[#D0A85A] px-6 text-[11px] font-semibold uppercase tracking-[.22em] text-[#C7A15C]">Best Sellers</button></div>
        </div>

        <div className="relative p-3 pt-0 md:p-6 md:pt-0 lg:p-10 lg:pl-0">
          <div className="relative min-h-[430px] overflow-hidden rounded-[26px] bg-[#eee6da] sm:min-h-[520px] lg:min-h-[650px]">
            <img src={productImage} alt={featuredProducts[0]?.name ?? 'Featured QUORIN product'} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: 'center 45%' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(24,18,12,.52)] via-transparent to-[rgba(255,255,255,.08)]" />
            <div className="absolute left-4 top-4 flex gap-2 sm:left-6 sm:top-6">{featuredProducts.slice(0, 3).map((product, index) => <button key={getProductId(product)} type="button" aria-label={`View ${product.name}`} onClick={() => navigate(`/product/${getProductId(product)}`)} className={`h-14 w-14 overflow-hidden rounded-full border-2 shadow-lg sm:h-16 sm:w-16 ${index === 0 ? 'border-white' : 'border-white/60'}`}><img src={getHeroImage(index)} alt="" className="h-full w-full object-cover" /></button>)}</div>
            <div className="absolute inset-x-4 bottom-4 rounded-[22px] border border-white/45 bg-[rgba(255,252,247,.88)] p-4 shadow-[0_20px_45px_rgba(42,33,24,.16)] backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[58%]">
              <div className="text-[9px] uppercase tracking-[.34em] text-[var(--color-text-muted)]">Featured Collection</div><div className="mt-1 quorin-brand text-2xl text-[var(--color-text-primary)]">{featuredProducts[0]?.name}</div><button type="button" onClick={() => featuredProducts[0] && navigate(`/product/${getProductId(featuredProducts[0])}`)} className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.25em] text-[var(--color-accent)]">View product <ArrowRight size={15} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 pt-5 md:px-8 lg:px-12"><div className="text-[10px] uppercase tracking-[.4em] text-[#C7A15C]">What We Sell</div><div className="mt-1 quorin-brand text-[2.1rem] leading-none text-[var(--color-text-primary)]">Our <span className="text-[#D0A85A]">Categories</span></div></div>
      <div className="grid gap-3 px-5 pb-7 md:grid-cols-3 md:px-8 lg:px-12 lg:pb-12">{featuredCategories.map((category) => { const art = categoryArt[category.id]; return <button type="button" key={category.id} onClick={() => navigate(`/category/${category.id}`)} className="group relative min-h-[190px] overflow-hidden rounded-[20px] text-left shadow-[0_14px_30px_rgba(42,33,24,.13)] md:min-h-[260px]"><img src={getCategoryPreviewImage(category)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" style={{ objectPosition: art?.position ?? 'center' }} /><div className="absolute inset-0 bg-gradient-to-t from-[rgba(25,18,12,.72)] via-[rgba(25,18,12,.1)] to-transparent" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white"><div><div className="text-[9px] uppercase tracking-[.28em] text-white/70">Explore collection</div><div className="mt-1 quorin-brand text-[1.7rem]">{category.title}</div></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[var(--color-text-primary)]"><ArrowRight size={18} /></span></div></button>; })}</div>
    </div></div>
  </section>;
}
