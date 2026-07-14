import { SiteHeader } from "../../components/navigation/SiteHeader";
import { MobileDock } from "../../components/navigation/MobileDock";
import "./home.css";
export function HomePage(){return <div className="home-page"><SiteHeader/><main><section className="home-hero" aria-labelledby="home-hero-title"><div className="q-container home-hero__content"><p className="home-hero__eyebrow">Materials for makers</p><h1 id="home-hero-title" className="q-display home-hero__title">Make something worth keeping.</h1><p className="home-hero__copy">Premium supplies, thoughtful tools and inspiration for handcrafted work.</p><a className="home-hero__cta" href="/search">Explore the collection</a></div></section></main><MobileDock/></div>}
