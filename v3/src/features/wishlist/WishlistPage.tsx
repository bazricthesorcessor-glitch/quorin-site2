import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { ProductCard } from "../../components/commerce/ProductCard";
import { MobileDock } from "../../components/navigation/MobileDock";
import { SiteHeader } from "../../components/navigation/SiteHeader";
import { catalogProducts } from "../../data/catalog";
import { useShop } from "../../state/ShopContext";
import "./wishlist.css";
export function WishlistPage(){const {wishlist,toggleWishlist,addToCart}=useShop();const products=catalogProducts.filter(product=>wishlist.includes(product.id));return <div className="wishlist-page"><SiteHeader/><main className="q-container wishlist"><header><p>SAVED FOR LATER</p><h1 className="q-display">Your wishlist</h1><span>Keep the materials that caught your eye close at hand.</span></header>{products.length===0?<section className="wishlist-empty"><Heart size={32}/><h2>Nothing saved yet.</h2><p>Tap the heart on a product and it will wait for you here.</p><a href="/search">Discover products</a></section>:<section className="wishlist-grid">{products.map(product=><div className="wishlist-item" key={product.id}><a href={`/product/${product.id}`}><ProductCard product={product}/></a><div className="wishlist-item__actions"><button onClick={()=>addToCart(product.id)}><ShoppingBag size={17}/> Add to bag</button><button onClick={()=>toggleWishlist(product.id)} aria-label={`Remove ${product.name}`}><Trash2 size={17}/></button></div></div>)}</section>}</main><MobileDock/></div>}
