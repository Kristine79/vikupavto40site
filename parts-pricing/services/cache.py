"""
Redis caching service for parts pricing
"""

import redis.asyncio as redis
from typing import Optional, Any
import json
import os
import logging

logger = logging.getLogger(__name__)

# Redis client instance
redis_client: Optional[redis.Redis] = None

# Cache TTL settings (in seconds)
CACHE_TTL_PRICES = 6 * 60 * 60  # 6 hours
CACHE_TTL_SEARCH = 30 * 60  # 30 minutes
CACHE_TTL_AVAILABILITY = 60 * 60  # 1 hour


def get_redis() -> redis.Redis:
    """Get Redis client instance"""
    if redis_client is None:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return redis_client


async def init_redis() -> None:
    """Initialize Redis connection"""
    global redis_client
    
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    try:
        redis_client = redis.from_url(redis_url, decode_responses=True)
        await redis_client.ping()
        logger.info(f"Redis connected: {redis_url}")
    except redis.ConnectionError as e:
        logger.warning(f"Redis connection failed: {e}. Continuing without cache.")
        # Create a dummy client that does nothing
        redis_client = None


async def close_redis() -> None:
    """Close Redis connection"""
    global redis_client
    
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")


async def cache_get(key: str) -> Optional[Any]:
    """Get value from cache"""
    if not redis_client:
        return None
    
    try:
        value = await redis_client.get(key)
        if value:
            return json.loads(value)
    except Exception as e:
        logger.error(f"Cache get error: {e}")
    
    return None


async def cache_set(key: str, value: Any, ttl: int = CACHE_TTL_PRICES) -> bool:
    """Set value in cache with TTL"""
    if not redis_client:
        return False
    
    try:
        await redis_client.setex(key, ttl, json.dumps(value, ensure_ascii=False))
        return True
    except Exception as e:
        logger.error(f"Cache set error: {e}")
        return False


async def cache_delete(key: str) -> bool:
    """Delete value from cache"""
    if not redis_client:
        return False
    
    try:
        await redis_client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Cache delete error: {e}")
        return False


async def cache_delete_pattern(pattern: str) -> int:
    """Delete all keys matching pattern"""
    if not redis_client:
        return 0
    
    try:
        keys = []
        async for key in redis_client.scan_iter(match=pattern):
            keys.append(key)
        
        if keys:
            return await redis_client.delete(*keys)
    except Exception as e:
        logger.error(f"Cache delete pattern error: {e}")
    
    return 0
