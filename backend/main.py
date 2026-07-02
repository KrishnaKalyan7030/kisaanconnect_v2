# # from fastapi import FastAPI
# # from fastapi.middleware.cors import CORSMiddleware
# # from router.auth import router as auth_router  
# # from router.product import router as product_router
# # from core.config import settings
# # from db.database import Base, engine
# # from models.user import User
# # from models.product import Product 
# # from fastapi.staticfiles import StaticFiles
# # from pathlib import Path
# # from fastapi.responses import FileResponse
# # import os

# # # initializing fastapi app here 
# # app = FastAPI(
# #     title="Kisaan Connect",
# #     description="Platform connecting farmers and buyers",
# #     version="1.0.0"
# # )



# # # Create tables on startup (PostgreSQL compatible)
# # @app.on_event("startup")
# # async def init_db():
# #     try:
# #         Base.metadata.create_all(bind=engine)
# #         print("✅ Database tables created/verified on PostgreSQL")
# #     except Exception as e:
# #         print(f"❌ Database initialization error: {e}")
       

# # # CORS middleware
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # Serve uploaded files (ADD THIS BEFORE YOUR ROUTERS)
# # uploads_path = Path("../uploads")  # Path to kisaanconnect/uploads/
# # if uploads_path.exists():
# #     app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")
# #     app.mounts('/static',StaticFiles(directory='frontend'),name='static')
# # # FIRST: Mount static files (CSS, JS)
# # app.mount("/css", StaticFiles(directory="../frontend/css"), name="css")
# # app.mount("/js", StaticFiles(directory="../frontend/js"), name="js")
# # app.mount("/assets", StaticFiles(directory="../frontend/assets"), name="assets")


# # # Include routers
# # app.include_router(auth_router, tags=['Authentication'])
# # app.include_router(product_router, tags=['Products'])





# # # SECOND: Serve HTML pages
# # @app.get("/")
# # async def serve_index():
# #     return FileResponse("../frontend/index.html")
# # # @app.get("/")
# # # def root():
# # #     return {
# # #         "status": "API running", 
# # #         "database": "PostgreSQL",
# # #         "message": "KisaanConnect Backend"
# # #     }




# # @app.get("/health")
# # def health_check():
# #     return {"status": "healthy"}

# # ==========================
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse
# from router.auth import router as auth_router  
# from router.product import router as product_router
# from core.config import settings
# from db.database import Base, engine
# from models.user import User
# from models.product import Product 
# from pathlib import Path
# import os

# # Initializing fastapi app here 
# app = FastAPI(
#     title="Kisaan Connect",
#     description="Platform connecting farmers and buyers",
#     version="1.0.0"
# )

# # Create tables on startup
# @app.on_event("startup")
# async def init_db():
#     try:
#         Base.metadata.create_all(bind=engine)
#         print("✅ Database tables created/verified on PostgreSQL")
#     except Exception as e:
#         print(f"❌ Database initialization error: {e}")

# # CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ========== STATIC FILES CONFIGURATION ==========
# FRONTEND_PATH = Path(__file__).parent.parent / "frontend"
# UPLOADS_PATH = Path(__file__).parent.parent / "uploads"

# # Mount static folders (CSS, JS, assets)
# if FRONTEND_PATH.exists():
#     css_path = FRONTEND_PATH / "css"
#     js_path = FRONTEND_PATH / "js"
#     assets_path = FRONTEND_PATH / "assets"
    
#     if css_path.exists():
#         app.mount("/css", StaticFiles(directory=str(css_path)), name="css")
#     if js_path.exists():
#         app.mount("/js", StaticFiles(directory=str(js_path)), name="js")
#     if assets_path.exists():
#         app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")
    
#     print(f"✅ Frontend folder found at: {FRONTEND_PATH}")
# else:
#     print(f"❌ Frontend folder NOT found at: {FRONTEND_PATH}")

# # Mount uploads folder
# if UPLOADS_PATH.exists():
#     app.mount("/uploads", StaticFiles(directory=str(UPLOADS_PATH)), name="uploads")
#     print(f"✅ Uploads folder found at: {UPLOADS_PATH}")

# # ========== INCLUDE API ROUTERS ==========
# # Your APIs: /auth/login, /auth/register, /auth/me
# # And: /products/, /products/my, etc.
# app.include_router(auth_router, tags=['Authentication'])
# app.include_router(product_router, tags=['Products'])

# # ========== SERVE HTML PAGES (DIFFERENT PATHS FROM API) ==========
# # These are separate from /auth/* APIs

# @app.get("/")
# async def serve_index():
#     """Serve homepage at /"""
#     index_path = FRONTEND_PATH / "index.html"
#     if index_path.exists():
#         return FileResponse(str(index_path))
#     return {"error": "index.html not found"}

# @app.get("/login")
# async def serve_login():
#     """Serve login page at /login (different from API at /auth/login)"""
#     login_path = FRONTEND_PATH / "login.html"
#     if login_path.exists():
#         return FileResponse(str(login_path))
#     return {"error": "login.html not found"}

# @app.get("/register")
# async def serve_register():
#     """Serve register page at /register (different from API at /auth/register)"""
#     register_path = FRONTEND_PATH / "register.html"
#     if register_path.exists():
#         return FileResponse(str(register_path))
#     return {"error": "register.html not found"}

# @app.get("/marketplace")
# async def serve_marketplace():
#     """Serve marketplace page"""
#     marketplace_path = FRONTEND_PATH / "marketplace.html"
#     if marketplace_path.exists():
#         return FileResponse(str(marketplace_path))
#     return {"error": "marketplace.html not found"}

# # Catch-all for dashboard pages
# @app.get("/{page}.html")
# async def serve_html_pages(page: str):
#     """Serve any .html file (dashboard pages, etc.)"""
#     file_path = FRONTEND_PATH / f"{page}.html"
#     if file_path.exists():
#         return FileResponse(str(file_path))
#     return {"error": f"{page}.html not found"}

# @app.get("/api-status")
# def api_status():
#     """Check API status"""
#     return {
#         "status": "API running", 
#         "database": "PostgreSQL",
#         "message": "KisaanConnect Backend"
#     }

# @app.get("/health")
# def health_check():
#     return {"status": "healthy"}






























from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from router.auth import router as auth_router
from router.product import router as product_router
from router.farmer import router as farmer_router
from core.config import settings
from db.database import Base, engine
from models.user import User
from models.product import Product
from pathlib import Path

app = FastAPI(
    title="Kisaan Connect",
    description="Platform connecting farmers and buyers",
    version="1.0.0"
)

@app.on_event("startup")
async def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified on PostgreSQL")
    except Exception as e:
        print(f"❌ Database initialization error: {e}")

# ─── CORS ─────────────────────────────────────────────────────────────────────
# FIX: allow_credentials=True is INCOMPATIBLE with allow_origins=["*"].
# You MUST list frontend URLs explicitly when using credentials.
# ALLOWED_ORIGINS = [
#     "https://kisaanconnectlocal.vercel.app",  # ← Replace with your actual Render frontend URL
#     "http://localhost:3000",
#     "http://localhost:5500",
#     "http://127.0.0.1:5500",
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── STATIC FILES ─────────────────────────────────────────────────────────────
FRONTEND_PATH = Path(__file__).parent.parent / "frontend"
UPLOADS_PATH = Path(__file__).parent.parent / "uploads"

if FRONTEND_PATH.exists():
    for folder, name in [("css", "css"), ("js", "js"), ("assets", "assets")]:
        p = FRONTEND_PATH / folder
        if p.exists():
            app.mount(f"/{folder}", StaticFiles(directory=str(p)), name=name)
    print(f"✅ Frontend found at: {FRONTEND_PATH}")
else:
    print(f"❌ Frontend NOT found at: {FRONTEND_PATH}")

if UPLOADS_PATH.exists():
    app.mount("/uploads", StaticFiles(directory=str(UPLOADS_PATH)), name="uploads")

# ─── API ROUTERS ───────────────────────────────────────────────────────────────
app.include_router(auth_router, tags=["Authentication"])
app.include_router(product_router, tags=["Products"])
app.include_router(farmer_router, tags=["Farmers"])

# ─── HTML PAGE ROUTES ─────────────────────────────────────────────────────────
def _serve(filename: str):
    p = FRONTEND_PATH / filename
    return FileResponse(str(p)) if p.exists() else {"error": f"{filename} not found"}

@app.get("/")
async def serve_index():
    return _serve("index.html")

@app.get("/login")
async def serve_login():
    return _serve("login.html")

@app.get("/register")
async def serve_register():
    return _serve("register.html")

@app.get("/marketplace")
async def serve_marketplace():
    return _serve("marketplace.html")

@app.get("/{page}.html")
async def serve_html_pages(page: str):
    return _serve(f"{page}.html")

@app.get("/health")
def health_check():
    return {"status": "healthy"}