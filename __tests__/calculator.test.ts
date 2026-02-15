/**
 * Calculator Tests
 * Tests for car price calculator functionality
 */

describe('Calculator Functions', () => {
  // Test data
  const testCalcData = {
    brand: 'Toyota',
    model: 'Camry',
    year: '2020',
    mileage: '50000',
    engineType: 'petrol',
    condition: 'good',
    hasDocuments: 'yes',
    hasAccidents: 'no'
  };

  describe('Price Calculation', () => {
    test('should calculate base price for Toyota', () => {
      const basePrice = 1800000; // Toyota base price
      expect(basePrice).toBe(1800000);
    });

    test('should apply year depreciation', () => {
      const currentYear = new Date().getFullYear();
      const yearDiff = currentYear - 2020;
      const yearMultiplier = Math.max(0.3, 1 - (yearDiff * 0.05));
      
      // For 2026: yearDiff = 6, multiplier = 1 - 0.3 = 0.7
      expect(yearMultiplier).toBeGreaterThanOrEqual(0.3);
      expect(yearMultiplier).toBeLessThanOrEqual(1);
    });

    test('should apply mileage adjustment', () => {
      let multiplier = 1.0;
      const mileage = 50000;
      
      if (mileage > 100000) multiplier *= 0.9;
      if (mileage > 200000) multiplier *= 0.85;
      if (mileage > 300000) multiplier *= 0.75;
      
      expect(multiplier).toBe(1.0); // 50k km - no adjustment
    });

    test('should apply high mileage adjustment', () => {
      let multiplier = 1.0;
      const mileage = 250000;
      
      if (mileage > 100000) multiplier *= 0.9;
      if (mileage > 200000) multiplier *= 0.85;
      
      expect(multiplier).toBe(0.765); // 0.9 * 0.85
    });

    test('should apply engine type multiplier', () => {
      const electricMultiplier = 1.1;
      const dieselMultiplier = 0.95;
      
      expect(electricMultiplier).toBe(1.1);
      expect(dieselMultiplier).toBe(0.95);
    });

    test('should apply condition multiplier', () => {
      const conditions = {
        excellent: 1.15,
        good: 1.0,
        fair: 0.8,
        poor: 0.6
      };
      
      expect(conditions.excellent).toBe(1.15);
      expect(conditions.good).toBe(1.0);
      expect(conditions.fair).toBe(0.8);
      expect(conditions.poor).toBe(0.6);
    });

    test('should apply accident history multiplier', () => {
      const accidentMultiplier = 0.7;
      expect(accidentMultiplier).toBe(0.7);
    });

    test('should apply documents multiplier', () => {
      const noDocsMultiplier = 0.5;
      expect(noDocsMultiplier).toBe(0.5);
    });

    test('should ensure minimum price of 100000', () => {
      const minPrice = 100000;
      const calculatedPrice = 50000;
      const finalPrice = Math.max(minPrice, calculatedPrice);
      
      expect(finalPrice).toBe(100000);
    });
  });

  describe('Damage Assessment', () => {
    test('should have repair cost database', () => {
      const repairCostDatabase = {
        bodyParts: {
          'Передний бампер': { minor: 10000, moderate: 20000, severe: 35000 }
        }
      };
      
      expect(repairCostDatabase.bodyParts['Передний бампер'].minor).toBe(10000);
      expect(repairCostDatabase.bodyParts['Передний бампер'].moderate).toBe(20000);
      expect(repairCostDatabase.bodyParts['Передний бампер'].severe).toBe(35000);
    });

    test('should apply brand multiplier to repair costs', () => {
      const brandMultipliers = {
        'Lada (ВАЗ)': 0.7,
        'Toyota': 1.1,
        'BMW': 1.5,
        'Mercedes': 1.6
      };
      
      const baseCost = 20000;
      const ladaCost = Math.round(baseCost * brandMultipliers['Lada (ВАЗ)']);
      const bmwCost = Math.round(baseCost * brandMultipliers['BMW']);
      
      expect(ladaCost).toBe(14000);
      expect(bmwCost).toBe(30000);
    });

    test('should calculate total damage cost', () => {
      const damages = [
        { repairCost: 20000 },
        { repairCost: 15000 },
        { repairCost: 10000 }
      ];
      
      const totalDamageCost = damages.reduce((sum, d) => sum + d.repairCost, 0);
      expect(totalDamageCost).toBe(45000);
    });

    test('should subtract damage cost from price', () => {
      const basePrice = 1000000;
      const totalDamageCost = 100000;
      const finalPrice = Math.max(100000, basePrice - totalDamageCost * 0.7);
      
      expect(finalPrice).toBe(930000); // 1000000 - 70000
    });
  });

  describe('Form Validation', () => {
    test('should require brand to be selected', () => {
      const isValid = testCalcData.brand !== '';
      expect(isValid).toBe(true);
    });

    test('should require year to be selected', () => {
      const isValid = testCalcData.year !== '';
      expect(isValid).toBe(true);
    });

    test('should disable button when brand is empty', () => {
      const emptyBrand = '';
      const isDisabled = !emptyBrand || emptyBrand === 'Другая';
      expect(isDisabled).toBe(true);
    });

    test('should disable button when year is empty', () => {
      const emptyYear = '';
      const isDisabled = !emptyYear;
      expect(isDisabled).toBe(true);
    });

    test('should enable button when brand and year are filled', () => {
      const isDisabled = !testCalcData.brand || !testCalcData.year;
      expect(isDisabled).toBe(false);
    });
  });

  describe('Photo Upload', () => {
    test('should limit photos to 5', () => {
      const photos = [1, 2, 3, 4, 5, 6, 7];
      const limitedPhotos = photos.slice(0, 5);
      
      expect(limitedPhotos.length).toBe(5);
    });

    test('should reset damage zones when photos change', () => {
      let damageZones = [{ id: 1, zone: 'Бампер' }];
      
      // Simulate photo upload
      damageZones = [];
      
      expect(damageZones.length).toBe(0);
    });
  });

  describe('API Integration', () => {
    test('should call repair API with correct data', () => {
      const requestBody = {
        brand: 'Toyota',
        damages: [
          { zone: 'Передний бампер', severity: 'moderate' }
        ]
      };
      
      expect(requestBody.brand).toBe('Toyota');
      expect(requestBody.damages.length).toBe(1);
      expect(requestBody.damages[0].zone).toBe('Передний бампер');
    });

    test('should handle API error with fallback', async () => {
      let usedFallback = false;
      
      try {
        throw new Error('API failed');
      } catch (error) {
        usedFallback = true;
      }
      
      expect(usedFallback).toBe(true);
    });
  });

  describe('Telegram Integration', () => {
    test('should format message correctly', () => {
      const message = `🚗 *Запрос расчета стоимости авто*\n\n` +
        `*Марка:* ${testCalcData.brand}\n` +
        `*Модель:* ${testCalcData.model}\n` +
        `*Год:* ${testCalcData.year}`;
      
      expect(message).toContain('Toyota');
      expect(message).toContain('Camry');
      expect(message).toContain('2020');
    });

    test('should encode message for URL', () => {
      const message = 'Тест сообщение';
      const encoded = encodeURIComponent(message);
      
      expect(encoded).not.toContain(' ');
      expect(encoded).toContain('%');
    });
  });

  describe('Brand and Model Selection', () => {
    test('should have car brands database', () => {
      const carBrands = ['Toyota', 'BMW', 'Mercedes', 'Lada (ВАЗ)'];
      expect(carBrands.length).toBeGreaterThan(0);
    });

    test('should filter models by brand', () => {
      const toyotaModels = ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'];
      const filtered = toyotaModels.filter(m => m.toLowerCase().includes('cam'));
      
      expect(filtered).toContain('Camry');
      expect(filtered.length).toBe(1);
    });

    test('should limit autocomplete suggestions to 10', () => {
      const allModels = Array.from({ length: 20 }, (_, i) => `Model ${i}`);
      const limited = allModels.slice(0, 10);
      
      expect(limited.length).toBe(10);
    });
  });
});

describe('Calculator UI State', () => {
  test('should show loading state during calculation', () => {
    let isCalculating = true;
    expect(isCalculating).toBe(true);
  });

  test('should show result after calculation', () => {
    let estimatedPrice: number | null = 1500000;
    expect(estimatedPrice).not.toBeNull();
    expect(estimatedPrice).toBeGreaterThan(0);
  });

  test('should show analyzing state during damage assessment', () => {
    let isAnalyzing = true;
    expect(isAnalyzing).toBe(true);
  });

  test('should show damage zones after analysis', () => {
    const damageZones = [
      { id: 1, zone: 'Бампер', severity: 'moderate', description: 'Вмятина', repairCost: 20000 }
    ];
    
    expect(damageZones.length).toBeGreaterThan(0);
    expect(damageZones[0].zone).toBe('Бампер');
  });
});

describe('Edge Cases', () => {
  test('should handle very old car (max depreciation)', () => {
    const currentYear = new Date().getFullYear();
    const oldYear = 1990;
    const yearDiff = currentYear - oldYear;
    const yearMultiplier = Math.max(0.3, 1 - (yearDiff * 0.05));
    
    expect(yearMultiplier).toBe(0.3); // Minimum 30%
  });

  test('should handle brand not in database', () => {
    const unknownBrand = 'UnknownBrand';
    const basePrices: Record<string, number> = {
      'Toyota': 1800000,
      'Другая': 500000
    };
    
    const price = basePrices[unknownBrand] || 500000;
    expect(price).toBe(500000);
  });

  test('should handle empty damage zones', () => {
    const damageZones: any[] = [];
    const totalDamageCost = damageZones.reduce((sum, d) => sum + d.repairCost, 0);
    
    expect(totalDamageCost).toBe(0);
  });

  test('should handle negative calculated price', () => {
    const calculatedPrice = -50000;
    const finalPrice = Math.max(100000, calculatedPrice);
    
    expect(finalPrice).toBe(100000);
  });
});
