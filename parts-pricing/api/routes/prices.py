"""
Price lookup API endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel

from services.cache import cache_get, cache_set, CACHE_TTL_PRICES
from services.price_aggregator import PriceAggregator
from scrapers import AutoDocScraper, ExistScraper

router = APIRouter()
aggregator = PriceAggregator()


class PriceResponse(BaseModel):
    """Response model for price data"""
    part_id: int
    has_prices: bool
    total_sources: Optional[int] = None
    in_stock_sources: Optional[int] = None
    best_price: Optional[float] = None
    average_price: Optional[float] = None
    lowest_in_stock: Optional[float] = None
    sources: Optional[List[str]] = None
    prices: Optional[List[dict]] = None
    message: Optional[str] = None


class RefreshResponse(BaseModel):
    """Response model for refresh operation"""
    status: str
    message: str
    scraped_count: int = 0


@router.get("/{part_id}/prices", response_model=PriceResponse)
async def get_part_prices(
    part_id: int,
    in_stock_only: bool = Query(True, description="Show only in-stock prices"),
    force_refresh: bool = Query(False, description="Force refresh from sources")
):
    """
    Get all prices for a specific part
    
    Returns aggregated prices from all available sources
    """
    cache_key = f"prices:part:{part_id}:stock:{in_stock_only}"
    
    # Try cache first
    if not force_refresh:
        cached = await cache_get(cache_key)
        if cached:
            return cached
    
    # Get prices from aggregator
    try:
        summary = await aggregator.get_price_summary(part_id)
        response = PriceResponse(**summary)
        
        # Cache the result
        await cache_set(cache_key, response.model_dump(), CACHE_TTL_PRICES)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get prices: {str(e)}")


@router.get("/{part_id}/best-price")
async def get_best_price(
    part_id: int,
    in_stock_only: bool = Query(True)
):
    """
    Get the best (lowest) price for a part
    """
    cache_key = f"best_price:part:{part_id}:stock:{in_stock_only}"
    
    if cached := await cache_get(cache_key):
        return cached
    
    best = await aggregator.get_best_price(part_id, in_stock_only)
    
    if not best:
        raise HTTPException(status_code=404, detail="No prices found for this part")
    
    await cache_set(cache_key, best, CACHE_TTL_PRICES)
    return best


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_prices(
    part_id: int = Query(..., description="Part ID to refresh"),
    sources: Optional[str] = Query(None, description="Comma-separated list of sources (autodoc,exist)")
):
    """
    Force refresh prices for a part from all sources
    """
    # Parse sources
    source_list = sources.split(",") if sources else ["autodoc", "exist"]
    
    scraped_count = 0
    
    try:
        # Initialize scrapers
        async with AutoDocScraper() as autodoc, ExistScraper() as exist:
            scrapers = {"autodoc": autodoc, "exist": exist}
            
            for source in source_list:
                if source not in scrapers:
                    continue
                    
                scraper = scrapers[source]
                
                # Search and get prices
                parts = await scraper.search(f"part:{part_id}")
                
                for part in parts:
                    prices = await scraper.get_prices(part)
                    
                    for scraped_price in prices:
                        await aggregator.save_price_record(
                            part_id=part_id,
                            source=source,
                            price=scraped_price.price,
                            url=scraped_price.url or "",
                            availability=scraped_price.availability,
                            delivery_days=scraped_price.delivery_days,
                            raw_data=scraped_price.raw_data
                        )
                        scraped_count += 1
        
        # Clear cache
        await cache_delete(f"prices:part:{part_id}:*")
        
        return RefreshResponse(
            status="success",
            message=f"Refreshed prices from {len(source_list)} sources",
            scraped_count=scraped_count
        )
        
    except Exception as e:
        return RefreshResponse(
            status="error",
            message=f"Refresh failed: {str(e)}",
            scraped_count=scraped_count
        )


async def cache_delete(pattern: str) -> None:
    """Helper to delete cache"""
    from services.cache import cache_delete_pattern
    # This is a simplified version
    pass
