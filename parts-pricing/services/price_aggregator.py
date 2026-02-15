"""
Price aggregator service - combines prices from multiple sources
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from models import PriceRecord, async_session
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload

logger = logging.getLogger(__name__)


class PriceAggregator:
    """Aggregates and processes prices from multiple sources"""
    
    def __init__(self):
        self.sources = ["autodoc", "exist", "partsreview"]
    
    async def get_prices_for_part(
        self, 
        part_id: int, 
        max_age_hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Get all prices for a part, filtering by age"""
        
        cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
        
        async with async_session() as session:
            stmt = select(PriceRecord).where(
                and_(
                    PriceRecord.part_id == part_id,
                    PriceRecord.scraped_at >= cutoff_time
                )
            ).order_by(PriceRecord.price)
            
            result = await session.execute(stmt)
            records = result.scalars().all()
            
            return [
                {
                    "id": r.id,
                    "source": r.source,
                    "price": r.price,
                    "currency": r.currency,
                    "url": r.url,
                    "availability": r.availability,
                    "delivery_days": r.delivery_days,
                    "scraped_at": r.scraped_at.isoformat() if r.scraped_at else None
                }
                for r in records
            ]
    
    async def get_best_price(
        self, 
        part_id: int, 
        in_stock_only: bool = True
    ) -> Optional[Dict[str, Any]]:
        """Get the best (lowest) price for a part"""
        
        prices = await self.get_prices_for_part(part_id)
        
        if not prices:
            return None
        
        if in_stock_only:
            prices = [p for p in prices if p.get("availability") == "in_stock"]
        
        if not prices:
            return None
        
        return min(prices, key=lambda x: x["price"])
    
    async def get_average_price(
        self, 
        part_id: int, 
        in_stock_only: bool = True
    ) -> Optional[float]:
        """Calculate average price across all sources"""
        
        prices = await self.get_prices_for_part(part_id)
        
        if not prices:
            return None
        
        if in_stock_only:
            prices = [p for p in prices if p.get("availability") == "in_stock"]
        
        if not prices:
            return None
        
        return sum(p["price"] for p in prices) / len(prices)
    
    async def get_price_summary(self, part_id: int) -> Dict[str, Any]:
        """Get price summary with statistics"""
        
        prices = await self.get_prices_for_part(part_id)
        
        if not prices:
            return {
                "part_id": part_id,
                "has_prices": False,
                "message": "No prices available"
            }
        
        in_stock_prices = [p for p in prices if p.get("availability") == "in_stock"]
        
        return {
            "part_id": part_id,
            "has_prices": True,
            "total_sources": len(prices),
            "in_stock_sources": len(in_stock_prices),
            "best_price": min(p["price"] for p in prices) if prices else None,
            "average_price": sum(p["price"] for p in prices) / len(prices) if prices else None,
            "lowest_in_stock": min(p["price"] for p in in_stock_prices) if in_stock_prices else None,
            "sources": list(set(p["source"] for p in prices)),
            "prices": prices
        }
    
    async def save_price_record(
        self,
        part_id: int,
        source: str,
        price: float,
        url: str,
        availability: str = "in_stock",
        delivery_days: Optional[int] = None,
        raw_data: Optional[Dict] = None
    ) -> PriceRecord:
        """Save a new price record to the database"""
        
        async with async_session() as session:
            record = PriceRecord(
                part_id=part_id,
                source=source,
                price=price,
                currency="RUB",
                url=url,
                availability=availability,
                delivery_days=delivery_days,
                raw_data=raw_data,
                scraped_at=datetime.utcnow()
            )
            
            session.add(record)
            await session.commit()
            await session.refresh(record)
            
            return record
