const PollutionAssessment = require('../models/PollutionAssessment');
const WaterSample = require('../models/WaterSample');
const ReferenceStandard = require('../models/ReferenceStandard');
const { performFullAssessment } = require('../services/calculationService');
const { logAudit } = require('../middleware/audit');

// @desc    Calculate HPI and HEI for a water sample
// @route   POST /api/assessments/:sampleId/calculate
// @access  Private (Analyst, Admin)
const calculateSampleAssessment = async (req, res, next) => {
  try {
    const { sampleId } = req.params;
    const { authority = 'WHO', standardVersion, notes = '' } = req.body;

    let sample = null;
    if (sampleId.match(/^[0-9a-fA-F]{24}$/)) {
      sample = await WaterSample.findById(sampleId);
    }
    if (!sample) {
      sample = await WaterSample.findOne({ sampleId: sampleId.toUpperCase() });
    }

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: `Water sample '${sampleId}' not found.`,
      });
    }

    // Query active standards for the selected authority
    const standardQuery = { authority: authority.toUpperCase() };
    if (standardVersion) {
      standardQuery.version = standardVersion;
    }

    let standards = await ReferenceStandard.find(standardQuery);
    if (!standards || standards.length === 0) {
      // Fallback: search for any standard for the requested authority without version constraint
      standards = await ReferenceStandard.find({ authority: authority.toUpperCase() });
    }

    if (!standards || standards.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No reference standards found for authority '${authority}'. Please seed or configure standards first.`,
      });
    }

    // Run the calculation engine
    const assessmentResult = performFullAssessment(sample.measurements, standards);

    // Save persistent assessment snapshot with exact standard version
    const savedAssessment = await PollutionAssessment.create({
      sampleId: sample.sampleId,
      sampleRef: sample._id,
      indexType: 'BOTH',
      hpiValue: assessmentResult.hpi.hpiValue,
      heiValue: assessmentResult.hei.heiValue,
      methodologyVersion: assessmentResult.methodologyVersion,
      standardReferences: assessmentResult.standardSnapshots,
      intermediateResults: {
        hpi: assessmentResult.hpi,
        hei: assessmentResult.hei,
      },
      classification: {
        hpiCategory: assessmentResult.hpi.category,
        heiCategory: assessmentResult.hei.category,
        overallReview: assessmentResult.overallReview,
        thresholdExplanation: assessmentResult.thresholdExplanation,
      },
      calculatedBy: req.user ? req.user._id : null,
      notes,
      isDemoData: sample.isDemoData,
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CALCULATE_ASSESSMENT',
      entityType: 'PollutionAssessment',
      entityId: savedAssessment._id,
      details: {
        sampleId: sample.sampleId,
        hpiValue: assessmentResult.hpi.hpiValue,
        heiValue: assessmentResult.hei.heiValue,
        authority,
      },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'HPI & HEI assessment calculated successfully',
      data: savedAssessment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all calculated assessments
// @route   GET /api/assessments
// @access  Public / Private
const getAssessments = async (req, res, next) => {
  try {
    const {
      sampleId,
      reviewState,
      hpiCategory,
      isDemoData,
      page = 1,
      limit = 20,
      sortBy = 'calculationDate',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (sampleId) {
      query.sampleId = new RegExp(sampleId.trim(), 'i');
    }

    if (reviewState && reviewState !== 'all') {
      query['classification.overallReview'] = reviewState;
    }

    if (hpiCategory && hpiCategory !== 'all') {
      query['classification.hpiCategory'] = hpiCategory;
    }

    if (isDemoData !== undefined && isDemoData !== 'all') {
      query.isDemoData = isDemoData === 'true';
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(2000, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [total, assessments] = await Promise.all([
      PollutionAssessment.countDocuments(query),
      PollutionAssessment.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('sampleRef', 'location waterSource coordinates collectionDate')
        .populate('calculatedBy', 'name email')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      count: assessments.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: assessments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment by ID
// @route   GET /api/assessments/:id
// @access  Public / Private
const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assessment = await PollutionAssessment.findById(id)
      .populate('sampleRef')
      .populate('calculatedBy', 'name email')
      .lean();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateSampleAssessment,
  getAssessments,
  getAssessmentById,
};
