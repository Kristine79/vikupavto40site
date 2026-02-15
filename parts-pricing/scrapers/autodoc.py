"""
AutoDoc.ru scraper implementation
"""

import logging
from typing import List, Optional
from urllib.parse import quote

from .base import BaseScraper, ScrapedPart, ScrapedPrice

logger = logging.getLogger(__name__)


class AutoDocScraper(BaseScraper):
    """
    Scraper for AutoDoc.ru - large auto parts marketplace
    
    Website: https://autodoc.ru
    API: Has official API available
    """
    
    def __init__(self):
        super().__init__("autodoc", "https://autodoc.ru")
        # AutoDoc has official API - this is preferred over scraping
        self.api_base = "https://api.autodoc.ru"
    
    async def search(self, query: str, limit: int = 10) -> List[ScrapedPart]:
        """
        Search for parts on AutoDoc.ru
        """
        parts = []
        
        try:
            # Use search API if available, otherwise scrape
            search_url = f"{self.base_url}/search?query={quote(query)}"
            
            soup = await self._fetch_page(search_url)
            if not soup:
                return parts
            
            # Parse search results - adjust selectors based on actual site structure
            result_items = soup.select(".product-card, .search-result-item, [class*='product']")
            
            for item in result_items[:limit]:
                try:
                    # Extract part information
                    name_elem = item.select_one("h3, .product-name, [class*='name']")
                    sku_elem = item.select_one("[class*='sku'], .article, .articul")
                    brand_elem = item.select_one("[class*='brand'], .manufacturer")
                    
                    if name_elem:
                        part = ScrapedPart(
                            name=name_elem.get_text(strip=True),
                            sku=sku_elem.get_text(strip=True) if sku_elem else "",
                            brand=brand_elem.get_text(strip=True) if brand_elem else None,
                            url=self.base_url + item.get("href", "") if item.get("href") else None
                        )
                        parts.append(part)
                        
                except Exception as e:
                    logger.warning(f"Failed to parse AutoDoc result: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"AutoDoc search failed: {e}")
        
        return parts
    
    async def get_prices(self, part: ScrapedPart) -> List[ScrapedPrice]:
        """
        Get prices for a specific part from AutoDoc
        """
        prices = []
        
        if not part.url:
            return prices
        
        try:
            soup = await self._fetch_page(part.url)
            if not soup:
                return prices
            
            # Find price elements - adjust selectors based on actual site
            price_elements = soup.select("[class*='price'], .product-price")
            
            for elem in price_elements:
                price_text = elem.get_text(strip=True)
                price = self._parse_price(price_text)
                
                if price:
                    # Check availability
                    avail_elem = elem.select_one("[class*='availability'], .stock")
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
            logger.error(f"AutoDoc get_prices failed: {e}")
        
        return prices
    
    async def search_by_oem(self, oem: str) -> List[ScrapedPart]:
        """
        Search by OEM number
        """
        return await self.search(f"OEM:{oem}")
