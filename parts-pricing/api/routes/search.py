"""
Search API endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from pydantic import BaseModel

from services.cache import cache_get, cache_set, CACHE_TTL_SEARCH
from scrapers import AutoDocScraper, ExistScraper

router = APIRouter()


class PartSearchResult(BaseModel):
    """Single search result"""
    name: str
    sku: str
    brand: Optional[str] = None
    oem_number: Optional[str] = None
    url: Optional[str] = None
    source: str


class SearchResponse(BaseModel):
    """Response for search query"""
    query: str
    results: List[PartSearchResult]
    total: int
    sources_searched: List[str]


@router.get("", response_model=SearchResponse)
async def search_parts(
    q: str = Query(..., description="Search query (part name, SKU, OEM)"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results per source"),
    sources: Optional[str] = Query("autodoc,exist", description="Sources to search")
):
    """
    Search for auto parts across multiple sources
    
    Returns aggregated results from all specified sources
    """
    # Parse sources
    source_list = [s.strip() for s in sources.split(",")]
    
    # Check cache
    cache_key = f"search:{q}:{':'.join(source_list)}:{limit}"
    cached = await cache_get(cache_key)
    if cached:
        return SearchResponse(**cached)
    
    results = []
    sources_searched = []
    
    try:
        async with AutoDocScraper() as autodoc:
            if "autodoc" in source_list:
                autodoc_results = await autodoc.search(q, limit)
                for part in autodoc_results:
                    results.append(PartSearchResult(
                        name=part.name,
                        sku=part.sku,
                        brand=part.brand,
                        oem_number=part.oem_number,
                        url=part.url,
                        source="autodoc"
                    ))
                sources_searched.append("autodoc")
        
        async with ExistScraper() as exist:
            if "exist" in source_list:
                exist_results = await exist.search(q, limit)
                for part in exist_results:
                    results.append(PartSearchResult(
                        name=part.name,
                        sku=part.sku,
                        brand=part.brand,
                        oem_number=part.oem_number,
                        url=part.url,
                        source="exist"
                    ))
                sources_searched.append("exist")
        
        # Limit total results
        results = results[:limit * len(source_list)]
        
        response = SearchResponse(
            query=q,
            results=results,
            total=len(results),
            sources_searched=sources_searched
        )
        
        # Cache results
        await cache_set(cache_key, response.model_dump(), CACHE_TTL_SEARCH)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/by-oem", response_model=SearchResponse)
async def search_by_oem(
    oem: str = Query(..., description="OEM number"),
    limit: int = Query(10, ge=1, le=50),
    sources: Optional[str] = Query("autodoc,exist")
):
    """
    Search for parts by OEM number
    """
    return await search_parts(q=f"OEM:{oem}", limit=limit, sources=sources)
