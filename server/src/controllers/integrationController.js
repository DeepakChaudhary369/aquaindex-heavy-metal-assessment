const { getDatasetSummary, getFilteredSamples, getSampleById: getDatasetSampleById } = require('../services/datasetService');
const { predictWaterQualityRisk } = require('../services/predictionService');
const { processChatMessage } = require('../services/aiChatService');

/**
 * Controller for AquaIndex Enhancements:
 * - Summary API (GET /api/summary)
 * - Prediction API (POST /api/predict)
 * - AI Chatbot API (POST /api/chat)
 */

// @desc    Get dataset and surveillance summary (total samples, districts, available metals)
// @route   GET /api/summary
// @access  Public
const getSummary = async (req, res, next) => {
  try {
    const summary = getDatasetSummary();
    res.status(200).json({
      success: true,
      message: 'Surveillance and dataset summary retrieved successfully',
      data: summary,
      // Top-level aliases for direct consumer compatibility
      totalSamples: summary.totalSamples,
      districts: summary.districts,
      districtCount: summary.districtCount,
      states: summary.states,
      stateCount: summary.stateCount,
      availableMetals: summary.availableMetals,
      waterSourceBreakdown: summary.waterSourceBreakdown,
      classificationCounts: summary.classificationCounts,
      averageHpi: summary.averageHpi,
      averageHei: summary.averageHei,
      isSyntheticDataset: summary.isSyntheticDataset,
      demonstrationNotice: summary.demonstrationNotice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Predict water contamination risk and compute indices
// @route   POST /api/predict
// @access  Public
const predictSample = async (req, res, next) => {
  try {
    const result = predictWaterQualityRisk(req.body);
    res.status(200).json({
      success: true,
      message: 'Demonstration prediction calculated successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Prediction calculation failed.',
    });
  }
};

// @desc    Send message to AquaBot AI Chatbot
// @route   POST /api/chat
// @access  Public
const chatWithAquaBot = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A non-empty "message" string is required in the request body.',
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message length exceeds maximum limit of 1,000 characters.',
      });
    }

    const response = await processChatMessage(message, history || []);
    res.status(200).json(response);
  } catch (error) {
    console.error('[AquaBot Controller Error]', error.message);
    res.status(500).json({
      success: false,
      message: 'AquaBot encountered an error processing your query. Please try again.',
      sender: 'AquaBot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get filtered CSV demonstration dataset records
// @route   GET /api/dataset/samples
// @access  Public
const getDatasetRecords = async (req, res, next) => {
  try {
    const result = getFilteredSamples(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single dataset sample by ID
// @route   GET /api/dataset/samples/:id
// @access  Public
const getDatasetRecordById = async (req, res, next) => {
  try {
    const sample = getDatasetSampleById(req.params.id);
    if (!sample) {
      return res.status(404).json({
        success: false,
        message: `Dataset sample '${req.params.id}' not found.`,
      });
    }
    res.status(200).json({
      success: true,
      data: sample,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  predictSample,
  chatWithAquaBot,
  getDatasetRecords,
  getDatasetRecordById,
};
