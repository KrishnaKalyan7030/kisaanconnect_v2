import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { API } from "../../api/client";

const todayISO = () => new Date().toISOString().split("T")[0];

const initialForm = {
  name: "",
  price: "",
  quantity: "",
  village: "",
  available_date: "",
  available_time: "",
  description: "",
};

export default function AddProduct() {
  const { t } = useLanguage();
  const auth = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [authorized, setAuthorized] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState("");
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      const userResult = await API.getCurrentUser();
      if (active && userResult.success && userResult.data) {
        setRegisteredPhone(userResult.data.phone || "");
      }
    }
    guard();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!API.isLoggedIn()) {
      setError(t("add_login_first"));
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (!imageFile) {
      setError(t("add_select_image"));
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("village", form.village.trim());
    formData.append("price", form.price);
    formData.append("quantity", form.quantity);
    formData.append("available_date", form.available_date);
    if (form.available_time) formData.append("available_time", form.available_time);
    if (form.description.trim()) formData.append("description", form.description.trim());
    formData.append("image", imageFile);

    const result = await API.createProduct(formData);

    if (result.success) {
      showToast(t("add_success"), "success");
      setTimeout(() => navigate("/dashboard/farmer/products"), 1500);
      return;
    }

    setError(result.message || t("add_fail"));
    setLoading(false);
  }

  if (!authorized) {
    return <div className="bg-[#f8f9f5] min-h-screen" />;
  }

  return (
    <div className="bg-[#f8f9f5] min-h-screen">
      <Navbar
        maxWidth="max-w-5xl"
        links={[
          { to: "/dashboard/farmer", i18nKey: "nav_dashboard" },
          { to: "/dashboard/farmer/products", i18nKey: "nav_my_products" },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-emerald-700 mb-8 flex items-center gap-3">
            <i className="fas fa-plus"></i>
            <span>{t("add_title")}</span>
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-2">
              <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="mb-8">
              <label className="block mb-3 font-medium text-gray-700">
                <span>{t("add_image")}</span>
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-sm
                           file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0
                           file:bg-emerald-50 file:text-emerald-700 file:font-medium
                           hover:border-emerald-400 transition cursor-pointer"
              />
              {preview && <img src={preview} className="mt-6 rounded-2xl w-full h-56 object-cover border" alt="Preview" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  <span>{t("add_name")}</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  required
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  <span>{t("add_price")}</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={update("price")}
                  required
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  <span>{t("add_quantity")}</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.quantity}
                  onChange={update("quantity")}
                  required
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  <span>{t("add_village")}</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={form.village}
                  onChange={update("village")}
                  required
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                />
              </div>
            </div>

            {/* Buyers contact you on your registered phone — nothing to type here */}
            <div className="mt-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <i className="fas fa-phone text-emerald-600"></i>
              <div>
                <p className="text-sm text-gray-500">{t("add_phone")}</p>
                <p className="font-medium text-gray-800">{registeredPhone || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  <span>{t("add_date")}</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  min={todayISO()}
                  value={form.available_date}
                  onChange={update("available_date")}
                  required
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">{t("add_time")}</label>
                <input
                  type="time"
                  value={form.available_time}
                  onChange={update("available_time")}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block mb-2 font-medium text-gray-700">{t("add_description")}</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={update("description")}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-10 w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-4 rounded-3xl font-semibold text-lg flex items-center justify-center gap-3 min-h-[56px] transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>{t("add_adding")}</span>
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle"></i>
                  <span>{t("add_submit_btn")}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
