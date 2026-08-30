import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { API, resolveImageUrl } from "../../api/client";

const FALLBACK_IMG = "https://picsum.photos/id/1015/400/300";

// Turns a timestamp into "Today" / "Yesterday" / "3 days ago" — easier for
// low-tech users to read at a glance than a raw date.
function relativeDay(isoString) {
  const then = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.setHours(0, 0, 0, 0) - new Date(then).setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1) return `${diffDays} days ago`;
  return then.toLocaleDateString();
}

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-gray-200 text-gray-600",
};

export default function MyProducts() {
  const { t } = useLanguage();
  const auth = useAuth();
  const { showToast } = useToast();

  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState(null); // null = loading
  const [loadFailed, setLoadFailed] = useState(false);
  const [interestCounts, setInterestCounts] = useState({}); // { productId: count }

  const [expandedId, setExpandedId] = useState(null); // which product's buyer list is open
  const [buyersByProduct, setBuyersByProduct] = useState({}); // cache: { productId: [buyers] }
  const [buyersLoading, setBuyersLoading] = useState(false);

  async function loadMyProducts() {
    setLoadFailed(false);
    const [productsResult, countsResult] = await Promise.all([
      API.getMyProducts(),
      API.getMyInterestCounts(),
    ]);

    if (!productsResult.success) {
      setLoadFailed(true);
      return;
    }
    setProducts(productsResult.data || []);
    if (countsResult.success) setInterestCounts(countsResult.data || {});
  }

  useEffect(() => {
    let active = true;
    async function guard() {
      const ok = await auth.checkAuth();
      if (!ok || !active) return;
      if (auth.getUserRole() !== "farmer") {
        window.location.href = "/marketplace";
        return;
      }
      setAuthorized(true);
      loadMyProducts();
    }
    guard();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteProduct(id) {
    if (!window.confirm(t("my_delete_confirm"))) return;
    const result = await API.deleteProduct(id);
    if (result.success) {
      showToast(t("my_deleted"), "success");
      loadMyProducts();
    } else {
      showToast(t("my_delete_fail"), "error");
    }
  }

  async function toggleInterestedBuyers(productId) {
    if (expandedId === productId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(productId);

    // Only fetch once per product — cache the result.
    if (!buyersByProduct[productId]) {
      setBuyersLoading(true);
      const result = await API.getInterestedBuyers(productId);
      setBuyersLoading(false);
      if (result.success) {
        setBuyersByProduct((prev) => ({ ...prev, [productId]: result.data }));
      } else {
        showToast("Could not load interested buyers", "error");
      }
    }
  }

  async function updateStatus(interestId, productId, status) {
    const result = await API.updateInterestStatus(interestId, status);
    if (result.success) {
      // Update just that one buyer's status in the cached list — no full re-fetch needed.
      setBuyersByProduct((prev) => ({
        ...prev,
        [productId]: prev[productId].map((b) => (b.id === interestId ? { ...b, status } : b)),
      }));
    } else {
      showToast("Could not update status", "error");
    }
  }

  if (!authorized) {
    return <div className="bg-[#f8f9f5] min-h-screen" />;
  }

  return (
    <div className="bg-[#f8f9f5] min-h-screen pb-20">
      <Navbar
        maxWidth="max-w-6xl"
        links={[{ to: "/dashboard/farmer", i18nKey: "nav_dashboard" }]}
        cta={{ to: "/dashboard/farmer/add", label: `+ ${t("nav_add_product")}` }}
        showLogout
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-emerald-800 mb-8">{t("my_title")}</h1>

        {loadFailed && <p className="text-red-500 text-center py-12">{t("my_load_fail")}</p>}

        {!loadFailed && products === null && (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-spinner fa-spin text-4xl"></i>
          </div>
        )}

        {!loadFailed && products && products.length === 0 && (
          <div className="text-center mt-20">
            <i className="fas fa-box text-6xl text-gray-300"></i>
            <p className="text-gray-500 mt-6 text-xl">{t("my_no_products")}</p>
            <Link
              to="/dashboard/farmer/add"
              className="mt-8 inline-block bg-emerald-600 text-white px-8 py-4 rounded-3xl hover:bg-emerald-700 transition"
            >
              {t("nav_add_product")}
            </Link>
          </div>
        )}

        {!loadFailed && products && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const count = interestCounts[product.id] ?? 0;
              const isExpanded = expandedId === product.id;
              const buyers = buyersByProduct[product.id];

              return (
                <div key={product.id} className="product-card bg-white rounded-3xl overflow-hidden shadow-sm">
                  <img
                    src={resolveImageUrl(product.image_url) || FALLBACK_IMG}
                    className="w-full h-52 object-cover"
                    onError={(e) => (e.target.src = FALLBACK_IMG)}
                    alt={product.name}
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-xl">{product.name}</h3>
                    <p className="text-emerald-600 font-bold text-3xl mt-2">₹{product.price}/kg</p>
                    <p className="text-gray-500 mt-3">Qty: {product.quantity} kg</p>
                    <p className="text-gray-400 text-sm mt-1">{product.village || ""}</p>
                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
                      <i className="fas fa-eye"></i>
                      {product.views_count ?? 0} {(product.views_count ?? 0) === 1 ? "view" : "views"}
                    </p>

                    {/* Interested Buyers — expand to see who */}
                    <button
                      onClick={() => toggleInterestedBuyers(product.id)}
                      className="mt-5 w-full flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <i className="fas fa-users"></i>
                        {count} {count === 1 ? "Interested Buyer" : "Interested Buyers"}
                      </span>
                      <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} text-sm`}></i>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {buyersLoading && !buyers && (
                          <p className="text-center text-gray-400 py-4">
                            <i className="fas fa-spinner fa-spin"></i>
                          </p>
                        )}
                        {buyers && buyers.length === 0 && (
                          <p className="text-center text-gray-400 py-4 text-sm">No one yet — check back soon</p>
                        )}
                        {buyers &&
                          buyers.map((buyer) => (
                            <div key={buyer.id} className="p-3 bg-gray-50 rounded-xl">
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{buyer.buyer_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {[buyer.village, buyer.district].filter(Boolean).join(", ") || "Location N/A"}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">Interested {relativeDay(buyer.created_at)}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[buyer.status]}`}>
                                  {buyer.status}
                                </span>
                              </div>
                              {buyer.status !== "closed" && (
                                <div className="flex gap-2 mt-2">
                                  {buyer.status === "pending" && (
                                    <button
                                      onClick={() => updateStatus(buyer.id, product.id, "contacted")}
                                      className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium"
                                    >
                                      Mark Contacted
                                    </button>
                                  )}
                                  <button
                                    onClick={() => updateStatus(buyer.id, product.id, "closed")}
                                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full font-medium"
                                  >
                                    Close
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="mt-4 w-full bg-red-100 hover:bg-red-200 text-red-600 py-3.5 rounded-2xl font-medium transition min-h-[48px]"
                    >
                      {t("my_delete")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
