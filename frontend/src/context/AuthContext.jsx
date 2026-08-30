import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(() => API.getUserRole());

  const login = useCallback(async (email, password) => {
    const result = await API.login(email, password);
    if (result.success) setRole(API.getUserRole());
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_type");
    setRole(null);
    navigate("/login");
  }, [navigate]);

  const isLoggedIn = useCallback(() => API.isLoggedIn(), []);

  // Ported from main.js checkAuth(): validates token with server, redirects to
  // /login if missing/expired. Returns true if the caller may proceed.
  const checkAuth = useCallback(async () => {
    if (!API.isLoggedIn()) {
      navigate("/login");
      return false;
    }
    const result = await API.getCurrentUser();
    if (!result.success) {
      navigate("/login");
      return false;
    }
    return true;
  }, [navigate]);

  const value = { role, login, logout, isLoggedIn, checkAuth, getUserRole: API.getUserRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
