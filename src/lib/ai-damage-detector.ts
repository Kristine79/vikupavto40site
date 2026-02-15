"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import cocoSsd from "@tensorflow-models/coco-ssd";

// Car damage zones that can be detected
export interface DamageZone {
  id: number;
  zone: string;
  key: string;
  category: string;
  severity: "minor" | "moderate" | "severe";
  description: string;
  repairCost: number;
  confidence: number;
}

// Damage detection result
export interface DamageDetectionResult {
  zone: string;
  key: string;
  severity: "minor" | "moderate" | "severe";
  confidence: number;
  detectedFrom: string;
}

// Car detection result
interface CarDetection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  score: number;
  class: string;
}

// Viewing angle determination
type ViewingAngle = "front" | "rear" | "side-left" | "side-right" | "unknown";

// Damage analysis within car bounding box
interface CarDamageAnalysis {
  angle: ViewingAngle;
  bbox: [number, number, number, number];
  damageZones: DamageResult[];
}

// Region analysis result
interface RegionAnalysis {
  region: string;
  variance: number;
  darkness: number;
  brightness: number;
  edgeCount: number;
}

// Damage detection result internal
interface DamageResult {
  zone: string;
  severity: "minor" | "moderate" | "severe";
  confidence: number;
}

// All possible damage zones
const DAMAGE_ZONES = [
  { key: "Kapot", category: "bodyParts", defaultSeverity: "minor" as const },
  { key: "Peredniy bamper", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Zadniy bamper", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Kryshka bagazhnika", category: "bodyParts", defaultSeverity: "minor" as const },
  { key: "Krysha", category: "bodyParts", defaultSeverity: "severe" as const },
  { key: "Levoe krylo", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Pravoe krylo", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Dver voditelya", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Dver passazhira", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Zadnyaya dver", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Lobovoe steklo", category: "glass", defaultSeverity: "severe" as const },
  { key: "Zadnee steklo", category: "glass", defaultSeverity: "moderate" as const },
  { key: "Bokovoe steklo", category: "glass", defaultSeverity: "moderate" as const },
  { key: "Fara perednyaya", category: "lighting", defaultSeverity: "moderate" as const },
  { key: "Fara zadnyaya", category: "lighting", defaultSeverity: "moderate" as const },
  { key: "Zerkalo levoe", category: "mirrors", defaultSeverity: "minor" as const },
  { key: "Zerkalo pravoe", category: "mirrors", defaultSeverity: "minor" as const },
  { key: "Disk kolesnyy", category: "wheels", defaultSeverity: "moderate" as const },
];

// Severity descriptions
type SeverityLevel = 'minor' | 'moderate' | 'severe';
type DamageCategory = 'bodyParts' | 'glass' | 'lighting' | 'mirrors' | 'wheels';

const SEVERITY_DESCRIPTIONS: Record<SeverityLevel, Record<DamageCategory, string>> = {
  minor: {
    bodyParts: "Melkie tsarapiny, nebolshie vmyatiny, skoly kraski",
    glass: "Treshchiny, skoly, tsarapiny",
    lighting: "Tsarapiny, pomutnenie, treshchiny",
    mirrors: "Tsarapiny, treshchiny, skoly",
    wheels: "Tsarapiny na diske, nebolshaya deformatsiya",
  },
  moderate: {
    bodyParts: "Vmyatiny srednego razmera, glubokie tsarapiny, deformatsiya",
    glass: "Treshchiny, trebuyushchie zameny",
    lighting: "Razbit, tresnut, ne rabotaet",
    mirrors: "Razbito, ne rabotaet",
    wheels: "Vmyatiny na diske, treshchiny",
  },
  severe: {
    bodyParts: "Silnaya deformatsiya, povrezhdenie nesushchikh elementov",
    glass: "Polnostyu razbito",
    lighting: "Sereznye povrezhdeniya, korotkoe zamykanie",
    mirrors: "Polnostyu razbito",
    wheels: "Silnaya deformatsiya, nebezopasno",
  },
};

// Base repair costs by severity
const REPAIR_COSTS: Record<string, Record<string, { minor: number; moderate: number; severe: number }>> = {
  bodyParts: {
    "Kapot": { minor: 8000, moderate: 20000, severe: 35000 },
    "Peredniy bamper": { minor: 5000, moderate: 15000, severe: 25000 },
    "Zadniy bamper": { minor: 5000, moderate: 14000, severe: 22000 },
    "Kryshka bagazhnika": { minor: 7000, moderate: 18000, severe: 28000 },
    "Krysha": { minor: 10000, moderate: 25000, severe: 45000 },
    "Levoe krylo": { minor: 4000, moderate: 12000, severe: 18000 },
    "Pravoe krylo": { minor: 4000, moderate: 12000, severe: 18000 },
    "Dver voditelya": { minor: 5000, moderate: 15000, severe: 22000 },
    "Dver passazhira": { minor: 5000, moderate: 15000, severe: 22000 },
    "Zadnyaya dver": { minor: 5000, moderate: 14000, severe: 20000 },
  },
  glass: {
    "Lobovoe steklo": { minor: 3000, moderate: 8000, severe: 15000 },
    "Zadnee steklo": { minor: 2500, moderate: 7000, severe: 12000 },
    "Bokovoe steklo": { minor: 2000, moderate: 5000, severe: 8000 },
  },
  lighting: {
    "Fara perednyaya": { minor: 3000, moderate: 12000, severe: 25000 },
    "Fara zadnyaya": { minor: 2500, moderate: 10000, severe: 18000 },
  },
  mirrors: {
    "Zerkalo levoe": { minor: 2000, moderate: 6000, severe: 12000 },
    "Zerkalo pravoe": { minor: 2000, moderate: 6000, severe: 12000 },
  },
  wheels: {
    "Disk kolesnyy": { minor: 3000, moderate: 8000, severe: 15000 },
  },
};

// Brand multipliers for repair costs
const BRAND_MULTIPLIERS: Record<string, number> = {
  "Lada (VAZ)": 0.7,
  "GAZ": 0.7,
  "UAZ": 0.75,
  "Daewoo": 0.75,
  "Datsun": 0.75,
  "Chery": 0.8,
  "Geely": 0.8,
  "JAC": 0.8,
  "Great Wall": 0.8,
  "Haval": 0.8,
  "Lifan": 0.75,
  "FAW": 0.8,
  "ZAZ": 0.7,
  "Kia": 1.0,
  "Hyundai": 1.0,
  "Volkswagen": 1.0,
  "Skoda": 1.0,
  "Ford": 1.0,
  "Toyota": 1.1,
  "Honda": 1.1,
  "Nissan": 1.1,
  "Mazda": 1.1,
  "Mitsubishi": 1.1,
  "Subaru": 1.1,
  "Suzuki": 1.0,
  "Peugeot": 1.0,
  "Citroen": 1.0,
  "Renault": 0.9,
  "SsangYong": 0.9,
  "Opel": 1.0,
  "Chevrolet": 0.95,
  "Fiat": 0.9,
  "Seat": 1.0,
  "Mini": 1.2,
  "Smart": 1.3,
  "Tesla": 1.5,
  "Audi": 1.5,
  "BMW": 1.6,
  "Mercedes": 1.7,
  "Lexus": 1.8,
  "Porsche": 2.2,
  "Land Rover": 1.7,
  "Jaguar": 1.6,
  "Volvo": 1.4,
  "Infiniti": 1.6,
  "Acura": 1.6,
  "Cadillac": 1.6,
  "Lincoln": 1.5,
  "Buick": 1.4,
  "Alfa Romeo": 1.4,
  "Maserati": 2.0,
};

export function useAIDamageDetection() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);

  // Load the COCO-SSD model
  const loadModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current;
    
    setIsModelLoading(true);
    try {
      await tf.ready();
      const loadedModel = await cocoSsd.load({
        base: "lite_mobilenet_v2",
      });
      modelRef.current = loadedModel;
      setModel(loadedModel);
      return loadedModel;
    } catch (error) {
      console.error("Failed to load AI model:", error);
      throw error;
    } finally {
      setIsModelLoading(false);
    }
  }, []);

  // Analyze a single image for damage indicators using proper computer vision
  const analyzeImage = useCallback(async (
    imageUrl: string,
    brand: string
  ): Promise<DamageDetectionResult[]> => {
    const results: DamageDetectionResult[] = [];

    try {
      // Load the AI model if not already loaded
      const model = await loadModel();

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Create canvas for image analysis
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Could not get canvas context");
        return results;
      }

      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      ctx.drawImage(img, 0, 0);

      // Step 1: Detect car using COCO-SSD
      const predictions = await model.detect(canvas);
      const carDetection = predictions.find(pred =>
        pred.class === "car" && pred.score > 0.3
      ) as CarDetection | undefined;

      if (!carDetection) {
        console.log("No car detected in image, skipping damage analysis");
        return results;
      }

      // Step 2: Determine viewing angle based on car bounding box
      const viewingAngle = determineViewingAngle(carDetection.bbox, canvas.width, canvas.height);

      // Step 3: Analyze damage only within car bounding box
      const damageAnalysis = await analyzeCarDamage(
        ctx,
        carDetection.bbox,
        viewingAngle,
        canvas.width,
        canvas.height
      );

      // Step 4: Convert to detection results
      for (const damage of damageAnalysis.damageZones) {
        results.push({
          zone: damage.zone,
          key: damage.zone,
          severity: damage.severity,
          confidence: damage.confidence,
          detectedFrom: imageUrl.substring(imageUrl.lastIndexOf("/") + 1),
        });
      }

    } catch (error) {
      console.error("Error analyzing image:", error);
    }

    return results;
  }, [loadModel, analyzeCarDamage]);

  // Determine viewing angle based on car bounding box proportions
  const determineViewingAngle = (
    bbox: [number, number, number, number],
    imgWidth: number,
    imgHeight: number
  ): ViewingAngle => {
    const [x, y, w, h] = bbox;
    const aspectRatio = w / h;
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    // Car aspect ratios: front/rear ~1.2-1.8, side ~2.5-4.0
    if (aspectRatio < 2.0) {
      // Likely front or rear view
      // Check if it's more centered (front) or offset (rear)
      const imgCenterX = imgWidth / 2;
      const horizontalOffset = Math.abs(centerX - imgCenterX) / imgWidth;

      if (horizontalOffset < 0.1) {
        return "front"; // Centered, likely front view
      } else {
        return "rear"; // Offset, likely rear view
      }
    } else {
      // Likely side view
      // Check if left or right side based on position
      const imgCenterX = imgWidth / 2;
      if (centerX < imgCenterX) {
        return "side-left";
      } else {
        return "side-right";
      }
    }
  };

  // Analyze damage within car bounding box
  const analyzeCarDamage = async (
    ctx: CanvasRenderingContext2D,
    carBbox: [number, number, number, number],
    viewingAngle: ViewingAngle,
    imgWidth: number,
    imgHeight: number
  ): Promise<CarDamageAnalysis> => {
    const [carX, carY, carW, carH] = carBbox;

    // Get image data only within car bounding box
    const imageData = ctx.getImageData(carX, carY, carW, carH);
    const data = imageData.data;

    // Analyze regions within the car
    const regions = analyzeCarRegions(data, carW, carH, viewingAngle);

    // Map regions to damage zones based on viewing angle
    const damageZones = mapCarDamageToZones(regions, viewingAngle);

    return {
      angle: viewingAngle,
      bbox: carBbox,
      damageZones
    };
  };

  // Analyze regions within car bounding box
  const analyzeCarRegions = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    viewingAngle: ViewingAngle
  ): RegionAnalysis[] => {
    // Define regions based on viewing angle
    let regions: { name: string; x: number; y: number; w: number; h: number }[] = [];

    switch (viewingAngle) {
      case "front":
        regions = [
          { name: "hood", x: 0.2, y: 0.1, w: 0.6, h: 0.4 }, // Kapot
          { name: "front-bumper", x: 0.1, y: 0.7, w: 0.8, h: 0.2 }, // Peredniy bamper
          { name: "front-left-wing", x: 0.05, y: 0.3, w: 0.25, h: 0.4 }, // Levoe krylo
          { name: "front-right-wing", x: 0.7, y: 0.3, w: 0.25, h: 0.4 }, // Pravoe krylo
          { name: "windshield", x: 0.25, y: 0.05, w: 0.5, h: 0.15 }, // Lobovoe steklo
          { name: "front-left-headlight", x: 0.1, y: 0.5, w: 0.15, h: 0.15 }, // Fara perednyaya levaya
          { name: "front-right-headlight", x: 0.75, y: 0.5, w: 0.15, h: 0.15 }, // Fara perednyaya pravaya
        ];
        break;

      case "rear":
        regions = [
          { name: "trunk", x: 0.2, y: 0.1, w: 0.6, h: 0.4 }, // Kryshka bagazhnika
          { name: "rear-bumper", x: 0.1, y: 0.7, w: 0.8, h: 0.2 }, // Zadniy bamper
          { name: "rear-window", x: 0.25, y: 0.05, w: 0.5, h: 0.15 }, // Zadnee steklo
          { name: "rear-left-taillight", x: 0.1, y: 0.5, w: 0.15, h: 0.15 }, // Fara zadnyaya levaya
          { name: "rear-right-taillight", x: 0.75, y: 0.5, w: 0.15, h: 0.15 }, // Fara zadnyaya pravaya
        ];
        break;

      case "side-left":
        regions = [
          { name: "left-front-door", x: 0.3, y: 0.2, w: 0.3, h: 0.4 }, // Dver voditelya
          { name: "left-rear-door", x: 0.6, y: 0.2, w: 0.3, h: 0.4 }, // Zadnyaya dver
          { name: "left-wing", x: 0.1, y: 0.3, w: 0.25, h: 0.4 }, // Levoe krylo
          { name: "left-mirror", x: 0.05, y: 0.15, w: 0.1, h: 0.1 }, // Zerkalo levoe
          { name: "left-wheels", x: 0.05, y: 0.7, w: 0.2, h: 0.2 }, // Kolesa levye
        ];
        break;

      case "side-right":
        regions = [
          { name: "right-front-door", x: 0.4, y: 0.2, w: 0.3, h: 0.4 }, // Dver passazhira
          { name: "right-rear-door", x: 0.1, y: 0.2, w: 0.3, h: 0.4 }, // Zadnyaya dver
          { name: "right-wing", x: 0.65, y: 0.3, w: 0.25, h: 0.4 }, // Pravoe krylo
          { name: "right-mirror", x: 0.85, y: 0.15, w: 0.1, h: 0.1 }, // Zerkalo pravoe
          { name: "right-wheels", x: 0.75, y: 0.7, w: 0.2, h: 0.2 }, // Kolesa pravye
        ];
        break;

      default:
        // Fallback to general regions
        regions = [
          { name: "top", x: 0, y: 0, w: 1, h: 0.33 },
          { name: "middle", x: 0, y: 0.33, w: 1, h: 0.34 },
          { name: "bottom", x: 0, y: 0.67, w: 1, h: 0.33 },
        ];
    }
    
    return regions.map(region => {
      const startX = Math.floor(region.x * width);
      const startY = Math.floor(region.y * height);
      const regionW = Math.floor(region.w * width);
      const regionH = Math.floor(region.h * height);

      let totalBrightness = 0;
      let totalDarkness = 0;
      let pixelCount = 0;
      let edgeCount = 0;
      const brightnessValues: number[] = [];

      for (let y = startY; y < startY + regionH && y < height - 1; y += 2) {
        for (let x = startX; x < startX + regionW && x < width - 1; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Calculate brightness (0-255)
          const brightness = (r + g + b) / 3;
          brightnessValues.push(brightness);

          if (brightness > 200) totalBrightness++;
          if (brightness < 50) totalDarkness++;

          // Enhanced edge detection - compare with neighboring pixels
          if (x < width - 2 && y < height - 2) {
            const nextIdx = ((y + 1) * width + (x + 1)) * 4;
            const nextBrightness = (data[nextIdx] + data[nextIdx + 1] + data[nextIdx + 2]) / 3;
            if (Math.abs(brightness - nextBrightness) > 40) {
              edgeCount++;
            }
          }

          pixelCount++;
        }
      }

      // Calculate variance
      const mean = brightnessValues.length > 0
        ? brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length
        : 128;
      const variance = brightnessValues.length > 0
        ? brightnessValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / brightnessValues.length
        : 0;

      return {
        region: region.name,
        variance: Math.sqrt(variance),
        darkness: pixelCount > 0 ? totalDarkness / pixelCount : 0,
        brightness: pixelCount > 0 ? totalBrightness / pixelCount : 0,
        edgeCount,
      };
    });
  };

  // Map car regions to damage zones based on viewing angle
  const mapCarDamageToZones = (
    regions: RegionAnalysis[],
    viewingAngle: ViewingAngle
  ): DamageResult[] => {
    const damageResults: DamageResult[] = [];

    for (const region of regions) {
      // Lower thresholds for better detection within car
      const hasAnomaly = region.variance > 300 || region.darkness > 0.03 || region.brightness > 0.08 || region.edgeCount > 50;

      if (hasAnomaly) {
        let zone: string = "Kapot";
        let severity: "minor" | "moderate" | "severe" = "moderate";

        // Map region to specific car zone based on viewing angle
        switch (viewingAngle) {
          case "front":
            switch (region.region) {
              case "hood":
                zone = "Kapot";
                severity = region.variance > 600 ? "severe" : region.variance > 400 ? "moderate" : "minor";
                break;
              case "front-bumper":
                zone = "Peredniy bamper";
                severity = region.darkness > 0.08 ? "severe" : region.variance > 400 ? "moderate" : "minor";
                break;
              case "front-left-wing":
                zone = "Levoe krylo";
                break;
              case "front-right-wing":
                zone = "Pravoe krylo";
                break;
              case "windshield":
                zone = "Lobovoe steklo";
                severity = region.edgeCount > 150 ? "severe" : region.edgeCount > 80 ? "moderate" : "minor";
                break;
              case "front-left-headlight":
              case "front-right-headlight":
                zone = "Fara perednyaya";
                break;
            }
            break;

          case "rear":
            switch (region.region) {
              case "trunk":
                zone = "Kryshka bagazhnika";
                break;
              case "rear-bumper":
                zone = "Zadniy bamper";
                severity = region.darkness > 0.08 ? "severe" : region.variance > 400 ? "moderate" : "minor";
                break;
              case "rear-window":
                zone = "Zadnee steklo";
                severity = region.edgeCount > 150 ? "severe" : region.edgeCount > 80 ? "moderate" : "minor";
                break;
              case "rear-left-taillight":
              case "rear-right-taillight":
                zone = "Fara zadnyaya";
                break;
            }
            break;

          case "side-left":
            switch (region.region) {
              case "left-front-door":
                zone = "Dver voditelya";
                break;
              case "left-rear-door":
                zone = "Zadnyaya dver";
                break;
              case "left-wing":
                zone = "Levoe krylo";
                break;
              case "left-mirror":
                zone = "Zerkalo levoe";
                break;
              case "left-wheels":
                zone = "Disk kolesnyy";
                break;
            }
            break;

          case "side-right":
            switch (region.region) {
              case "right-front-door":
                zone = "Dver passazhira";
                break;
              case "right-rear-door":
                zone = "Zadnyaya dver";
                break;
              case "right-wing":
                zone = "Pravoe krylo";
                break;
              case "right-mirror":
                zone = "Zerkalo pravoe";
                break;
              case "right-wheels":
                zone = "Disk kolesnyy";
                break;
            }
            break;
        }

        // Calculate confidence based on anomaly strength
        const anomalyStrength = Math.min((region.variance / 1000) + (region.darkness * 5) + (region.brightness * 5) + (region.edgeCount / 300), 1);
        const confidence = 0.6 + anomalyStrength * 0.35;

        // Check if zone already added with higher confidence
        const existingIndex = damageResults.findIndex(d => d.zone === zone);
        if (existingIndex === -1 || damageResults[existingIndex].confidence < confidence) {
          if (existingIndex === -1) {
            damageResults.push({ zone, severity, confidence });
          } else {
            damageResults[existingIndex] = { zone, severity, confidence };
          }
        }
      }
    }

    return damageResults;
  };
  // Analyze all uploaded images
  const analyzeAllImages = useCallback(async (
    imageUrls: string[],
    brand: string,
    onProgress?: (progress: number) => void
  ): Promise<DamageDetectionResult[]> => {
    setIsAnalyzing(true);
    setProgress(0);

    const allResults: DamageDetectionResult[] = [];
    const uniqueZones = new Map<string, DamageDetectionResult>();

    try {
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        const results = await analyzeImage(imageUrl, brand);

        // Merge results, keeping highest confidence for each zone
        for (const result of results) {
          const existing = uniqueZones.get(result.zone);
          if (!existing || result.confidence > existing.confidence) {
            uniqueZones.set(result.zone, result);
          }
        }

        setProgress(((i + 1) / imageUrls.length) * 100);
        onProgress?.(((i + 1) / imageUrls.length) * 100);
      }

      allResults.push(...uniqueZones.values());
    } catch (error) {
      console.error("Error in analyzeAllImages:", error);
    } finally {
      setIsAnalyzing(false);
    }

    return allResults;
  }, [analyzeImage]);

  // Convert detection results to damage zones with costs
  const convertToDamageZones = useCallback((
    detections: DamageDetectionResult[],
    brand: string
  ): DamageZone[] => {
    const multiplier = BRAND_MULTIPLIERS[brand] || 1.0;
    
    return detections.map((detection, index) => {
      const zone = DAMAGE_ZONES.find(z => z.key === detection.zone);
      const category = zone?.category || "bodyParts";
      const costs = REPAIR_COSTS[category];
      const partCosts = costs?.[detection.zone];
      const baseCost = partCosts?.[detection.severity] || 10000;
      const repairCost = Math.round(baseCost * multiplier);
      
      return {
        id: index + 1,
        zone: detection.zone,
        key: detection.zone,
        category,
        severity: detection.severity,
        description: SEVERITY_DESCRIPTIONS[detection.severity][category as DamageCategory] || "Trebuyet osmotra",
        repairCost,
        confidence: detection.confidence,
      };
    });
  }, []);

  return {
    loadModel,
    analyzeAllImages,
    convertToDamageZones,
    isModelLoading,
    isAnalyzing,
    progress,
    DAMAGE_ZONES,
  };
}
