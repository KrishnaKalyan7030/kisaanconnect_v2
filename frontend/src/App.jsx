import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import FarmerDashboard from "./pages/dashboard/FarmerDashboard";
import AddProduct from "./pages/dashboard/AddProduct";
import MyProducts from "./pages/dashboard/MyProducts";
import BuyerDashboard from "./pages/dashboard/BuyerDashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
      <Route path="/dashboard/farmer/add" element={<AddProduct />} />
      <Route path="/dashboard/farmer/products" element={<MyProducts />} />
      <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
