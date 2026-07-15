import { motion } from 'framer-motion';
import { ArrowRight, Search, ShoppingBag, Star, ShieldCheck, Truck, Sparkles, Heart, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { quorinData, getProductId, type Category } from '@/data/products';

const featuredCategories = quorinData.categories.slice(0, 3);
const featuredProducts = featuredCategories.flatMap((category) => category.products.slice(0, 1));

const getCategoryPreviewImage = (category: Category) => {
  const product = category.products[0];
  return product?.images_local?.[0] ?? product?.images?.[0] ?? '';
};

const getHeroImage = (index: number) => {
  const product = featuredProducts[index];
  return product?.images_local?.[0] ?? product?.images?.[0] ?? '';
};

export default function Hero() {
  const navigate = useNavigate();
  const productImage = getHeroImage(0);

  return (
    <section className="relative overflow-hidden px-4 pt-4 pb-8 md:px-8 md:pt-5 md:pb-10">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 18% 15%, rgba(201,169,110,0.12), transparent 26%), radial-gradient(circle at 82% 28%, rgba(61,43,31,0.08), transparent 24%)' }} />

      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[24px] border border-[rgba(232,226,217,0.95)] bg-[rgba(255,252,247,0.86)] shadow-[0_22px_60px_rgba(42,33,24,0.08)] overflow-hidden">


          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-0">
            <div className="px-5 pt-6 pb-6 md:px-8 md:pt-10 md:pb-10 lg:px-12 lg:pt-14 lg:pb-12">
              <div className="lg:hidden mb-6 flex items-center justify-between">
                <button
                  onClick={() => navigate('/search')}
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(201,169,110,0.12)] bg-white/90 shadow-[0_8px_24px_rgba(42,33,24,0.06)]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                  </svg>
                </button>
                <div className="quorin-brand text-[1.9rem] tracking-[0.18em] text-[var(--color-accent)]">QUORIN</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate('/search')} className="grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(201,169,110,0.12)] bg-white/90 shadow-[0_8px_24px_rgba(42,33,24,0.06)]"><Search size={18} /></button>
                  <button onClick={() => window.dispatchEvent(new CustomEvent('quorin:openCart'))} className="grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(201,169,110,0.12)] bg-white/90 shadow-[0_8px_24px_rgba(42,33,24,0.06)]"><ShoppingBag size={18} /></button>
                  <button onClick={() => window.dispatchEvent(new CustomEvent('quorin:openLogin'))} className="grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(201,169,110,0.12)] bg-white/90 shadow-[0_8px_24px_rgba(42,33,24,0.06)]"><User size={18} /></button>
                </div>
              </div>

              <motion.p
                className="text-[10px] md:text-xs tracking-[0.4em] uppercase mb-4 text-[var(--color-text-muted)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                Made for Makers
              </motion.p>

              <motion.h1
                className="quorin-brand text-[clamp(3.8rem,9vw,7.2rem)] leading-[0.88] tracking-tight text-[var(--color-accent)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                QUORIN
              </motion.h1>

              <motion.p
                className="mt-5 max-w-md text-[15px] md:text-[17px] leading-[1.7] text-[var(--color-text-secondary)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.06 }}
              >
                Premium crafting supplies for resin art, candle making, and soap making. Everything you need to bring your creative vision to life.
              </motion.p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate('/search')}
                  className="inline-flex h-12 items-center gap-3 rounded-full bg-[#D0A85A] px-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_10px_26px_rgba(201,169,110,0.25)]"
                >
                  Explore Collection <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/search')}
                  className="inline-flex h-12 items-center rounded-full border border-[#D0A85A] bg-transparent px-6 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C7A15C]"
                >
                  Shop Best Sellers
                </button>
              </div>

              <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.42em] text-[var(--color-text-muted)]">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[rgba(201,169,110,0.26)] bg-white/80">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M12 4v16" strokeLinecap="round" />
                    <path d="M8 8h8" strokeLinecap="round" />
                  </svg>
                </span>
                <span>Scroll to explore</span>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#D0A85A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[rgba(201,169,110,0.18)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[rgba(201,169,110,0.18)]" />
              </div>
            </div>

            <div className="relative px-4 pb-4 pt-0 md:px-6 md:pb-6 lg:px-12 lg:pt-12 lg:pb-10">
              <div className="relative h-full min-h-[320px] lg:min-h-[640px] rounded-[28px] overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(246,240,232,0.95))]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(201,169,110,0.12),transparent_25%),radial-gradient(circle_at_20%_80%,rgba(201,169,110,0.08),transparent_20%)]" />
                <div className="absolute right-6 top-6 hidden lg:block h-28 w-28 rounded-full overflow-hidden shadow-[0_20px_40px_rgba(42,33,24,0.14)] border border-white/80">
                  <img src={getHeroImage(1)} alt="Resin preview" className="h-full w-full object-cover" />
                </div>
                <div className="absolute left-10 top-16 hidden lg:block h-40 w-40 rounded-full overflow-hidden shadow-[0_24px_50px_rgba(42,33,24,0.18)] border border-white/70">
                  <img src={productImage} alt={featuredProducts[0]?.name ?? 'Featured product'} className="h-full w-full object-cover" />
                </div>
                <div className="absolute right-10 bottom-8 hidden lg:block h-52 w-52 rounded-[30px] overflow-hidden shadow-[0_24px_40px_rgba(42,33,24,0.18)] border border-white/80">
                  <img src={getHeroImage(2)} alt="Soap preview" className="h-full w-full object-cover" />
                </div>

                <div className="absolute inset-x-4 bottom-4 lg:bottom-6 lg:right-6 lg:left-auto lg:w-[54%] rounded-[24px] bg-white/85 backdrop-blur-md border border-[rgba(232,226,217,0.95)] shadow-[0_20px_45px_rgba(42,33,24,0.10)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.35em] text-[var(--color-text-muted)]">Featured Collection</div>
                      <div className="mt-1 quorin-brand text-2xl text-[var(--color-text-primary)]">{featuredProducts[0]?.name}</div>
                    </div>
                    <button
                      onClick={() => featuredProducts[0] && navigate(`/product/${getProductId(featuredProducts[0])}`)}
                      className="grid h-11 w-11 place-items-center rounded-full bg-[#D0A85A] text-white"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {featuredProducts[0]?.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#F5EFE6] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 px-5 pb-5 pt-0 md:px-8 md:pb-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-6 lg:px-12 lg:pb-10 lg:pt-0">
            <div>
              <div className="text-[10px] uppercase tracking-[0.42em] text-[#C7A15C]">What We Sell</div>
              <div className="mt-1 flex items-end gap-2">
                <div className="quorin-brand text-[2.2rem] leading-none text-[var(--color-text-primary)]">Our</div>
                <div className="quorin-brand text-[2.2rem] leading-none text-[#D0A85A]">Categories</div>
              </div>
            </div>
            <p className="max-w-lg text-sm md:text-base leading-relaxed text-[var(--color-text-secondary)] lg:pt-5">
              From crystal-clear resins to aromatic candle supplies — find everything you need for your next creative project.
            </p>
          </div>

          <div className="grid gap-3 px-5 pb-5 md:px-8 md:pb-8 lg:grid-cols-3 lg:gap-4 lg:px-12 lg:pb-12">
            {featuredCategories.map((category) => {
              const image = getCategoryPreviewImage(category);
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/category/${category.id}`)}
                  className="group relative overflow-hidden rounded-[18px] text-left shadow-[0_16px_30px_rgba(42,33,24,0.14)]"
                  style={{ minHeight: 165 }}
                >
                  <img src={image} alt={category.title} className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(42,33,24,0.68)] via-[rgba(42,33,24,0.24)] to-transparent" />
                  <div className="relative z-10 flex min-h-[165px] items-end justify-between px-4 py-4 text-white">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/75">{category.title}</div>
                      <div className="mt-2 quorin-brand text-[1.8rem] leading-none">{category.title}</div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/80">Explore Collection →</div>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-[var(--color-text-primary)]">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pb-4 text-center text-[10px] uppercase tracking-[0.42em] text-[#C7A15C] lg:pb-6">Why Choose Us</div>
        </div>
      </div>
    </section>
  );
}
