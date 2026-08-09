from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings
import os

# Create engine for PostgreSQL with connection pooling for production
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Helps with connection drops
    pool_recycle=300,    # Recycle connections every 5 minutes
)

# Session for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()