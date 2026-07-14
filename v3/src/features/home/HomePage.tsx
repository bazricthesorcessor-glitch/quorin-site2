import { ArrowRight, Gem, HeartHandshake, PackageCheck, Sparkles } from "lucide-react";
import { MobileDock } from "../../components/navigation/MobileDock";
import { SiteHeader } from "../../components/navigation/SiteHeader";
import { SectionHeading } from "../../components/primitives/SectionHeading";
import "../../components/primitives/primitives.css";
import "./home.css";

const categories=[
 {title:"Resin Art",copy:"Pigments, molds and finishing essentials",tone:"rose"},
 {title:"Candle Making",copy:"Wax, fragrance and tools for a warmer glow",tone:"sand"},
 {title:"Soap Making",copy:"Thoughtful ingredients for small-batch craft",tone:"sage"},
 {title:"Creative Kits",copy:"Everything you need to begin beautifully",tone:"lilac"}
];
const values=[
 {icon:Gem,title:"Curated quality",copy:"Materials selected for makers who care about the finish."},
 {icon:PackageCheck,title:"Packed with care",copy:"Orders prepared thoughtfully so your supplies arrive ready to create."},
 {icon:HeartHandshake,title:"Made for makers",copy:"Practical guidance and a community that grows with your craft."},
 {icon:Sparkles,title:"Fresh inspiration",copy:"New materials, techniques and project ideas worth exploring."}
];
export function HomePage(){return <div className="home-page"><SiteHeader/><main>
<section className="home-hero" aria-labelledby="home-hero-title"><div className="q-container home-hero__content"><p className="home-hero__eyebrow">Materials for makers</p><h1 id="home-hero-title" className="q-display home-hero__title">Make something worth keeping.</h1><p className="home-hero__copy">Premium supplies, thoughtful tools and inspiration for handcrafted work.</p><a className="home-hero__cta" href="/search">Explore the collection <ArrowRight size={18}/></a></div><div className="home-hero__art" aria-hidden="true"><span className="home-hero__orb home-hero__orb--one"/><span className="home-hero__orb home-hero__orb--two"/><span className="home-hero__object"/></div></section>
<section className="q-section home-categories"><div className="q-container"><SectionHeading eyebrow="Explore your craft" title="Made for the way you create" copy="Find materials and tools organized around the crafts you love."/><div className="home-categories__grid">{categories.map(category=><a className={`category-card category-card--${category.tone}`} href="/search" key={category.title}><div className="category-card__visual"><span/></div><div className="category-card__body"><h3>{category.title}</h3><p>{category.copy}</p><span className="category-card__link">Shop collection <ArrowRight size={16}/></span></div></a>)}</div></div></section>
<section className="q-section home-values"><div className="q-container"><SectionHeading eyebrow="The QUORIN difference" title="Why makers shop with us"/><div className="home-values__grid">{values.map(({icon:Icon,title,copy})=><article className="value-card" key={title}><span className="value-card__icon"><Icon size={22}/></span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
<section className="q-section home-placeholder"><div className="q-container"><SectionHeading eyebrow="Coming into focus" title="Best sellers, stories and community" copy="The structural foundation is now in place. Product rails and media will be connected to the preserved QUORIN assets and Medusa catalog during visual calibration."/></div></section>
</main><MobileDock/></div>}
