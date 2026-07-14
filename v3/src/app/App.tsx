import { Route, Routes } from "react-router";
import { HomePage } from "../features/home/HomePage";
export function App(){return <Routes><Route path="/" element={<HomePage/>}/></Routes>}
