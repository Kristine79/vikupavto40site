"""
Base scraper class for auto parts websites
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


@dataclass
class ScrapedPart:
    """Represents a scraped auto part"""
    name: str
    sku: str
    brand: Optional[str] = None
    oem_number: Optional[str] = None
    category: Optional[str] = None
    url: Optional[str] = None


@dataclass
class ScrapedPrice:
    """Represents a scraped price"""
    part: ScrapedPart
    price: float
    currency: str = "RUB"
    availability: str = "in_stock"
    delivery_days: Optional[int] = None
    url: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None


class BaseScraper(ABC):
    """Base class for all scrapers"""
    
    def __init__(self, source_name: str, base_url: str):
        self.source_name = source_name
        self.base_url = base_url
        self.session: Optional[httpx.AsyncClient] = None
        
        # Rate limiting
        self.request_delay = 1.0  # seconds between requests
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = httpx.AsyncClient(
            timeout=30.0,
            headers=self._get_headers()
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.aclose()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for requests"""
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }
    
    @abstractmethod
    async def search(self, query: str, limit: int = 10) -> List[ScrapedPart]:
        """
        Search for parts by query
        
        Args:
            query: Search query (part name, SKU, OEM number)
            limit: Maximum number of results
            
        Returns:
            List of scraped parts
        """
        pass
    
    @abstractmethod
    async def get_prices(self, part: ScrapedPart) -> List[ScrapedPrice]:
        """
        Get prices for a specific part
        
        Args:
            part: The part to get prices for
            
        Returns:
            List of scraped prices
        """
        pass
    
    async def _fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse HTML page"""
        try:
            response = await self.session.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.text, "lxml")
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return None
    
    def _parse_price(self, price_str: str) -> Optional[float]:
        """Parse price string to float"""
        if not price_str:
            return None
        
        # Remove currency symbols and whitespace
        cleaned = price_str.replace("₽", "").replace("руб", "").replace(" ", "").strip()
        
        try:
            return float(cleaned)
        except ValueError:
            return None
    
    def _parse_availability(self, text: str) -> str:
        """Parse availability status from text"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["в наличии", "есть в наличии", "in stock"]):
            return "in_stock"
        elif any(word in text_lower for word in ["под заказ", "on order"]):
            return "on_order"
        else:
            return "unknown"
