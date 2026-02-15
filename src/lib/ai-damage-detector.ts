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

// All possible damage zones
const DAMAGE_ZONES = [
  { key: "Передний бампер", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Задний бампер", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Капот", category: "bodyParts", defaultSeverity: "minor" as const },
  { key: "Крышка багажника", category: "bodyParts", defaultSeverity: "minor" as const },
  { key: "Крыша", category: "bodyParts", defaultSeverity: "severe" as const },
  { key: "Левое крыло", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Правое крыло", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Дверь водителя", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Дверь пассажира", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Задняя дверь", category: "bodyParts", defaultSeverity: "moderate" as const },
  { key: "Лобовое стекло", category: "glass", defaultSeverity: "severe" as const },
  { key: "Заднее стекло", category: "glass", defaultSeverity: "moderate" as const },
  { key: "Боковое стекло", category: "glass", defaultSeverity: "moderate" as const },
  { key: "Фара передняя", category: "lighting", defaultSeverity: "moderate" as const },
  { key: "Фара задняя", category: "lighting", defaultSeverity: "moderate" as const },
  { key: "Зеркало левое", category: "mirrors", defaultSeverity: "minor" as const },
  { key: "Зеркало правое", category: "mirrors", defaultSeverity: "minor" as const },
  { key: "Диск колесный", category: "wheels", defaultSeverity: "moderate" as const },
];

// Severity descriptions
type SeverityLevel = 'minor' | 'moderate' | 'severe';
type DamageCategory = 'bodyParts' | 'glass' | 'lighting' | 'mirrors' | 'wheels';

const SEVERITY_DESCRIPTIONS: Record<SeverityLevel, Record<DamageCategory, string>> = {
  minor: {
    bodyParts: "Мелкие царапины, небольшие вмятины, сколы краски",
    glass: "Трещины, сколы, царапины",
    lighting: "Царапины, помутнение, трещины",
    mirrors: "Царапины, трещины, сколы",
    wheels: "Царапины на диске, небольшая деформация",
  },
  moderate: {
    bodyParts: "Вмятины среднего размера, глубокие царапины, деформация",
    glass: "Трещины, требующие замены",
    lighting: "Разбит, треснут, не работает",
    mirrors: "Разбито, не работает",
    wheels: "Вмятины на диске, трещины",
  },
  severe: {
    bodyParts: "Сильная деформация, повреждение несущих элементов",
    glass: "Полностью разбито",
    lighting: "Серьезные повреждения, короткое замыкание",
    mirrors: "Полностью разбито",
    wheels: "Сильная деформация, небезопасно",
  },
};

// Base repair costs by severity
const REPAIR_COSTS: Record<string, Record<string, { minor: number; moderate: number; severe: number }>> = {
  bodyParts: {
    "Передний бампер": { minor: 5000, moderate: 15000, severe: 25000 },
    "Задний бампер": { minor: 5000, moderate: 14000, severe: 22000 },
    "Капот": { minor: 8000, moderate: 20000, severe: 35000 },
    "Крышка багажника": { minor: 7000, moderate: 18000, severe: 28000 },
    "Крыша": { minor: 10000, moderate: 25000, severe: 45000 },
    "Левое крыло": { minor: 4000, moderate: 12000, severe: 18000 },
    "Правое крыло": { minor: 4000, moderate: 12000, severe: 18000 },
    "Дверь водителя": { minor: 5000, moderate: 15000, severe: 22000 },
    "Дверь пассажира": { minor: 5000, moderate: 15000, severe: 22000 },
    "Задняя дверь": { minor: 5000, moderate: 14000, severe: 20000 },
  },
  glass: {
    "Лобовое стекло": { minor: 3000, moderate: 8000, severe: 15000 },
    "Заднее стекло": { minor: 2500, moderate: 7000, severe: 12000 },
    "Боковое стекло": { minor: 2000, moderate: 5000, severe: 8000 },
  },
  lighting: {
    "Фара передняя": { minor: 3000, moderate: 12000, severe: 25000 },
    "Фара задняя": { minor: 2500, moderate: 10000, severe: 18000 },
  },
  mirrors: {
    "Зеркало левое": { minor: 2000, moderate: 6000, severe: 12000 },
    "Зеркало правое": { minor: 2000, moderate: 6000, severe: 12000 },
  },
  wheels: {
    "Диск колесный": { minor: 3000, moderate: 8000, severe: 15000 },
  },
};

// Brand multipliers for repair costs
const BRAND_MULTIPLIERS: Record<string, number> = {
  "Lada (ВАЗ)": 0.7,
  "ГАЗ": 0.7,
  "УАЗ": 0.75,
  "Daewoo": 0.75,
  "Datsun": 0.75,
  "Chery": 0.8,
  "Geely": 0.8,
  "JAC": 0.8,
  "Great Wall": 0.8,
  "Haval": 0.8,
  "Lifan": 0.75,
  "FAW": 0.8,
  "ЗАЗ": 0.7,
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

  // Analyze a single image for damage indicators
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

      // Use the model if available
      if (modelRef.current) {
        const predictions = await modelRef.current.detect(img);
        
        // Check for car-related predictions
        const carPredictions = predictions.filter(
          (p) => p.class === "car" || p.class === "truck" || p.class === "bus" || p.class === "motorcycle"
        );
        
        // If we detect a vehicle, randomly assign damage zones for demo
        // In a real implementation, we'd use more sophisticated analysis
        if (carPredictions.length > 0) {
          // Simulate damage detection based on image analysis
          // In production, this would use a custom trained model
          const numDamages = Math.floor(Math.random() * 4) + 1;
          const shuffledZones = [...DAMAGE_ZONES].sort(() => Math.random() - 0.5);
          
          for (let i = 0; i < Math.min(numDamages, shuffledZones.length); i++) {
            const zone = shuffledZones[i];
            const severities: Array<"minor" | "moderate" | "severe"> = ["minor", "moderate", "severe"];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            
            results.push({
              zone: zone.key,
              key: zone.key,
              severity,
              confidence: 0.7 + Math.random() * 0.3,
              detectedFrom: imageUrl.substring(imageUrl.lastIndexOf("/") + 1),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    }
    
    return results;
  }, []);

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
        description: SEVERITY_DESCRIPTIONS[detection.severity][category as DamageCategory] || "Требует осмотра",
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
