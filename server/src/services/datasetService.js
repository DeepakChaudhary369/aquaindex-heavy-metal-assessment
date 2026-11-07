const fs = require('fs');
const path = require('path');
const { calculateHPI, calculateHEI, performFullAssessment } = require('./calculationService');
const WaterSample = require('../models/WaterSample');
const PollutionAssessment = require('../models/PollutionAssessment');

// Standard Reference Limits (mg/L)
const REFERENCE_STANDARDS = {
  WHO: {
    authority: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    limits: {
      PB: { name: 'Lead', symbol: 'Pb', limitMgL: 0.01, unit: 'mg/L' },
      CD: { name: 'Cadmium', symbol: 'Cd', limitMgL: 0.003, unit: 'mg/L' },
      CR: { name: 'Chromium', symbol: 'Cr', limitMgL: 0.05, unit: 'mg/L' },
      CU: { name: 'Copper', symbol: 'Cu', limitMgL: 2.0, unit: 'mg/L' },
      ZN: { name: 'Zinc', symbol: 'Zn', limitMgL: 3.0, unit: 'mg/L' },
      NI: { name: 'Nickel', symbol: 'Ni', limitMgL: 0.07, unit: 'mg/L' },
      FE: { name: 'Iron', symbol: 'Fe', limitMgL: 0.3, unit: 'mg/L' },
      AS: { name: 'Arsenic', symbol: 'As', limitMgL: 0.01, unit: 'mg/L' },
      HG: { name: 'Mercury', symbol: 'Hg', limitMgL: 0.001, unit: 'mg/L' },
    },
  },
  BIS: {
    authority: 'Bureau of Indian Standards BIS IS 10500:2012 (Acceptable Limit)',
    limits: {
      PB: { name: 'Lead', symbol: 'Pb', limitMgL: 0.01, unit: 'mg/L' },
      CD: { name: 'Cadmium', symbol: 'Cd', limitMgL: 0.003, unit: 'mg/L' },
      CR: { name: 'Chromium', symbol: 'Cr', limitMgL: 0.05, unit: 'mg/L' },
      CU: { name: 'Copper', symbol: 'Cu', limitMgL: 0.05, unit: 'mg/L' },
      ZN: { name: 'Zinc', symbol: 'Zn', limitMgL: 5.0, unit: 'mg/L' },
      NI: { name: 'Nickel', symbol: 'Ni', limitMgL: 0.02, unit: 'mg/L' },
      FE: { name: 'Iron', symbol: 'Fe', limitMgL: 0.3, unit: 'mg/L' },
      AS: { name: 'Arsenic', symbol: 'As', limitMgL: 0.01, unit: 'mg/L' },
      HG: { name: 'Mercury', symbol: 'Hg', limitMgL: 0.001, unit: 'mg/L' },
    },
  },
};

// Cached parsed records
let cachedRecords = null;
let lastLoadedTime = 0;
let cacheMtime = 0;

/**
 * Resolves configured dataset CSV file path
 */
function getDatasetPath() {
  const envPath = process.env.DATASET_CSV_PATH;
  if (envPath) {
    if (path.isAbsolute(envPath)) return envPath;
    return path.resolve(__dirname, '../../', envPath);
  }
  return path.resolve(__dirname, '../../data/aquaindex_heavy_metals_synthetic_dataset.csv');
}

/**
 * Robust CSV parser that handles commas inside quotes and whitespace
 */
function parseCsv(content) {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let insideQuotes = false;
    let currentVal = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    if (values.length === headers.length) {
      const row = {};
      for (let h = 0; h < headers.length; h++) {
        row[headers[h]] = values[h];
      }
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parses numerical value safely, preserving null for missing/invalid data
 */
function parseNum(val) {
  if (val === null || val === undefined || val === '' || val === 'NA' || val === 'null' || isNaN(val)) {
    return null;
  }
  return Number(val);
}

/**
 * Enriches a single raw CSV row with standard calculations and status flags
 */
function enrichRecord(row, idx) {
  const sampleId = row.sample_id || `AI-${String(idx + 1).padStart(4, '0')}`;
  const sampleDate = row.sample_date ? new Date(row.sample_date) : null;
  const district = row.district || 'Unspecified';
  const state = row.state || 'Unspecified';
  const waterSource = row.water_source_type || 'Groundwater';
  const latitude = parseNum(row.latitude);
  const longitude = parseNum(row.longitude);
  const pH = parseNum(row.pH);
  const tdsMgL = parseNum(row.TDS_mg_L);
  const turbidityNtu = parseNum(row.turbidity_NTU);
  const dataType = row.data_type || 'synthetic_demo';

  // Metals in mg/L
  const metals = {
    Pb: parseNum(row.Pb_mg_L),
    Cd: parseNum(row.Cd_mg_L),
    Cr: parseNum(row.Cr_mg_L),
    Cu: parseNum(row.Cu_mg_L),
    Zn: parseNum(row.Zn_mg_L),
    Ni: parseNum(row.Ni_mg_L),
    Fe: parseNum(row.Fe_mg_L),
    As: parseNum(row.As_mg_L),
    Hg: parseNum(row.Hg_mg_L),
  };

  // Build standard measurements array for HPI & HEI calculation engine
  const measurements = [];
  const whoStandardsList = [];
  const metalComparisons = {};
  const exceededMetals = [];

  for (const [symbol, val] of Object.entries(metals)) {
    const symUpper = symbol.toUpperCase();
    const whoStd = REFERENCE_STANDARDS.WHO.limits[symUpper];
    const bisStd = REFERENCE_STANDARDS.BIS.limits[symUpper];

    const comp = {
      symbol,
      metalName: whoStd?.name || symbol,
      valueMgL: val,
      whoLimitMgL: whoStd ? whoStd.limitMgL : null,
      bisLimitMgL: bisStd ? bisStd.limitMgL : null,
      unit: 'mg/L',
      status: 'missing',
      ratioToWho: null,
      ratioToBis: null,
      exceedsWho: false,
      exceedsBis: false,
    };

    if (val !== null && !isNaN(val)) {
      measurements.push({
        metalSymbol: symUpper,
        normalizedValueMgL: val,
      });

      if (whoStd) {
        whoStandardsList.push({
          metalSymbol: symUpper,
          metalName: whoStd.name,
          limitValue: whoStd.limitMgL,
          authority: 'WHO',
        });

        comp.ratioToWho = Number((val / whoStd.limitMgL).toFixed(3));
        comp.exceedsWho = val > whoStd.limitMgL;
        if (comp.exceedsWho) {
          exceededMetals.push({
            symbol,
            metalName: whoStd.name,
            valueMgL: val,
            standardLimitMgL: whoStd.limitMgL,
            ratio: comp.ratioToWho,
          });
        }
      }

      if (bisStd) {
        comp.ratioToBis = Number((val / bisStd.limitMgL).toFixed(3));
        comp.exceedsBis = val > bisStd.limitMgL;
      }

      comp.status = comp.exceedsWho ? 'exceeds_limit' : 'within_limit';
    }

    metalComparisons[symbol] = comp;
  }

  // Calculate HPI and HEI using the verified Prasad & Bose (2001) / Edet & Offiong (2002) engine
  let hpi = null;
  let hei = null;
  let overallReview = 'Within selected threshold';
  let hpiCategory = 'Uncalculated';
  let heiCategory = 'Uncalculated';

  if (measurements.length > 0 && whoStandardsList.length > 0) {
    try {
      const assessment = performFullAssessment(measurements, whoStandardsList);
      hpi = assessment.hpi.hpiValue;
      hei = assessment.hei.heiValue;
      hpiCategory = assessment.hpi.category;
      heiCategory = assessment.hei.category;
      overallReview = assessment.overallReview;
    } catch {
      // Fallback in case of calculation issue
    }
  }

  const measurementsFormatted = Object.entries(metals).map(([sym, val]) => ({
    metalSymbol: sym.toUpperCase(),
    rawValue: val,
    rawUnit: 'mg/L',
    normalizedValueMgL: val,
    notes: 'Synthetic reading',
  }));

  const latestAssessment = {
    hpiValue: hpi,
    heiValue: hei,
    classification: {
      overallReview,
      hpiCategory,
      heiCategory,
    },
    exceededMetals,
  };

  return {
    _id: sampleId,
    sampleId,
    sampleDate: sampleDate ? sampleDate.toISOString().split('T')[0] : null,
    collectionDate: sampleDate,
    district,
    state,
    location: `${district}, ${state}`,
    waterSource,
    waterSourceType: waterSource,
    coordinates: {
      latitude,
      longitude,
    },
    latitude,
    longitude,
    pH,
    tdsMgL,
    turbidityNtu,
    measurements: measurementsFormatted,
    metals,
    metalComparisons,
    exceededMetals,
    hasExceedance: exceededMetals.length > 0,
    hpi,
    hei,
    hpiCategory,
    heiCategory,
    overallReview,
    latestAssessment,
    dataType,
    isDemoData: dataType === 'synthetic_demo',
    demonstrationNotice: 'SYNTHETIC DEMONSTRATION DATA: Not certified laboratory measurements.',
  };
}

/**
 * Loads and returns all dataset records with caching
 */
function loadDataset(forceReload = false) {
  const filePath = getDatasetPath();

  if (!fs.existsSync(filePath)) {
    console.warn(`[DatasetService] Dataset CSV not found at: ${filePath}`);
    return [];
  }

  const stat = fs.statSync(filePath);
  if (!forceReload && cachedRecords && cacheMtime === stat.mtimeMs) {
    return cachedRecords;
  }

  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const parsedRows = parseCsv(rawContent);
    cachedRecords = parsedRows.map((row, idx) => enrichRecord(row, idx));
    cacheMtime = stat.mtimeMs;
    lastLoadedTime = Date.now();
    console.log(`[DatasetService] Successfully loaded and indexed ${cachedRecords.length} records from ${filePath}`);
    return cachedRecords;
  } catch (error) {
    console.error('[DatasetService] Error loading dataset CSV:', error.message);
    return cachedRecords || [];
  }
}

/**
 * Query dataset samples with full searching, filtering, pagination, and sorting
 */
function getFilteredSamples(params = {}) {
  const allRecords = loadDataset();

  const {
    search,
    district,
    waterSource,
    sourceType,
    startDate,
    endDate,
    metal,
    minMetal,
    maxMetal,
    metalExceeding,
    reviewStatus,
    page = 1,
    limit = 20,
    sortBy = 'sampleDate',
    sortOrder = 'desc',
  } = params;

  let filtered = [...allRecords];

  // 1. Text Search across ID, District, State, Source
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.sampleId.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.waterSource.toLowerCase().includes(q)
    );
  }

  // 2. District Filter
  if (district && district !== 'all' && district.trim() !== '') {
    const dLower = district.trim().toLowerCase();
    filtered = filtered.filter((r) => r.district.toLowerCase() === dLower);
  }

  // 3. Water Source Type Filter
  const targetSource = waterSource || sourceType;
  if (targetSource && targetSource !== 'all' && targetSource.trim() !== '') {
    const sLower = targetSource.trim().toLowerCase();
    filtered = filtered.filter((r) => r.waterSource.toLowerCase() === sLower);
  }

  // 4. Date Range Filter
  if (startDate) {
    const start = new Date(startDate);
    filtered = filtered.filter((r) => r.collectionDate && r.collectionDate >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    filtered = filtered.filter((r) => r.collectionDate && r.collectionDate <= end);
  }

  // 5. Metal Filter (Pb, Cd, Cr, Cu, Zn, Ni, Fe, As, Hg)
  if (metal && metal !== 'all' && metal.trim() !== '') {
    const metalKey = metal.trim();
    const matchedKey = Object.keys(REFERENCE_STANDARDS.WHO.limits).find(
      (k) => k.toLowerCase() === metalKey.toLowerCase()
    );

    if (matchedKey) {
      const sym = REFERENCE_STANDARDS.WHO.limits[matchedKey].symbol;
      const whoLimit = REFERENCE_STANDARDS.WHO.limits[matchedKey].limitMgL;

      if (metalExceeding === 'true' || metalExceeding === true) {
        filtered = filtered.filter((r) => r.metals[sym] !== null && r.metals[sym] > whoLimit);
      }

      if (minMetal !== undefined && minMetal !== '') {
        const minVal = Number(minMetal);
        if (!isNaN(minVal)) {
          filtered = filtered.filter((r) => r.metals[sym] !== null && r.metals[sym] >= minVal);
        }
      }

      if (maxMetal !== undefined && maxMetal !== '') {
        const maxVal = Number(maxMetal);
        if (!isNaN(maxVal)) {
          filtered = filtered.filter((r) => r.metals[sym] !== null && r.metals[sym] <= maxVal);
        }
      }
    }
  }

  // 6. Review Status Filter
  if (reviewStatus && reviewStatus !== 'all') {
    filtered = filtered.filter((r) => r.overallReview === reviewStatus);
  }

  // Sorting
  const orderMultiplier = sortOrder === 'asc' ? 1 : -1;
  filtered.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Check inside metals object if sorting by metal
    if (valA === undefined && a.metals && a.metals[sortBy] !== undefined) {
      valA = a.metals[sortBy];
      valB = b.metals[sortBy];
    }

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'string') {
      return valA.localeCompare(valB) * orderMultiplier;
    }
    return (valA - valB) * orderMultiplier;
  });

  const total = filtered.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(2000, Math.max(1, parseInt(limit, 10)));
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = filtered.slice(startIndex, startIndex + limitNum);

  return {
    success: true,
    total,
    count: paginatedData.length,
    currentPage: pageNum,
    totalPages: Math.ceil(total / limitNum),
    limit: limitNum,
    isSyntheticDataset: true,
    data: paginatedData,
  };
}

/**
 * Calculates comprehensive statistical summary across the dataset
 */
function getDatasetSummary() {
  const records = loadDataset();
  const totalSamples = records.length;

  if (totalSamples === 0) {
    return {
      totalSamples: 0,
      districts: [],
      states: [],
      availableMetals: [],
      waterSourceBreakdown: {},
      classificationCounts: {
        withinThreshold: 0,
        requiresReview: 0,
        exceedsThreshold: 0,
      },
      averageHpi: null,
      averageHei: null,
    };
  }

  // Unique Districts & States
  const districtsSet = new Set();
  const statesSet = new Set();
  const sourceCounts = {};

  let sumHpi = 0;
  let countHpi = 0;
  let sumHei = 0;
  let countHei = 0;

  const classificationCounts = {
    withinThreshold: 0,
    requiresReview: 0,
    exceedsThreshold: 0,
  };

  const metalStats = {};
  const metalSymbols = ['Pb', 'Cd', 'Cr', 'Cu', 'Zn', 'Ni', 'Fe', 'As', 'Hg'];

  metalSymbols.forEach((sym) => {
    const upper = sym.toUpperCase();
    const whoStd = REFERENCE_STANDARDS.WHO.limits[upper];
    const bisStd = REFERENCE_STANDARDS.BIS.limits[upper];

    metalStats[sym] = {
      symbol: sym,
      name: whoStd ? whoStd.name : sym,
      unit: 'mg/L',
      whoStandardLimitMgL: whoStd ? whoStd.limitMgL : null,
      bisStandardLimitMgL: bisStd ? bisStd.limitMgL : null,
      values: [],
      min: Infinity,
      max: -Infinity,
      sum: 0,
      count: 0,
      exceedanceCount: 0,
    };
  });

  records.forEach((r) => {
    districtsSet.add(r.district);
    statesSet.add(r.state);

    sourceCounts[r.waterSource] = (sourceCounts[r.waterSource] || 0) + 1;

    if (r.hpi !== null && !isNaN(r.hpi)) {
      sumHpi += r.hpi;
      countHpi++;
    }

    if (r.hei !== null && !isNaN(r.hei)) {
      sumHei += r.hei;
      countHei++;
    }

    if (r.overallReview === 'Within selected threshold') {
      classificationCounts.withinThreshold++;
    } else if (r.overallReview === 'Requires review') {
      classificationCounts.requiresReview++;
    } else if (r.overallReview === 'Exceeds selected threshold') {
      classificationCounts.exceedsThreshold++;
    }

    metalSymbols.forEach((sym) => {
      const val = r.metals[sym];
      if (val !== null && !isNaN(val)) {
        const stat = metalStats[sym];
        stat.values.push(val);
        stat.sum += val;
        stat.count++;
        if (val < stat.min) stat.min = val;
        if (val > stat.max) stat.max = val;
        if (stat.whoStandardLimitMgL && val > stat.whoStandardLimitMgL) {
          stat.exceedanceCount++;
        }
      }
    });
  });

  const availableMetals = metalSymbols.map((sym) => {
    const s = metalStats[sym];
    const mean = s.count > 0 ? Number((s.sum / s.count).toFixed(6)) : 0;
    return {
      symbol: s.symbol,
      name: s.name,
      unit: s.unit,
      whoLimitMgL: s.whoStandardLimitMgL,
      bisLimitMgL: s.bisStandardLimitMgL,
      meanConcentrationMgL: mean,
      minConcentrationMgL: s.count > 0 ? Number(s.min.toFixed(6)) : 0,
      maxConcentrationMgL: s.count > 0 ? Number(s.max.toFixed(6)) : 0,
      samplesAnalyzed: s.count,
      samplesExceedingLimit: s.exceedanceCount,
      exceedanceRatePercent: s.count > 0 ? Number(((s.exceedanceCount / s.count) * 100).toFixed(1)) : 0,
    };
  });

  return {
    totalSamples,
    districts: Array.from(districtsSet).sort(),
    districtCount: districtsSet.size,
    states: Array.from(statesSet).sort(),
    stateCount: statesSet.size,
    availableMetals,
    waterSourceBreakdown: sourceCounts,
    classificationCounts,
    averageHpi: countHpi > 0 ? Number((sumHpi / countHpi).toFixed(2)) : null,
    averageHei: countHei > 0 ? Number((sumHei / countHei).toFixed(2)) : null,
    samplesRequiringAttention: classificationCounts.requiresReview + classificationCounts.exceedsThreshold,
    criticalContaminationCount: classificationCounts.exceedsThreshold,
    latestSampleDate: records.length > 0 ? records[0].sampleDate : null,
    isSyntheticDataset: true,
    demonstrationNotice:
      'NOTICE: All dataset records are synthetic demonstration entries generated for environmental monitoring workflow evaluation. Never use synthetic data for real-world drinking water decisions.',
    referenceStandards: REFERENCE_STANDARDS,
  };
}

/**
 * Retrieves a single sample by sampleId
 */
function getSampleById(sampleId) {
  const records = loadDataset();
  const idUpper = sampleId.trim().toUpperCase();
  return records.find((r) => r.sampleId.toUpperCase() === idUpper) || null;
}

/**
 * Syncs the CSV dataset records into MongoDB if connected, ensuring full platform interoperability
 */
async function syncToMongo(adminUserId = null) {
  try {
    const records = loadDataset();
    if (!records || records.length === 0) return { inserted: 0, existing: 0 };

    console.log(`[DatasetSync] Verifying synchronization for ${records.length} samples in MongoDB...`);

    const existingSampleCount = await WaterSample.countDocuments();
    if (existingSampleCount >= records.length) {
      console.log(`[DatasetSync] Database already populated with ${existingSampleCount} samples.`);
      return { inserted: 0, total: existingSampleCount };
    }

    let insertedCount = 0;
    const batchSize = 100;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const docsToInsert = [];
      const assessmentsToInsert = [];

      for (const rec of batch) {
        const exists = await WaterSample.findOne({ sampleId: rec.sampleId });
        if (exists) continue;

        const measurementsArray = Object.entries(rec.metals).map(([sym, val]) => ({
          metalSymbol: sym.toUpperCase(),
          rawValue: val !== null ? val : 0,
          rawUnit: 'mg/L',
          normalizedValueMgL: val !== null ? val : 0,
          notes: `Synthetic concentration: ${val} mg/L`,
        }));

        const newSample = new WaterSample({
          sampleId: rec.sampleId,
          location: rec.location,
          district: rec.district,
          state: rec.state,
          coordinates: {
            latitude: rec.latitude,
            longitude: rec.longitude,
          },
          collectionDate: rec.collectionDate || new Date(),
          waterSource: rec.waterSource,
          pH: rec.pH,
          tdsMgL: rec.tdsMgL,
          turbidityNtu: rec.turbidityNtu,
          measurements: measurementsArray,
          notes: 'DEMONSTRATION SYNTHETIC DATASET SAMPLE',
          isDemoData: true,
          dataType: rec.dataType,
          createdBy: adminUserId,
        });

        docsToInsert.push(newSample);
      }

      if (docsToInsert.length > 0) {
        const savedDocs = await WaterSample.insertMany(docsToInsert, { ordered: false });
        insertedCount += savedDocs.length;

        // Auto-create assessments for saved docs
        for (const doc of savedDocs) {
          const rec = records.find((r) => r.sampleId === doc.sampleId);
          if (rec && rec.hpi !== null) {
            assessmentsToInsert.push({
              sampleId: doc.sampleId,
              sampleRef: doc._id,
              indexType: 'BOTH',
              hpiValue: rec.hpi,
              heiValue: rec.hei,
              methodologyVersion: 'HPI: Prasad & Bose (2001) / HEI: Edet & Offiong (2002) v1.0',
              classification: {
                hpiCategory: rec.hpiCategory,
                heiCategory: rec.heiCategory,
                overallReview: rec.overallReview,
                thresholdExplanation: 'Automated index assessment against WHO Guidelines for Drinking-water Quality.',
              },
            });
          }
        }

        if (assessmentsToInsert.length > 0) {
          await PollutionAssessment.insertMany(assessmentsToInsert, { ordered: false });
        }
      }
    }

    console.log(`[DatasetSync] Completed! Inserted ${insertedCount} new samples into MongoDB.`);
    return { inserted: insertedCount, total: await WaterSample.countDocuments() };
  } catch (err) {
    console.warn('[DatasetSync Error] Non-fatal sync note:', err.message);
    return { error: err.message };
  }
}

/**
 * Dynamically registers a newly created water sample into the in-memory dataset cache
 */
function addSampleToDatasetCache(sampleDoc) {
  if (!cachedRecords) {
    loadDataset();
  }
  if (!cachedRecords) return null;

  const metals = {};
  if (Array.isArray(sampleDoc.measurements)) {
    for (const m of sampleDoc.measurements) {
      if (m.metalSymbol) {
        metals[m.metalSymbol.toUpperCase()] = m.normalizedValueMgL !== undefined ? m.normalizedValueMgL : m.rawValue;
      }
    }
  }

  const row = {
    sample_id: sampleDoc.sampleId,
    sample_date: sampleDoc.collectionDate ? new Date(sampleDoc.collectionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    district: sampleDoc.district || '',
    state: sampleDoc.state || '',
    water_source_type: sampleDoc.waterSource || 'Groundwater',
    latitude: sampleDoc.coordinates?.latitude,
    longitude: sampleDoc.coordinates?.longitude,
    pH: sampleDoc.pH,
    TDS_mg_L: sampleDoc.tdsMgL,
    turbidity_NTU: sampleDoc.turbidityNtu,
    Pb_mg_L: metals.PB,
    Cd_mg_L: metals.CD,
    Cr_mg_L: metals.CR,
    Cu_mg_L: metals.CU,
    Zn_mg_L: metals.ZN,
    Ni_mg_L: metals.NI,
    Fe_mg_L: metals.FE,
    As_mg_L: metals.AS,
    Hg_mg_L: metals.HG,
    data_type: sampleDoc.dataType || 'measured',
  };

  const enriched = enrichRecord(row, cachedRecords.length);
  enriched.location = sampleDoc.location || enriched.location;
  enriched._id = sampleDoc._id ? sampleDoc._id.toString() : sampleDoc.sampleId;
  enriched.isDemoData = false;

  // Prepend to cached records so it appears at the top of dataset queries
  cachedRecords.unshift(enriched);
  return enriched;
}

module.exports = {
  REFERENCE_STANDARDS,
  loadDataset,
  getFilteredSamples,
  getDatasetSummary,
  getSampleById,
  syncToMongo,
  addSampleToDatasetCache,
};
