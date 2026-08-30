# KisaanConnect — React Version

This is a React (Vite + React Router + Tailwind CSS) conversion of the original
multi-page HTML/JS KisaanConnect frontend. The visual theme is unchanged:
Poppins font, emerald-green palette, FontAwesome icons, rounded-3xl cards.

## Getting started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

To create a production build:

```bash
npm run build
npm run preview
```

## Backend

The API client (`src/api/client.js`) points at:

```
http://127.0.0.1:8000
```

This matches the FastAPI backend included in the original project
(`backend/` folder, not part of this React app). Update `BASE_URL` in
`src/api/client.js` to point at a deployed backend when needed.

## Project structure

```
src/
  api/client.js            API client (auth, products) — ported from js/api.js
  data/translations.js     en/hi/mr/pa translation strings — ported from js/translations.js
  context/
    LanguageContext.jsx    i18n (replaces window.t / applyTranslations)
    AuthContext.jsx        auth state + checkAuth guard (replaces main.js)
    ToastContext.jsx       toast notifications (replaces main.js toast)
  components/
    Navbar.jsx              shared navbar (all page variants)
    Footer.jsx
    ProductCard.jsx
    LanguageSwitcher.jsx
    VideoCarousel.jsx       ported from js/video_carousel.js
  pages/
    Home.jsx                 index.html
    Login.jsx                 login.html
    Register.jsx               register.html
    Marketplace.jsx             marketplace.html (incl. product/farmer/auth modals)
    dashboard/
      FarmerDashboard.jsx        dashboard/farmer/index.html
      AddProduct.jsx               dashboard/farmer/add_products.html
      MyProducts.jsx                dashboard/farmer/my_products.html
      BuyerDashboard.jsx             dashboard/buyer/index.html
```

## Routes

| Route                        | Page              |
|-------------------------------|-------------------|
| `/`                            | Home              |
| `/login`                       | Login             |
| `/register`                    | Register          |
| `/marketplace`                 | Marketplace       |
| `/dashboard/farmer`            | Farmer Dashboard  |
| `/dashboard/farmer/add`        | Add Product       |
| `/dashboard/farmer/products`   | My Products       |
| `/dashboard/buyer`             | Buyer Dashboard   |

## Notes

- Language switching, toasts, and auth guards were ported from the original
  vanilla-JS globals (`window.t`, `window.Main`, `window.API`) into React
  context providers — same behavior, React-idiomatic implementation.
- `assets/videos/farmer1.mp4` referenced by the video carousel was not present
  in the uploaded project (only `adv.mp4` was) — this matches the original
  behavior, so the reference was kept as-is.
