"""
Kisaan Connect — FastAPI backend.

Pure JSON API. The frontend is a separate React app (deployed independently
on Vercel) — this backend does not serve any HTML.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from router.auth import router as auth_router
from router.product import router as product_router
from router.user import router as user_router
from router.interest import router as interest_router

app = FastAPI(
    title="Kisaan Connect",
    description="Platform connecting farmers and buyers",
    version="1.0.0",
)

# ─── CORS ───────────────────────────────────────────────────────────────────
# allow_credentials=True requires an explicit origin list — "*" is not
# permitted alongside it. Add your deployed frontend's real URL here once
# it's live.

ALLOWED_ORIGINS = [
    "http://localhost:5173",   
    "http://127.0.0.1:5173",
    "https://kisaanconnect-v2.vercel.app" #deployed link
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── STATIC FILES ───────────────────────────────────────────────────────────
# Only used as a fallback when Cloudinary isn't configured (see
# utils/image_storage.py). Once CLOUDINARY_* env vars are set, new uploads
# go straight to Cloudinary and this folder stays empty.
UPLOADS_PATH = Path(__file__).parent / "uploads"
if UPLOADS_PATH.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_PATH)), name="uploads")

# ─── API ROUTERS ────────────────────────────────────────────────────────────
app.include_router(auth_router, tags=["Authentication"])
app.include_router(product_router, tags=["Products"])
app.include_router(user_router, tags=["Users"])
app.include_router(interest_router, tags=["Interests"])


@app.get("/health")
def health_check():
    return {"status": "healthy"}
