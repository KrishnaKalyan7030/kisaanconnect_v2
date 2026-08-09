from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import User
from models.product import Product
from schemas.user import FarmerInfoResponse, ProfilePhotoResponse
from dependencies.auth import get_current_user
from utils.image_storage import save_profile_image

router = APIRouter(prefix="/users", tags=["Users"])


# ── UPDATE MY PROFILE PHOTO (farmer or buyer, uploading their OWN photo) ──────
@router.post("/me/photo", response_model=ProfilePhotoResponse)
async def update_profile_photo(
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),   # 🔒 must be logged in
    db: Session = Depends(get_db)
):
    try:
        image_url = save_profile_image(photo)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    current_user.profile_image_url = image_url
    db.commit()
    db.refresh(current_user)

    return {"profile_image_url": current_user.profile_image_url}


# ── GET FARMER INFO FOR A PRODUCT (buyer viewing who grew it) ────────────────
@router.get("/farmer-info/{product_id}", response_model=FarmerInfoResponse)
def get_farmer_info(
    product_id: int,
    current_user: User = Depends(get_current_user),   # 🔒 THIS is the real lock.
    # FastAPI runs get_current_user BEFORE this function's body.
    # No valid token -> it raises 401 itself -> our code below never runs.
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    farmer = db.query(User).filter(User.id == product.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    return farmer