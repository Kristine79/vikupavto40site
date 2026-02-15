"""
UMAPI.ru scraper implementation
UMAPI provides auto parts pricing API
"""

import logging
import os
from typing import List, Optional

from .base import BaseScraper, ScrapedPart, ScrapedPrice

logger = logging.getLogger(__name__)


class UmapiScraper(BaseScraper):
    """
    Scraper for UMAPI.ru - auto parts price API service
    
    Website: https://umapi.ru
    API: Has official API available
    """
    
    def __init__(self, api_key: str = None):
        super().__init__("umapi", "https://api.umapi.ru")
        self.api_key = api_key or os.getenv("UMAPI_API_KEY")
        self.api_base = "https://api.umapi.ru/v1"
    
    async def search(self, query: str, limit: int = 10) -> List[ScrapedPart]:
        """
        Search for parts via UMAPI
        """
        parts = []
        
        if not self.api_key:
            logger.warning("UMAPI API key not configured")
            return parts
        
        try:
            # UMAPI search endpoint - adjust based on actual API
            search_url = f"{self.api_base}/search"
            params = {
                "query": query,
                "limit": limit
            }
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            soup = await self._fetch_page(search_url, params=params, headers=headers)
            if not soup:
                return parts
            
            # Parse JSON response - adjust based on actual API structure
            # Expected response format from UMAPI
            result_items = soup.select(".product, .item, [data-type='product']")
            
            for item in result_items[:limit]:
                try:
                    name_elem = item.select_one(".name, .title, [class*='name']")
                    sku_elem = item.select_one(".sku, .article, [class*='sku']")
                    brand_elem = item.select_one(".brand, .manufacturer, [class*='brand']")
                    
                    if name_elem:
                        part = ScrapedPart(
                            name=name_elem.get_text(strip=True),
                            sku=sku_elem.get_text(strip=True) if sku_elem else "",
                            brand=brand_elem.get_text(strip=True) if brand_elem else None,
                            url=item.get("data-url") or item.get("href")
                        )
                        parts.append(part)
                        
                except Exception as e:
                    logger.warning(f"Failed to parse UMAPI result: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"UMAPI search failed: {e}")
        
        return parts
    
    async def get_prices(self, part: ScrapedPart) -> List[ScrapedPrice]:
        """
        Get prices for a specific part from UMAPI
        """
        prices = []
        
        if not self.api_key:
            logger.warning("UMAPI API key not configured")
            return prices
        
        try:
            # Get price by article
            if part.sku:
                price_url = f"{self.api_base}/price/{part.sku}"
                headers = {
                    "Authorization": f"Bearer {self.api_key}"
                }
                
                soup = await self._fetch_page(price_url, headers=headers)
                if not soup:
                    return prices
                
                # Parse price data - adjust based on actual API response
                price_elem = soup.select_one("[class*='price'], .cost, .value")
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    price = self._parse_price(price_text)
                    
                    if price:
                        avail_elem = soup.select_one("[class*='stock'], .availability")
                        availability = self._parse_availability(
                            avail_elem.get_text(strip=True) if avail_elem else ""
                        )
                        
                        scraped_price = ScrapedPrice(
                            part=part,
                            price=price,
                            currency="RUB",
                            availability=availability,
                            url=part.url
                        )
                        prices.append(scraped_price)
                        
        except Exception as e:
            logger.error(f"UMAPI get_prices failed: {e}")
        
        return prices
    
    async def search_by_oem(self, oem: str) -> List[ScrapedPart]:
        """
        Search by OEM number via UMAPI
        """
        return await self.search(f"OEM:{oem}")
    
    async def get_price_by_brand_article(self, brand: str, article: str) -> Optional[ScrapedPrice]:
        """
        Get price by brand and article number - main use case for UMAPI
        """
        if not self.api_key:
            logger.warning("UMAPI API key not configured")
            return None
        
        try:
            # UMAPI direct price lookup endpoint
            price_url = f"{self.api_base}/prices"
            params = {
                "brand": brand,
                "article": article
            }
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            soup = await self._fetch_page(price_url, params=params, headers=headers)
            if not soup:
                return None
            
            # Parse JSON response - expected format:
            # {"brand": "...", "article": "...", "price": 1234.56, "availability": "in_stock", ...}
            price_elem = soup.select_one(".price, [data-price]")
            if price_elem:
                price = self._parse_price(price_elem.get_text(strip=True))
                
                if price:
                    part = ScrapedPart(
                        name=f"{brand} {article}",
                        sku=article,
                        brand=brand
                    )
                    
                    avail_elem = soup.select_one(".availability, .stock")
                    availability = self._parse_availability(
                        avail_elem.get_text(strip=True) if avail_elem else "in_stock"
                    )
                    
                    return ScrapedPrice(
                        part=part,
                        price=price,
                        currency="RUB",
                        availability=availability,
                        url=None
                    )
                    
        except Exception as e:
            logger.error(f"UMAPI get_price_by_brand_article failed: {e}")
        
        return None
