from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import date, time

from db.database import get_db
from models.product import Product
from models.user import User, UserType
from schemas.product import ProductResponse
from dependencies.auth import get_current_user
from utils.image_storage import save_product_image

router = APIRouter(prefix="/products", tags=["Products"])


# CREATE PRODUCT
@router.post("/", response_model=ProductResponse)
async def create_product(
    name: str = Form(...),
    village: str = Form(...),
    price: float = Form(...),
    quantity: float = Form(...),
    available_date: date = Form(...),
    available_time: Optional[time] = Form(None),
    description: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # UserType is a str-enum so comparing .value is explicit and safe
    if current_user.user_type.value != UserType.farmer.value:
        raise HTTPException(status_code=403, detail="Only farmers can add products")

    # Save image (Cloudinary if configured, else local disk — see utils/image_storage.py)
    image_url = save_product_image(image)

    new_product = Product(
        name=name,
        village=village,
        phone=current_user.phone,  # ← auto-filled from registration, never asked again
        price=price,
        quantity=quantity,
        available_date=available_date,
        available_time=available_time,
        description=description,
        image_url=image_url,
        farmer_id=current_user.id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# GET ALL PRODUCTS (with optional filters — used by the Marketplace filter panel)
@router.get("/", response_model=list[ProductResponse])
def get_products(
    q: Optional[str] = None,             # product name search
    location: Optional[str] = None,      # matches product village OR farmer's district/state
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "newest",      # "newest" | "price_asc" | "price_desc"
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if location:
        # One simple search box on the frontend — a buyer might type a
        # village, a district, or a state, so match any of the three rather
        # than making them pick which field it is.
        query = query.join(User, Product.farmer_id == User.id)
        query = query.filter(or_(
            Product.village.ilike(f"%{location}%"),
            User.district.ilike(f"%{location}%"),
            User.state.ilike(f"%{location}%"),
        ))

    if q:
        query = query.filter(Product.name.ilike(f"%{q}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    else:  # "newest" (default) — most recently added first
        query = query.order_by(Product.id.desc())

    return query.all()


# GET MY PRODUCTS
@router.get("/my", response_model=list[ProductResponse])
def get_my_products(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Product).filter(Product.farmer_id == current_user.id).all()


# GET SINGLE PRODUCT
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# DELETE PRODUCT
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(product)
    db.commit()
    return {"message": "Deleted successfully"}


# RECORD A VIEW (public — no login needed to browse, but the frontend only
# calls this once per product per browser session, via a localStorage flag,
# so a single visitor refreshing the page doesn't inflate the count)
@router.post("/{product_id}/view")
def record_view(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.views_count = (product.views_count or 0) + 1
    db.commit()
    return {"views_count": product.views_count}
