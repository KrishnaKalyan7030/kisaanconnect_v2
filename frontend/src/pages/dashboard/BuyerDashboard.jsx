import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../api/client";

const FALLBACK_IMG = "https://picsum.photos/id/201/400/300";

export default function BuyerDashboard() {
  const { t } = useLanguage();
  const auth = useAuth();
  const navigate = useNavigate();

  const [authorized, setAuthorized] = useState(false);
  const [welcomeName, setWelcomeName] = useState(null);
  const [products, setProducts] = useState(null); // null = loading
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");

  const availableCount = products ? products.length : null;
  const farmerCount = products ? new Set(products.map((p) => p.farmer_id)).size : null;

  useEffect(() => {
    let active = true;
    async function guard() {
      const ok = await auth.checkAuth();
      if (!ok || !active) return;
      if (auth.getUserRole() !== "buyer") {
        window.location.href = "/marketplace";
        return;
      }
      setAuthorized(true);

      const userResult = await API.getCurrentUser();
      if (active && userResult.success && userResult.data) {
        setWelcomeName(userResult.data.full_name || userResult.data.name || "Buyer");
      }

      const result = await API.getAllProducts();
      if (!active) return;
      if (!result.success) {
        setFailed(true);
        return;
      }
      setProducts(result.data || []);
    }
    guard();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToMarketplace() {
    const query = search.trim();
    navigate(query ? `/marketplace?search=${encodeURIComponent(query)}` : "/marketplace");
  }

  if (!authorized) {
    return <div className="bg-[#f8f9f5] min-h-screen" />;
  }

  return (
    <div className="bg-[#f8f9f5] min-h-screen">
      <Navbar links={[{ to: "/marketplace", i18nKey: "nav_marketplace" }]} showLogout />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-emerald-800">
          {welcomeName ? `Welcome back, ${welcomeName}! 🛒` : t("buyer_welcome")}
        </h1>
        <p className="text-gray-600 mt-2">{t("buyer_subtitle")}</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          <div className="bg-white rounded-3xl p-6 shadow">
            <p className="text-gray-500 text-sm">{t("buyer_available")}</p>
            <p className="text-5xl font-bold text-emerald-700 mt-3">{availableCount ?? "—"}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow">
            <p className="text-gray-500 text-sm">{t("buyer_farmers")}</p>
            <p className="text-5xl font-bold text-emerald-700 mt-3">{farmerCount ?? "—"}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow">
            <p className="text-gray-500 text-sm">{t("buyer_this_week")}</p>
            <p className="text-5xl font-bold text-emerald-700 mt-3">12</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-10 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && goToMarketplace()}
            placeholder={t("buyer_search_ph")}
            className="w-full px-6 py-5 pl-14 rounded-3xl border border-gray-300 focus:border-emerald-600 focus:outline-none text-base"
          />
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
        </div>

        {/* Fresh Picks */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{t("buyer_fresh_picks")}</h2>
            <button onClick={() => navigate("/marketplace")} className="text-emerald-600 font-medium">
              {t("buyer_browse_all")}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {failed && <p className="col-span-full text-center text-red-500 py-10">Failed to load products</p>}
            {!failed && products === null && (
              <div className="col-span-full text-center py-10 text-gray-400">
                <i className="fas fa-spinner fa-spin text-3xl"></i>
              </div>
            )}
            {!failed && products && products.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-10">{t("no_products")}</p>
            )}
            {!failed &&
              products &&
              products.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/marketplace?product=${p.id}`)}
                  className="bg-white rounded-3xl overflow-hidden shadow cursor-pointer active:scale-95 transition"
                >
                  <img
                    src={p.image_url || FALLBACK_IMG}
                    className="w-full h-40 object-cover"
                    onError={(e) => (e.target.src = FALLBACK_IMG)}
                    alt={p.name}
                  />
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <p className="text-emerald-600 font-bold text-xl mt-1">₹{p.price}/kg</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
