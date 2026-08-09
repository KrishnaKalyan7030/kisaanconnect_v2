import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API } from "../api/client";

export default function Login() {
  const { t } = useLanguage();
  const auth = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-redirect if already logged in
    if (API.isLoggedIn()) {
      const role = API.getUserRole();
      if (role === "farmer") navigate("/dashboard/farmer");
      else if (role === "buyer") navigate("/dashboard/buyer");
    }
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError(t("login_err_missing_fields"));
      return;
    }

    setLoading(true);
    try {
      const result = await auth.login(email.trim(), password);

      if (result.success) {
        showToast(t("login_success_toast"), "success");
        setTimeout(() => {
          const userType = localStorage.getItem("user_type");
          if (userType === "farmer") navigate("/dashboard/farmer");
          else if (userType === "buyer") navigate("/dashboard/buyer");
          else navigate("/");
        }, 1000);
        return;
      }

      let errMsg = t("login_err_invalid");
      if (result.data?.detail) {
        errMsg = typeof result.data.detail === "string" ? result.data.detail : JSON.stringify(result.data.detail);
      } else if (result.message) {
        errMsg = result.message;
      }
      setError(errMsg);
    } catch (err) {
      setError(t("login_err_network"));
    }
    setLoading(false);
  }

  return (
    <div className="bg-[#f8f9f5] min-h-screen">
      <Navbar maxWidth="max-w-5xl" backLink={{ to: "/", i18nKey: "nav_home", icon: "fa-home" }} />

      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="login-bg h-48 sm:h-52 flex items-center justify-center text-white">
              <div className="text-center px-6">
                <i className="fas fa-seedling text-5xl sm:text-6xl mb-4"></i>
                <h1 className="text-2xl sm:text-3xl font-bold">{t("login_title")}</h1>
                <p className="text-emerald-100 mt-2 text-sm sm:text-base">{t("login_subtitle")}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("login_email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                    placeholder={t("login_email_ph")}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("login_password")}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-600 text-base"
                    placeholder={t("login_password_ph")}
                    required
                  />
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
                      <span>{t("login_logging_in")}</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      <span>{t("login_btn")}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-8">
                <p className="text-gray-600 text-sm">
                  <span>{t("login_no_account")}</span>
                  <Link to="/register" className="text-emerald-600 font-semibold hover:underline ml-1">
                    {t("login_register_link")}
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
