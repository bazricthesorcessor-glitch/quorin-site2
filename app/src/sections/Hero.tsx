import { motion } from 'framer-motion';
import { ArrowRight, Palette, Flame, Sparkles, Wrench, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { quorinData, getProductId, type Category } from '@/data/products';

const featuredCategories = quorinData.categories.slice(0, 3);
const allProducts = quorinData.categories.flatMap((category) => category.products);
const featuredProducts = allProducts.slice(0, 8);

const categoryArt: Record<string, { src: string; position: string }> = {
  'resin-art': { src: '/resin_category.webp', position: 'center 42%' },
  'candle-making': { src: '/candle_category.webp', position: 'center 48%' },
  'soap-making': { src: '/soap_category.webp', position: 'center 50%' },
  'tools': { src: '/tools-category.webp', position: 'center 38%' },
  'craft-supplies': { src: '/craft-supplies.webp', position: 'center 40%' },
};

const getCategoryPreviewImage = (category: Category) => categoryArt[category.id]?.src ?? category.products[0]?.images_local?.[0] ?? category.products[0]?.images?.[0] ?? '';
const productImage = (index: number) => featuredProducts[index]?.images_local?.[0] ?? featuredProducts[index]?.images?.[0] ?? '';
const categoryIconMap: Record<string, typeof Palette> = {
  'resin-art': Palette, 'candle-making': Flame, 'soap-making': Sparkles,
  'tools': Wrench, 'craft-supplies': PackageOpen,
};

const allCategoryCards = [
  ...featuredCategories.map((cat) => ({
    id: cat.id, title: cat.title, subtitle: 'Explore Collection',
    src: getCategoryPreviewImage(cat), position: categoryArt[cat.id]?.position ?? 'center',
    href: `/category/${cat.id}`, icon: categoryIconMap[cat.id],
  })),
  { id: 'tools', title: 'Tools', subtitle: 'Explore Collection', src: categoryArt['tools']!.src, position: categoryArt['tools']!.position, href: '/tools', icon: categoryIconMap['tools'] },
  { id: 'craft-supplies', title: 'Craft Supplies', subtitle: 'Explore Collection', src: categoryArt['craft-supplies']!.src, position: categoryArt['craft-supplies']!.position, href: '/craft-supplies', icon: categoryIconMap['craft-supplies'] },
];

const testimonials = [
  { quote: 'The quality is exceptional! My resin art has never looked this professional.', name: 'Priya Sharma', role: 'Resin Artist' },
  { quote: 'Beginner friendly kits with everything you need. Highly recommended for starters!', name: 'Ankit Verma', role: 'DIY Creator' },
  { quote: 'Fast delivery, premium products, and amazing customer support. Love Quorin!', name: 'Neha Iyer', role: 'Soap Maker' },
];

function GoldenVine() {
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 120 860" fill="none" className="pointer-events-none absolute left-[41%] top-0 z-20 hidden h-[860px] w-[120px] -translate-x-1/2 overflow-visible lg:block">
        <path d="M58 -6C59 55 52 104 61 155C70 206 78 235 62 282C46 329 35 360 48 407C61 454 74 487 61 535C48 583 39 620 53 668C64 708 67 750 57 840" stroke="#C99A4D" strokeWidth="1.25" strokeLinecap="round"/>
        <path d="M68 92C78 84 86 73 93 61C80 63 72 75 68 92Z" stroke="#C99A4D" strokeWidth="1.1"/>
        <path d="M49 198C39 191 31 181 25 169C37 172 45 181 49 198Z" stroke="#C99A4D" strokeWidth="1.1"/>
        <path d="M67 298C76 292 84 281 89 269C77 272 70 283 67 298Z" stroke="#C99A4D" strokeWidth="1.1"/>
        <path d="M49 392C39 387 31 379 25 368C37 370 45 379 49 392Z" stroke="#C99A4D" strokeWidth="1.1"/>
        <path d="M67 494C78 488 86 477 91 465C79 468 71 479 67 494Z" stroke="#C99A4D" strokeWidth="1.1"/>
        <path d="M49 596C39 591 31 582 25 571C37 574 45 583 49 596Z" stroke="#C99A4D" strokeWidth="1.1"/>
        <path d="M68 706C78 699 86 689 92 676C79 678 71 689 68 706Z" stroke="#C99A4D" strokeWidth="1.1"/>
        <circle cx="58" cy="92" r="3.8" fill="#C99A4D"/>
        <circle cx="48" cy="298" r="3.4" fill="#C99A4D"/>
        <circle cx="61" cy="494" r="3.4" fill="#C99A4D"/>
        <circle cx="54" cy="706" r="3.4" fill="#C99A4D"/>
      </svg>

      <svg aria-hidden="true" viewBox="0 0 64 420" fill="none" className="pointer-events-none absolute right-2 top-14 z-20 h-[420px] w-[64px] overflow-visible lg:hidden">
        <path d="M31 0C34 46 25 74 33 111C41 148 47 177 34 208C21 239 13 268 22 304C31 340 39 370 29 420" stroke="#C99A4D" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M36 68C44 62 49 53 53 43C45 45 39 53 36 68Z" stroke="#C99A4D" strokeWidth="1.05"/>
        <path d="M27 155C20 150 15 142 11 132C20 134 25 141 27 155Z" stroke="#C99A4D" strokeWidth="1.05"/>
        <path d="M36 247C44 241 49 233 53 223C45 225 39 233 36 247Z" stroke="#C99A4D" strokeWidth="1.05"/>
        <path d="M27 335C20 330 15 322 11 312C20 314 25 321 27 335Z" stroke="#C99A4D" strokeWidth="1.05"/>
      </svg>
    </>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const heroImage = '/hero-image.webp';
  const categoryCards = allCategoryCards;

  return (
    <section className="relative overflow-hidden pb-24 md:pb-10 pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(201,169,110,.12),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(201,169,110,.08),transparent_26%)]" />
      <div className="relative mx-auto max-w-[1400px] px-3 pt-3 sm:px-4 md:px-8 md:pt-5">
        <div className="relative overflow-hidden rounded-[28px] border border-[rgba(232,226,217,.9)] bg-[rgba(255,252,247,.92)] shadow-[0_24px_70px_rgba(42,33,24,.08)]">
          <GoldenVine />
          <div className="relative min-h-[560px] lg:grid lg:min-h-[650px] lg:grid-cols-[.78fr_1.22fr]">
            <div className="relative z-10 px-6 pb-7 pt-16 md:px-10 lg:flex lg:flex-col lg:justify-center lg:px-14 lg:py-16 hidden lg:flex">
              <motion.p className="mb-5 flex items-center gap-5 text-[9px] font-medium uppercase tracking-[.48em] text-[#3D3731] before:h-px before:w-10 before:bg-[#C9A96E]/65 after:h-px after:w-10 after:bg-[#C9A96E]/65" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>Made for Makers</motion.p>
              <motion.h1 className="quorin-brand text-[clamp(3.5rem,14vw,7rem)] font-normal leading-[.84] tracking-[.025em] text-[#C9A35D]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>QUORIN</motion.h1>
              <p className="mt-7 max-w-[350px] text-[15px] leading-[1.65] text-[#3E3730]">Premium crafting supplies for resin art,<br className="hidden sm:block"/> candle making, and soap making.<br/><span className="font-medium text-[#C99A4D]">Everything you need to bring your<br className="hidden sm:block"/> creative vision to life.</span></p>
              <div className="mt-8 flex max-w-[380px] flex-col gap-3 sm:flex-row lg:max-w-none"><button onClick={() => navigate('/search')} className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#D0A85A] px-6 text-[10px] font-semibold uppercase tracking-[.2em] text-white">Explore Collection <ArrowRight size={16}/></button><button onClick={() => navigate('/search')} className="inline-flex h-12 items-center justify-center rounded-full border border-[#D0A85A] px-6 text-[10px] font-semibold uppercase tracking-[.2em] text-[#B98C43]">Shop Best Sellers</button></div>
              <div className="mt-10 hidden items-center gap-3 text-[9px] font-medium uppercase tracking-[.38em] text-[#3D3731] lg:flex"><span className="relative block h-7 w-4 rounded-full border border-[#3D3731]"><span className="absolute left-1/2 top-1 h-1.5 w-px -translate-x-1/2 bg-[#3D3731]"/></span>Scroll to Explore</div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-full overflow-hidden lg:relative lg:w-auto lg:min-h-[650px]"><img src="/hero-mobile.webp" alt="" className="h-full w-full object-cover lg:hidden" style={{ objectPosition: '78% center' }} /><img src={heroImage} alt="QUORIN creative supplies" className="absolute inset-0 hidden h-full w-full object-cover lg:block" style={{ objectPosition: 'center 48%' }}/></div>
          </div>
          <div className="relative rounded-t-[30px] bg-[#FBF8F2] px-5 pb-9 pt-8 md:px-10 lg:px-14 lg:pb-14"><div className="lg:grid lg:grid-cols-2 lg:items-end lg:gap-16"><div><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">What We Sell</div><h2 className="mt-2 font-serif text-[2.15rem] font-semibold leading-none">Our <span className="text-[#C99A4D]">Categories</span></h2></div><p className="mt-4 max-w-md text-[14px] leading-6 text-[var(--color-text-secondary)] lg:mt-0">From crystal-clear resins to aromatic candle supplies —<br className="hidden xl:block"/> find everything you need for your next creative project.</p></div><div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-5">{categoryCards.map((category) => { const Icon=category.icon; return <button key={category.id} onClick={() => navigate(category.href)} className="group relative min-h-[132px] overflow-hidden rounded-[18px] text-left shadow-[0_14px_30px_rgba(42,33,24,.14)] lg:min-h-[270px]"><img src={category.src} alt="" className="absolute inset-0 h-full w-full object-cover" style={{objectPosition:category.position}}/><div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/18 to-black/10 lg:bg-gradient-to-t lg:from-black/70 lg:via-black/10 lg:to-transparent"/><div className="relative flex min-h-[132px] items-center gap-4 p-4 text-white lg:min-h-[270px] lg:items-end"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#C99A4D]"><Icon size={22}/></span><div className="flex-1"><div className="font-serif text-[1.35rem] font-semibold">{category.title}</div><div className="mt-1 text-[9px] font-semibold uppercase tracking-[.18em]">Explore Collection →</div></div><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#2A2118]"><ArrowRight size={17}/></span></div></button>})}</div></div>
        </div>
        <div className="mx-auto max-w-[1320px] px-1 py-12 md:px-6 md:py-20"><div className="text-center"><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">Popular Picks</div><h2 className="mt-2 font-serif text-4xl font-semibold">Best <span className="text-[#C99A4D]">Sellers</span></h2></div><div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">{featuredProducts.map((product,index)=><button key={getProductId(product)} onClick={()=>navigate(`/product/${getProductId(product)}`)} className="min-w-0 overflow-hidden rounded-[16px] border border-[#E8E2D9] bg-white text-left shadow-[0_8px_24px_rgba(42,33,24,.07)]"><div className="relative aspect-square overflow-hidden bg-[#F4EFE7]"><img src={productImage(index)} alt={product.name} className="h-full w-full object-cover"/><span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[8px] font-semibold text-[#D08735]">{index===0?'Best Seller':index===1?'Trending':index===2?'New':'Popular'}</span></div><div className="p-2.5 sm:p-4"><div className="line-clamp-2 min-h-[36px] text-[11px] font-semibold leading-[18px] text-[#211A14] sm:min-h-[44px] sm:text-sm sm:leading-[22px]">{product.name}</div><div className="mt-2 flex flex-wrap items-baseline gap-x-2"><span className="text-[15px] font-bold sm:text-lg">₹{product.price}</span>{product.compare_price?<span className="text-[10px] text-[#8E867D] line-through sm:text-xs">₹{product.compare_price}</span>:null}</div></div></button>)}</div><div className="mt-7 text-center"><button onClick={()=>navigate('/search')} className="inline-flex h-12 items-center gap-4 rounded-full bg-[#D0A85A] px-8 text-[10px] font-semibold uppercase tracking-[.22em] text-white">View All Products <ArrowRight size={16}/></button></div></div>
        <div className="border-y border-[#E8E2D9] py-14 md:py-20"><div className="text-center"><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">Testimonials</div><h2 className="mt-2 font-serif text-4xl font-semibold">What <span className="text-[#C99A4D]">Makers Say</span></h2></div><div className="mt-8 grid gap-4 md:grid-cols-3">{testimonials.map(item=><article key={item.name} className="rounded-[20px] border border-[#E8E2D9] bg-white/80 p-6"><p className="text-[14px] leading-6">“{item.quote}”</p><div className="mt-5 text-sm font-semibold">{item.name}<div className="text-xs font-normal text-[#8A8178]">{item.role}</div></div></article>)}</div></div>
        <div className="py-14 text-center"><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">Follow Us</div><h2 className="mt-2 font-serif text-3xl font-semibold">@quorin.<span className="text-[#C99A4D]">crafts</span></h2><div className="mt-7 grid grid-cols-5 gap-2">{[0,1,2,3,4].map(index=><div key={index} className="aspect-square overflow-hidden rounded-[12px] bg-[#F1ECE4]"><img src={productImage(index)} alt="" className="h-full w-full object-cover"/></div>)}</div></div>
        <div className="mb-10 rounded-[26px] border border-[#E8E2D9] bg-[#F7F1E7] p-7 text-center"><div className="text-[9px] uppercase tracking-[.42em] text-[#C79B50]">Join the Craft Club</div><p className="mx-auto mt-3 max-w-2xl text-[14px] leading-6 text-[#4B433B]">Get first access to new drops, bundles, and creator-only offers.</p><button onClick={()=>navigate('/search')} className="mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-[#D0A85A] px-8 text-[10px] font-semibold uppercase tracking-[.22em] text-white">Start Shopping <ArrowRight size={16}/></button></div>
      </div>
    </section>
  );
}