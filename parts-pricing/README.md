# Parts Pricing API

Backend service for scraping and caching auto parts prices from multiple sources.

## Tech Stack

- **FastAPI** - Python web framework
- **Scrapy** - Web scraping framework
- **Playwright** - Browser automation for anti-bot protection
- **Redis** - Caching layer
- **SQLAlchemy** - Database ORM

## Project Structure

```
parts-pricing/
├── api/                    # FastAPI endpoints
│   └── routes/
│       └── prices.py       # Price lookup endpoints
├── scrapers/              # Web scrapers
│   ├── base.py            # Base scraper class
│   ├── autodoc.py         # AutoDoc.ru scraper
│   └── exist.py           # Exist.ru scraper
├── services/              # Business logic
│   ├── cache.py           # Redis caching
│   └── price_aggregator.py # Price aggregation
├── models/                # Database models
│   └── parts.py           # Part models
├── main.py                # FastAPI app entry point
├── requirements.txt       # Python dependencies
└── .env.example           # Environment variables
```

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

## API Endpoints

- `GET /api/parts/search?q={query}` - Search parts by name
- `GET /api/parts/{part_id}/prices` - Get prices from all sources
- `POST /api/parts/refresh` - Force refresh prices from sources

## Environment Variables

```
REDIS_URL=redis://localhost:6379
DATABASE_URL=sqlite:///parts.db
```
