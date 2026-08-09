import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { translations, SUPPORTED_LANGS, LANG_NAMES } from "../data/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("kc_lang") || "en");

  const setLanguage = useCallback((next) => {
    if (!SUPPORTED_LANGS.includes(next)) return;
    setLang(next);
    localStorage.setItem("kc_lang", next);
  }, []);

  const t = useCallback(
    (key) => (translations[lang] && translations[lang][key]) || translations.en[key] || key,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLanguage, t, langName: LANG_NAMES[lang] || lang.toUpperCase() }),
    [lang, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
