/**
 * Roboflow AI Damage Detector
 * Uses Roboflow's hosted computer vision API for car damage detection
 * 
 * Roboflow offers pre-trained models for vehicle damage detection
 * API: https://docs.roboflow.com/api/overview
 */

'use client';

export interface RoboflowDetection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // x, y, width, height
}

export interface RoboflowDamageResult {
  success: boolean;
  predictions: RoboflowDetection[];
  imageWidth: number;
  imageHeight: number;
  error?: string;
}

// Car parts mapping based on detected damage locations
const DAMAGE_TO_PARTS: Record<string, string[]> = {
  'dent': ['Капот', 'Крыша', 'Дверь', 'Крыло', 'Багажник'],
  'scratch': ['Капот', 'Дверь', 'Крыло', 'Багажник', 'Бампер'],
  'crack': ['Лобовое стекло', 'Заднее стекло', 'Боковые стекла'],
  'broken': ['Бампер', 'Фара', 'Зеркало', 'Дверь'],
  'damage': ['Капот', 'Крыша', 'Бампер', 'Крыло', 'Дверь'],
  'headlight': ['Фара передняя', 'Фонарь задний'],
  'taillight': ['Фонарь задний', 'Фара задняя'],
  'bumper': ['Передний бампер', 'Задний бампер'],
  'hood': ['Капот'],
  'door': ['Передняя дверь', 'Задняя дверь'],
  'fender': ['Переднее крыло', 'Заднее крыло'],
  'trunk': ['Крышка багажника'],
  'roof': ['Крыша'],
  'glass': ['Лобовое стекло', 'Заднее стекло', 'Боковые стекла'],
  'wheel': ['Колесо', 'Диск'],
  'mirror': ['Зеркало боковое'],
};

// Severity estimation based on confidence and damage type
function estimateSeverity(detection: RoboflowDetection): 'minor' | 'moderate' | 'severe' {
  const confidence = detection.confidence;
  
  // Lower confidence = harder to assess = moderate
  // Higher confidence with certain damage types = more severe
  if (confidence > 0.8) {
    const classLower = detection.class.toLowerCase();
    if (classLower.includes('broken') || classLower.includes('severe') || classLower.includes('crack')) {
      return 'severe';
    }
    return 'moderate';
  }
  return 'minor';
}

/**
 * Analyze damage detections and map to car parts
 */
export function analyzeRoboflowPredictions(
  predictions: RoboflowDetection[],
  imageWidth: number,
  imageHeight: number
): {
  damages: Array<{
    part: string;
    severity: 'minor' | 'moderate' | 'severe';
    confidence: number;
  }>;
  totalDamageScore: number;
  estimatedRepairCost: number;
} {
  const damageMap = new Map<string, { severity: 'minor' | 'moderate' | 'severe'; confidence: number }>();
  
  let totalScore = 0;
  
  predictions.forEach(prediction => {
    const classLower = prediction.class.toLowerCase();
    const [x, y, w, h] = prediction.bbox;
    
    // Determine position (top/middle/bottom, left/center/right)
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const posX = centerX / imageWidth;
    const posY = centerY / imageHeight;
    
    // Get parts for this damage type
    const parts = DAMAGE_TO_PARTS[classLower] || DAMAGE_TO_PARTS['damage'];
    
    // Determine which part based on position
    let selectedPart = parts[0];
    if (parts.length > 1) {
      if (posY < 0.4) {
        // Top of car
        selectedPart = parts.find(p => 
          p.includes('Капот') || p.includes('Крыша') || p.includes('Фара') || p.includes('Лобовое')
        ) || parts[0];
      } else if (posY > 0.6) {
        // Bottom of car
        selectedPart = parts.find(p => 
          p.includes('Бампер') || p.includes('Багажник') || p.includes('Фонарь') || p.includes('Заднее')
        ) || parts[parts.length - 1];
      } else {
        // Middle
        selectedPart = parts.find(p => 
          p.includes('Дверь') || p.includes('Крыло') || p.includes('Зеркало')
        ) || parts[0];
      }
    }
    
    const severity = estimateSeverity(prediction);
    
    // Store best detection for each part
    const existing = damageMap.get(selectedPart);
    if (!existing || prediction.confidence > existing.confidence) {
      damageMap.set(selectedPart, { severity, confidence: prediction.confidence });
    }
    
    totalScore += prediction.confidence;
  });
  
  // Calculate costs
  const baseRepairCost = 50000;
  const severityMultiplier: Record<string, number> = {
    minor: 1,
    moderate: 2,
    severe: 3,
  };
  
  let estimatedRepairCost = baseRepairCost;
  damageMap.forEach(({ severity }) => {
    estimatedRepairCost += baseRepairCost * severityMultiplier[severity] * 0.3;
  });
  
  // Normalize score
  const totalDamageScore = Math.min(totalScore / 10, 1);
  
  return {
    damages: Array.from(damageMap.entries()).map(([part, data]) => ({
      part,
      severity: data.severity,
      confidence: data.confidence,
    })),
    totalDamageScore,
    estimatedRepairCost: Math.round(estimatedRepairCost),
  };
}

/**
 * Send image to Roboflow API for damage detection
 * 
 * You need to:
 * 1. Create account at https://roboflow.com
 * 2. Upload images and annotate car damages
 * 3. Train a model or use a public one
 * 4. Get your API key and model name
 * 
 * Environment variables:
 * - NEXT_PUBLIC_ROBOFLOW_API_KEY
 * - NEXT_PUBLIC_ROBOFLOW_MODEL_NAME
 */
export async function detectWithRoboflow(
  imageBase64: string
): Promise<RoboflowDamageResult> {
  const apiKey = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY || 'YOUR_API_KEY')
    : 'YOUR_API_KEY';
  
  const modelName = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_ROBOFLOW_MODEL_NAME || 'car-damage-detection/1')
    : 'car-damage-detection/1';
  
  // Check if API key is configured
  if (apiKey === 'YOUR_API_KEY' || !apiKey) {
    return {
      success: false,
      predictions: [],
      imageWidth: 0,
      imageHeight: 0,
      error: 'Roboflow API key not configured. Please set NEXT_PUBLIC_ROBOFLOW_API_KEY environment variable.',
    };
  }
  
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    // Roboflow API endpoint
    const url = `https://detect.roboflow.com/${modelName}?api_key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: base64Data,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Roboflow API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      predictions: result.predictions || [],
      imageWidth: result.image?.width || 0,
      imageHeight: result.image?.height || 0,
    };
    
  } catch (error) {
    console.error('Roboflow detection error:', error);
    return {
      success: false,
      predictions: [],
      imageWidth: 0,
      imageHeight: 0,
      error: error instanceof Error ? error.message : 'Unknown error in Roboflow detection',
    };
  }
}

/**
 * Main damage detection function that uses Roboflow AI
 */
export async function detectCarDamageRoboflow(source: File | string): Promise<{
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
  source: 'roboflow' | 'fallback';
}> {
  console.log('🤖 Starting Roboflow AI damage detection...');
  
  try {
    // Convert source to base64
    let imageBase64: string;
    
    if (source instanceof File) {
      const reader = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(source);
      });
      imageBase64 = reader;
    } else {
      imageBase64 = source.startsWith('data:') ? source : `data:image/jpeg;base64,${source}`;
    }
    
    // Try Roboflow first
    const roboflowResult = await detectWithRoboflow(imageBase64);
    
    if (roboflowResult.success && roboflowResult.predictions.length > 0) {
      console.log(`✅ Roboflow detected ${roboflowResult.predictions.length} damages`);
      
      const analysis = analyzeRoboflowPredictions(
        roboflowResult.predictions,
        roboflowResult.imageWidth,
        roboflowResult.imageHeight
      );
      
      return {
        success: true,
        carDetected: true,
        ...analysis,
        source: 'roboflow',
      };
    }
    
    // If Roboflow failed or no predictions, try fallback
    console.log('⚠️ Roboflow not available, using fallback detector');
    
    // Dynamic import of fallback detector
    const { detectCarDamage: detectSimpleDamage } = await import('./simple-damage-detector');
    const fallbackResult = await detectSimpleDamage(source);
    
    return {
      ...fallbackResult,
      source: 'fallback',
    };
    
  } catch (error) {
    console.error('❌ Error in Roboflow damage detection:', error);
    
    // Try fallback
    try {
      const { detectCarDamage: detectSimpleDamage } = await import('./simple-damage-detector');
      const fallbackResult = await detectSimpleDamage(source);
      
      return {
        ...fallbackResult,
        source: 'fallback',
      };
    } catch (fallbackError) {
      return {
        success: false,
        carDetected: false,
        damages: [],
        totalDamageScore: 0,
        estimatedRepairCost: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'fallback',
      };
    }
  }
}
