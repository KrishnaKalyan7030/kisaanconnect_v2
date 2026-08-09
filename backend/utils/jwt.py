from typing import Optional
from core.config import settings
from jose import jwt,JWTError
from datetime import datetime ,timedelta

def create_access_token(data:dict,expires_delta: Optional[timedelta] = None):
    # Step 1: Make a copy of the data (so we don't change original dictionary)
    to_encode = data.copy()

    # Step 2: Calculate when the token should expire
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Use default expiry time from .env file (usually 60 minutes)
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Step 3: Add expiry time into our data
    to_encode.update({"exp": expire})

    # Step 4: Create the actual JWT token using secret key
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        print("Decoded payload:", payload)

        email: str = payload.get('sub')   # ✅ FIXED

        if email is None:
            return None

        return payload

    except JWTError as e:
        print("JWT ERROR:", e)
        return None
        
