import { BrowserRouter, Routes, Route } from "react-router-dom";

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

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/marketplace" element={<Marketplace />} />

        <Route
          path="/farmer/dashboard"
          element={<FarmerDashboard />}
        />

        <Route
          path="/buyer/dashboard"
          element={<BuyerDashboard />}
        />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;