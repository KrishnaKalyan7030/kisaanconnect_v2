from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from models.interest import InterestStatus


class InterestCreateResponse(BaseModel):
    message: str
    already_interested: bool = False


class InterestedBuyerResponse(BaseModel):
    id: int              # id of the interest row (used to update status later)
    buyer_id: int
    buyer_name: str
    village: Optional[str] = None
    district: Optional[str] = None
    phone: Optional[str] = None
    status: InterestStatus
    created_at: datetime

    class Config:
        from_attributes = True


class InterestStatusUpdate(BaseModel):
    status: InterestStatus
