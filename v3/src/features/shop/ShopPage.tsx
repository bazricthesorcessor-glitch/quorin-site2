import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "../../components/commerce/ProductCard";
import { SiteHeader } from "../../components/navigation/SiteHeader";
import { MobileDock } from "../../components/navigation/MobileDock";
import { catalogProducts } from "../../data/catalog";
import "./shop.css";
export function ShopPage(){return <div className="shop-page"><SiteHeader/><main className="q-container shop"><header className="shop__header"><p>QUORIN COLLECTION</p><h1 className="q-display">Find your next material.</h1><span>Explore tools, pigments and kits selected for hands-on makers.</span></header><div className="shop__toolbar"><label><Search size={18}/><input placeholder="Search products" aria-label="Search products"/></label><button type="button"><SlidersHorizontal size={18}/> Filters</button></div><div className="shop__chips" aria-label="Product categories"><button>All</button><button>Resin Art</button><button>Candle Making</button><button>Soap Making</button></div><section className="shop__grid" aria-label="Products">{catalogProducts.map(product=><a href={`/product/${product.id}`} key={product.id}><ProductCard product={product}/></a>)}</section></main><MobileDock/></div>}
