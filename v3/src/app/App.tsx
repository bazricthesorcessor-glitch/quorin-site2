import { Route, Routes } from "react-router";
import { BagPage } from "../features/bag/BagPage";
import { HomePage } from "../features/home/HomePage";
import { ProductPage } from "../features/product/ProductPage";
import { ShopPage } from "../features/shop/ShopPage";
import { SimplePage } from "../features/simple/SimplePage";
import { WishlistPage } from "../features/wishlist/WishlistPage";
export function App(){return <Routes><Route path="/" element={<HomePage/>}/><Route path="/search" element={<ShopPage/>}/><Route path="/product/:id" element={<ProductPage/>}/><Route path="/wishlist" element={<WishlistPage/>}/><Route path="/bag" element={<BagPage/>}/><Route path="/account" element={<SimplePage title="Your account" copy="Orders, addresses and account preferences — all in one place."/>}/><Route path="*" element={<SimplePage title="Page not found" copy="That page wandered off into the workshop."/>}/></Routes>}
