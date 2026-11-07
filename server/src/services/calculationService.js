/**
 * Heavy Metal Pollution Index (HPI) and Heavy Metal Evaluation Index (HEI) Calculation Engine
 *
 * METHODOLOGY REFERENCES:
 * 1. Heavy Metal Pollution Index (HPI):
 *    - Prasad, B., & Bose, J. M. (2001). "Evaluation of the heavy metal pollution index for
 *      ground water of an abandoned open cast coal mine." Environment International, 27(6), 463-467.
 *    - Mohan, S. V., Nithila, P., & Reddy, S. J. (1996). "Estimation of heavy metal in drinking water
 *      and development of heavy metal pollution index." Journal of Environmental Science & Health Part A.
 *
 *    Equation:
 *    HPI = Σ(Wi * Qi) / ΣWi
 *    Where:
 *      - Wi = Unit weight for metal i = k / Si, with constant of proportionality k = 1 / Σ(1 / Si)
 *             (Unit weight is inversely proportional to the recommended standard limit Si)
 *      - Qi = Sub-index for metal i = (|Mi - Ii| / (Si - Ii)) * 100
 *             Where Mi is the measured concentration (mg/L),
 *             Ii is the ideal value (0.0 mg/L for toxic heavy metals as per WHO / BIS),
 *             Si is the standard permissible limit (mg/L).
 *             Thus: Qi = (Mi / Si) * 100
 *
 *    HPI Classification (Prasad & Bose 2001, Bhutiani et al. 2016):
 *      - HPI < 50: Low pollution (Good water quality)
 *      - 50 <= HPI <= 100: Medium / Threshold pollution (Moderate water quality)
 *      - HPI > 100: High pollution (Critical threshold exceeded, water unsuitable without treatment)
 *
 * 2. Heavy Metal Evaluation Index (HEI):
 *    - Edet, A. E., & Offiong, O. E. (2002). "Evaluation of water quality index of drinking water
 *      in Calabar Municipality, Nigeria." Environmental Geology, 42(5), 452-460.
 *
 *    Equation:
 *    HEI = Σ(Ci / MACi)
 *    Where:
 *      - Ci = Measured concentration of heavy metal i (mg/L)
 *      - MACi = Maximum Allowable Concentration (standard permissible limit Si) (mg/L)
 *
 *    HEI Classification (Edet & Offiong 2002):
 *      - HEI < 10: Low heavy metal pollution
 *      - 10 <= HEI <= 20: Medium heavy metal pollution
 *      - HEI > 20: High heavy metal pollution
 */

const UNIT_CONVERSION_FACTORS = {
  'mg/L': 1.0,
  'µg/L': 0.001,
  'ug/L': 0.001,
  'ppm': 1.0,
  'ppb': 0.001,
};

/**
 * Normalize concentration from any supported unit to standard mg/L
 * @param {number} value - Measured numerical concentration
 * @param {string} unit - Measurement unit ('mg/L', 'µg/L', 'ppm', 'ppb')
 * @returns {number} Normalized value in mg/L
 */
function normalizeToMgL(value, unit) {
  if (value === null || value === undefined || isNaN(value)) {
    throw new Error('Concentration value must be a valid number');
  }
  if (value < 0) {
    throw new Error('Concentration value cannot be negative');
  }

  const factor = UNIT_CONVERSION_FACTORS[unit];
  if (!factor) {
    throw new Error(`Unsupported unit: ${unit}. Supported units are: mg/L, µg/L, ppm, ppb`);
  }

  return Number((value * factor).toFixed(8));
}

/**
 * Standard metals metadata and chemical symbols
 */
const SUPPORTED_METALS = {
  PB: { name: 'Lead', symbol: 'Pb', atomicWeight: 207.2 },
  CD: { name: 'Cadmium', symbol: 'Cd', atomicWeight: 112.41 },
  CR: { name: 'Chromium', symbol: 'Cr', atomicWeight: 51.996 },
  CU: { name: 'Copper', symbol: 'Cu', atomicWeight: 63.546 },
  ZN: { name: 'Zinc', symbol: 'Zn', atomicWeight: 65.38 },
  NI: { name: 'Nickel', symbol: 'Ni', atomicWeight: 58.693 },
  FE: { name: 'Iron', symbol: 'Fe', atomicWeight: 55.845 },
  AS: { name: 'Arsenic', symbol: 'As', atomicWeight: 74.922 },
  HG: { name: 'Mercury', symbol: 'Hg', atomicWeight: 200.59 },
};

/**
 * Calculate HPI (Heavy Metal Pollution Index)
 * @param {Array<{ metalSymbol: string, normalizedValueMgL: number }>} measurements
 * @param {Array<{ metalSymbol: string, limitValue: number, authority?: string }>} standards
 * @returns {Object} HPI calculation result and full intermediate steps
 */
function calculateHPI(measurements, standards) {
  if (!Array.isArray(measurements) || measurements.length === 0) {
    throw new Error('Measurements array is required and must not be empty');
  }
  if (!Array.isArray(standards) || standards.length === 0) {
    throw new Error('Standards array is required and must not be empty');
  }

  // Create standard lookup map by uppercase symbol
  const standardMap = new Map();
  standards.forEach((std) => {
    if (std.metalSymbol && std.limitValue > 0) {
      standardMap.set(std.metalSymbol.toUpperCase(), std);
    }
  });

  const matchedPairs = [];
  const missingStandards = [];

  for (const m of measurements) {
    const symbol = m.metalSymbol.toUpperCase();
    const std = standardMap.get(symbol);
    if (!std) {
      missingStandards.push(symbol);
      continue;
    }
    matchedPairs.push({
      symbol,
      metalName: std.metalName || SUPPORTED_METALS[symbol]?.name || symbol,
      measuredMgL: m.normalizedValueMgL,
      standardLimitMgL: std.limitValue,
      authority: std.authority || 'Standard',
      documentVersion: std.version || '1.0',
    });
  }

  if (matchedPairs.length === 0) {
    throw new Error(
      `None of the provided measurements (${measurements.map(m => m.metalSymbol).join(', ')}) matched active reference standards.`
    );
  }

  // Step 1: Calculate proportionality constant k = 1 / Σ(1 / Si)
  // Wi = k / Si ensures ΣWi = 1
  let sumInverseSi = 0;
  for (const item of matchedPairs) {
    sumInverseSi += 1 / item.standardLimitMgL;
  }
  const k = 1 / sumInverseSi;

  let sumWiQi = 0;
  let sumWi = 0;
  const intermediateDetails = [];

  for (const item of matchedPairs) {
    const Si = item.standardLimitMgL;
    const Mi = item.measuredMgL;
    const Ii = 0.0; // Ideal value for heavy metals

    const Wi = k / Si; // Unit weight
    const Qi = ((Mi - Ii) / (Si - Ii)) * 100; // Sub-index rating
    const WiQi = Wi * Qi;

    sumWi += Wi;
    sumWiQi += WiQi;

    intermediateDetails.push({
      metalSymbol: item.symbol,
      metalName: item.metalName,
      measuredMgL: Mi,
      standardLimitMgL: Si,
      unitWeightWi: Number(Wi.toFixed(6)),
      subIndexQi: Number(Qi.toFixed(4)),
      productWiQi: Number(WiQi.toFixed(4)),
      exceedsLimit: Mi > Si,
      ratioToLimit: Number((Mi / Si).toFixed(3)),
    });
  }

  const hpiValue = sumWi > 0 ? Number((sumWiQi / sumWi).toFixed(3)) : 0;

  // Prasad & Bose (2001) classification:
  let category = 'Low Pollution';
  let reviewState = 'Within selected threshold';
  if (hpiValue > 100) {
    category = 'High Pollution';
    reviewState = 'Exceeds selected threshold';
  } else if (hpiValue >= 50) {
    category = 'Medium / Threshold Pollution';
    reviewState = 'Requires review';
  }

  return {
    hpiValue,
    category,
    reviewState,
    kProportionality: Number(k.toFixed(6)),
    sumWi: Number(sumWi.toFixed(6)),
    sumWiQi: Number(sumWiQi.toFixed(4)),
    metalsIncludedCount: matchedPairs.length,
    missingStandards,
    details: intermediateDetails,
    methodology: 'HPI: Prasad & Bose (2001) / Mohan et al. (1996)',
    thresholds: {
      low: '< 50',
      medium: '50 - 100',
      critical: '> 100',
    },
  };
}

/**
 * Calculate HEI (Heavy Metal Evaluation Index)
 * @param {Array<{ metalSymbol: string, normalizedValueMgL: number }>} measurements
 * @param {Array<{ metalSymbol: string, limitValue: number, authority?: string }>} standards
 * @returns {Object} HEI calculation result and per-metal contribution
 */
function calculateHEI(measurements, standards) {
  if (!Array.isArray(measurements) || measurements.length === 0) {
    throw new Error('Measurements array is required and must not be empty');
  }
  if (!Array.isArray(standards) || standards.length === 0) {
    throw new Error('Standards array is required and must not be empty');
  }

  const standardMap = new Map();
  standards.forEach((std) => {
    if (std.metalSymbol && std.limitValue > 0) {
      standardMap.set(std.metalSymbol.toUpperCase(), std);
    }
  });

  const matchedPairs = [];
  const missingStandards = [];

  for (const m of measurements) {
    const symbol = m.metalSymbol.toUpperCase();
    const std = standardMap.get(symbol);
    if (!std) {
      missingStandards.push(symbol);
      continue;
    }
    matchedPairs.push({
      symbol,
      metalName: std.metalName || SUPPORTED_METALS[symbol]?.name || symbol,
      measuredMgL: m.normalizedValueMgL,
      macMgL: std.limitValue,
      authority: std.authority || 'Standard',
      documentVersion: std.version || '1.0',
    });
  }

  if (matchedPairs.length === 0) {
    throw new Error('No measurements matched active reference standards for HEI calculation.');
  }

  let totalHEI = 0;
  const ratioDetails = [];

  for (const item of matchedPairs) {
    const ratio = item.measuredMgL / item.macMgL;
    totalHEI += ratio;
    ratioDetails.push({
      metalSymbol: item.symbol,
      metalName: item.metalName,
      measuredMgL: item.measuredMgL,
      macMgL: item.macMgL,
      ratioCiOverMACi: Number(ratio.toFixed(4)),
      exceedsLimit: item.measuredMgL > item.macMgL,
    });
  }

  const heiValue = Number(totalHEI.toFixed(3));

  // Compute percentage contribution of each metal
  const contributions = ratioDetails.map((r) => ({
    ...r,
    percentageOfHEI: heiValue > 0 ? Number(((r.ratioCiOverMACi / heiValue) * 100).toFixed(2)) : 0,
  }));

  // Edet & Offiong (2002) classification:
  let category = 'Low Heavy Metal Pollution';
  let reviewState = 'Within selected threshold';
  if (heiValue > 20) {
    category = 'High Heavy Metal Pollution';
    reviewState = 'Exceeds selected threshold';
  } else if (heiValue >= 10) {
    category = 'Medium Heavy Metal Pollution';
    reviewState = 'Requires review';
  }

  return {
    heiValue,
    category,
    reviewState,
    metalsIncludedCount: matchedPairs.length,
    missingStandards,
    contributions,
    methodology: 'HEI: Edet & Offiong (2002)',
    thresholds: {
      low: '< 10',
      medium: '10 - 20',
      high: '> 20',
    },
  };
}

/**
 * Comprehensive Combined Assessment for Water Quality Sample
 */
function performFullAssessment(measurements, standards) {
  const hpiResult = calculateHPI(measurements, standards);
  const heiResult = calculateHEI(measurements, standards);

  // Overall combined review determination:
  // Neutral regulatory / screening classification
  let overallReview = 'Within selected threshold';
  if (hpiResult.hpiValue > 100 || heiResult.heiValue > 20) {
    overallReview = 'Exceeds selected threshold';
  } else if (hpiResult.hpiValue >= 50 || heiResult.heiValue >= 10) {
    overallReview = 'Requires review';
  }

  // Standard references snapshot
  const standardSnapshots = standards.map((s) => ({
    metalSymbol: s.metalSymbol,
    metalName: s.metalName,
    limitValue: s.limitValue,
    unit: s.unit || 'mg/L',
    authority: s.authority,
    version: s.version,
  }));

  return {
    hpi: hpiResult,
    hei: heiResult,
    overallReview,
    thresholdExplanation:
      'HPI thresholds: Low (<50), Medium (50-100), Critical (>100) per Prasad & Bose (2001). HEI thresholds: Low (<10), Medium (10-20), High (>20) per Edet & Offiong (2002). Screening assessment only.',
    standardSnapshots,
    methodologyVersion: 'HPI: Prasad & Bose (2001) / HEI: Edet & Offiong (2002) v1.0',
  };
}

module.exports = {
  UNIT_CONVERSION_FACTORS,
  SUPPORTED_METALS,
  normalizeToMgL,
  calculateHPI,
  calculateHEI,
  performFullAssessment,
};
