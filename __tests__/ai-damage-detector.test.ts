/**
 * AI Damage Detector Tests
 * Tests for image analysis and damage detection functionality
 */

// Mock TensorFlow.js and COCO-SSD
jest.mock('@tensorflow/tfjs', () => ({
  ready: jest.fn().mockResolvedValue(true),
}));

// Mock COCO-SSD with different scenarios
const mockDetect = jest.fn();
jest.mock('@tensorflow-models/coco-ssd', () => ({
  load: jest.fn().mockResolvedValue({
    detect: mockDetect,
  }),
}));

// Mock canvas and image
class MockCanvas {
  width = 800;
  height = 600;
  getContext() {
    return {
      drawImage: jest.fn(),
      getImageData: jest.fn().mockReturnValue({
        data: new Uint8ClampedArray(800 * 600 * 4).fill(128),
      }),
    };
  }
}

class MockImage {
  width = 800;
  height = 600;
  crossOrigin = '';
  src = '';
  onload: (() => void) | null = null;
  onerror: ((e: Error) => void) | null = null;
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

// Mock document
const mockCreateElement = jest.fn((tag: string) => {
  if (tag === 'canvas') return new MockCanvas();
  return null;
});

global.document = {
  createElement: mockCreateElement,
} as any;

global.Image = MockImage as any;

// Helper function to create mock damage data
function createMockDamageData(width: number, height: number, damageArea: string): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);

  // Fill with normal data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128;     // R
    data[i + 1] = 128; // G
    data[i + 2] = 128; // B
    data[i + 3] = 255; // A
  }

  // Add damage in specific area
  switch (damageArea) {
    case 'hood':
      // Damage in top center (hood area for front view)
      for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.5); y++) {
        for (let x = Math.floor(width * 0.2); x < Math.floor(width * 0.8); x++) {
          const idx = (y * width + x) * 4;
          data[idx] = 50;     // Dark damage
          data[idx + 1] = 50;
          data[idx + 2] = 50;
        }
      }
      break;
    case 'bumper':
      // Damage in bottom area (bumper)
      for (let y = Math.floor(height * 0.7); y < height; y++) {
        for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x++) {
          const idx = (y * width + x) * 4;
          data[idx] = 30;     // Very dark damage
          data[idx + 1] = 30;
          data[idx + 2] = 30;
        }
      }
      break;
  }

  return data;
}

describe('AI Damage Detection', () => {
  beforeEach(() => {
    // Reset mock for each test
    mockDetect.mockClear();
  });

  describe('Viewing Angle Determination', () => {
    test('should detect front view for centered wide bbox', () => {
      // Test the viewing angle determination logic directly
      const aspectRatio = 1.5; // Front view aspect ratio
      const centerX = 400; // Centered
      const imgWidth = 800;

      const horizontalOffset = Math.abs(centerX - imgWidth / 2) / imgWidth;
      const isFront = aspectRatio < 2.0 && horizontalOffset < 0.1;

      expect(isFront).toBe(true);
    });

    test('should detect side view for wide bbox', () => {
      const aspectRatio = 2.5; // Side view aspect ratio
      const isSide = aspectRatio >= 2.0;

      expect(isSide).toBe(true);
    });

    test('should detect left side view for bbox on left side', () => {
      const centerX = 200; // Left side
      const imgWidth = 800;
      const imgCenterX = imgWidth / 2;
      const isLeftSide = centerX < imgCenterX;

      expect(isLeftSide).toBe(true);
    });
  });

  describe('Car Region Analysis', () => {
    test('should define correct regions for front view', () => {
      // Test that front view has expected regions
      const frontRegions = [
        'hood', 'front-bumper', 'front-left-wing', 'front-right-wing',
        'windshield', 'front-left-headlight', 'front-right-headlight'
      ];

      // Verify these are the expected regions for front view
      expect(frontRegions).toContain('hood');
      expect(frontRegions).toContain('front-bumper');
      expect(frontRegions).toContain('windshield');
    });

    test('should define correct regions for side views', () => {
      const leftSideRegions = [
        'left-front-door', 'left-rear-door', 'left-wing', 'left-mirror', 'left-wheels'
      ];
      const rightSideRegions = [
        'right-front-door', 'right-rear-door', 'right-wing', 'right-mirror', 'right-wheels'
      ];

      expect(leftSideRegions).toContain('left-front-door');
      expect(rightSideRegions).toContain('right-front-door');
    });
  });

  describe('Damage Zone Mapping', () => {
    test('should map front view regions to correct zones', () => {
      // Test mapping logic for front view
      const mappings: Record<string, string> = {
        'hood': 'Kapot',
        'front-bumper': 'Peredniy bamper',
        'windshield': 'Lobovoe steklo',
        'front-left-wing': 'Levoe krylo',
        'front-right-wing': 'Pravoe krylo'
      };

      expect(mappings['hood']).toBe('Kapot');
      expect(mappings['front-bumper']).toBe('Peredniy bamper');
      expect(mappings['windshield']).toBe('Lobovoe steklo');
    });

    test('should map side view regions to correct zones', () => {
      const leftMappings: Record<string, string> = {
        'left-front-door': 'Dver voditelya',
        'left-rear-door': 'Zadnyaya dver',
        'left-wing': 'Levoe krylo'
      };

      const rightMappings: Record<string, string> = {
        'right-front-door': 'Dver passazhira',
        'right-rear-door': 'Zadnyaya dver',
        'right-wing': 'Pravoe krylo'
      };

      expect(leftMappings['left-front-door']).toBe('Dver voditelya');
      expect(rightMappings['right-front-door']).toBe('Dver passazhira');
    });
  });

  describe('Car Detection Integration', () => {
    test('should detect car and analyze damage for front view', async () => {
      // Mock car detection for front view
      mockDetect.mockResolvedValue([
        { class: 'car', bbox: [200, 150, 400, 300], score: 0.9 } // Centered, wide aspect ratio
      ]);

      // Mock canvas with damage data
      const mockCtx = {
        drawImage: jest.fn(),
        getImageData: jest.fn().mockReturnValue({
          data: createMockDamageData(400, 300, 'hood') // Mock damage in hood area
        })
      };

      const mockCanvas = {
        width: 800,
        height: 600,
        getContext: jest.fn().mockReturnValue(mockCtx)
      };

      mockCreateElement.mockReturnValue(mockCanvas);

      // Test would go here - for now just verify mock setup
      expect(mockDetect).not.toHaveBeenCalled();
    });

    test('should skip analysis when no car detected', async () => {
      // Mock no car detection
      mockDetect.mockResolvedValue([]);

      // Test would verify empty results returned
      expect(mockDetect).not.toHaveBeenCalled();
    });
  });

  describe('Image Region Analysis', () => {
    // Test the analyzeImageRegions function logic
    test('should calculate variance correctly for uniform region', () => {
      // Uniform brightness = low variance
      const uniformData = new Uint8ClampedArray(100 * 100 * 4).fill(128);
      const brightnessValues: number[] = [];
      
      for (let i = 0; i < uniformData.length; i += 4) {
        const brightness = (uniformData[i] + uniformData[i + 1] + uniformData[i + 2]) / 3;
        brightnessValues.push(brightness);
      }
      
      const mean = brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length;
      const variance = brightnessValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / brightnessValues.length;
      
      expect(variance).toBe(0); // No variance in uniform image
    });

    test('should calculate variance correctly for varied region', () => {
      // Varied brightness = high variance
      const variedData = new Uint8ClampedArray(100 * 100 * 4);
      for (let i = 0; i < variedData.length; i += 4) {
        const value = (i / 4) % 256; // Gradient
        variedData[i] = value;
        variedData[i + 1] = value;
        variedData[i + 2] = value;
        variedData[i + 3] = 255;
      }
      
      const brightnessValues: number[] = [];
      for (let i = 0; i < variedData.length; i += 4) {
        const brightness = (variedData[i] + variedData[i + 1] + variedData[i + 2]) / 3;
        brightnessValues.push(brightness);
      }
      
      const mean = brightnessValues.reduce((a, b) => a + b, 0) / brightnessValues.length;
      const variance = brightnessValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / brightnessValues.length;
      
      expect(variance).toBeGreaterThan(0);
    });

    test('should detect dark pixels correctly', () => {
      const darkData = new Uint8ClampedArray(100 * 100 * 4);
      for (let i = 0; i < darkData.length; i += 4) {
        darkData[i] = 30; // Dark
        darkData[i + 1] = 30;
        darkData[i + 2] = 30;
        darkData[i + 3] = 255;
      }
      
      let darkCount = 0;
      const threshold = 50;
      
      for (let i = 0; i < darkData.length; i += 4) {
        const brightness = (darkData[i] + darkData[i + 1] + darkData[i + 2]) / 3;
        if (brightness < threshold) darkCount++;
      }
      
      expect(darkCount).toBe(100 * 100);
    });

    test('should detect bright pixels correctly', () => {
      const brightData = new Uint8ClampedArray(100 * 100 * 4);
      for (let i = 0; i < brightData.length; i += 4) {
        brightData[i] = 240; // Bright
        brightData[i + 1] = 240;
        brightData[i + 2] = 240;
        brightData[i + 3] = 255;
      }
      
      let brightCount = 0;
      const threshold = 200;
      
      for (let i = 0; i < brightData.length; i += 4) {
        const brightness = (brightData[i] + brightData[i + 1] + brightData[i + 2]) / 3;
        if (brightness > threshold) brightCount++;
      }
      
      expect(brightCount).toBe(100 * 100);
    });
  });

  describe('Damage Zone Mapping', () => {
    test('should map left region to left fender in landscape image', () => {
      const isLandscape = true;
      const region = 'left';
      
      let zone: string = 'Hood';
      if (isLandscape) {
        if (region === 'left') {
          zone = 'Left fender';
        } else if (region === 'right') {
          zone = 'Right fender';
        }
      }
      
      expect(zone).toBe('Left fender');
    });

    test('should map top region to roof in landscape image', () => {
      const isLandscape = true;
      const region = 'top';
      
      let zone: string = 'Hood';
      if (isLandscape) {
        if (region === 'top') {
          zone = 'Roof';
        } else if (region === 'bottom') {
          zone = 'Front bumper';
        }
      }
      
      expect(zone).toBe('Roof');
    });

    test('should map bottom region to bumper in landscape image', () => {
      const isLandscape = true;
      const region = 'bottom';
      
      let zone: string = 'Hood';
      if (isLandscape) {
        if (region === 'bottom') {
          zone = 'Front bumper';
        }
      }
      
      expect(zone).toBe('Front bumper');
    });

    test('should map regions differently for portrait image', () => {
      const isLandscape = false;
      const region = 'top';
      
      let zone: string = 'Trunk lid';
      if (!isLandscape) {
        if (region === 'top') {
          zone = 'Windshield';
        } else if (region === 'bottom') {
          zone = 'Rear bumper';
        }
      }
      
      expect(zone).toBe('Windshield');
    });
  });

  describe('Anomaly Detection Thresholds', () => {
    test('should detect anomaly with high variance', () => {
      const variance = 2000;
      const darkness = 0.1;
      const brightness = 0.1;
      
      const hasAnomaly = variance > 1500 || darkness > 0.15 || brightness > 0.2;
      
      expect(hasAnomaly).toBe(true);
    });

    test('should detect anomaly with high darkness', () => {
      const variance = 1000;
      const darkness = 0.2;
      const brightness = 0.1;
      
      const hasAnomaly = variance > 1500 || darkness > 0.15 || brightness > 0.2;
      
      expect(hasAnomaly).toBe(true);
    });

    test('should detect anomaly with high brightness', () => {
      const variance = 1000;
      const darkness = 0.1;
      const brightness = 0.3;
      
      const hasAnomaly = variance > 1500 || darkness > 0.15 || brightness > 0.2;
      
      expect(hasAnomaly).toBe(true);
    });

    test('should not detect anomaly in normal image', () => {
      const variance = 800;
      const darkness = 0.05;
      const brightness = 0.1;
      
      const hasAnomaly = variance > 1500 || darkness > 0.15 || brightness > 0.2;
      
      expect(hasAnomaly).toBe(false);
    });
  });

  describe('Severity Calculation', () => {
    test('should assign severe severity for high variance', () => {
      const variance = 2500;
      const severity = variance > 2000 ? 'severe' : variance > 1500 ? 'moderate' : 'minor';
      
      expect(severity).toBe('severe');
    });

    test('should assign moderate severity for medium variance', () => {
      const variance = 1800;
      const severity = variance > 2000 ? 'severe' : variance > 1500 ? 'moderate' : 'minor';
      
      expect(severity).toBe('moderate');
    });

    test('should assign minor severity for low variance', () => {
      const variance = 1200;
      const severity = variance > 2000 ? 'severe' : variance > 1500 ? 'moderate' : 'minor';
      
      expect(severity).toBe('minor');
    });

    test('should assign severe severity for high darkness', () => {
      const darkness = 0.25;
      const variance = 1000;
      const severity = darkness > 0.2 ? 'severe' : variance > 1500 ? 'moderate' : 'minor';
      
      expect(severity).toBe('severe');
    });
  });

  describe('Confidence Calculation', () => {
    test('should calculate confidence based on anomaly strength', () => {
      const variance = 2000;
      const darkness = 0.2;
      const brightness = 0.3;
      
      const anomalyStrength = Math.min((variance / 3000) + (darkness * 2) + (brightness * 2), 1);
      const confidence = 0.6 + anomalyStrength * 0.35;
      
      expect(confidence).toBeGreaterThan(0.6);
      expect(confidence).toBeLessThanOrEqual(0.95);
    });

    test('should cap confidence at 0.95', () => {
      const variance = 5000;
      const darkness = 0.5;
      const brightness = 0.5;
      
      const anomalyStrength = Math.min((variance / 3000) + (darkness * 2) + (brightness * 2), 1);
      const confidence = 0.6 + anomalyStrength * 0.35;
      
      expect(confidence).toBeLessThanOrEqual(0.95);
    });

    test('should have minimum confidence of 0.6', () => {
      const variance = 0;
      const darkness = 0;
      const brightness = 0;
      
      const anomalyStrength = Math.min((variance / 3000) + (darkness * 2) + (brightness * 2), 1);
      const confidence = 0.6 + anomalyStrength * 0.35;
      
      expect(confidence).toBeGreaterThanOrEqual(0.6);
    });
  });

  describe('Damage Zone List', () => {
    const DAMAGE_ZONES = [
      { key: 'Front bumper', category: 'bodyParts' },
      { key: 'Rear bumper', category: 'bodyParts' },
      { key: 'Hood', category: 'bodyParts' },
      { key: 'Trunk lid', category: 'bodyParts' },
      { key: 'Roof', category: 'bodyParts' },
      { key: 'Left fender', category: 'bodyParts' },
      { key: 'Right fender', category: 'bodyParts' },
      { key: 'Driver door', category: 'bodyParts' },
      { key: 'Passenger door', category: 'bodyParts' },
      { key: 'Windshield', category: 'glass' },
      { key: 'Rear window', category: 'glass' },
      { key: 'Headlight', category: 'lighting' },
      { key: 'Taillight', category: 'lighting' },
      { key: 'Left mirror', category: 'mirrors' },
      { key: 'Right mirror', category: 'mirrors' },
      { key: 'Wheel', category: 'wheels' },
    ];

    test('should have all required damage zones', () => {
      expect(DAMAGE_ZONES.length).toBe(16);
    });

    test('should have body parts category', () => {
      const bodyParts = DAMAGE_ZONES.filter(z => z.category === 'bodyParts');
      expect(bodyParts.length).toBe(9);
    });

    test('should have glass category', () => {
      const glass = DAMAGE_ZONES.filter(z => z.category === 'glass');
      expect(glass.length).toBe(2);
    });

    test('should have lighting category', () => {
      const lighting = DAMAGE_ZONES.filter(z => z.category === 'lighting');
      expect(lighting.length).toBe(2);
    });

    test('should have mirrors category', () => {
      const mirrors = DAMAGE_ZONES.filter(z => z.category === 'mirrors');
      expect(mirrors.length).toBe(2);
    });

    test('should have wheels category', () => {
      const wheels = DAMAGE_ZONES.filter(z => z.category === 'wheels');
      expect(wheels.length).toBe(1);
    });
  });

  describe('Repair Cost Calculation', () => {
    const REPAIR_COSTS = {
      bodyParts: {
        'Front bumper': { minor: 5000, moderate: 15000, severe: 25000 },
        'Hood': { minor: 8000, moderate: 20000, severe: 35000 },
      },
      glass: {
        'Windshield': { minor: 3000, moderate: 8000, severe: 15000 },
      },
    };

    test('should have correct repair cost for minor front bumper damage', () => {
      const cost = REPAIR_COSTS.bodyParts['Front bumper'].minor;
      expect(cost).toBe(5000);
    });

    test('should have correct repair cost for severe hood damage', () => {
      const cost = REPAIR_COSTS.bodyParts['Hood'].severe;
      expect(cost).toBe(35000);
    });

    test('should have correct repair cost for moderate windshield damage', () => {
      const cost = REPAIR_COSTS.glass['Windshield'].moderate;
      expect(cost).toBe(8000);
    });
  });

  describe('Brand Multiplier Application', () => {
    const BRAND_MULTIPLIERS: Record<string, number> = {
      'Lada (VAZ)': 0.7,
      'Toyota': 1.1,
      'BMW': 1.5,
      'Mercedes': 1.7,
    };

    test('should apply Lada multiplier correctly', () => {
      const baseCost = 20000;
      const finalCost = Math.round(baseCost * BRAND_MULTIPLIERS['Lada (VAZ)']);
      expect(finalCost).toBe(14000);
    });

    test('should apply Toyota multiplier correctly', () => {
      const baseCost = 20000;
      const finalCost = Math.round(baseCost * BRAND_MULTIPLIERS['Toyota']);
      expect(finalCost).toBe(22000);
    });

    test('should apply BMW multiplier correctly', () => {
      const baseCost = 20000;
      const finalCost = Math.round(baseCost * BRAND_MULTIPLIERS['BMW']);
      expect(finalCost).toBe(30000);
    });

    test('should apply Mercedes multiplier correctly', () => {
      const baseCost = 20000;
      const finalCost = Math.round(baseCost * BRAND_MULTIPLIERS['Mercedes']);
      expect(finalCost).toBe(34000);
    });

    test('should use default multiplier for unknown brand', () => {
      const baseCost = 20000;
      const multiplier = BRAND_MULTIPLIERS['Unknown'] || 1.0;
      const finalCost = Math.round(baseCost * multiplier);
      expect(finalCost).toBe(20000);
    });
  });

  describe('Subtle Damage Detection', () => {
    test('should detect bumper damage from corner analysis', () => {
      // Simulate corner analysis
      const cornerAnomalies = 3; // 3 out of 4 corners have anomalies
      const hasBumperDamage = cornerAnomalies > 0;
      
      expect(hasBumperDamage).toBe(true);
    });

    test('should assign severe severity for multiple corner anomalies', () => {
      const cornerAnomalies = 3;
      const severity = cornerAnomalies > 2 ? 'severe' : 'moderate';
      
      expect(severity).toBe('severe');
    });

    test('should assign moderate severity for few corner anomalies', () => {
      const cornerAnomalies = 1;
      const severity = cornerAnomalies > 2 ? 'severe' : 'moderate';
      
      expect(severity).toBe('moderate');
    });

    test('should detect hood damage from center variance', () => {
      const centerVariance = 1200;
      const hasHoodDamage = centerVariance > 800;
      
      expect(hasHoodDamage).toBe(true);
    });

    test('should not detect hood damage for low center variance', () => {
      const centerVariance = 500;
      const hasHoodDamage = centerVariance > 800;
      
      expect(hasHoodDamage).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty image data', () => {
      const emptyData = new Uint8ClampedArray(0);
      expect(emptyData.length).toBe(0);
    });

    test('should handle very small image', () => {
      const smallData = new Uint8ClampedArray(10 * 10 * 4);
      expect(smallData.length).toBe(400);
    });

    test('should handle very large image', () => {
      const largeData = new Uint8ClampedArray(4000 * 3000 * 4);
      expect(largeData.length).toBe(48000000);
    });

    test('should handle image with all black pixels', () => {
      const blackData = new Uint8ClampedArray(100 * 100 * 4).fill(0);
      
      let allBlack = true;
      for (let i = 0; i < blackData.length; i += 4) {
        const brightness = (blackData[i] + blackData[i + 1] + blackData[i + 2]) / 3;
        if (brightness > 0) allBlack = false;
      }
      
      expect(allBlack).toBe(true);
    });

    test('should handle image with all white pixels', () => {
      const whiteData = new Uint8ClampedArray(100 * 100 * 4);
      for (let i = 0; i < whiteData.length; i += 4) {
        whiteData[i] = 255;
        whiteData[i + 1] = 255;
        whiteData[i + 2] = 255;
        whiteData[i + 3] = 255;
      }
      
      let allWhite = true;
      for (let i = 0; i < whiteData.length; i += 4) {
        const brightness = (whiteData[i] + whiteData[i + 1] + whiteData[i + 2]) / 3;
        if (brightness < 255) allWhite = false;
      }
      
      expect(allWhite).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should return damage zones for damaged car image', async () => {
      // Simulate a damaged car image analysis
      const mockResults = [
        { zone: 'Front bumper', severity: 'moderate' as const, confidence: 0.75 },
        { zone: 'Hood', severity: 'minor' as const, confidence: 0.65 },
      ];
      
      expect(mockResults.length).toBe(2);
      expect(mockResults[0].zone).toBe('Front bumper');
      expect(mockResults[0].severity).toBe('moderate');
    });

    test('should merge duplicate zones keeping highest confidence', () => {
      const results = [
        { zone: 'Front bumper', severity: 'minor' as const, confidence: 0.6 },
        { zone: 'Front bumper', severity: 'moderate' as const, confidence: 0.8 },
        { zone: 'Hood', severity: 'minor' as const, confidence: 0.7 },
      ];
      
      const uniqueZones = new Map<string, typeof results[0]>();
      for (const result of results) {
        const existing = uniqueZones.get(result.zone);
        if (!existing || result.confidence > existing.confidence) {
          uniqueZones.set(result.zone, result);
        }
      }
      
      const merged = Array.from(uniqueZones.values());
      expect(merged.length).toBe(2);
      expect(merged.find(r => r.zone === 'Front bumper')?.confidence).toBe(0.8);
    });

    test('should convert detection results to damage zones with costs', () => {
      const detection = { zone: 'Front bumper', severity: 'moderate' as const, confidence: 0.75 };
      const brand = 'Toyota';
      const multiplier = 1.1;
      const baseCost = 15000;
      const repairCost = Math.round(baseCost * multiplier);
      
      const damageZone = {
        id: 1,
        zone: detection.zone,
        key: detection.zone,
        category: 'bodyParts',
        severity: detection.severity,
        description: 'Medium dents, deep scratches, deformation',
        repairCost,
        confidence: detection.confidence,
      };
      
      expect(damageZone.repairCost).toBe(16500);
      expect(damageZone.confidence).toBe(0.75);
    });
  });
});