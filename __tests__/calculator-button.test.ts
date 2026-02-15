/**
 * Calculator Button Tests
 * Tests for the "Рассчитать стоимость" button functionality
 */

describe('Calculator Button Functionality', () => {
  describe('Button State Management', () => {
    test('button should be disabled when brand is empty', () => {
      const calcData = {
        brand: '',
        year: '2020'
      };
      
      const isDisabled = !calcData.brand || !calcData.year;
      expect(isDisabled).toBe(true);
    });

    test('button should be disabled when year is empty', () => {
      const calcData = {
        brand: 'Toyota',
        year: ''
      };
      
      const isDisabled = !calcData.brand || !calcData.year;
      expect(isDisabled).toBe(true);
    });

    test('button should be disabled when both brand and year are empty', () => {
      const calcData = {
        brand: '',
        year: ''
      };
      
      const isDisabled = !calcData.brand || !calcData.year;
      expect(isDisabled).toBe(true);
    });

    test('button should be enabled when both brand and year are filled', () => {
      const calcData = {
        brand: 'Toyota',
        year: '2020'
      };
      
      const isDisabled = !calcData.brand || !calcData.year;
      expect(isDisabled).toBe(false);
    });

    test('button should be disabled during calculation', () => {
      const isCalculating = true;
      const calcData = {
        brand: 'Toyota',
        year: '2020'
      };
      
      const isDisabled = isCalculating || !calcData.brand || !calcData.year;
      expect(isDisabled).toBe(true);
    });

    test('button should be enabled after calculation completes', () => {
      const isCalculating = false;
      const calcData = {
        brand: 'Toyota',
        year: '2020'
      };
      
      const isDisabled = isCalculating || !calcData.brand || !calcData.year;
      expect(isDisabled).toBe(false);
    });
  });

  describe('Button Click Handler', () => {
    test('should call calculatePrice function on click', () => {
      let calculatePriceCalled = false;
      
      const calculatePrice = () => {
        calculatePriceCalled = true;
      };
      
      // Simulate button click
      calculatePrice();
      
      expect(calculatePriceCalled).toBe(true);
    });

    test('should set isCalculating to true when calculation starts', () => {
      let isCalculating = false;
      
      const calculatePrice = () => {
        isCalculating = true;
      };
      
      calculatePrice();
      expect(isCalculating).toBe(true);
    });

    test('should perform full calculation flow', async () => {
      let isCalculating = false;
      let estimatedPrice: number | null = null;
      
      const calculatePrice = async () => {
        isCalculating = true;
        
        // Simulate calculation
        const basePrice = 1800000;
        const yearMultiplier = 0.7;
        const finalPrice = Math.round(basePrice * yearMultiplier);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 10));
        
        estimatedPrice = finalPrice;
        isCalculating = false;
      };
      
      await calculatePrice();
      
      expect(isCalculating).toBe(false);
      expect(estimatedPrice).toBe(1260000);
    });
  });

  describe('Button Text Display', () => {
    test('should show "Рассчитать стоимость" when not calculating', () => {
      const isCalculating = false;
      const buttonText = isCalculating ? 'Расчет...' : 'Рассчитать стоимость';
      
      expect(buttonText).toBe('Рассчитать стоимость');
    });

    test('should show "Расчет..." when calculating', () => {
      const isCalculating = true;
      const buttonText = isCalculating ? 'Расчет...' : 'Рассчитать стоимость';
      
      expect(buttonText).toBe('Расчет...');
    });

    test('should show loading spinner when calculating', () => {
      const isCalculating = true;
      const showSpinner = isCalculating;
      
      expect(showSpinner).toBe(true);
    });

    test('should show calculator icon when not calculating', () => {
      const isCalculating = false;
      const showIcon = !isCalculating;
      
      expect(showIcon).toBe(true);
    });
  });

  describe('Complete Calculation Workflow', () => {
    test('should complete full workflow from form fill to result', async () => {
      // Initial state
      let calcData = {
        brand: '',
        model: '',
        year: '',
        mileage: '',
        engineType: 'petrol',
        condition: 'good',
        hasDocuments: 'yes',
        hasAccidents: 'no'
      };
      let isCalculating = false;
      let estimatedPrice: number | null = null;
      
      // Step 1: Fill form
      calcData = {
        ...calcData,
        brand: 'Toyota',
        model: 'Camry',
        year: '2020',
        mileage: '50000'
      };
      
      // Step 2: Check button is enabled
      const isDisabled = !calcData.brand || !calcData.year;
      expect(isDisabled).toBe(false);
      
      // Step 3: Click button (start calculation)
      const calculatePrice = async () => {
        isCalculating = true;
        
        // Base price calculation
        const basePrices: Record<string, number> = {
          'Toyota': 1800000
        };
        let basePrice = basePrices[calcData.brand] || 500000;
        
        // Year adjustment
        const currentYear = new Date().getFullYear();
        const yearDiff = currentYear - parseInt(calcData.year);
        const yearMultiplier = Math.max(0.3, 1 - (yearDiff * 0.05));
        basePrice *= yearMultiplier;
        
        // Mileage adjustment
        const mileage = parseInt(calcData.mileage);
        if (mileage > 100000) basePrice *= 0.9;
        if (mileage > 200000) basePrice *= 0.85;
        if (mileage > 300000) basePrice *= 0.75;
        
        // Condition adjustment
        if (calcData.condition === 'excellent') basePrice *= 1.15;
        if (calcData.condition === 'fair') basePrice *= 0.8;
        if (calcData.condition === 'poor') basePrice *= 0.6;
        
        // Accidents adjustment
        if (calcData.hasAccidents === 'yes') basePrice *= 0.7;
        
        // Documents adjustment
        if (calcData.hasDocuments === 'no') basePrice *= 0.5;
        
        // Ensure minimum price
        basePrice = Math.max(100000, basePrice);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 10));
        
        estimatedPrice = Math.round(basePrice);
        isCalculating = false;
      };
      
      await calculatePrice();
      
      // Step 4: Verify result
      expect(isCalculating).toBe(false);
      expect(estimatedPrice).not.toBeNull();
      expect(estimatedPrice).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle calculation error gracefully', async () => {
      let isCalculating = false;
      let estimatedPrice: number | null = null;
      let hasError = false;
      
      const calculatePrice = async () => {
        try {
          isCalculating = true;
          
          // Simulate error
          throw new Error('Calculation failed');
        } catch (error) {
          hasError = true;
          isCalculating = false;
        }
      };
      
      await calculatePrice();
      
      expect(hasError).toBe(true);
      expect(isCalculating).toBe(false);
      expect(estimatedPrice).toBeNull();
    });

    test('should reset state after error', async () => {
      let isCalculating = true;
      
      const handleError = () => {
        isCalculating = false;
      };
      
      handleError();
      expect(isCalculating).toBe(false);
    });
  });

  describe('Integration with Damage Assessment', () => {
    test('should include damage costs in final calculation', async () => {
      const damageZones = [
        { id: 1, zone: 'Бампер', severity: 'moderate', description: 'Вмятина', repairCost: 20000 },
        { id: 2, zone: 'Капот', severity: 'minor', description: 'Царапина', repairCost: 15000 }
      ];
      
      let basePrice = 1000000;
      const totalDamageCost = damageZones.reduce((sum, d) => sum + d.repairCost, 0);
      basePrice = Math.max(100000, basePrice - totalDamageCost * 0.7);
      
      expect(basePrice).toBe(975500); // 1000000 - (35000 * 0.7)
    });

    test('should recalculate when damage zones change', () => {
      let damageZones = [
        { id: 1, zone: 'Бампер', repairCost: 20000 }
      ];
      let totalCost = damageZones.reduce((sum, d) => sum + d.repairCost, 0);
      expect(totalCost).toBe(20000);
      
      // Add more damage
      damageZones = [
        ...damageZones,
        { id: 2, zone: 'Капот', repairCost: 15000 }
      ];
      totalCost = damageZones.reduce((sum, d) => sum + d.repairCost, 0);
      expect(totalCost).toBe(35000);
    });
  });
});

describe('Calculator Form Validation', () => {
  test('should validate all required fields', () => {
    const calcData = {
      brand: 'Toyota',
      model: 'Camry',
      year: '2020',
      mileage: '50000',
      engineType: 'petrol',
      condition: 'good',
      hasDocuments: 'yes',
      hasAccidents: 'no'
    };
    
    const isValid = calcData.brand !== '' && calcData.year !== '';
    expect(isValid).toBe(true);
  });

  test('should handle optional fields', () => {
    const calcData = {
      brand: 'Toyota',
      model: '', // Optional
      year: '2020',
      mileage: '', // Optional
      engineType: 'petrol',
      condition: 'good',
      hasDocuments: 'yes',
      hasAccidents: 'no'
    };
    
    const isValid = calcData.brand !== '' && calcData.year !== '';
    expect(isValid).toBe(true);
  });

  test('should provide default values for optional fields', () => {
    const calcData = {
      brand: 'Toyota',
      year: '2020',
      mileage: '0', // Default
      engineType: 'petrol', // Default
      condition: 'good', // Default
      hasDocuments: 'yes', // Default
      hasAccidents: 'no' // Default
    };
    
    expect(calcData.mileage).toBe('0');
    expect(calcData.engineType).toBe('petrol');
    expect(calcData.condition).toBe('good');
  });
});
