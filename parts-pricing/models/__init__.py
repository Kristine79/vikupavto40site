"""
Database models initialization
"""

import os

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime

Base = declarative_base()


class Part(Base):
    """Auto part model"""
    __tablename__ = "parts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False, index=True)
    sku = Column(String(100), unique=True, index=True)
    brand = Column(String(100))
    category = Column(String(100))
    oem_number = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PriceRecord(Base):
    """Price record from various sources"""
    __tablename__ = "price_records"
    
    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, index=True)
    source = Column(String(50), nullable=False)  # autodoc, exist, partsreview
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="RUB")
    url = Column(String(1000))
    availability = Column(String(50))  # in_stock, out_of_stock, on_order
    delivery_days = Column(Integer)
    raw_data = Column(JSON)  # Store full response for debugging
    scraped_at = Column(DateTime, default=datetime.utcnow)


# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///parts.db")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
