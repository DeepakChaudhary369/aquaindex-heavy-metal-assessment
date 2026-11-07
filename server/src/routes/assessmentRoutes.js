const express = require('express');
const router = express.Router();
const {
  calculateSampleAssessment,
  getAssessments,
  getAssessmentById,
} = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getAssessments);

router.route('/:id')
  .get(getAssessmentById);

router.post('/:sampleId/calculate', protect, authorize('admin', 'analyst'), calculateSampleAssessment);

module.exports = router;
