"""
Scrapers package - Web scraping services for auto parts
"""

from .base import BaseScraper, ScrapedPart, ScrapedPrice
from .autodoc import AutoDocScraper
from .exist import ExistScraper

__all__ = [
    "BaseScraper",
    "ScrapedPart", 
    "ScrapedPrice",
    "AutoDocScraper",
    "ExistScraper"
]
