from pydantic import BaseModel
from typing import Optional


class FarmerInfoResponse(BaseModel):
    id: int
    full_name: str
    phone: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True  # lets Pydantic read this straight off a SQLAlchemy User object


class ProfilePhotoResponse(BaseModel):
    profile_image_url: str