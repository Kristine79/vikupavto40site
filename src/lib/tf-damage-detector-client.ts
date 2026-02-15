/**
 * Client-side TensorFlow.js Car Damage Detection
 * Uses COCO-SSD for vehicle detection and pixel analysis for damage
 * Runs in the browser for better Next.js compatibility
 */

'use client';

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface DamageDetectionResult {
  success: boolean;
  carDetected: boolean;
  damages: Array<{
    part: string;
    severity: 'minor' | 'moderate' | 'severe';
    confidence: number;
  }>;
  totalDamageScore: number;
  estimatedRepairCost: number;
  error?: string;
}

interface DetectedObject {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

// Car parts mapping based on detected regions
const CAR_PARTS = {
  front: ['Передний бампер', 'Капот', 'Передняя фара левая', 'Передняя фара правая', 'Решетка радиатора'],
  side: ['Передняя дверь левая', 'Передняя дверь правая', 'Задняя дверь левая', 'Задняя дверь правая', 'Переднее крыло левое', 'Переднее крыло правое'],
  rear: ['Задний бампер', 'Крышка багажника', 'Задний фонарь левый', 'Задний фонарь правый'],
  top: ['Крыша', 'Лобовое стекло', 'Заднее стекло'],
};

// Damage detection thresholds
const DAMAGE_THRESHOLDS = {
  minor: 0.3,
  moderate: 0.5,
  severe: 0.7,
};

let modelCache: cocoSsd.ObjectDetection | null = null;

/**
 * Load COCO-SSD model (cached)
 */
async function loadModel(): Promise<cocoSsd.ObjectDetection> {
  if (modelCache) {
    return modelCache;
  }
  
  console.log('Loading COCO-SSD model...');
  modelCache = await cocoSsd.load({
    base: 'lite_mobilenet_v2', // Lighter model for browser
  });
  console.log('COCO-SSD model loaded successfully');
  
  return modelCache;
}

/**
 * Load image from File or base64
 */
async function loadImageElement(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (typeof source === 'string') {
      // Base64 string
      img.src = source.startsWith('data:') ? source : `data:image/jpeg;base64,${source}`;
    } else {
      // File object
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Detect vehicles in the image
 */
async function detectVehicles(img: HTMLImageElement): Promise<DetectedObject[]> {
  const model = await loadModel();
  
  // Detect objects
  const predictions = await model.detect(img);
  
  // Filter for vehicles (car, truck, bus, motorcycle)
  const vehicles = predictions.filter(pred => 
    ['car', 'truck', 'bus', 'motorcycle'].includes(pred.class)
  );
  
  return vehicles.map(pred => ({
    bbox: pred.bbox as [number, number, number, number],
    class: pred.class,
    score: pred.score,
  }));
}

/**
 * Analyze image for damage patterns using pixel analysis
 */
function analyzeDamagePatterns(
  img: HTMLImageElement,
  vehicleBbox: [number, number, number, number]
): {
  damageScore: number;
  affectedRegions: string[];
} {
  // Create canvas for pixel analysis
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  // Extract vehicle region
  const [x, y, width, height] = vehicleBbox;
  const vehicleData = ctx.getImageData(x, y, width, height);
  const pixels = vehicleData.data;
  
  // Analyze for damage indicators
  let damageScore = 0;
  const regionScores = {
    front: 0,
    side: 0,
    rear: 0,
    top: 0,
  };
  
  // Divide vehicle into regions
  const regionWidth = width / 3;
  const regionHeight = height / 2;
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    // Calculate pixel position
    const pixelIndex = i / 4;
    const px = pixelIndex % width;
    const py = Math.floor(pixelIndex / width);
    
    // Determine region
    let region: keyof typeof regionScores = 'side';
    if (px < regionWidth) region = 'front';
    else if (px > regionWidth * 2) region = 'rear';
    if (py < regionHeight / 2) region = 'top';
    
    // Detect damage indicators
    const brightness = (r + g + b) / 3;
    const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    
    // Dark spots (potential damage)
    if (brightness < 50) {
      damageScore += 0.001;
      regionScores[region] += 0.001;
    }
    
    // High color variance (scratches, mismatched parts)
    if (colorVariance > 100) {
      damageScore += 0.0005;
      regionScores[region] += 0.0005;
    }
  }
  
  // Normalize scores
  damageScore = Math.min(damageScore, 1);
  
  // Identify affected regions
  const affectedRegions: string[] = [];
  Object.entries(regionScores).forEach(([region, score]) => {
    if (score > 0.1) {
      affectedRegions.push(region);
    }
  });
  
  return { damageScore, affectedRegions };
}

/**
 * Determine viewing angle of the car
 */
function determineViewingAngle(bbox: [number, number, number, number], imageWidth: number): string {
  const [x, , width] = bbox;
  const centerX = x + width / 2;
  const relativePosition = centerX / imageWidth;
  
  if (relativePosition < 0.33) return 'front-left';
  if (relativePosition > 0.67) return 'front-right';
  return 'front';
}

/**
 * Map damaged regions to specific car parts
 */
function mapRegionsToParts(affectedRegions: string[], viewingAngle: string): string[] {
  const parts: string[] = [];
  
  affectedRegions.forEach(region => {
    const regionParts = CAR_PARTS[region as keyof typeof CAR_PARTS] || [];
    
    // Filter parts based on viewing angle
    if (viewingAngle.includes('front') && region === 'front') {
      parts.push(...regionParts);
    } else if (viewingAngle.includes('side') && region === 'side') {
      parts.push(...regionParts);
    } else if (viewingAngle.includes('rear') && region === 'rear') {
      parts.push(...regionParts);
    } else if (region === 'top') {
      parts.push(...regionParts);
    }
  });
  
  return [...new Set(parts)]; // Remove duplicates
}

/**
 * Main damage detection function
 */
export async function detectCarDamage(source: File | string): Promise<DamageDetectionResult> {
  try {
    // Step 1: Load image
    console.log('Loading image...');
    const img = await loadImageElement(source);
    
    // Step 2: Detect vehicles
    console.log('Detecting vehicles in image...');
    const vehicles = await detectVehicles(img);
    
    if (vehicles.length === 0) {
      return {
        success: true,
        carDetected: false,
        damages: [],
        totalDamageScore: 0,
        estimatedRepairCost: 0,
        error: 'No vehicle detected in the image',
      };
    }
    
    // Use the first detected vehicle
    const vehicle = vehicles[0];
    console.log(`Vehicle detected: ${vehicle.class} (confidence: ${vehicle.score.toFixed(2)})`);
    
    // Step 3: Analyze damage patterns
    console.log('Analyzing damage patterns...');
    const { damageScore, affectedRegions } = analyzeDamagePatterns(img, vehicle.bbox);
    
    // Step 4: Determine viewing angle
    const viewingAngle = determineViewingAngle(vehicle.bbox, img.width);
    
    // Step 5: Map to specific parts
    const damagedParts = mapRegionsToParts(affectedRegions, viewingAngle);
    
    // Step 6: Determine severity
    let severity: 'minor' | 'moderate' | 'severe' = 'minor';
    if (damageScore > DAMAGE_THRESHOLDS.severe) severity = 'severe';
    else if (damageScore > DAMAGE_THRESHOLDS.moderate) severity = 'moderate';
    
    // Step 7: Create damage list
    const damages = damagedParts.map(part => ({
      part,
      severity,
      confidence: Math.min(damageScore * 1.5, 1),
    }));
    
    // Step 8: Estimate repair cost
    const baseCost = 50000; // Base cost in rubles
    const severityMultiplier = severity === 'severe' ? 3 : severity === 'moderate' ? 2 : 1;
    const partsMultiplier = Math.min(damagedParts.length * 0.5, 3);
    const estimatedRepairCost = Math.round(baseCost * severityMultiplier * partsMultiplier);
    
    console.log(`Damage analysis complete: ${damages.length} parts affected, score: ${damageScore.toFixed(2)}`);
    
    return {
      success: true,
      carDetected: true,
      damages,
      totalDamageScore: damageScore,
      estimatedRepairCost,
    };
    
  } catch (error) {
    console.error('Error in damage detection:', error);
    return {
      success: false,
      carDetected: false,
      damages: [],
      totalDamageScore: 0,
      estimatedRepairCost: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
