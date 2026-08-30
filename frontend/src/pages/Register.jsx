import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { API } from "../api/client";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  village: "",
  district: "",
  state: "Maharashtra",
  password: "",
  confirm_password: "",
};

export default function Register() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const { name, email, phone, village, district, state, password, confirm_password } = form;

    if (!selectedRole) {
      setError(t("reg_err_select_role"));
      return;
    }
    if (password !== confirm_password) {
      setError(t("reg_err_password_mismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("reg_err_password_short"));
      return;
    }
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError(t("reg_err_phone_invalid"));
      return;
    }

    const userData = {
      full_name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      village: village.trim(),
      district: district.trim(),
      state: state.trim(),
      password,
      confirm_password,
      user_type: selectedRole,
    };

    setLoading(true);
    try {
      const result = await API.register(userData);

      if (result.success) {
        showToast(t("reg_success_toast"), "success");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      const detail = result?.data?.detail;
      let errMsg = t("reg_err_generic");
      if (typeof detail === "string") {
        errMsg = detail;
      } else if (Array.isArray(detail)) {
        errMsg = detail.map((e) => e.msg || JSON.stringify(e)).join(", ");
      } else if (detail && typeof detail === "object") {
        errMsg = JSON.stringify(detail);
      } else if (typeof result?.message === "string") {
        errMsg = result.message;
      }
      setError(errMsg);
    } catch (err) {
      setError(t("reg_err_network"));
    }
    setLoading(false);
  }

  const roleBtnClass = (role) =>
    `role-btn py-6 border-2 rounded-3xl font-medium transition flex flex-col items-center gap-3 active:scale-95 min-h-[100px] ${
      selectedRole === role ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:border-emerald-500"
    }`;

  return (
    <div className="bg-[#f8f9f5] min-h-screen">
      <Navbar maxWidth="max-w-5xl" backLink={{ to: "/login", i18nKey: "common_back_login", icon: "fa-arrow-left" }} />

      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="register-bg h-52 sm:h-56 flex items-center justify-center text-white">
              <div className="text-center px-6">
                <i className="fas fa-handshake text-5xl sm:text-6xl mb-4"></i>
                <h1 className="text-2xl sm:text-3xl font-bold">{t("reg_title")}</h1>
                <p className="text-emerald-100 mt-2 text-sm sm:text-base">{t("reg_subtitle")}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleRegister}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("reg_fullname")}</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                    placeholder={t("reg_fullname_ph")}
                    required
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("reg_email")}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                    placeholder={t("reg_email_ph")}
                    required
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("reg_phone")}</label>
                  <input
                    type="tel"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={form.phone}
                    onChange={update("phone")}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                    placeholder={t("reg_phone_ph")}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("reg_village")}</label>
                    <input
                      type="text"
                      value={form.village}
                      onChange={update("village")}
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                      placeholder={t("reg_village")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("reg_district")}</label>
                    <input
                      type="text"
                      value={form.district}
                      onChange={update("district")}
                      className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                      placeholder={t("reg_district")}
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("reg_state")}</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={update("state")}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                    placeholder={t("reg_state")}
                    required
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("reg_password")}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={update("password")}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                    placeholder={t("reg_password_ph")}
                    required
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("reg_confirm_pw")}</label>
                  <input
                    type="password"
                    value={form.confirm_password}
                    onChange={update("confirm_password")}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                    placeholder={t("reg_confirm_pw_ph")}
                    required
                  />
                </div>

                {/* Role Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t("reg_role_label")}</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setSelectedRole("farmer")} className={roleBtnClass("farmer")}>
                      <i className="fas fa-seedling text-4xl text-emerald-600"></i>
                      <span className="text-base">{t("reg_farmer")}</span>
                    </button>
                    <button type="button" onClick={() => setSelectedRole("buyer")} className={roleBtnClass("buyer")}>
                      <i className="fas fa-shopping-basket text-4xl text-emerald-600"></i>
                      <span className="text-base">{t("reg_buyer")}</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-2">
                    <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0"></i>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all text-white font-semibold text-lg py-4 rounded-3xl flex items-center justify-center gap-3 min-h-[56px] disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>{t("reg_creating")}</span>
                    </>
                  ) : (
                    <span>{t("reg_btn")}</span>
                  )}
                </button>
              </form>

              <div className="text-center mt-8">
                <p className="text-gray-600 text-sm">
                  <span>{t("reg_have_account")}</span>
                  <Link to="/login" className="text-emerald-600 font-semibold hover:underline ml-1">
                    {t("reg_login_link")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
