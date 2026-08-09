from passlib.context import CryptContext

# This creates a password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash the password before saving to database"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if entered password matches the hashed one"""
    return pwd_context.verify(plain_password, hashed_password)