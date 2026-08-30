import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 space-y-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${
              toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
            } text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 text-sm md:text-base transition-opacity duration-300 ${
              toast.leaving ? "opacity-0" : "opacity-100"
            }`}
          >
            <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
