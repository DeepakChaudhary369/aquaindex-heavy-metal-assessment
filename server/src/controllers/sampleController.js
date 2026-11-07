const WaterSample = require('../models/WaterSample');
const PollutionAssessment = require('../models/PollutionAssessment');
const ReferenceStandard = require('../models/ReferenceStandard');
const { performFullAssessment } = require('../services/calculationService');
const { logAudit } = require('../middleware/audit');

// Helper to generate sequential unique Sample ID
const generateNextSampleId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `SMP-${currentYear}-`;
  const count = await WaterSample.countDocuments({
    sampleId: new RegExp(`^${prefix}`),
  });
  const seq = String(count + 1).padStart(4, '0');
  let candidate = `${prefix}${seq}`;

  // Double check uniqueness
  const exists = await WaterSample.findOne({ sampleId: candidate });
  if (exists) {
    candidate = `${prefix}${Date.now().toString().slice(-4)}`;
  }
  return candidate;
};

// @desc    Create a new water sample
// @route   POST /api/samples
// @access  Private (Analyst, Admin)
const createSample = async (req, res, next) => {
  try {
    let {
      sampleId,
      location,
      district,
      state,
      coordinates,
      collectionDate,
      waterSource,
      pH,
      tdsMgL,
      turbidityNtu,
      dataType,
      measurements,
      notes,
      autoAssess,
      standardAuthority,
    } = req.body;

    if (!sampleId || sampleId.trim() === '') {
      sampleId = await generateNextSampleId();
    } else {
      sampleId = sampleId.trim().toUpperCase();
      const existing = await WaterSample.findOne({ sampleId });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Sample ID '${sampleId}' is already in use. Please specify another ID or leave empty for auto-generation.`,
        });
      }
    }

    const parsedLat = coordinates?.latitude !== undefined && coordinates?.latitude !== '' && coordinates?.latitude !== null ? Number(coordinates.latitude) : null;
    const parsedLng = coordinates?.longitude !== undefined && coordinates?.longitude !== '' && coordinates?.longitude !== null ? Number(coordinates.longitude) : null;

const UNIT_CONVERSIONS = {
  'mg/L': 1.0,
  'µg/L': 0.001,
  'ppm': 1.0,
  'ppb': 0.001,
};

function sanitizeMeasurements(rawMeasurements) {
  if (!Array.isArray(rawMeasurements)) return [];
  return rawMeasurements.map((m) => {
    const rawVal = Number(m.rawValue);
    const unit = m.rawUnit || 'mg/L';
    const factor = UNIT_CONVERSIONS[unit] || 1.0;
    const normalized =
      m.normalizedValueMgL !== undefined && m.normalizedValueMgL !== null && !isNaN(Number(m.normalizedValueMgL))
        ? Number(m.normalizedValueMgL)
        : Number((rawVal * factor).toFixed(6));

    return {
      metalSymbol: m.metalSymbol ? m.metalSymbol.toUpperCase().trim() : '',
      rawValue: rawVal,
      rawUnit: unit,
      normalizedValueMgL: normalized,
      notes: m.notes || '',
    };
  });
}

    const sample = await WaterSample.create({
      sampleId,
      location: location?.trim() || (district && state ? `${district.trim()}, ${state.trim()}` : 'Field Collection Site'),
      district: district ? district.trim() : '',
      state: state ? state.trim() : '',
      coordinates: {
        latitude: parsedLat,
        longitude: parsedLng,
      },
      collectionDate: collectionDate || new Date(),
      waterSource: waterSource || 'Groundwater',
      pH: pH !== undefined && pH !== '' && pH !== null ? Number(pH) : null,
      tdsMgL: tdsMgL !== undefined && tdsMgL !== '' && tdsMgL !== null ? Number(tdsMgL) : null,
      turbidityNtu: turbidityNtu !== undefined && turbidityNtu !== '' && turbidityNtu !== null ? Number(turbidityNtu) : null,
      dataType: dataType || 'measured',
      measurements: sanitizeMeasurements(measurements),
      notes: notes || '',
      isDemoData: false,
      createdBy: req.user ? req.user._id : null,
    });

    try {
      const datasetService = require('../services/datasetService');
      datasetService.addSampleToDatasetCache(sample);
    } catch (cacheErr) {
      console.warn('Dataset cache sync note:', cacheErr.message);
    }

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_SAMPLE',
      entityType: 'WaterSample',
      entityId: sample._id,
      details: { sampleId: sample.sampleId, location: sample.location, waterSource: sample.waterSource },
      req,
    });

    let assessmentResult = null;
    // If autoAssess is requested, calculate immediately using default standards
    if (autoAssess) {
      try {
        const authority = standardAuthority || 'WHO';
        const standards = await ReferenceStandard.find({ authority });
        if (standards && standards.length > 0) {
          const assessmentData = performFullAssessment(sample.measurements, standards);
          assessmentResult = await PollutionAssessment.create({
            sampleId: sample.sampleId,
            sampleRef: sample._id,
            indexType: 'BOTH',
            hpiValue: assessmentData.hpi.hpiValue,
            heiValue: assessmentData.hei.heiValue,
            methodologyVersion: assessmentData.methodologyVersion,
            standardReferences: assessmentData.standardSnapshots,
            intermediateResults: {
              hpi: assessmentData.hpi,
              hei: assessmentData.hei,
            },
            classification: {
              hpiCategory: assessmentData.hpi.category,
              heiCategory: assessmentData.hei.category,
              overallReview: assessmentData.overallReview,
              thresholdExplanation: assessmentData.thresholdExplanation,
            },
            calculatedBy: req.user?._id,
          });
        }
      } catch (calcErr) {
        console.warn('Auto assessment calculation note:', calcErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Water sample recorded successfully',
      data: sample,
      assessment: assessmentResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all water samples with filtering, pagination, and latest assessment
// @route   GET /api/samples
// @access  Public / Private
const getSamples = async (req, res, next) => {
  try {
    const {
      search,
      waterSource,
      sourceType,
      district,
      metal,
      minMetal,
      maxMetal,
      metalExceeding,
      startDate,
      endDate,
      hasCoordinates,
      isDemoData,
      source,
      page = 1,
      limit = 20,
      sortBy = 'collectionDate',
      sortOrder = 'desc',
    } = req.query;

    const datasetService = require('../services/datasetService');

    // If caller specifically requests CSV dataset or MongoDB has no records
    if (source === 'csv' || source === 'dataset') {
      const csvResult = datasetService.getFilteredSamples(req.query);
      return res.status(200).json(csvResult);
    }

    const query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { sampleId: searchRegex },
        { location: searchRegex },
        { district: searchRegex },
        { state: searchRegex },
        { notes: searchRegex },
      ];
    }

    if (district && district !== 'all' && district.trim() !== '') {
      query.district = new RegExp(`^${district.trim()}$`, 'i');
    }

    const effectiveSource = waterSource || sourceType;
    if (effectiveSource && effectiveSource !== 'all') {
      query.waterSource = new RegExp(`^${effectiveSource.trim()}$`, 'i');
    }

    if (isDemoData !== undefined && isDemoData !== 'all') {
      query.isDemoData = isDemoData === 'true';
    }

    if (hasCoordinates === 'true') {
      query['coordinates.latitude'] = { $ne: null };
      query['coordinates.longitude'] = { $ne: null };
    }

    if (startDate || endDate) {
      query.collectionDate = {};
      if (startDate) query.collectionDate.$gte = new Date(startDate);
      if (endDate) query.collectionDate.$lte = new Date(endDate);
    }

    if (metal && metal !== 'all' && metal.trim() !== '') {
      const mSym = metal.trim().toUpperCase();
      const mElemMatch = { metalSymbol: mSym };
      if (minMetal !== undefined && minMetal !== '') {
        mElemMatch.normalizedValueMgL = { ...mElemMatch.normalizedValueMgL, $gte: Number(minMetal) };
      }
      if (maxMetal !== undefined && maxMetal !== '') {
        mElemMatch.normalizedValueMgL = { ...mElemMatch.normalizedValueMgL, $lte: Number(maxMetal) };
      }
      query.measurements = { $elemMatch: mElemMatch };
    }

    const { getDbStatus } = require('../config/db');
    const dbStatus = getDbStatus();

    // If database is not connected, immediately serve from CSV dataset
    if (!dbStatus.isConnected) {
      const csvResult = datasetService.getFilteredSamples(req.query);
      return res.status(200).json(csvResult);
    }

    const totalInDb = await WaterSample.countDocuments({});
    if (totalInDb === 0) {
      // Fallback to CSV dataset if DB is not yet populated
      const csvResult = datasetService.getFilteredSamples(req.query);
      return res.status(200).json(csvResult);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(2000, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [totalSamples, samples] = await Promise.all([
      WaterSample.countDocuments(query),
      WaterSample.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .lean(),
    ]);

    // Attach latest assessment for each sample if available
    const sampleIds = samples.map((s) => s._id);
    const assessments = await PollutionAssessment.find({ sampleRef: { $in: sampleIds } })
      .sort({ calculationDate: -1 })
      .lean();

    const assessmentMap = new Map();
    for (const a of assessments) {
      if (!assessmentMap.has(a.sampleRef.toString())) {
        assessmentMap.set(a.sampleRef.toString(), a);
      }
    }

    const enrichedSamples = samples.map((s) => ({
      ...s,
      latestAssessment: assessmentMap.get(s._id.toString()) || null,
    }));

    res.status(200).json({
      success: true,
      count: enrichedSamples.length,
      total: totalSamples,
      totalPages: Math.ceil(totalSamples / limitNum),
      currentPage: pageNum,
      data: enrichedSamples,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sample by ID
// @route   GET /api/samples/:id
// @access  Public / Private
const getSampleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let sample = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      sample = await WaterSample.findById(id).populate('createdBy', 'name email').lean();
    }
    if (!sample) {
      sample = await WaterSample.findOne({ sampleId: id.toUpperCase() }).populate('createdBy', 'name email').lean();
    }

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: `Water sample with ID '${id}' not found.`,
      });
    }

    // Find all assessments associated with this sample
    const assessments = await PollutionAssessment.find({ sampleRef: sample._id })
      .sort({ calculationDate: -1 })
      .populate('calculatedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...sample,
        assessments,
        latestAssessment: assessments[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sample
// @route   PUT /api/samples/:id
// @access  Private (Analyst, Admin)
const updateSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { location, district, state, coordinates, collectionDate, waterSource, pH, tdsMgL, turbidityNtu, measurements, notes } = req.body;

    const sample = await WaterSample.findById(id);
    if (!sample) {
      return res.status(404).json({
        success: false,
        message: `Water sample not found`,
      });
    }

    // Role check: Only admin or sample creator can update
    if (req.user.role !== 'admin' && sample.createdBy && sample.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this sample.',
      });
    }

    if (location !== undefined) sample.location = location;
    if (district !== undefined) sample.district = district;
    if (state !== undefined) sample.state = state;
    if (coordinates) {
      sample.coordinates = {
        latitude: coordinates.latitude !== undefined && coordinates.latitude !== '' ? Number(coordinates.latitude) : null,
        longitude: coordinates.longitude !== undefined && coordinates.longitude !== '' ? Number(coordinates.longitude) : null,
      };
    }
    if (collectionDate) sample.collectionDate = collectionDate;
    if (waterSource) sample.waterSource = waterSource;
    if (pH !== undefined) sample.pH = pH !== '' && pH !== null ? Number(pH) : null;
    if (tdsMgL !== undefined) sample.tdsMgL = tdsMgL !== '' && tdsMgL !== null ? Number(tdsMgL) : null;
    if (turbidityNtu !== undefined) sample.turbidityNtu = turbidityNtu !== '' && turbidityNtu !== null ? Number(turbidityNtu) : null;
    if (measurements) sample.measurements = sanitizeMeasurements(measurements);
    if (notes !== undefined) sample.notes = notes;

    await sample.save();

    await logAudit({
      userId: req.user._id,
      action: 'UPDATE_SAMPLE',
      entityType: 'WaterSample',
      entityId: sample._id,
      details: { sampleId: sample.sampleId, updatedFields: Object.keys(req.body) },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Water sample updated successfully',
      data: sample,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sample
// @route   DELETE /api/samples/:id
// @access  Private (Admin only or creator)
const deleteSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sample = await WaterSample.findById(id);

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: `Water sample not found`,
      });
    }

    // Authorization
    if (req.user.role !== 'admin' && sample.createdBy && sample.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this sample.',
      });
    }

    await PollutionAssessment.deleteMany({ sampleRef: sample._id });
    await WaterSample.findByIdAndDelete(id);

    await logAudit({
      userId: req.user._id,
      action: 'DELETE_SAMPLE',
      entityType: 'WaterSample',
      entityId: id,
      details: { sampleId: sample.sampleId, location: sample.location },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Sample ${sample.sampleId} and associated assessments removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSample,
  getSamples,
  getSampleById,
  updateSample,
  deleteSample,
};
