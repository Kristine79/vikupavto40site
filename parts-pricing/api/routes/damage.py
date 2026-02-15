"""
Hugging Face Damage Detection API Route
Uses DETR (Detection Transformer) from Hugging Face for better object detection
"""
import base64
import json
from io import BytesIO

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

# Import the Hugging Face detector
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from hf_damage_detector import get_detector, HuggingFaceDamageDetector

router = APIRouter()

# Global detector instance
_detector = None

def get_damage_detector() -> HuggingFaceDamageDetector:
    """Get or create the damage detector instance"""
    global _detector
    if _detector is None:
        _detector = HuggingFaceDamageDetector()
        _detector.load_model()
    return _detector


@router.post("/detect")
async def detect_damage(
    image: UploadFile = File(..., description="Car image to analyze for damage"),
):
    """
    Detect damage in a car image using Hugging Face DETR model
    
    Uses:
    - Facebook's DETR (Detection Transformer) for object detection
    - Advanced image analysis for damage indicators
    
    Returns:
        JSON with detected objects and damage analysis
    """
    try:
        # Read image data
        image_data = await image.read()
        
        # Get detector and analyze
        detector = get_damage_detector()
        result = detector.analyze_damage(image_data)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "has_damage": False,
            }
        )


@router.post("/detect-base64")
async def detect_damage_base64(
    image_base64: str = Form(..., description="Base64 encoded car image"),
):
    """
    Detect damage in a base64 encoded car image
    
    Args:
        image_base64: Base64 encoded image string (without data URI prefix)
        
    Returns:
        JSON with detected objects and damage analysis
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        
        # Get detector and analyze
        detector = get_damage_detector()
        result = detector.analyze_damage(image_data)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "has_damage": False,
            }
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model": "detr-resnet-50"}
