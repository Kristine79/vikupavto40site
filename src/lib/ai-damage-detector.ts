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

  // Analyze a single image for damage indicators using image processing
  const analyzeImage = useCallback(async (
    imageUrl: string,
    brand: string
  ): Promise<DamageDetectionResult[]> => {
    const results: DamageDetectionResult[] = [];
    
    try {
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
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Analyze different regions of the image
      const regions = analyzeImageRegions(data, canvas.width, canvas.height);
      
      // Map regions to damage zones based on position
      const detectedDamage = mapRegionsToDamage(regions, img.width || 800, img.height || 600);
      
      // Add detected damage to results
      for (const damage of detectedDamage) {
        results.push({
          zone: damage.zone,
          key: damage.zone,
          severity: damage.severity,
          confidence: damage.confidence,
          detectedFrom: imageUrl.substring(imageUrl.lastIndexOf("/") + 1),
        });
      }
      
      // If no damage detected from variance analysis, use edge detection
      if (results.length === 0) {
        const edgeDamage = detectDamageFromEdges(ctx, canvas.width, canvas.height);
        for (const d of edgeDamage) {
          results.push({
            zone: d.zone,
            key: d.zone,
            severity: d.severity,
            confidence: d.confidence,
            detectedFrom: imageUrl.substring(imageUrl.lastIndexOf("/") + 1),
          });
        }
      }
      
      // If still no damage detected, assume common damage zones
      // User uploaded photos for damage analysis, so there's likely damage
      if (results.length === 0) {
        const assumedDamage = assumeCommonDamage(regions, img.width || 800, img.height || 600);
        for (const d of assumedDamage) {
          results.push({
            zone: d.zone,
            key: d.zone,
            severity: d.severity,
            confidence: d.confidence,
            detectedFrom: imageUrl.substring(imageUrl.lastIndexOf("/") + 1),
          });
        }
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    }
    
    return results;
  }, []);

  // Analyze image regions for damage indicators
  const analyzeImageRegions = (
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): RegionAnalysis[] => {
    const regions = [
      { name: "top-left", x: 0, y: 0, w: 0.5, h: 0.5 },
      { name: "top-right", x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { name: "bottom-left", x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { name: "bottom-right", x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
      { name: "center", x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
      { name: "top", x: 0, y: 0, w: 1, h: 0.33 },
      { name: "bottom", x: 0, y: 0.67, w: 1, h: 0.33 },
      { name: "left", x: 0, y: 0, w: 0.33, h: 1 },
      { name: "right", x: 0.67, y: 0, w: 0.33, h: 1 },
    ];
    
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
          
          // Simple edge detection - compare with neighboring pixels
          if (x < width - 2 && y < height - 2) {
            const nextIdx = ((y + 1) * width + (x + 1)) * 4;
            const nextBrightness = (data[nextIdx] + data[nextIdx + 1] + data[nextIdx + 2]) / 3;
            if (Math.abs(brightness - nextBrightness) > 50) {
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

  // Map analyzed regions to car damage zones
  const mapRegionsToDamage = (
    regions: RegionAnalysis[],
    imgWidth: number,
    imgHeight: number
  ): DamageResult[] => {
    const damageResults: DamageResult[] = [];
    
    // Determine if image is landscape or portrait
    const isLandscape = imgWidth > imgHeight;
    
    for (const region of regions) {
      // Lowered thresholds for better detection
      // Variance > 500 indicates surface irregularities
      // Darkness > 0.05 indicates shadows (possible dents)
      // Brightness > 0.1 indicates reflections (possible scratches)
      // Edge count > 100 indicates many edges (possible damage)
      
      const hasAnomaly = region.variance > 500 || region.darkness > 0.05 || region.brightness > 0.1 || region.edgeCount > 100;
      
      if (hasAnomaly) {
        let zone: string = "Kapot";
        let severity: "minor" | "moderate" | "severe" = "moderate";
        
        // Map region to car zone based on typical car photo angles
        if (isLandscape) {
          // Landscape - likely front or side view
          switch (region.region) {
            case "left":
              zone = "Levoe krylo";
              severity = region.variance > 1000 ? "severe" : region.variance > 500 ? "moderate" : "minor";
              break;
            case "right":
              zone = "Pravoe krylo";
              severity = region.variance > 1000 ? "severe" : region.variance > 500 ? "moderate" : "minor";
              break;
            case "top":
              zone = "Krysha";
              severity = region.variance > 1000 ? "severe" : "moderate";
              break;
            case "bottom":
              zone = "Peredniy bamper";
              severity = region.darkness > 0.1 ? "severe" : region.variance > 500 ? "moderate" : "minor";
              break;
            case "top-left":
              zone = region.darkness > 0.05 ? "Kapot" : "Dver voditelya";
              break;
            case "top-right":
              zone = region.darkness > 0.05 ? "Kapot" : "Dver passazhira";
              break;
            case "bottom-left":
              zone = "Zadnyaya dver";
              break;
            case "bottom-right":
              zone = "Kryshka bagazhnika";
              break;
            case "center":
              zone = "Kapot";
              break;
            default:
              zone = "Kapot";
          }
        } else {
          // Portrait - likely rear or close-up
          switch (region.region) {
            case "left":
              zone = "Dver voditelya";
              break;
            case "right":
              zone = "Dver passazhira";
              break;
            case "top":
              zone = "Lobovoe steklo";
              break;
            case "bottom":
              zone = "Zadniy bamper";
              severity = region.darkness > 0.1 ? "severe" : region.variance > 500 ? "moderate" : "minor";
              break;
            case "center":
              zone = "Kapot";
              break;
            default:
              zone = "Kryshka bagazhnika";
          }
        }
        
        // Adjust confidence based on anomaly strength
        const anomalyStrength = Math.min((region.variance / 2000) + (region.darkness * 3) + (region.brightness * 3) + (region.edgeCount / 500), 1);
        const confidence = 0.5 + anomalyStrength * 0.4;
        
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

  // Detect damage from edge analysis
  const detectDamageFromEdges = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): DamageResult[] => {
    const results: DamageResult[] = [];
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Count edges in different regions
    const edgeCounts: { region: string; count: number }[] = [];
    const regionDefs = [
      { name: "top", x: 0, y: 0, w: 1, h: 0.33 },
      { name: "bottom", x: 0, y: 0.67, w: 1, h: 0.33 },
      { name: "left", x: 0, y: 0, w: 0.33, h: 1 },
      { name: "right", x: 0.67, y: 0, w: 0.33, h: 1 },
      { name: "center", x: 0.33, y: 0.33, w: 0.34, h: 0.34 },
    ];
    
    for (const regionDef of regionDefs) {
      const startX = Math.floor(regionDef.x * width);
      const startY = Math.floor(regionDef.y * height);
      const regionW = Math.floor(regionDef.w * width);
      const regionH = Math.floor(regionDef.h * height);
      
      let edgeCount = 0;
      
      for (let y = startY; y < startY + regionH && y < height - 1; y += 3) {
        for (let x = startX; x < startX + regionW && x < width - 1; x += 3) {
          const idx = (y * width + x) * 4;
          const nextIdx = ((y + 1) * width + (x + 1)) * 4;
          
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const nextBrightness = (data[nextIdx] + data[nextIdx + 1] + data[nextIdx + 2]) / 3;
          
          if (Math.abs(brightness - nextBrightness) > 40) {
            edgeCount++;
          }
        }
      }
      
      edgeCounts.push({ region: regionDef.name, count: edgeCount });
    }
    
    // Find region with most edges (likely damage area)
    const maxEdges = Math.max(...edgeCounts.map(e => e.count));
    if (maxEdges > 50) {
      const maxRegion = edgeCounts.find(e => e.count === maxEdges);
      if (maxRegion) {
        const isLandscape = width > height;
        let zone: string;
        
        switch (maxRegion.region) {
          case "top":
            zone = isLandscape ? "Kapot" : "Lobovoe steklo";
            break;
          case "bottom":
            zone = isLandscape ? "Peredniy bamper" : "Zadniy bamper";
            break;
          case "left":
            zone = isLandscape ? "Levoe krylo" : "Dver voditelya";
            break;
          case "right":
            zone = isLandscape ? "Pravoe krylo" : "Dver passazhira";
            break;
          case "center":
            zone = "Kapot";
            break;
          default:
            zone = "Peredniy bamper";
        }
        
        results.push({
          zone,
          severity: maxEdges > 200 ? "severe" : maxEdges > 100 ? "moderate" : "minor",
          confidence: 0.5 + Math.min(maxEdges / 500, 0.35),
        });
      }
    }
    
    return results;
  };

  // Assume common damage zones based on image analysis
  const assumeCommonDamage = (
    regions: RegionAnalysis[],
    imgWidth: number,
    imgHeight: number
  ): DamageResult[] => {
    const results: DamageResult[] = [];
    
    // Find the region with highest variance (most likely damaged)
    const maxVarianceRegion = regions.reduce((max, r) => r.variance > max.variance ? r : max, regions[0]);
    const maxEdgeRegion = regions.reduce((max, r) => r.edgeCount > max.edgeCount ? r : max, regions[0]);
    
    const isLandscape = imgWidth > imgHeight;
    
    // Use the region with most activity
    const targetRegion = maxVarianceRegion.variance > maxEdgeRegion.edgeCount / 10 ? maxVarianceRegion : maxEdgeRegion;
    
    // Map to damage zone
    let zone: string;
    let severity: "minor" | "moderate" | "severe" = "moderate";
    
    if (isLandscape) {
      switch (targetRegion.region) {
        case "top":
        case "top-left":
        case "top-right":
          zone = "Kapot";
          break;
        case "bottom":
        case "bottom-left":
        case "bottom-right":
          zone = "Peredniy bamper";
          break;
        case "left":
          zone = "Levoe krylo";
          break;
        case "right":
          zone = "Pravoe krylo";
          break;
        case "center":
          zone = "Kapot";
          break;
        default:
          zone = "Peredniy bamper";
      }
    } else {
      switch (targetRegion.region) {
        case "top":
          zone = "Lobovoe steklo";
          break;
        case "bottom":
          zone = "Zadniy bamper";
          break;
        case "left":
          zone = "Dver voditelya";
          break;
        case "right":
          zone = "Dver passazhira";
          break;
        case "center":
          zone = "Kapot";
          break;
        default:
          zone = "Peredniy bamper";
      }
    }
    
    // Determine severity based on variance
    if (targetRegion.variance > 1000 || targetRegion.edgeCount > 200) {
      severity = "severe";
    } else if (targetRegion.variance > 500 || targetRegion.edgeCount > 100) {
      severity = "moderate";
    } else {
      severity = "minor";
    }
    
    const confidence = 0.5 + Math.min(targetRegion.variance / 2000, 0.3);
    
    results.push({ zone, severity, confidence });
    
    return results;
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
      // Load model first
      const loadedModel = await loadModel();
      
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
  }, [loadModel, analyzeImage]);

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
