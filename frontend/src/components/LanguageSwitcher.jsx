import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

const OPTIONS = [
  { code: "en", label: "🇬🇧 English" },
  { code: "hi", label: "🇮🇳 हिंदी" },
  { code: "mr", label: "🇮🇳 मराठी" },
  { code: "pa", label: "🇮🇳 ਪੰਜਾਬੀ" },
];

export default function LanguageSwitcher() {
  const { setLanguage, langName } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="relative lang-switcher-wrapper" ref={wrapperRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-gray-200 hover:border-emerald-400 text-sm font-medium text-gray-700 transition"
      >
        <i className="fas fa-globe text-emerald-600"></i>
        <span className="lang-current">{langName}</span>
        <i className="fas fa-chevron-down text-xs text-gray-400"></i>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 min-w-[130px]">
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => {
                setLanguage(opt.code);
                setOpen(false);
              }}
              className="lang-opt w-full text-left px-4 py-3 hover:bg-emerald-50 text-sm font-medium flex items-center gap-2"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
