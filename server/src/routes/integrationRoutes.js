const express = require('express');
const router = express.Router();
const {
  getSummary,
  predictSample,
  chatWithAquaBot,
  getDatasetRecords,
  getDatasetRecordById,
} = require('../controllers/integrationController');

// Summary API: GET /api/summary
router.get('/summary', getSummary);

// Prediction API: POST /api/predict
router.post('/predict', predictSample);

// AI Chatbot API: POST /api/chat
router.post('/chat', chatWithAquaBot);

// Direct Demonstration Dataset API: GET /api/dataset/samples
router.get('/dataset/samples', getDatasetRecords);
router.get('/dataset/samples/:id', getDatasetRecordById);

module.exports = router;
