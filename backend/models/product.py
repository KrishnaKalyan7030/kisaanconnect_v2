from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Time
from db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    image_url = Column(String, nullable=True)  # ✅ IMPORTANT

    name = Column(String, nullable=False)
    village = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    available_date = Column(Date, nullable=False)
    available_time = Column(Time, nullable=True)
    description = Column(String, nullable=True)

    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)