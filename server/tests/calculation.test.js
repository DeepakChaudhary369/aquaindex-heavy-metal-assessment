const {
  normalizeToMgL,
  calculateHPI,
  calculateHEI,
  performFullAssessment,
} = require('../src/services/calculationService');

describe('Heavy Metal Pollution Calculation Engine', () => {
  describe('Unit Conversions and Validation', () => {
    test('correctly normalizes standard units to mg/L', () => {
      expect(normalizeToMgL(1.5, 'mg/L')).toBe(1.5);
      expect(normalizeToMgL(10, 'µg/L')).toBe(0.01);
      expect(normalizeToMgL(50, 'ug/L')).toBe(0.05);
      expect(normalizeToMgL(2.5, 'ppm')).toBe(2.5);
      expect(normalizeToMgL(5, 'ppb')).toBe(0.005);
    });

    test('rejects negative concentration values', () => {
      expect(() => normalizeToMgL(-0.5, 'mg/L')).toThrow('Concentration value cannot be negative');
    });

    test('rejects non-numeric values and null/undefined', () => {
      expect(() => normalizeToMgL(NaN, 'mg/L')).toThrow('Concentration value must be a valid number');
      expect(() => normalizeToMgL(null, 'mg/L')).toThrow('Concentration value must be a valid number');
      expect(() => normalizeToMgL('invalid', 'mg/L')).toThrow('Concentration value must be a valid number');
    });

    test('rejects unsupported units', () => {
      expect(() => normalizeToMgL(10, 'grains/gal')).toThrow('Unsupported unit');
    });
  });

  describe('HPI Calculation Engine (Prasad & Bose 2001 formulation)', () => {
    test('calculates exact verified manual HPI test case', () => {
      // 2 metals with known values:
      // Metal Pb: Measured = 0.005 mg/L, Standard = 0.01 mg/L -> Q = 50
      // Metal Cr: Measured = 0.025 mg/L, Standard = 0.05 mg/L -> Q = 50
      // Weight Pb: 100/120 = 0.833333
      // Weight Cr: 20/120 = 0.166667
      // HPI should be exactly 50
      const measurements = [
        { metalSymbol: 'Pb', normalizedValueMgL: 0.005 },
        { metalSymbol: 'Cr', normalizedValueMgL: 0.025 },
      ];

      const standards = [
        { metalSymbol: 'Pb', metalName: 'Lead', limitValue: 0.01, authority: 'WHO', version: '4th Ed' },
        { metalSymbol: 'Cr', metalName: 'Chromium', limitValue: 0.05, authority: 'WHO', version: '4th Ed' },
      ];

      const result = calculateHPI(measurements, standards);
      expect(result.hpiValue).toBe(50);
      expect(result.category).toBe('Medium / Threshold Pollution');
      expect(result.reviewState).toBe('Requires review');
      expect(result.details).toHaveLength(2);
      expect(result.details[0].subIndexQi).toBe(50);
      expect(result.details[1].subIndexQi).toBe(50);
    });

    test('correctly flags High Pollution when concentrations exceed critical limits', () => {
      const measurements = [
        { metalSymbol: 'Pb', normalizedValueMgL: 0.03 }, // 3x standard limit
        { metalSymbol: 'Cd', normalizedValueMgL: 0.01 }, // >3x standard limit
      ];

      const standards = [
        { metalSymbol: 'Pb', metalName: 'Lead', limitValue: 0.01, authority: 'WHO' },
        { metalSymbol: 'Cd', metalName: 'Cadmium', limitValue: 0.003, authority: 'WHO' },
      ];

      const result = calculateHPI(measurements, standards);
      expect(result.hpiValue).toBeGreaterThan(100);
      expect(result.category).toBe('High Pollution');
      expect(result.reviewState).toBe('Exceeds selected threshold');
      expect(result.details[0].exceedsLimit).toBe(true);
    });

    test('correctly handles missing reference standards gracefully', () => {
      const measurements = [
        { metalSymbol: 'Pb', normalizedValueMgL: 0.005 },
        { metalSymbol: 'XxUnknown', normalizedValueMgL: 0.1 },
      ];

      const standards = [
        { metalSymbol: 'Pb', metalName: 'Lead', limitValue: 0.01, authority: 'WHO' },
      ];

      const result = calculateHPI(measurements, standards);
      expect(result.missingStandards).toContain('XXUNKNOWN');
      expect(result.metalsIncludedCount).toBe(1);
    });

    test('throws error if no measurements match reference standards', () => {
      const measurements = [{ metalSymbol: 'XxUnknown', normalizedValueMgL: 0.1 }];
      const standards = [{ metalSymbol: 'Pb', limitValue: 0.01 }];

      expect(() => calculateHPI(measurements, standards)).toThrow('None of the provided measurements');
    });
  });

  describe('HEI Calculation Engine (Edet & Offiong 2002 formulation)', () => {
    test('calculates exact verified manual HEI test case', () => {
      // HEI = Σ(Ci / MACi)
      // Pb: 0.005 / 0.01 = 0.5 (50%)
      // Cr: 0.025 / 0.05 = 0.5 (50%)
      // Total HEI = 1.0 (Low pollution < 10)
      const measurements = [
        { metalSymbol: 'Pb', normalizedValueMgL: 0.005 },
        { metalSymbol: 'Cr', normalizedValueMgL: 0.025 },
      ];

      const standards = [
        { metalSymbol: 'Pb', metalName: 'Lead', limitValue: 0.01, authority: 'WHO' },
        { metalSymbol: 'Cr', metalName: 'Chromium', limitValue: 0.05, authority: 'WHO' },
      ];

      const result = calculateHEI(measurements, standards);
      expect(result.heiValue).toBe(1.0);
      expect(result.category).toBe('Low Heavy Metal Pollution');
      expect(result.reviewState).toBe('Within selected threshold');
      expect(result.contributions[0].percentageOfHEI).toBe(50);
      expect(result.contributions[1].percentageOfHEI).toBe(50);
    });

    test('classifies High Heavy Metal Pollution when HEI > 20', () => {
      const measurements = [
        { metalSymbol: 'Pb', normalizedValueMgL: 0.25 }, // 25x standard
      ];
      const standards = [
        { metalSymbol: 'Pb', metalName: 'Lead', limitValue: 0.01, authority: 'WHO' },
      ];

      const result = calculateHEI(measurements, standards);
      expect(result.heiValue).toBe(25);
      expect(result.category).toBe('High Heavy Metal Pollution');
      expect(result.reviewState).toBe('Exceeds selected threshold');
    });
  });

  describe('performFullAssessment', () => {
    test('produces comprehensive combined assessment and standard snapshot', () => {
      const measurements = [
        { metalSymbol: 'Pb', normalizedValueMgL: 0.002 },
        { metalSymbol: 'Cd', normalizedValueMgL: 0.0005 },
        { metalSymbol: 'Cu', normalizedValueMgL: 0.05 },
      ];

      const standards = [
        { metalSymbol: 'Pb', metalName: 'Lead', limitValue: 0.01, unit: 'mg/L', authority: 'WHO', version: '4.0' },
        { metalSymbol: 'Cd', metalName: 'Cadmium', limitValue: 0.003, unit: 'mg/L', authority: 'WHO', version: '4.0' },
        { metalSymbol: 'Cu', metalName: 'Copper', limitValue: 2.0, unit: 'mg/L', authority: 'WHO', version: '4.0' },
      ];

      const assessment = performFullAssessment(measurements, standards);
      expect(assessment.hpi).toBeDefined();
      expect(assessment.hei).toBeDefined();
      expect(assessment.overallReview).toBe('Within selected threshold');
      expect(assessment.standardSnapshots).toHaveLength(3);
      expect(assessment.standardSnapshots[0].version).toBe('4.0');
    });
  });
});
