from fastapi import APIRouter, Request, HTTPException, Depends, Response, status
# from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from db.database import get_db
from models.user import User, UserType
from schemas.auth import RegisterRequest, TokenResponse
from utils.security import hash_password, verify_password
from utils.jwt import create_access_token
from core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# templates = Jinja2Templates(directory="frontend")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ====================== HTML ROUTES ======================

# @router.get("/")
# def home(request: Request):
#     return templates.TemplateResponse("index.html", {"request": request})


# @router.get("/register")
# def register_page(request: Request):
#     return templates.TemplateResponse("register.html", {"request": request})


# @router.get("/login")
# def login_page(request: Request):
#     return templates.TemplateResponse("login.html", {"request": request})


# ====================== REGISTER ======================

@router.post("/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):

    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Check email
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check phone
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status_code=400, detail="Phone already registered")

    # Hash password
    hashed_password = hash_password(data.password)

    # Create user
    new_user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        village=data.village,
        district=data.district,
        state=data.state,
        hashed_password=hashed_password,
        user_type=UserType(data.user_type)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "user_type": new_user.user_type.value
        }
    }


# ====================== LOGIN (OAuth2) ======================

@router.post("/login", response_model=TokenResponse)
async def login_user(
    response:Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    
    db: Session = Depends(get_db)
):
    email = form_data.username
    password = form_data.password

    user = db.query(User).filter(User.email == email).first()
    

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {
        "sub": user.email,
        "user_id": user.id,
        "user_type": user.user_type.value
    }

    access_token = create_access_token(payload)

    # SET COOKIE (unused by the React app, which reads the token from the
    # response body instead — kept here in case cookie-based auth is added
    # later. secure=True in production so it's only sent over HTTPS.)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        max_age=7200
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user.user_type.value,
        "message": "Login successful"
    }


# ====================== PROTECTED ROUTE ======================

@router.get("/me")
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
         
         

        user_id = payload.get("user_id")


        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status_code=401, detail="Token has expired")
        
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Token invalid: {str(e)}")
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalid or expired")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.user_type.value,
        "village": user.village,
        "district": user.district,
        "profile_image_url": user.profile_image_url,
        "bio": user.bio
    }