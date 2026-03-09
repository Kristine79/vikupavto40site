/**
 * Simple Damage Detection without ML dependencies
 * Uses image analysis techniques to detect potential damage
 */

'use client';

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

// Car parts by region
const CAR_PARTS_BY_REGION = {
  'top-left': ['Передняя фара левая', 'Переднее крыло левое', 'Передняя дверь левая'],
  'top-center': ['Капот', 'Лобовое стекло', 'Крыша'],
  'top-right': ['Передняя фара правая', 'Переднее крыло правое', 'Передняя дверь правая'],
  'middle-left': ['Передняя дверь левая', 'Задняя дверь левая'],
  'middle-center': ['Крыша', 'Боковые стекла'],
  'middle-right': ['Передняя дверь правая', 'Задняя дверь правая'],
  'bottom-left': ['Задняя дверь левая', 'Заднее крыло левое', 'Задний фонарь левый'],
  'bottom-center': ['Задний бампер', 'Крышка багажника', 'Заднее стекло'],
  'bottom-right': ['Задняя дверь правая', 'Заднее крыло правое', 'Задний фонарь правый'],
};

/**
 * Load image from File or base64 string or blob URL
 */
async function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (typeof source === 'string') {
      // Handle blob URLs - don't set crossOrigin for blob URLs
      if (source.startsWith('blob:')) {
        img.src = source;
      } else {
        img.crossOrigin = 'anonymous';
        img.src = source.startsWith('data:') ? source : `data:image/jpeg;base64,${source}`;
      }
    } else {
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
 * Analyze image for damage indicators
 */
function analyzeImageDamage(img: HTMLImageElement): {
  damageRegions: string[];
  damageScore: number;
  damagedParts: string[];
} {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  // Divide image into 9 regions (3x3 grid)
  const regionWidth = canvas.width / 3;
  const regionHeight = canvas.height / 3;
  
  const regionScores: Record<string, number> = {
    'top-left': 0,
    'top-center': 0,
    'top-right': 0,
    'middle-left': 0,
    'middle-center': 0,
    'middle-right': 0,
    'bottom-left': 0,
    'bottom-center': 0,
    'bottom-right': 0,
  };
  
  // Analyze each pixel
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    // Calculate pixel position
    const pixelIndex = i / 4;
    const x = pixelIndex % canvas.width;
    const y = Math.floor(pixelIndex / canvas.width);
    
    // Determine region
    const regionX = Math.floor(x / regionWidth);
    const regionY = Math.floor(y / regionHeight);
    const regionKey = `${regionY === 0 ? 'top' : regionY === 1 ? 'middle' : 'bottom'}-${regionX === 0 ? 'left' : regionX === 1 ? 'center' : 'right'}`;
    
    // Damage indicators
    const brightness = (r + g + b) / 3;
    const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    
    // Dark spots (potential damage, missing parts)
    if (brightness < 40) {
      regionScores[regionKey] += 0.002;
    }
    
    // Very dark spots (holes, severe damage)
    if (brightness < 20) {
      regionScores[regionKey] += 0.005;
    }
    
    // High color variance (scratches, rust, mismatched parts)
    if (colorVariance > 120) {
      regionScores[regionKey] += 0.001;
    }
    
    // Extreme variance (severe damage)
    if (colorVariance > 180) {
      regionScores[regionKey] += 0.003;
    }
  }
  
  // Identify damaged regions
  const damageRegions: string[] = [];
  const damagedParts: string[] = [];
  let totalDamageScore = 0;
  
  Object.entries(regionScores).forEach(([region, score]) => {
    // Normalize score
    const normalizedScore = Math.min(score, 1);
    totalDamageScore += normalizedScore;
    
    // Threshold for damage detection
    if (normalizedScore > 0.15) {
      damageRegions.push(region);
      const parts = CAR_PARTS_BY_REGION[region as keyof typeof CAR_PARTS_BY_REGION] || [];
      damagedParts.push(...parts);
    }
  });
  
  // Normalize total score
  totalDamageScore = Math.min(totalDamageScore / 9, 1);
  
  return {
    damageRegions,
    damageScore: totalDamageScore,
    damagedParts: [...new Set(damagedParts)], // Remove duplicates
  };
}

/**
 * Detect if image contains a vehicle (simple heuristic)
 */
function detectVehicle(img: HTMLImageElement): boolean {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  // Simple heuristic: check for typical car colors and patterns
  let metallic = 0;
  let glass = 0;
  let rubber = 0;
  
  for (let i = 0; i < pixels.length; i += 4 * 100) { // Sample every 100th pixel
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    
    const brightness = (r + g + b) / 3;
    const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    
    // Metallic surfaces (low variance, medium-high brightness)
    if (colorVariance < 30 && brightness > 80 && brightness < 200) {
      metallic++;
    }
    
    // Glass (high brightness, low variance)
    if (brightness > 200 && colorVariance < 20) {
      glass++;
    }
    
    // Rubber/tires (very dark, low variance)
    if (brightness < 50 && colorVariance < 30) {
      rubber++;
    }
  }
  
  const sampleSize = Math.floor(pixels.length / 4 / 100);
  const metallicRatio = metallic / sampleSize;
  const glassRatio = glass / sampleSize;
  const rubberRatio = rubber / sampleSize;
  
  // If we detect typical car materials, assume it's a vehicle
  return (metallicRatio > 0.2 || glassRatio > 0.1 || rubberRatio > 0.05);
}

/**
 * Main damage detection function
 */
export async function detectCarDamage(source: File | string): Promise<DamageDetectionResult> {
  try {
    console.log('🔍 Starting damage detection...');
    
    // Load image
    const img = await loadImage(source);
    console.log(`📐 Image loaded: ${img.width}x${img.height}`);
    
    // Check if image contains a vehicle
    const hasVehicle = detectVehicle(img);
    console.log(`🚗 Vehicle detected: ${hasVehicle}`);
    
    if (!hasVehicle) {
      return {
        success: true,
        carDetected: false,
        damages: [],
        totalDamageScore: 0,
        estimatedRepairCost: 0,
        error: 'No vehicle detected in the image',
      };
    }
    
    // Analyze damage
    const { damageRegions, damageScore, damagedParts } = analyzeImageDamage(img);
    console.log(`📊 Damage analysis: ${damageRegions.length} regions affected, score: ${damageScore.toFixed(2)}`);
    
    // Determine severity
    let severity: 'minor' | 'moderate' | 'severe' = 'minor';
    if (damageScore > 0.6) severity = 'severe';
    else if (damageScore > 0.35) severity = 'moderate';
    
    // Create damage list
    const damages = damagedParts.map(part => ({
      part,
      severity,
      confidence: Math.min(damageScore * 1.2, 0.95),
    }));
    
    // Estimate repair cost
    const baseCost = 50000;
    const severityMultiplier = severity === 'severe' ? 3 : severity === 'moderate' ? 2 : 1;
    const partsMultiplier = Math.min(damagedParts.length * 0.5, 3);
    const estimatedRepairCost = Math.round(baseCost * severityMultiplier * partsMultiplier);
    
    console.log(`✅ Detection complete: ${damages.length} parts affected`);
    
    return {
      success: true,
      carDetected: true,
      damages,
      totalDamageScore: damageScore,
      estimatedRepairCost,
    };
    
  } catch (error) {
    console.error('❌ Error in damage detection:', error);
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
