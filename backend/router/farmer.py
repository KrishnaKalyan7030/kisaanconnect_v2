from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import User

router = APIRouter(prefix="/farmers", tags=["Farmers"])

@router.get("/{farmer_id}")
def get_farmer_profile(farmer_id: int, db: Session = Depends(get_db)):
  
    farmer = db.query(User).filter(User.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return {
        "id": farmer.id,
        "full_name": farmer.full_name,
        "village": farmer.village,
        "district": farmer.district,
        "state": farmer.state,
    }