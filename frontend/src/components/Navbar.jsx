// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { useLanguage } from "../context/LanguageContext";
// import { useAuth } from "../context/AuthContext";
// import LanguageSwitcher from "./LanguageSwitcher";

// /**
//  * Flexible Navbar used across all pages.
//  *
//  * props:
//  *  - maxWidth: tailwind max-w-* class for the inner container
//  *  - links: [{ to, i18nKey, label }] shown in the desktop + mobile menu
//  *  - cta: { to, i18nKey, label } shown as the primary button (e.g. Login/Register)
//  *  - backLink: { to, i18nKey, label, icon } shown instead of links (login/register pages)
//  *  - showLogout: boolean — shows a Logout button that calls auth.logout()
//  */
// export default function Navbar({ maxWidth = "max-w-7xl", links = [], cta, backLink, showLogout = false }) {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const { t } = useLanguage();
//   const auth = useAuth();

//   return (
//     <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
//       <div className={`${maxWidth} mx-auto px-4 py-4 flex justify-between items-center`}>
//         <Link to="/" className="flex items-center gap-3">
//           <i className="fas fa-seedling text-3xl text-emerald-600"></i>
//           <div>
//             <span className="text-2xl font-bold text-emerald-700">Kisaan</span>
//             <span className="text-2xl font-bold text-emerald-600">Connect</span>
//           </div>
//         </Link>

//         {backLink ? (
//           <div className="flex items-center gap-4">
//             <LanguageSwitcher />
//             <Link
//               to={backLink.to}
//               className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 text-sm sm:text-base"
//             >
//               {backLink.icon && <i className={`fas ${backLink.icon}`}></i>}
//               <span>{backLink.i18nKey ? t(backLink.i18nKey) : backLink.label}</span>
//             </Link>
//           </div>
//         ) : (
//           <>
//             {/* Desktop Menu */}
//             <div className="hidden sm:flex md:flex items-center gap-6 text-sm font-medium">
//               {links.map((link) => (
//                 <Link key={link.to} to={link.to} className="text-gray-700 hover:text-emerald-600 transition">
//                   {link.i18nKey ? t(link.i18nKey) : link.label}
//                 </Link>
//               ))}
//               <LanguageSwitcher />
//               {showLogout && (
//                 <button
//                   onClick={() => auth.logout()}
//                   className="px-5 py-2.5 bg-red-100 text-red-600 rounded-3xl hover:bg-red-200 font-medium text-sm"
//                 >
//                   {t("nav_logout")}
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center gap-3">
//               {cta && (
//                 <Link
//                   to={cta.to}
//                   className="hidden sm:block px-6 py-3 bg-emerald-700 text-white text-sm font-medium rounded-3xl hover:bg-emerald-800 transition"
//                 >
//                   {cta.i18nKey ? t(cta.i18nKey) : cta.label}
//                 </Link>
//               )}
//               <button
//                 onClick={() => setMobileOpen((o) => !o)}
//                 className="md:hidden sm:hidden p-2 text-3xl text-emerald-700"
//               >
//                 <i className="fas fa-bars"></i>
//               </button>
//             </div>
//           </>
//         )}
//       </div>

//       {/* Mobile Menu */}
//       {!backLink && mobileOpen && (
//         <div className="md:hidden sm:hidden bg-white border-t px-4 py-5">
//           <div className="flex flex-col gap-3 text-base font-medium">
//             {links.map((link) => (
//               <Link
//                 key={link.to}
//                 to={link.to}
//                 onClick={() => setMobileOpen(false)}
//                 className="py-3 px-4 hover:bg-emerald-50 rounded-2xl"
//               >
//                 {link.i18nKey ? t(link.i18nKey) : link.label}
//               </Link>
//             ))}
//             <div className="px-4 py-2">
//               <LanguageSwitcher />
//             </div>
//             {cta && (
//               <Link
//                 to={cta.to}
//                 onClick={() => setMobileOpen(false)}
//                 className="mt-2 w-full text-center py-4 bg-emerald-700 text-white rounded-3xl font-medium"
//               >
//                 {cta.i18nKey ? t(cta.i18nKey) : cta.label}
//               </Link>
//             )}
//             {showLogout && (
//               <button
//                 onClick={() => auth.logout()}
//                 className="mt-2 w-full py-4 bg-red-100 text-red-600 rounded-3xl font-medium"
//               >
//                 {t("nav_logout")}
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }


// ==========================*=======================

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * Flexible Navbar used across all pages.
 *
 * props:
 *  - maxWidth: tailwind max-w-* class for the inner container
 *  - links: [{ to, i18nKey, label }] shown in the desktop + mobile menu
 *  - cta: { to, i18nKey, label } shown as the primary button (e.g. Login/Register)
 *  - backLink: { to, i18nKey, label, icon } shown instead of links (login/register pages)
 *  - showLogout: boolean — shows a Logout button that calls auth.logout()
 */
export default function Navbar({ maxWidth = "max-w-7xl", links = [], cta, backLink, showLogout = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const auth = useAuth();

  // Hide navbar when scrolling down, reveal it when scrolling up.
  // lastScrollY is a ref (not state) so the scroll handler doesn't trigger
  // its own re-renders on every pixel — only `hidden` changes cause a render.
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      const scrolledDown = currentY > lastScrollY.current;
      const pastThreshold = currentY > 80; // don't hide near the very top of the page

      if (mobileOpen) {
        // Never hide the navbar while the mobile menu is open — the user
        // needs to keep seeing it to close it.
        setHidden(false);
      } else {
        setHidden(scrolledDown && pastThreshold);
      }

      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  return (
    <nav
      className={`bg-white shadow-sm border-b sticky top-0 z-50 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className={`${maxWidth} mx-auto px-4 py-4 flex justify-between items-center`}>
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 whitespace-nowrap">
          <i className="fas fa-seedling text-3xl text-emerald-600"></i>
          <div>
            <span className="text-2xl font-bold text-emerald-700">Kisaan</span>
            <span className="text-2xl font-bold text-emerald-600">Connect</span>
          </div>
        </Link>

        {backLink ? (
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to={backLink.to}
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2 text-sm sm:text-base"
            >
              {backLink.icon && <i className={`fas ${backLink.icon}`}></i>}
              <span>{backLink.i18nKey ? t(backLink.i18nKey) : backLink.label}</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className="text-gray-700 hover:text-emerald-600 transition">
                  {link.i18nKey ? t(link.i18nKey) : link.label}
                </Link>
              ))}
              <LanguageSwitcher />
              {showLogout && (
                <button
                  onClick={() => auth.logout()}
                  className="px-5 py-2.5 bg-red-100 text-red-600 rounded-3xl hover:bg-red-200 font-medium text-sm"
                >
                  {t("nav_logout")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {cta && (
                <Link
                  to={cta.to}
                  className="hidden md:block px-6 py-3 bg-emerald-700 text-white text-sm font-medium rounded-3xl hover:bg-emerald-800 transition"
                >
                  {cta.i18nKey ? t(cta.i18nKey) : cta.label}
                </Link>
              )}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden p-2 text-3xl text-emerald-700"
              >
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {!backLink && mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 py-5">
          <div className="flex flex-col gap-3 text-base font-medium">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-4 hover:bg-emerald-50 rounded-2xl"
              >
                {link.i18nKey ? t(link.i18nKey) : link.label}
              </Link>
            ))}
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
            {cta && (
              <Link
                to={cta.to}
                onClick={() => setMobileOpen(false)}
                className="mt-2 w-full text-center py-4 bg-emerald-700 text-white rounded-3xl font-medium"
              >
                {cta.i18nKey ? t(cta.i18nKey) : cta.label}
              </Link>
            )}
            {showLogout && (
              <button
                onClick={() => auth.logout()}
                className="mt-2 w-full py-4 bg-red-100 text-red-600 rounded-3xl font-medium"
              >
                {t("nav_logout")}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
