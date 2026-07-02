from sqlalchemy import Column, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship
from db.database import Base
import enum

class UserType(str, enum.Enum):
    farmer = "farmer"
    buyer = "buyer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    village = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, default="Maharashtra")
    hashed_password = Column(String, nullable=False)
    
    # This is the fixed version for PostgreSQL
    # user_type = Column(
    #     SQLEnum(UserType, name="usertype", create_type=False), 
    #     nullable=False
    # )
    user_type = Column(
        SQLEnum(UserType), 
        nullable=False
    )
