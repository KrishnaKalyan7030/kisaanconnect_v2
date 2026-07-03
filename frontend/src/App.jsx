import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Landing/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Marketplace from "./pages/Marketplace/Marketplace";
import FarmerDashboard from "./pages/Farmer/Dashboard";
import BuyerDashboard from "./pages/Buyer/Dashboard";
import NotFound from "./pages/NotFound/NotFound";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Routes WITHOUT Navbar/Footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes WITH Navbar/Footer */}
        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

          <Route path="/marketplace" element={<Marketplace />} />

          <Route
            path="/buyer/dashboard"
            element={<BuyerDashboard />}
          />

          <Route
            path="/farmer/dashboard"
            element={<FarmerDashboard />}
          />

        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;