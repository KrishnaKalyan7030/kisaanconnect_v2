import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function MainLayout() {
  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "80vh",
          padding: "30px",
        }}
      >
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;