from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from db.database import get_db
from models.product import Product
from models.user import User
from models.interest import ProductInterest
from schemas.interest import InterestCreateResponse, InterestedBuyerResponse, InterestStatusUpdate
from dependencies.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Interests"])


# ── BUYER: mark interest in a product ("I am Interested" button) ────────────
@router.post("/{product_id}/interest", response_model=InterestCreateResponse)
def mark_interest(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.user_type.value != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can mark interest")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Idempotent: clicking twice doesn't create a duplicate row or error out.
    existing = (
        db.query(ProductInterest)
        .filter(ProductInterest.product_id == product_id, ProductInterest.buyer_id == current_user.id)
        .first()
    )
    if existing:
        return {"message": "You've already shown interest in this product", "already_interested": True}

    interest = ProductInterest(product_id=product_id, buyer_id=current_user.id)
    db.add(interest)
    db.commit()

    return {"message": "The farmer has been notified of your interest", "already_interested": False}


# ── FARMER: view everyone interested in one of their products ──────────────
@router.get("/{product_id}/interested-buyers", response_model=list[InterestedBuyerResponse])
def get_interested_buyers(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    rows = (
        db.query(ProductInterest, User)
        .join(User, ProductInterest.buyer_id == User.id)
        .filter(ProductInterest.product_id == product_id)
        .order_by(ProductInterest.created_at.desc())
        .all()
    )

    return [
        InterestedBuyerResponse(
            id=interest.id,
            buyer_id=buyer.id,
            buyer_name=buyer.full_name,
            village=buyer.village,
            district=buyer.district,
            phone=buyer.phone,
            status=interest.status,
            created_at=interest.created_at,
        )
        for interest, buyer in rows
    ]


# ── FARMER: interested-buyer COUNT per product (for dashboard cards) ────────
@router.get("/my/interest-counts")
def get_my_interest_counts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product_ids = [p.id for p in db.query(Product.id).filter(Product.farmer_id == current_user.id).all()]
    if not product_ids:
        return {}

    rows = (
        db.query(ProductInterest.product_id, func.count(ProductInterest.id))
        .filter(ProductInterest.product_id.in_(product_ids))
        .group_by(ProductInterest.product_id)
        .all()
    )
    counts = {product_id: count for product_id, count in rows}
    # Include products with zero interest too, so the frontend doesn't need
    # to guess — every farmer product_id gets an entry.
    return {pid: counts.get(pid, 0) for pid in product_ids}


# ── FARMER: move a buyer's interest through pending -> contacted -> closed ──
@router.patch("/interests/{interest_id}")
def update_interest_status(
    interest_id: int,
    payload: InterestStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interest = db.query(ProductInterest).filter(ProductInterest.id == interest_id).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")

    product = db.query(Product).filter(Product.id == interest.product_id).first()
    if not product or product.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    interest.status = payload.status
    db.commit()
    return {"message": "Status updated"}
