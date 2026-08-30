import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import VideoCarousel from "../components/VideoCarousel";
import { useLanguage } from "../context/LanguageContext";
import { API } from "../api/client";

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState(null); // null = loading

  useEffect(() => {
    let active = true;
    API.getAllProducts().then((result) => {
      if (!active) return;
      if (result.success && result.data && result.data.length) {
        setProducts(result.data.slice(0, 8));
      } else {
        setProducts([]);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-[#f8f9f5] min-h-screen">
      <Navbar
        links={[
          { to: "/marketplace", i18nKey: "nav_marketplace" },
          { to: "/dashboard/farmer", i18nKey: "nav_for_farmers" },
          { to: "/#how", label: "How it Works", i18nKey: "nav_how_it_works" },
        ]}
        cta={{ to: "/login", i18nKey: "nav_login" }}
      />

      {/* Hero */}
      <section className="hero-bg text-white py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">शेतातून थेट तुमच्या घरापर्यंत</h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-emerald-100">{t("hero_subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button
              onClick={() => navigate("/dashboard/farmer")}
              className="px-8 py-5 bg-white text-emerald-700 font-semibold rounded-3xl text-lg active:scale-95 transition flex items-center justify-center gap-3"
            >
              <i className="fas fa-seedling"></i>
              <span>{t("hero_farmer_btn")}</span>
            </button>
            <button
              onClick={() => navigate("/marketplace")}
              className="px-8 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-3xl text-lg active:scale-95 transition flex items-center justify-center gap-3"
            >
              <span>{t("hero_buyer_btn")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-800">{t("featured_title")}</h2>
            <button
              onClick={() => navigate("/marketplace")}
              className="text-emerald-600 font-medium flex items-center gap-2 text-sm md:text-base"
            >
              <span>{t("view_all")}</span> <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products === null && (
              <p className="col-span-full text-center py-12 text-gray-400">
                <i className="fas fa-spinner fa-spin mr-2"></i>Loading...
              </p>
            )}
            {products && products.length === 0 && (
              <p className="col-span-full text-center py-12 text-gray-500">{t("no_products")}</p>
            )}
            {products &&
              products.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => navigate(`/marketplace?product=${p.id}`)} />
              ))}
          </div>
        </div>
      </section>

      <VideoCarousel />

      <Footer />
    </div>
  );
}
