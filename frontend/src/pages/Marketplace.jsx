import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { API, resolveImageUrl } from "../api/client";

const FALLBACK_PRODUCT_IMG = "https://picsum.photos/id/1015/400/300";
const FALLBACK_FARMER_IMG = "https://picsum.photos/id/64/300/300";

// Matches selected app language to a real locale, so dates/times render the
// way a Marathi/Hindi/Punjabi speaker actually expects — not just labels,
// the values themselves (e.g. month names) follow the chosen language too.
const LOCALE_MAP = { en: "en-IN", hi: "hi-IN", mr: "mr-IN", pa: "pa-IN" };

function formatAvailableDate(dateStr, lang) {
  if (!dateStr) return null;
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    return new Intl.DateTimeFormat(LOCALE_MAP[lang] || "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatAvailableTime(timeStr, lang) {
  if (!timeStr) return null;
  try {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(Number(h), Number(m), 0);
    return new Intl.DateTimeFormat(LOCALE_MAP[lang] || "en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return timeStr;
  }
}

export default function Marketplace() {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [farmerInfo, setFarmerInfo] = useState(null);
  const [farmerLoading, setFarmerLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });
  const [filtersActive, setFiltersActive] = useState(false);

  // Records a view at most once per product per browser tab/session — a
  // buyer re-opening the same product, or a refresh, shouldn't inflate the
  // count. This is a simple client-side dedup, not a bulletproof one (a
  // scripted client could bypass it), which is an acceptable tradeoff for
  // an MVP view counter — see Phase notes.
  function openModal(product) {
    setCurrentProduct(product);
    setShowProductModal(true);
    setInterestSent(false);

    const sessionKey = `viewed_product_${product.id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, "1");
      API.recordView(product.id); // fire-and-forget, no need to await
    }
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await API.getAllProducts();
        if (result.success) {
          const products = result.data || [];
          setAllProducts(products);

          const pid = searchParams.get("product");
          if (pid) {
            const p = products.find((x) => String(x.id) === String(pid));
            if (p) {
              openModal(p);
            }
          }
        } else {
          showToast("Failed to load products", "error");
        }
      } catch (err) {
        showToast("Server error. Please try again.", "error");
      }
    }
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? allProducts.filter((p) => p.name.toLowerCase().includes(q)) : allProducts;
  }, [search, allProducts]);

  function updateFilter(field) {
    return (e) => setFilters((f) => ({ ...f, [field]: e.target.value }));
  }

  async function applyFilters() {
    const result = await API.getAllProducts({
      location: filters.location.trim(),
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      sort: filters.sort,
    });
    if (result.success) {
      setAllProducts(result.data || []);
      setFiltersActive(true);
    } else {
      showToast("Could not apply filters", "error");
    }
  }

  async function clearFilters() {
    setFilters({ location: "", minPrice: "", maxPrice: "", sort: "newest" });
    setFiltersActive(false);
    const result = await API.getAllProducts();
    if (result.success) setAllProducts(result.data || []);
  }

  function closeModal() {
    setShowProductModal(false);
  }

  function closeFarmerModal() {
    setShowFarmerModal(false);
    setFarmerInfo(null);
  }

  async function contactFarmer() {
    if (!currentProduct) return;

    setContactLoading(true);
    // Phone is no longer part of the public product response — it only
    // comes back from this protected endpoint, same as "View Farmer Info".
    const result = await API.getFarmerInfo(currentProduct.id);
    setContactLoading(false);

    if (result.requiresLogin) {
      setShowAuthPrompt(true);
      return;
    }

    if (!result.success || !result.data?.phone) {
      showToast("Phone number not available", "error");
      return;
    }

    const phone = result.data.phone.replace(/\D/g, "");
    window.open(`https://wa.me/91${phone}`, "_blank");
  }

  async function markInterested() {
    if (!currentProduct) return;

    setInterestLoading(true);
    const result = await API.markInterested(currentProduct.id);
    setInterestLoading(false);

    if (result.requiresLogin) {
      setShowAuthPrompt(true);
      return;
    }

    if (result.success) {
      setInterestSent(true);
      showToast(result.data.message, "success");
    } else {
      showToast(result.message || "Could not send interest", "error");
    }
  }

  async function viewFarmerInfo() {
    if (!currentProduct) return;

    setFarmerLoading(true);
    // We ask the BACKEND, not just check localStorage — the backend is the
    // one that actually decides if this request is allowed (see
    // router/user.py -> get_farmer_info, protected by Depends(get_current_user)).
    const result = await API.getFarmerInfo(currentProduct.id);
    setFarmerLoading(false);

    if (result.requiresLogin) {
      // Backend said 401 -> not logged in (or token expired). Show the
      // same login-prompt modal as before, but now it's backed by a real check.
      setShowAuthPrompt(true);
      return;
    }

    if (result.success) {
      setFarmerInfo(result.data);
      setShowFarmerModal(true);
    } else {
      showToast("Could not load farmer info", "error");
    }
  }

  const isFarmer = API.getUserRole() === "farmer";

  const mapQuery = farmerInfo
    ? encodeURIComponent(`${farmerInfo.village || ""}, ${farmerInfo.district || ""}, India`)
    : "";

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar links={[{ to: "/", i18nKey: "nav_home" }]} showLogout />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-emerald-800">{t("mkt_title")}</h1>
            <p className="text-gray-600 mt-1">{t("mkt_subtitle")}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (e.target.value) next.set("search", e.target.value);
                else next.delete("search");
                next.delete("product");
                return next;
              });
            }}
            placeholder={t("mkt_search_ph")}
            className="w-full px-6 py-4 pl-14 border border-gray-300 rounded-3xl focus:outline-none focus:border-emerald-600 text-base"
          />
          <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="mb-4 flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 hover:border-emerald-500"
        >
          <i className="fas fa-sliders-h text-emerald-600"></i>
          <span>{t("mkt_filters")}</span>
          {filtersActive && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
          <i className={`fas fa-chevron-${showFilters ? "up" : "down"} text-xs text-gray-400`}></i>
        </button>

        {showFilters && (
          <div className="mb-8 p-5 bg-white border border-gray-200 rounded-3xl">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-map-marker-alt text-emerald-600 mr-1"></i>
                {t("mkt_filter_location")}
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={updateFilter("location")}
                placeholder={t("mkt_filter_location_ph")}
                className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("mkt_filter_price")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={updateFilter("minPrice")}
                  placeholder={t("mkt_filter_min")}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={updateFilter("maxPrice")}
                  placeholder={t("mkt_filter_max")}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("mkt_filter_sort")}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "newest", label: t("mkt_sort_newest") },
                  { key: "price_asc", label: t("mkt_sort_low") },
                  { key: "price_desc", label: t("mkt_sort_high") },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setFilters((f) => ({ ...f, sort: opt.key }))}
                    className={`py-3 rounded-2xl text-sm font-medium border-2 transition ${
                      filters.sort === opt.key
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-gray-300 text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-semibold text-base"
              >
                {t("mkt_filter_apply")}
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-3.5 border border-gray-300 rounded-2xl font-medium text-base text-gray-600 hover:bg-gray-50"
              >
                {t("mkt_filter_clear")}
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => openModal(p)}
                className="product-card bg-white rounded-3xl overflow-hidden shadow-sm cursor-pointer"
              >
                <img
                  src={resolveImageUrl(p.image_url) || FALLBACK_PRODUCT_IMG}
                  className="w-full h-40 sm:h-48 object-cover"
                  onError={(e) => (e.target.src = FALLBACK_PRODUCT_IMG)}
                  alt={p.name}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{p.name}</h3>
                  <p className="text-emerald-600 font-bold text-2xl mt-2">₹{p.price}/kg</p>
                  <p className="text-gray-500 text-sm mt-1">{p.quantity || "N/A"} kg</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <i className="fas fa-box text-6xl text-gray-300"></i>
            <p className="text-gray-500 mt-6 text-xl">{t("mkt_no_products")}</p>
            <button
              onClick={() => {
                setSearch("");
                setSearchParams({});
              }}
              className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-3xl hover:bg-emerald-700"
            >
              {t("mkt_clear_search")}
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductModal && currentProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Drag handle — signals "this is a scrollable sheet" on mobile */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-gray-300"></div>
            </div>

            <div className="relative">
              <img
                src={resolveImageUrl(currentProduct.image_url) || FALLBACK_PRODUCT_IMG}
                className="w-full h-48 sm:h-72 object-cover sm:rounded-t-3xl"
                onError={(e) => (e.target.src = FALLBACK_PRODUCT_IMG)}
                alt={currentProduct.name}
              />
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-semibold">{currentProduct.name}</h3>
              <p className="text-emerald-600 font-bold text-2xl sm:text-3xl mt-1.5">₹{currentProduct.price}/kg</p>

              {currentProduct.description && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{currentProduct.description}</p>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-5 text-sm">
                <div>
                  <p className="text-gray-500">{t("mkt_qty")}</p>
                  <p className="font-medium mt-1">{currentProduct.quantity || "N/A"} kg</p>
                </div>
                <div>
                  <p className="text-gray-500">{t("mkt_village")}</p>
                  <p className="font-medium mt-1">{currentProduct.village || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t("mkt_available_date")}</p>
                  <p className="font-medium mt-1">
                    {formatAvailableDate(currentProduct.available_date, lang) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">{t("mkt_available_time")}</p>
                  <p className="font-medium mt-1">
                    {formatAvailableTime(currentProduct.available_time, lang) || t("mkt_time_any")}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm text-gray-500">
                <i className="fas fa-lock text-xs mr-1"></i>
                {t("mkt_phone_hidden")}
              </p>

              {!isFarmer && (
                <button
                  onClick={markInterested}
                  disabled={interestLoading || interestSent}
                  className="mt-4 w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white py-4 rounded-3xl font-semibold text-lg flex items-center justify-center gap-3 min-h-[56px] disabled:opacity-70"
                >
                  {interestLoading ? (
                    <i className="fas fa-spinner fa-spin text-xl"></i>
                  ) : (
                    <i className={`fas ${interestSent ? "fa-check-circle" : "fa-hand-point-up"} text-xl`}></i>
                  )}
                  <span>{interestSent ? t("mkt_interest_sent") : t("mkt_interested_btn")}</span>
                </button>
              )}

              <button
                onClick={contactFarmer}
                disabled={contactLoading}
                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-4 rounded-3xl font-semibold text-lg flex items-center justify-center gap-3 min-h-[56px] disabled:opacity-70"
              >
                {contactLoading ? (
                  <i className="fas fa-spinner fa-spin text-xl"></i>
                ) : (
                  <i className="fab fa-whatsapp text-xl"></i>
                )}
                <span>{t("mkt_contact_btn")}</span>
              </button>

              <button
                onClick={viewFarmerInfo}
                disabled={farmerLoading}
                className="mt-3 w-full bg-white border-2 border-emerald-600 hover:bg-emerald-50 text-emerald-700 py-4 rounded-3xl font-semibold text-lg flex items-center justify-center gap-3 min-h-[56px] disabled:opacity-70"
              >
                <i className={`fas ${farmerLoading ? "fa-spinner fa-spin" : "fa-user-circle"} text-xl`}></i>
                <span>{t("mkt_farmer_info")}</span>
              </button>

              <button onClick={closeModal} className="mt-3 w-full py-4 text-gray-600 font-medium min-h-[48px]">
                {t("mkt_close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Info Modal */}
      {showFarmerModal && farmerInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && closeFarmerModal()}
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="relative p-6">
              <button
                onClick={() => closeFarmerModal()}
                className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md z-10"
              >
                <i className="fas fa-times text-xl"></i>
              </button>

              <div className="flex justify-center -mt-2">
                <img
                  src={resolveImageUrl(farmerInfo.profile_image_url) || FALLBACK_FARMER_IMG}
                  className="w-32 h-32 rounded-full object-cover border-4 border-emerald-600 shadow-inner"
                  onError={(e) => (e.target.src = FALLBACK_FARMER_IMG)}
                  alt="Farmer"
                />
              </div>

              <h3 className="text-2xl font-semibold text-center mt-6">{farmerInfo.full_name || "Local Farmer"}</h3>

              <div className="grid grid-cols-2 gap-6 mt-8 text-sm">
                <div>
                  <p className="text-gray-500">{t("mkt_village")}</p>
                  <p className="font-medium mt-1">{farmerInfo.village || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">District</p>
                  <p className="font-medium mt-1">{farmerInfo.district || "N/A"}</p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
                className="mt-8 flex items-center justify-center gap-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-4 rounded-3xl font-semibold text-base"
              >
                <i className="fas fa-map-marker-alt"></i>
                <span>{t("mkt_view_map")}</span>
              </a>

              <div className="mt-10">
                <p className="text-gray-500 font-medium mb-3">{t("mkt_about_farmer")}</p>
                <p className="text-gray-600 leading-relaxed text-base">
                  {farmerInfo.bio || "This farmer is part of our trusted local network supplying fresh produce."}
                </p>
              </div>

              <button
                onClick={() => closeFarmerModal()}
                className="mt-10 w-full py-4 text-gray-600 font-medium min-h-[48px]"
              >
                {t("mkt_close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showAuthPrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAuthPrompt(false)}
        >
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl">
            <div className="p-8 text-center">
              <i className="fas fa-lock text-6xl text-emerald-600 mb-6"></i>
              <h3 className="text-2xl font-semibold">{t("mkt_login_required")}</h3>
              <p className="text-gray-600 mt-3 leading-tight">
                Farmer details are private and crucial.
                <br />
                Only logged-in buyers can view them.
              </p>

              <div className="mt-10 flex flex-col gap-4">
                <button
                  onClick={() => {
                    setShowAuthPrompt(false);
                    navigate("/login");
                  }}
                  className="w-full bg-emerald-600 text-white py-4 rounded-3xl font-semibold text-lg"
                >
                  Login to Continue
                </button>
                <button
                  onClick={() => {
                    setShowAuthPrompt(false);
                    navigate("/register");
                  }}
                  className="w-full border-2 border-emerald-600 text-emerald-700 py-4 rounded-3xl font-semibold text-lg"
                >
                  Register as New Buyer
                </button>
              </div>

              <button onClick={() => setShowAuthPrompt(false)} className="mt-6 text-gray-500 font-medium text-sm">
                {t("mkt_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}