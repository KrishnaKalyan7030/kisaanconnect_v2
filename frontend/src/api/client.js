// src/api/client.js
// KisaanConnect — API client (ported from frontend/js/api.js)

// export const BASE_URL = "https://kisaanconnect-v2.vercel.app/";
export const BASE_URL = "https://kisaanconnect-v2-backend.onrender.com"; // ← uncomment for prod

// The backend returns image_url as a relative path like "/uploads/xxx.jpg".
// Prefix it with BASE_URL so <img> tags load from the FastAPI server instead
// of resolving against the React dev server's own origin.
export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ─── Token helpers ────────────────────────────────────────────────────────────
function setToken(token) {
  localStorage.setItem("access_token", token);
}
function getToken() {
  return localStorage.getItem("access_token");
}
function getAuthHeaders() {
  const token = getToken();
  return {
    Authorization: "Bearer " + (token || ""),
    "Content-Type": "application/json",
  };
}

// ─── API object ───────────────────────────────────────────────────────────────
export const API = {
  // ── REGISTER ──────────────────────────────────────────────────────────────
  async register(userData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      if (err.name === "AbortError") {
        return { success: false, message: "Server is waking up, please try again in 30 seconds." };
      }
      return { success: false, message: "Network error. Please check your connection." };
    }
  },

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  async login(email, password) {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.access_token);
        localStorage.setItem("user_type", data.user_type);
      }

      return { success: res.ok, data };
    } catch (err) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  },

  // ── GET CURRENT USER ─────────────────────────────────────────────────────────
  async getCurrentUser() {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_type");
      }
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, data: null };
    }
  },

  // ── GET ALL PRODUCTS ─────────────────────────────────────────────────────────
  async getAllProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      const qs = params.toString();
      const res = await fetch(`${BASE_URL}/products/${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, message: "Failed to load products", data: [] };
    }
  },

  // ── RECORD A VIEW (public, no login needed) ─────────────────────────────────
  async recordView(productId) {
    try {
      const res = await fetch(`${BASE_URL}/products/${productId}/view`, { method: "POST" });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      // A failed view-count ping should never block the page — fail silently.
      return { success: false };
    }
  },

  // ── GET MY PRODUCTS ──────────────────────────────────────────────────────────
  async getMyProducts() {
    try {
      const res = await fetch(`${BASE_URL}/products/my`, { headers: getAuthHeaders() });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  // ── CREATE PRODUCT (multipart/form-data) ─────────────────────────────────────
  async createProduct(formData) {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "You are not logged in. Please login again." };
      }

      const res = await fetch(`${BASE_URL}/products/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        /* empty body */
      }

      if (res.ok) return { success: true, data };

      return {
        success: false,
        message: data.detail || data.message || `Server error (${res.status})`,
      };
    } catch (err) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  },

  // ── GET FARMER INFO (protected — only works if logged in) ──────────────────
  async getFarmerInfo(productId) {
    try {
      const res = await fetch(`${BASE_URL}/users/farmer-info/${productId}`, {
        headers: getAuthHeaders(),
      });

      // 401 = backend is saying "not logged in" — this is the REAL check,
      // not just the frontend hiding a button.
      if (res.status === 401) {
        return { success: false, requiresLogin: true };
      }

      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  },

  // ── UPDATE MY PROFILE PHOTO ───────────────────────────────────────────────
  async updateProfilePhoto(file) {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, message: "You are not logged in. Please login again." };
      }

      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`${BASE_URL}/users/me/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) return { success: true, data };
      return { success: false, message: data.detail || "Failed to update photo" };
    } catch (err) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  },

  // ── MARK INTEREST ("I am Interested" button, buyers only) ──────────────────
  async markInterested(productId) {
    try {
      const res = await fetch(`${BASE_URL}/products/${productId}/interest`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) return { success: false, requiresLogin: true };

      const data = await res.json();
      if (res.ok) return { success: true, data };
      return { success: false, message: data.detail || "Failed to mark interest" };
    } catch (err) {
      return { success: false, message: "Network error. Please check your connection." };
    }
  },

  // ── GET INTERESTED BUYERS FOR A PRODUCT (farmer, ownership-checked) ────────
  async getInterestedBuyers(productId) {
    try {
      const res = await fetch(`${BASE_URL}/products/${productId}/interested-buyers`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  // ── GET INTEREST COUNT PER PRODUCT (for farmer dashboard cards) ────────────
  async getMyInterestCounts() {
    try {
      const res = await fetch(`${BASE_URL}/products/my/interest-counts`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, data: {} };
    }
  },

  // ── UPDATE INTEREST STATUS (pending -> contacted -> closed) ─────────────────
  async updateInterestStatus(interestId, status) {
    try {
      const res = await fetch(`${BASE_URL}/products/interests/${interestId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      return { success: false, message: "Network error." };
    }
  },

  // ── DELETE PRODUCT ───────────────────────────────────────────────────────────
  async deleteProduct(id) {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return { success: res.ok };
    } catch (err) {
      return { success: false };
    }
  },

  // ── LOGOUT ───────────────────────────────────────────────────────────────────
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_type");
    window.location.href = "/login";
  },

  // ── AUTH CHECK ───────────────────────────────────────────────────────────────
  isLoggedIn() {
    return !!getToken();
  },

  getUserRole() {
    return localStorage.getItem("user_type");
  },
};