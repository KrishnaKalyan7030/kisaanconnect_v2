from pydantic import BaseModel
from datetime import date, time
from typing import Optional


class ProductBase(BaseModel):
    name: str
    village: str
    phone: str
    price: float
    quantity: float
    available_date: date
    available_time: Optional[time] = None
    description: Optional[str] = None


class ProductResponse(ProductBase):
    id: int
    image_url: Optional[str] = None
    farmer_id: int
    # phone: Optional[str] = None
    # quantity: Optional[float] = None
    # available_date: Optional[str] = None
    # village: Optional[str] = None

    class Config:
        from_attributes = True