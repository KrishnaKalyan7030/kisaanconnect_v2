from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.sql import func
from db.database import Base
import enum


class InterestStatus(str, enum.Enum):
    pending = "pending"      # buyer just clicked "I am Interested"
    contacted = "contacted"  # farmer has reached out to the buyer
    closed = "closed"        # deal done / no longer relevant


class ProductInterest(Base):
    __tablename__ = "product_interests"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(InterestStatus, name="interest_status_enum"), default=InterestStatus.pending, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # A buyer can only mark interest in a given product once — clicking
    # "I am Interested" a second time should be a no-op, not a duplicate row.
    __table_args__ = (
        UniqueConstraint("product_id", "buyer_id", name="uq_product_buyer_interest"),
    )
