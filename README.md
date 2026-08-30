# Kisaan Connect

A marketplace connecting farmers directly with buyers — built mobile-first,
with support for English, Hindi, Marathi, and Punjabi.

## Architecture

```
kisaanconnect_v2/
├── backend2/     FastAPI + PostgreSQL (Neon) — REST API only, no HTML
└── frontend/     React + Vite + Tailwind CSS — deployed separately
```

The frontend and backend are two independent deployments that talk over
HTTP. The backend does not serve any HTML — it's a pure JSON API.

## Tech stack

| Layer          | Choice                          |
|-----------------|----------------------------------|
| Frontend         | React, React Router, Tailwind CSS |
| Backend           | FastAPI                            |
| Database           | PostgreSQL (hosted on Neon)         |
| Auth                | JWT (python-jose)                    |
| Image storage        | Cloudinary (falls back to local disk) |
| Migrations             | Alembic                                |

## Key features

- JWT authentication, role-based (farmer / buyer)
- Farmers list products with photos (Cloudinary), buyers browse and filter
- Farmer's phone number is only revealed to logged-in buyers — not on the
  public product listing
- "I am Interested" — buyers express interest without a farmer's number
  being shown upfront; farmers see a list of interested buyers per product,
  with contact details and a status they can update (pending → contacted → closed)
- View counts per product (deduplicated per browser session, not per page load)
- Search/filter marketplace by location, price range, and sort order
- Full i18n — every screen, form, and validation message in 4 languages

## Local setup

**Backend:**
```bash
cd backend2
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # fill in real DATABASE_URL, SECRET_KEY, etc.
alembic upgrade head          # apply migrations to your database
uvicorn main:app --reload
```
Runs on `http://127.0.0.1:8000`. Check `http://127.0.0.1:8000/health`.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## API overview

| Area       | Endpoints |
|------------|-----------|
| Auth        | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Products     | `GET /products/` (filterable), `POST /products/`, `GET/DELETE /products/{id}`, `GET /products/my` |
| Interest      | `POST /products/{id}/interest`, `GET /products/{id}/interested-buyers`, `PATCH /products/interests/{id}` |
| Views          | `POST /products/{id}/view` |
| Users           | `GET /users/farmer-info/{product_id}` (login required), `POST /users/me/photo` |

Full interactive docs at `http://127.0.0.1:8000/docs` once the backend is running.

## Database migrations

Schema changes go through Alembic — never `Base.metadata.create_all()` on an
existing database. See `backend2/alembic/README.md` for the full workflow.

```bash
alembic revision --autogenerate -m "describe your change"
# review the generated file in alembic/versions/
alembic upgrade head
```

## Deployment

- **Backend** → Render (or similar): set `DATABASE_URL`, `SECRET_KEY`,
  `CLOUDINARY_*` as environment variables in the dashboard — never commit `.env`.
- **Frontend** → Vercel: `npm run build`, deploy the `dist/` folder.
- After deploying, update:
  - `ALLOWED_ORIGINS` in `backend2/main.py` — add the real frontend URL
  - `BASE_URL` in `frontend/src/api/client.js` — point at the real backend URL
