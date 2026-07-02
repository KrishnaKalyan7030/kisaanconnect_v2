from pydantic import BaseModel,EmailStr,Field
from typing import Literal,Optional

# Schemas
class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=10)
    village: Optional[str] = None
    district: Optional[str] = None
    state: str = "Maharashtra"
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    user_type: Literal["farmer", "buyer"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str
    message: str
