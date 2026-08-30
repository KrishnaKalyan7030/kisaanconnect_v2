import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { API, resolveImageUrl } from "../../api/client";

export default function FarmerDashboard() {
  const { t } = useLanguage();
  const auth = useAuth();

  const [welcomeName, setWelcomeName] = useState(null); // null = default text
  const [profilePhoto, setProfilePhoto] = useState(null); // current photo URL
  const [photoUploading, setPhotoUploading] = useState(false);
  const [products, setProducts] = useState(null); // null = loading, [] = empty
  const [loadFailed, setLoadFailed] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const ok = await auth.checkAuth();
      if (!ok || !active) return;

      if (auth.getUserRole() !== "farmer") {
        window.location.href = "/marketplace";
        return;
      }
      setAuthorized(true);

      try {
        const userResult = await API.getCurrentUser();
        if (active && userResult.success && userResult.data) {
          setWelcomeName(userResult.data.full_name || userResult.data.name || "Farmer");
          setProfilePhoto(userResult.data.profile_image_url || null);
        }

        const productsResult = await API.getMyProducts();
        if (!active) return;
        if (productsResult.success && productsResult.data && productsResult.data.length > 0) {
          setProducts(productsResult.data.slice(0, 3));
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (active) setLoadFailed(true);
      }
    }

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoUploading(true);
    const result = await API.updateProfilePhoto(file);
    setPhotoUploading(false);

    if (result.success) {
      setProfilePhoto(result.data.profile_image_url);
    } else {
      alert(result.message || "Failed to update photo");
    }
  }

  if (!authorized) {
    return <div className="bg-[#f8f9f5] min-h-screen" />;
  }

  return (
    <div className="bg-[#f8f9f5] min-h-screen pb-20">
      <Navbar
        maxWidth="max-w-6xl"
        links={[
          { to: "/marketplace", i18nKey: "nav_marketplace" },
          { to: "/dashboard/farmer/add", i18nKey: "nav_add_product" },
          { to: "/dashboard/farmer/products", i18nKey: "nav_my_products" },
        ]}
        showLogout
      />

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-12">
        <div className="mb-10 flex items-center gap-5">
          {/* Profile photo — click the camera icon to upload/replace */}
          <div className="relative flex-shrink-0">
            <img
              src={resolveImageUrl(profilePhoto) || "https://picsum.photos/id/64/200/200"}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-emerald-600"
              alt="Your profile"
            />
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md">
              {photoUploading ? (
                <i className="fas fa-spinner fa-spin text-xs"></i>
              ) : (
                <i className="fas fa-camera text-xs"></i>
              )}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={photoUploading} />
            </label>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-emerald-800">
              {welcomeName ? `Welcome, ${welcomeName} 👋` : t("farmer_welcome")}
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg">{t("farmer_subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          <Link
            to="/dashboard/farmer/add"
            className="card bg-emerald-600 text-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg active:scale-95 transition min-h-[140px]"
          >
            <i className="fas fa-plus text-5xl mb-4"></i>
            <span className="text-xl font-semibold">{t("farmer_add_btn")}</span>
          </Link>
          <Link
            to="/dashboard/farmer/products"
            className="card bg-white border-2 border-emerald-600 text-emerald-700 rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg active:scale-95 transition min-h-[140px]"
          >
            <i className="fas fa-list text-5xl mb-4"></i>
            <span className="text-xl font-semibold">{t("farmer_my_btn")}</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{t("farmer_recent")}</h2>
            <Link
              to="/dashboard/farmer/products"
              className="text-emerald-600 hover:underline font-medium flex items-center gap-1 text-sm"
            >
              <span>{t("farmer_view_all")}</span> <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          <div className="space-y-4 min-h-[180px]">
            {loadFailed && <p className="text-red-500 text-center py-8">{t("farmer_load_fail")}</p>}

            {!loadFailed && products === null && (
              <p className="text-center text-gray-400 py-8">
                <i className="fas fa-spinner fa-spin mr-2"></i>Loading...
              </p>
            )}

            {!loadFailed && products && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">{t("farmer_no_products")}</p>
                <Link
                  to="/dashboard/farmer/add"
                  className="mt-6 inline-block px-8 py-3 bg-emerald-600 text-white rounded-3xl hover:bg-emerald-700"
                >
                  {t("farmer_add_first")}
                </Link>
              </div>
            )}

            {!loadFailed &&
              products &&
              products.map((product) => (
                <div key={product.id} className="p-5 bg-gray-50 rounded-2xl flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">{product.name}</p>
                    <p className="text-emerald-600 font-medium">
                      ₹{product.price}/kg • {product.quantity || ""} kg
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium flex-shrink-0">
                    {t("farmer_available")}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}