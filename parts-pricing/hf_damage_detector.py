"""
Hugging Face-based damage detection API using DETR (Detection Transformer)
This provides better object detection than COCO-SSD
"""
import io
import base64
import json
from PIL import Image
import torch
from transformers import DetrImageProcessor, DetrForObjectDetection
import numpy as np

# Car-related objects from COCO that we care about
CAR_RELATED_CLASSES = {
    2: "car",
    3: "motorcycle", 
    4: "airplane",
    6: "bus",
    7: "train",
    8: "truck",
    17: "cat",
    18: "dog",
}

# Parts of a car that can be damaged
CAR_PARTS = {
    "car": ["wheel", "door", "window", "bumper", "hood", "trunk", "mirror", "light"],
}

class HuggingFaceDamageDetector:
    def __init__(self):
        self.processor = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def load_model(self):
        """Load DETR model for object detection"""
        if self.model is None:
            print("Loading DETR model from Hugging Face...")
            # Use Facebook's DETR model
            self.processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
            self.model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50")
            self.model.to(self.device)
            self.model.eval()
            print(f"Model loaded successfully on {self.device}")
        return self.model
    
    def detect_objects(self, image_data: bytes) -> dict:
        """Detect objects in the image using DETR"""
        if self.model is None:
            self.load_model()
        
        # Load image
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Process image
        inputs = self.processor(images=image, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Run inference
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Post-process
        target_sizes = torch.tensor([image.size[::-1]])
        results = self.processor.post_process_object_detection(
            outputs, target_sizes=target_sizes, threshold=0.3
        )[0]
        
        # Extract detected objects
        detected = []
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            if score > 0.3:
                label_name = self.model.config.id2label[label.item()]
                detected.append({
                    "label": label_name,
                    "score": score.item(),
                    "bbox": box.cpu().numpy().tolist(),
                })
        
        return {
            "objects": detected,
            "image_size": image.size,
        }
    
    def analyze_damage(self, image_data: bytes) -> dict:
        """Analyze image for car damage using DETR"""
        detection_result = self.detect_objects(image_data)
        
        # Look for cars and analyze their condition
        damage_results = []
        
        for obj in detection_result["objects"]:
            if obj["label"] == "car":
                # Car detected - analyze for damage indicators
                bbox = obj["bbox"]
                x1, y1, x2, y2 = [int(coord) for coord in bbox]
                
                # Extract car region
                image = Image.open(io.BytesIO(image_data)).convert("RGB")
                car_region = image.crop((x1, y1, x2, y2))
                
                # Analyze the car region for damage indicators
                damage_analysis = self._analyze_car_region(car_region, obj["bbox"])
                
                if damage_analysis:
                    damage_results.append({
                        "type": "car_detected",
                        "location": "car",
                        "confidence": obj["score"],
                        "damage_indicators": damage_analysis,
                        "bbox": obj["bbox"],
                    })
        
        return {
            "success": True,
            "detections": detection_result["objects"],
            "damage_analysis": damage_results,
            "has_damage": len(damage_results) > 0,
        }
    
    def _analyze_car_region(self, car_image: Image.Image, bbox: list) -> list:
        """Analyze a car region for damage indicators using image analysis"""
        # Convert to numpy for analysis
        car_array = np.array(car_image)
        
        # Calculate statistics that might indicate damage
        damage_indicators = []
        
        # 1. Check for unusual dark spots (potential dents or scratches)
        gray = np.mean(car_array, axis=2)
        dark_pixels = np.sum(gray < 50)
        dark_ratio = dark_pixels / gray.size
        
        # 2. Check for high variance regions (potential damage)
        variance = np.var(gray)
        
        # 3. Check for edge density (potential scratches)
        # Simple gradient calculation
        grad_x = np.abs(np.diff(gray, axis=1))
        grad_y = np.abs(np.diff(gray, axis=0))
        edge_density = (np.mean(grad_x) + np.mean(grad_y)) / 2
        
        # Determine if there are damage indicators based on thresholds
        # Lower thresholds for better detection
        if dark_ratio > 0.01 or variance > 500 or edge_density > 10:
            # Potential damage detected
            severity = "moderate"
            if dark_ratio > 0.05 or variance > 1000:
                severity = "severe"
            elif dark_ratio < 0.03 and variance < 800:
                severity = "minor"
            
            damage_indicators.append({
                "type": "general_damage",
                "severity": severity,
                "confidence": min(0.5 + (dark_ratio * 10) + (variance / 2000), 0.95),
                "indicators": {
                    "dark_ratio": float(dark_ratio),
                    "variance": float(variance),
                    "edge_density": float(edge_density),
                }
            })
        
        return damage_indicators


# Global detector instance
_detector = None

def get_detector() -> HuggingFaceDamageDetector:
    """Get or create the damage detector instance"""
    global _detector
    if _detector is None:
        _detector = HuggingFaceDamageDetector()
    return _detector


def detect_damage(image_base64: str) -> dict:
    """
    Main function to detect damage from base64 encoded image
    
    Args:
        image_base64: Base64 encoded image string
        
    Returns:
        Dictionary with detection results
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        
        # Get detector
        detector = get_detector()
        
        # Analyze for damage
        result = detector.analyze_damage(image_data)
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "has_damage": False,
        }


# For testing
if __name__ == "__main__":
    # Test with a simple image
    import sys
    
    if len(sys.argv) > 1:
        # Load image from file
        with open(sys.argv[1], "rb") as f:
            image_data = f.read()
        
        detector = get_detector()
        result = detector.analyze_damage(image_data)
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python hf_damage_detector.py <image_file>")
