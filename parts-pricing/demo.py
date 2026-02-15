"""
Demo script showing how scrapers and price aggregator work
"""

import asyncio
import logging
from scrapers.autodoc import AutoDocScraper
from scrapers.exist import ExistScraper
from scrapers.umapi import UmapiScraper

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def demo_search():
    """Demo: Search for auto parts across different scrapers"""
    
    print("=" * 60)
    print("🔍 SCRAPER DEMO - Search for auto parts")
    print("=" * 60)
    
    # Initialize scrapers
    autodoc = AutoDocScraper()
    exist = ExistScraper()
    umapi = UmapiScraper()  # Requires UMAPI_API_KEY in .env
    
    # Demo search query
    query = "масляный фильтр"
    
    print(f"\n📝 Search query: '{query}'")
    print("-" * 40)
    
    # Search AutoDoc
    print("\n[1] AutoDoc.ru search:")
    try:
        results = await autodoc.search(query, limit=3)
        for i, part in enumerate(results, 1):
            print(f"   {i}. {part.name}")
            print(f"      SKU: {part.sku} | Brand: {part.brand}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Search Exist
    print("\n[2] Exist.ru search:")
    try:
        results = await exist.search(query, limit=3)
        for i, part in enumerate(results, 1):
            print(f"   {i}. {part.name}")
            print(f"      SKU: {part.sku} | Brand: {part.brand}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Search UMAPI
    print("\n[3] UMAPI.ru search:")
    try:
        results = await umapi.search(query, limit=3)
        for i, part in enumerate(results, 1):
            print(f"   {i}. {part.name}")
            print(f"      SKU: {part.sku} | Brand: {part.brand}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)


async def demo_prices():
    """Demo: Get prices for a specific part"""
    
    print("=" * 60)
    print("💰 SCRAPER DEMO - Get prices for a part")
    print("=" * 60)
    
    # Initialize scrapers
    autodoc = AutoDocScraper()
    exist = ExistScraper()
    
    # Demo part - oil filter
    brand = "Mann"
    article = "W610/3"
    
    print(f"\n📝 Part: {brand} {article}")
    print("-" * 40)
    
    # Get prices from AutoDoc
    print("\n[1] AutoDoc.ru prices:")
    try:
        prices = await autodoc.get_prices(brand, article, limit=3)
        for price_data in prices:
            print(f"   💵 {price_data.price} RUB")
            print(f"      Availability: {price_data.availability}")
            print(f"      URL: {price_data.url}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Get prices from Exist
    print("\n[2] Exist.ru prices:")
    try:
        prices = await exist.get_prices(brand, article, limit=3)
        for price_data in prices:
            print(f"   💵 {price_data.price} RUB")
            print(f"      Availability: {price_data.availability}")
            print(f"      Delivery: {price_data.delivery_days} days")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)


async def demo_oem_search():
    """Demo: Search by OEM number"""
    
    print("=" * 60)
    print("🔢 SCRAPER DEMO - Search by OEM number")
    print("=" * 60)
    
    autodoc = AutoDocScraper()
    exist = ExistScraper()
    
    # Demo OEM number
    oem = "5W30"
    
    print(f"\n📝 OEM search: '{oem}'")
    print("-" * 40)
    
    print("\n[1] AutoDoc.ru OEM search:")
    try:
        results = await autodoc.search_by_oem(oem, limit=3)
        for i, part in enumerate(results, 1):
            print(f"   {i}. {part.name}")
            print(f"      OEM: {part.oem_number} | Brand: {part.brand}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n[2] Exist.ru OEM search:")
    try:
        results = await exist.search_by_oem(oem, limit=3)
        for i, part in enumerate(results, 1):
            print(f"   {i}. {part.name}")
            print(f"      OEM: {part.oem_number} | Brand: {part.brand}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)


async def main():
    """Run all demos"""
    
    print("\n" + "🛠️  " + "=" * 56)
    print("   PARTS PRICING - SCRAPER DEMONSTRATION")
    print("=" * 58 + "\n")
    
    # Run demos
    await demo_search()
    print()
    await demo_prices()
    print()
    await demo_oem_search()
    
    print("\n✅ Demo complete!")


if __name__ == "__main__":
    asyncio.run(main())
