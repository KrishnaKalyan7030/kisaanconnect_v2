# import uuid
# import shutil
# from pathlib import Path
# from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
# from sqlalchemy.orm import Session
# from typing import Optional
# from datetime import date, time

# from db.database import get_db
# from models.product import Product
# from schemas.product import ProductResponse
# from dependencies.auth import get_current_user

# router = APIRouter(prefix="/products", tags=["Products"])

# UPLOAD_DIR = Path("uploads")
# UPLOAD_DIR.mkdir(exist_ok=True)


# # CREATE PRODUCT
# @router.post("/", response_model=ProductResponse)
# async def create_product(
#     name: str = Form(...),
#     village: str = Form(...),
#     phone: str = Form(...),
#     price: float = Form(...),
#     quantity: float = Form(...),
#     available_date: date = Form(...),
#     available_time: Optional[time] = Form(None),
#     description: Optional[str] = Form(None),
#     image: UploadFile = File(...),
#     current_user=Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     # Allow only farmers
#     if current_user.user_type != "farmer":
#         raise HTTPException(status_code=403, detail="Only farmers can add products")

#     # Save image
#     file_ext = image.filename.split(".")[-1]
#     filename = f"{uuid.uuid4()}.{file_ext}"
#     file_path = UPLOAD_DIR / filename

#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(image.file, buffer)

#     image_url = f"/uploads/{filename}"

#     #  SAVE IMAGE URL IN DATABASE (MAIN FIX)
#     new_product = Product(
#         name=name,
#         village=village,
#         phone=phone,
#         price=price,
#         quantity=quantity,
#         available_date=available_date,
#         available_time=available_time,
#         description=description,
#         image_url=image_url,   # ✅ IMPORTANT LINE
#         farmer_id=current_user.id
#     )

#     db.add(new_product)
#     db.commit()
#     db.refresh(new_product)

#     return new_product


# # GET ALL PRODUCTS
# @router.get("/", response_model=list[ProductResponse])
# def get_products(db: Session = Depends(get_db)):
#     return db.query(Product).all()


# #  GET MY PRODUCTS
# @router.get("/my", response_model=list[ProductResponse])
# def get_my_products(
#     current_user=Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     return db.query(Product).filter(Product.farmer_id == current_user.id).all()


# #  GET SINGLE PRODUCT
# @router.get("/{product_id}", response_model=ProductResponse)
# def get_product(product_id: int, db: Session = Depends(get_db)):
#     product = db.query(Product).filter(Product.id == product_id).first()

#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     return product


# # DELETE PRODUCT
# @router.delete("/{product_id}")
# def delete_product(
#     product_id: int,
#     current_user=Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     product = db.query(Product).filter(Product.id == product_id).first()

#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")

#     if product.farmer_id != current_user.id:
#         raise HTTPException(status_code=403, detail="Not allowed")

#     db.delete(product)
#     db.commit()

#     return {"message": "Deleted successfully"}
















# ====================
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, time

from db.database import get_db
from models.product import Product
from models.user import UserType
from schemas.product import ProductResponse
from dependencies.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# CREATE PRODUCT
@router.post("/", response_model=ProductResponse)
async def create_product(
    name: str = Form(...),
    village: str = Form(...),
    phone: str = Form(...),
    price: float = Form(...),
    quantity: float = Form(...),
    available_date: date = Form(...),
    available_time: Optional[time] = Form(None),
    description: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # FIX: UserType is a str-enum so comparing .value is explicit and safe
    if current_user.user_type.value != UserType.farmer.value:
        raise HTTPException(status_code=403, detail="Only farmers can add products")

    # Save image
    file_ext = image.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    image_url = f"/uploads/{filename}"

    new_product = Product(
        name=name,
        village=village,
        phone=phone,
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


# GET ALL PRODUCTS
@router.get("/", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


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