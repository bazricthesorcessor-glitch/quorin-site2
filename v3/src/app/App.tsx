import { Route, Routes } from "react-router";
import { HomePage } from "../features/home/HomePage";
import { ShopPage } from "../features/shop/ShopPage";
import { ProductPage } from "../features/product/ProductPage";
import { SimplePage } from "../features/simple/SimplePage";
export function App(){return <Routes><Route path="/" element={<HomePage/>}/><Route path="/search" element={<ShopPage/>}/><Route path="/product/:id" element={<ProductPage/>}/><Route path="/wishlist" element={<SimplePage title="Your wishlist" copy="Save the materials and tools you want to return to."/>}/><Route path="/bag" element={<SimplePage title="Your bag" copy="Your selected QUORIN products will appear here."/>}/><Route path="/account" element={<SimplePage title="Your account" copy="Orders, addresses and account preferences — all in one place."/>}/><Route path="*" element={<SimplePage title="Page not found" copy="That page wandered off into the workshop."/>}/></Routes>}
