"""
Exist.ru scraper implementation
"""

import logging
from typing import List, Optional
from urllib.parse import quote

from .base import BaseScraper, ScrapedPart, ScrapedPrice

logger = logging.getLogger(__name__)


class ExistScraper(BaseScraper):
    """
    Scraper for Exist.ru - large auto parts supplier
    
    Website: https://exist.ru
    Note: Has strong anti-bot protection, consider using official API
    """
    
    def __init__(self):
        super().__init__("exist", "https://exist.ru")
        # Exist has API but requires authentication
        self.api_base = "https://exist.ru"
    
    async def search(self, query: str, limit: int = 10) -> List[ScrapedPart]:
        """
        Search for parts on Exist.ru
        """
        parts = []
        
        try:
            # Exist search URL
            search_url = f"{self.base_url}/catalog?kw={quote(query)}"
            
            soup = await self._fetch_page(search_url)
            if not soup:
                return parts
            
            # Parse search results - adjust selectors based on actual site
            result_items = soup.select(".goods-item, .catalog-item, [class*='item']")
            
            for item in result_items[:limit]:
                try:
                    name_elem = item.select_one("h3, .name, [class*='name']")
                    sku_elem = item.select_one("[class*='article'], .articul, .sku")
                    brand_elem = item.select_one("[class*='brand'], .maker")
                    
                    if name_elem:
                        part = ScrapedPart(
                            name=name_elem.get_text(strip=True),
                            sku=sku_elem.get_text(strip=True) if sku_elem else "",
                            brand=brand_elem.get_text(strip=True) if brand_elem else None,
                            url=self.base_url + item.get("href", "") if item.get("href") else None
                        )
                        parts.append(part)
                        
                except Exception as e:
                    logger.warning(f"Failed to parse Exist result: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Exist search failed: {e}")
        
        return parts
    
    async def get_prices(self, part: ScrapedPart) -> List[ScrapedPrice]:
        """
        Get prices for a specific part from Exist
        """
        prices = []
        
        if not part.url:
            return prices
        
        try:
            soup = await self._fetch_page(part.url)
            if not soup:
                return prices
            
            # Find price elements
            price_elements = soup.select("[class*='price'], .cost, .price-value")
            
            for elem in price_elements:
                price_text = elem.get_text(strip=True)
                price = self._parse_price(price_text)
                
                if price:
                    avail_elem = elem.select_one("[class*='stock'], .availability")
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
            logger.error(f"Exist get_prices failed: {e}")
        
        return prices
    
    async def search_by_oem(self, oem: str) -> List[ScrapedPart]:
        """
        Search by OEM number on Exist
        """
        return await self.search(f"OEM:{oem}")
