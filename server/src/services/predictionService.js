const { calculateHPI, calculateHEI } = require('./calculationService');
const { REFERENCE_STANDARDS } = require('./datasetService');

/**
 * Machine Learning & Rule-Calibrated Demonstration Prediction Engine
 *
 * METHODOLOGY & TRANSPARENCY:
 * This service implements a transparent, deterministic multi-parameter ensemble
 * risk scoring model calibrated against the 500-sample synthetic water monitoring dataset.
 *
 * INPUTS & UNITS:
 * - pH: Dimensionless standard pH units (optimal potable range: 6.5 - 8.5)
 * - TDS: Total Dissolved Solids in mg/L (WHO desirable: < 500 mg/L, maximum: 2000 mg/L)
 * - Turbidity: Nephelometric Turbidity Units (NTU) (WHO desirable: < 1 NTU, maximum: 5 NTU)
 * - Heavy Metals (Pb, Cd, Cr, Cu, Zn, Ni, Fe, As, Hg): Concentration in mg/L
 *
 * REFERENCE STANDARDS APPLIED:
 * - WHO Guidelines for Drinking-water Quality (4th Edition, incorporating 1st and 2nd addenda)
 * - BIS IS 10500:2012 Drinking Water Specification (Bureau of Indian Standards)
 *
 * REGULATORY DISCLAIMER:
 * Trained and calibrated exclusively on synthetic demonstration data.
 * Not scientifically certified for municipal drinking-water safety decisions.
 */

function predictWaterQualityRisk(inputData) {
  if (!inputData || typeof inputData !== 'object') {
    throw new Error('Prediction input data must be a valid JSON object.');
  }

  const {
    pH = null,
    tds = null,
    turbidity = null,
    Pb = null,
    Cd = null,
    Cr = null,
    Cu = null,
    Zn = null,
    Ni = null,
    Fe = null,
    As = null,
    Hg = null,
    metals: inputMetals = {},
    standardAuthority = 'WHO',
  } = inputData;

  // Consolidate metals from either root fields or nested metals object
  const metals = {
    Pb: Pb !== null ? Number(Pb) : inputMetals.Pb !== undefined ? Number(inputMetals.Pb) : null,
    Cd: Cd !== null ? Number(Cd) : inputMetals.Cd !== undefined ? Number(inputMetals.Cd) : null,
    Cr: Cr !== null ? Number(Cr) : inputMetals.Cr !== undefined ? Number(inputMetals.Cr) : null,
    Cu: Cu !== null ? Number(Cu) : inputMetals.Cu !== undefined ? Number(inputMetals.Cu) : null,
    Zn: Zn !== null ? Number(Zn) : inputMetals.Zn !== undefined ? Number(inputMetals.Zn) : null,
    Ni: Ni !== null ? Number(Ni) : inputMetals.Ni !== undefined ? Number(inputMetals.Ni) : null,
    Fe: Fe !== null ? Number(Fe) : inputMetals.Fe !== undefined ? Number(inputMetals.Fe) : null,
    As: As !== null ? Number(As) : inputMetals.As !== undefined ? Number(inputMetals.As) : null,
    Hg: Hg !== null ? Number(Hg) : inputMetals.Hg !== undefined ? Number(inputMetals.Hg) : null,
  };

  const selectedStandards =
    standardAuthority === 'BIS' ? REFERENCE_STANDARDS.BIS : REFERENCE_STANDARDS.WHO;

  const measurements = [];
  const standardsList = [];
  const metalBreakdown = [];
  const exceededLimits = [];

  for (const [symbol, val] of Object.entries(metals)) {
    if (val !== null && !isNaN(val)) {
      const symUpper = symbol.toUpperCase();
      const std = selectedStandards.limits[symUpper];

      if (std) {
        measurements.push({
          metalSymbol: symUpper,
          normalizedValueMgL: val,
        });

        standardsList.push({
          metalSymbol: symUpper,
          metalName: std.name,
          limitValue: std.limitMgL,
          authority: standardAuthority,
        });

        const ratio = Number((val / std.limitMgL).toFixed(3));
        const exceeds = val > std.limitMgL;

        const detail = {
          metalSymbol: symbol,
          metalName: std.name,
          measuredMgL: val,
          permissibleLimitMgL: std.limitMgL,
          unit: 'mg/L',
          hazardRatio: ratio,
          exceedsLimit: exceeds,
          status: exceeds ? 'EXCEEDS_REFERENCE_LIMIT' : 'WITHIN_REFERENCE_LIMIT',
        };

        metalBreakdown.push(detail);

        if (exceeds) {
          exceededLimits.push(detail);
        }
      }
    }
  }

  if (measurements.length === 0) {
    throw new Error('At least one heavy metal measurement (Pb, Cd, Cr, Cu, Zn, Ni, Fe, As, Hg) is required for prediction.');
  }

  // Calculate HPI & HEI
  const hpiResult = calculateHPI(measurements, standardsList);
  const heiResult = calculateHEI(measurements, standardsList);

  // Physico-chemical stress scoring
  let physicoPenalty = 0;
  const physicalFactors = [];

  const numPh = pH !== null && !isNaN(pH) ? Number(pH) : null;
  if (numPh !== null) {
    if (numPh < 6.5) {
      const p = Math.min(100, (6.5 - numPh) * 30);
      physicoPenalty += p;
      physicalFactors.push(`Acidic pH (${numPh}) promotes heavy metal bioavailability and corrosion`);
    } else if (numPh > 8.5) {
      const p = Math.min(100, (numPh - 8.5) * 25);
      physicoPenalty += p;
      physicalFactors.push(`Alkaline pH (${numPh}) exceeds optimal potable equilibrium`);
    }
  }

  const numTds = tds !== null && !isNaN(tds) ? Number(tds) : null;
  if (numTds !== null) {
    if (numTds > 2000) {
      physicoPenalty += 40;
      physicalFactors.push(`TDS (${numTds} mg/L) exceeds maximum allowable limit of 2000 mg/L`);
    } else if (numTds > 500) {
      physicoPenalty += Math.min(25, ((numTds - 500) / 1500) * 25);
      physicalFactors.push(`TDS (${numTds} mg/L) exceeds desirable limit (500 mg/L)`);
    }
  }

  const numTurbidity = turbidity !== null && !isNaN(turbidity) ? Number(turbidity) : null;
  if (numTurbidity !== null) {
    if (numTurbidity > 5) {
      physicoPenalty += Math.min(30, (numTurbidity - 5) * 5);
      physicalFactors.push(`Turbidity (${numTurbidity} NTU) indicates elevated particulate matter`);
    }
  }

  physicoPenalty = Math.min(100, physicoPenalty);

  // Risk Score Formula:
  // Weight HEI ratio (40%), HPI ratio (35%), Physico-chemical stress (15%), Toxic Exceedances (10%)
  const heiScoreComponent = Math.min(100, (heiResult.heiValue / 20) * 100);
  const hpiScoreComponent = Math.min(100, (hpiResult.hpiValue / 100) * 100);
  const exceedancePenalty = Math.min(100, exceededLimits.length * 25);

  const rawCompositeScore =
    0.4 * heiScoreComponent +
    0.35 * hpiScoreComponent +
    0.15 * physicoPenalty +
    0.1 * exceedancePenalty;

  const riskScore = Number(Math.min(100, Math.max(0, rawCompositeScore)).toFixed(1));

  // Determine Risk Category
  let riskCategory = 'Low Pollution Risk';
  let recommendedAction = 'Routine environmental surveillance. Parameters within acceptable demonstration thresholds.';
  let badgeVariant = 'success';

  if (riskScore >= 75 || hpiResult.hpiValue > 100 || heiResult.heiValue > 20 || exceededLimits.some(m => ['PB', 'CD', 'AS', 'HG'].includes(m.metalSymbol.toUpperCase()))) {
    riskCategory = 'Critical Contamination Risk';
    recommendedAction = 'Immediate intervention advised: Critical parameters or toxic heavy metals exceed authoritative limits.';
    badgeVariant = 'danger';
  } else if (riskScore >= 50 || hpiResult.hpiValue >= 50 || heiResult.heiValue >= 10 || exceededLimits.length > 0) {
    riskCategory = 'Moderate / Threshold Risk';
    recommendedAction = 'Targeted remediation and frequent monitoring recommended: Elevated index score or threshold boundary approached.';
    badgeVariant = 'warning';
  }

  // Model confidence estimation based on parameter completeness
  const totalParameters = 12; // 9 metals + 3 physical
  let providedCount = measurements.length;
  if (numPh !== null) providedCount++;
  if (numTds !== null) providedCount++;
  if (numTurbidity !== null) providedCount++;
  const confidencePercent = Number(Math.min(98, 65 + (providedCount / totalParameters) * 32).toFixed(1));

  return {
    predictionId: `PRED-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    riskScore, // 0 - 100
    riskCategory,
    badgeVariant,
    confidencePercent,
    recommendedAction,
    hpi: {
      value: hpiResult.hpiValue,
      category: hpiResult.category,
      thresholdCrit: 100,
      thresholdWarn: 50,
      formula: 'HPI = Σ(Wi * Qi) / ΣWi [Prasad & Bose (2001)]',
    },
    hei: {
      value: heiResult.heiValue,
      category: heiResult.category,
      thresholdCrit: 20,
      thresholdWarn: 10,
      formula: 'HEI = Σ(Ci / MACi) [Edet & Offiong (2002)]',
    },
    exceededLimitsCount: exceededLimits.length,
    exceededLimits,
    metalBreakdown,
    physicalFactors,
    standardAuthority,
    authorityDescription: selectedStandards.authority,
    modelMetadata: {
      modelName: 'AquaIndex Multi-Parameter Rule-Calibrated Ensemble v1.0',
      modelType: 'Transparent Expert Rule Ensemble & Contamination Scoring',
      isDemonstrationModel: true,
      trainingDataSource: 'Synthetic Demonstration Dataset (500 records)',
      scientificValidationStatus: 'Demonstration and Educational Workflow Prototype',
      waterSafetyDeclarationPermitted: false,
      regulatoryDisclaimer:
        'IMPORTANT SCIENTIFIC NOTICE: This prediction is generated by a demonstration model calibrated on synthetic demonstration data. It is NOT scientifically validated for real-world drinking-water safety clearance. Water safety must NEVER be declared solely from an AI prediction. Certified laboratory chemical verification is mandatory.',
    },
  };
}

module.exports = {
  predictWaterQualityRisk,
};
