import { motion } from 'framer-motion';
import { ArrowRight, Palette, Flame, Sparkles, Wrench, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { quorinData, getProductId, type Category } from '@/data/products';

const featuredCategories = quorinData.categories.slice(0, 3);
const allProducts = quorinData.categories.flatMap((category) => category.products);
const featuredProducts = allProducts.slice(0, 3);

const categoryArt: Record<string, { src: string; position: string }> = {
  'resin-art': { src: '/resin_category.webp', position: 'center 42%' },
  'candle-making': { src: '/candle_category.webp', position: 'center 48%' },
  'soap-making': { src: '/soap_category.webp', position: 'center 50%' },
};

const getCategoryPreviewImage = (category: Category) => categoryArt[category.id]?.src ?? category.products[0]?.images_local?.[0] ?? category.products[0]?.images?.[0] ?? '';
const productImage = (index: number) => featuredProducts[index]?.images_local?.[0] ?? featuredProducts[index]?.images?.[0] ?? '';

const extraCategoryCards = [
  { id: 'tools', title: 'Tools', subtitle: 'Explore Collection', description: 'Heat tools, hand drills and essential equipment for every maker.', src: '/tools-category.webp', search: 'tools', position: 'center', icon: Wrench },
  { id: 'craft-supplies', title: 'Craft Supplies', subtitle: 'Explore Collection', description: 'Glitters, pigments, dyes, additives and finishing supplies.', src: '/craft-supplies.webp', search: 'craft', position: 'center', icon: PackageOpen },
];

const testimonials = [
  { quote: 'The quality is exceptional! My resin art has never looked this professional.', name: 'Priya Sharma', role: 'Resin Artist' },
  { quote: 'Beginner friendly kits with everything you need. Highly recommended for starters!', name: 'Ankit Verma', role: 'DIY Creator' },
  { quote: 'Fast delivery, premium products, and amazing customer support. Love Quorin!', name: 'Neha Iyer', role: 'Soap Maker' },
];

export default function Hero() {
  const navigate = useNavigate();
  const heroImage = productImage(0) || '/resin_category.webp';
  const categoryCards = [
    ...featuredCategories.map((category, index) => ({ id: category.id, title: category.title, subtitle: 'Explore Collection', src: getCategoryPreviewImage(category), position: categoryArt[category.id]?.position ?? 'center', href: `/category/${category.id}`, icon: [Palette, Flame, Sparkles][index] })),
    ...extraCategoryCards.map((category) => ({ ...category, href: `/search?q=${encodeURIComponent(category.search)}` })),
  ];

  return <section className="relative overflow-hidden pb-24 md:pb-10">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,169,110,.12),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(201,169,110,.08),transparent_26%)]" />
    <div className="relative mx-auto max-w-[1400px] px-3 pt-3 sm:px-4 md:px-8 md:pt-5">
      <div className="overflow-hidden rounded-[28px] border border-[rgba(232,226,217,.9)] bg-[rgba(255,252,247,.92)] shadow-[0_24px_70px_rgba(42,33,24,.08)]">
        <div className="relative grid min-h-[620px] lg:grid-cols-[.78fr_1.22fr] lg:min-h-[650px]">
          <div className="relative z-10 px-6 pb-7 pt-16 md:px-10 lg:flex lg:flex-col lg:justify-center lg:px-14 lg:py-16">
            <motion.p className="mb-5 flex items-center gap-4 text-[9px] uppercase tracking-[.46em] text-[var(--color-text-muted)] before:h-px before:w-10 before:bg-[#C9A96E]/50 after:h-px after:w-10 after:bg-[#C9A96E]/50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>Made for Makers</motion.p>
            <motion.h1 className="quorin-brand text-[clamp(3.5rem,14vw,7rem)] leading-[.84] tracking-[-.04em] text-[#C9A35D]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>QUORIN</motion.h1>
            <p className="mt-6 max-w-[330px] text-[16px] leading-[1.55] text-[var(--color-text-secondary)]">Premium crafting supplies for resin art, candle making, and soap making.</p>
            <p className="mt-1 max-w-[260px] text-[16px] font-medium leading-[1.55] text-[#C99A4D]">Bring your creative vision to life.</p>
            <div className="mt-8 flex max-w-[360px] flex-col gap-3 sm:flex-row lg:max-w-none">
              <button type="button" onClick={() => navigate('/search')} className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#D0A85A] px-6 text-[10px] font-semibold uppercase tracking-[.2em] text-white shadow-[0_12px_28px_rgba(201,169,110,.28)]">Explore Collection <ArrowRight size={16} /></button>
              <button type="button" onClick={() => navigate('/search')} className="inline-flex h-12 items-center justify-center rounded-full border border-[#D0A85A] bg-white/45 px-6 text-[10px] font-semibold uppercase tracking-[.2em] text-[#B98C43]">Shop Best Sellers</button>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden lg:min-h-[650px]">
            <img src={heroImage} alt={featuredProducts[0]?.name ?? 'QUORIN creative supplies'} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: 'center 48%' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,252,247,.2)] via-transparent to-transparent lg:from-[rgba(255,252,247,.38)]" />
          </div>
        </div>

        <div className="rounded-t-[30px] bg-[#FBF8F2] px-5 pb-9 pt-8 md:px-10 lg:px-14 lg:pb-14">
          <div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">What We Sell</div>
          <h2 className="mt-2 font-serif text-[2.15rem] font-semibold leading-none text-[var(--color-text-primary)] md:text-5xl">Our <span className="text-[#C99A4D]">Categories</span></h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-6 text-[var(--color-text-secondary)]">From crystal-clear resins to aromatic candle supplies — find everything you need for your next creative project.</p>
          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-5">
            {categoryCards.map((category) => { const Icon = category.icon; return <button type="button" key={category.id} onClick={() => navigate(category.href)} className="group relative min-h-[132px] overflow-hidden rounded-[18px] text-left shadow-[0_14px_30px_rgba(42,33,24,.14)] lg:min-h-[270px]">
              <img src={category.src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" style={{ objectPosition: category.position }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/18 to-black/10 lg:bg-gradient-to-t lg:from-black/70 lg:via-black/10 lg:to-transparent" />
              <div className="relative flex h-full min-h-[132px] items-center gap-4 p-4 text-white lg:min-h-[270px] lg:items-end">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#C99A4D] shadow-lg"><Icon size={22} strokeWidth={1.7} /></span>
                <div className="min-w-0 flex-1"><div className="font-serif text-[1.35rem] font-semibold leading-tight lg:text-2xl">{category.title}</div><div className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em] text-white/90">{category.subtitle} →</div></div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#2A2118]"><ArrowRight size={17} /></span>
              </div>
            </button>; })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-2 py-14 md:px-6 md:py-20">
        <div className="text-center"><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">Popular Picks</div><h2 className="mt-2 font-serif text-4xl font-semibold">Best <span className="text-[#C99A4D]">Sellers</span></h2></div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {featuredProducts.map((product, index) => <button key={getProductId(product)} type="button" onClick={() => navigate(`/product/${getProductId(product)}`)} className="overflow-hidden rounded-[20px] border border-[#E8E2D9] bg-white text-left shadow-[0_12px_34px_rgba(42,33,24,.07)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F4EFE7]"><img src={productImage(index)} alt={product.name} className="h-full w-full object-cover" /><span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#D08735]">{index === 0 ? 'Best Seller' : index === 1 ? 'Trending' : 'New'}</span></div>
            <div className="p-4"><div className="min-h-[48px] text-[15px] font-semibold leading-6 text-[#211A14]">{product.name}</div><div className="mt-4 flex items-center gap-3"><span className="text-lg font-bold">₹{product.price}</span>{product.compare_price ? <span className="text-sm text-[#8E867D] line-through">₹{product.compare_price}</span> : null}</div></div>
          </button>)}
        </div>
        <div className="mt-7 text-center"><button type="button" onClick={() => navigate('/search')} className="inline-flex h-12 items-center gap-4 rounded-full bg-[#D0A85A] px-8 text-[10px] font-semibold uppercase tracking-[.22em] text-white">View All Products <ArrowRight size={16} /></button></div>
      </div>

      <div className="border-y border-[#E8E2D9] py-14 md:py-20">
        <div className="text-center"><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">Testimonials</div><h2 className="mt-2 font-serif text-4xl font-semibold">What <span className="text-[#C99A4D]">Makers Say</span></h2></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{testimonials.map((item) => <article key={item.name} className="rounded-[20px] border border-[#E8E2D9] bg-white/80 p-6 shadow-[0_10px_30px_rgba(42,33,24,.06)]"><p className="min-h-[72px] text-[14px] leading-6 text-[#3D342B]">“{item.quote}”</p><div className="mt-5 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[#F1E7D5] font-serif font-bold text-[#B98C43]">{item.name.charAt(0)}</div><div><div className="text-sm font-semibold">{item.name}</div><div className="text-xs text-[#8A8178]">{item.role}</div></div></div></article>)}</div>
      </div>

      <div className="py-14 text-center md:py-20"><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">Follow Us</div><h2 className="mt-2 font-serif text-3xl font-semibold">@quorin.<span className="text-[#C99A4D]">crafts</span></h2><div className="mt-7 grid grid-cols-5 gap-2 md:gap-4">{[0,1,2,3,4].map((index) => <div key={index} className="aspect-square overflow-hidden rounded-[16px] bg-[#F1ECE4]"><img src={index < 3 ? productImage(index) : categoryCards[index - 2]?.src} alt="" className="h-full w-full object-cover" /></div>)}</div></div>

      <div className="mb-10 overflow-hidden rounded-[26px] border border-[#E8E2D9] bg-[#F7F1E7] p-7 shadow-[0_14px_38px_rgba(42,33,24,.06)] md:p-10"><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">Stay Inspired</div><h2 className="mt-2 max-w-md font-serif text-3xl font-semibold">Join Our<br/>Creative Community</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#5B5045]">Get exclusive offers, crafting tips, new product updates, and creative inspiration straight to your inbox.</p><form className="mt-6 flex max-w-xl gap-2" onSubmit={(event) => event.preventDefault()}><input aria-label="Email address" type="email" placeholder="Enter your email address" className="min-w-0 flex-1 rounded-xl border border-[#E8E2D9] bg-white px-4 text-sm outline-none focus:border-[#C9A96E]"/><button type="submit" className="rounded-xl bg-[#C99A4D] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.15em] text-white">Subscribe</button></form><p className="mt-2 text-[11px] text-[#8A8178]">No spam. Unsubscribe anytime.</p></div>
    </div>
  </section>;
}