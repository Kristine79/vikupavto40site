"""
Parts Pricing API - Main Application
FastAPI backend for auto parts price scraping and lookup
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging

from api.routes import prices, search
from services.cache import init_redis, close_redis
from models import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events"""
    # Startup
    logger.info("Starting Parts Pricing API...")
    
    # Initialize Redis connection
    await init_redis()
    
    # Initialize database
    await init_db()
    
    logger.info("Application started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await close_redis()
    logger.info("Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Parts Pricing API",
    description="API for scraping and caching auto parts prices",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prices.router, prefix="/api/parts", tags=["Parts"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "ok",
        "service": "Parts Pricing API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
