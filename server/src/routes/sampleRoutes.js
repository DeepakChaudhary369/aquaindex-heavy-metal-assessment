const express = require('express');
const router = express.Router();
const {
  createSample,
  getSamples,
  getSampleById,
  updateSample,
  deleteSample,
} = require('../controllers/sampleController');
const { validateSample } = require('../validators/sampleValidator');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getSamples)
  .post(protect, authorize('admin', 'analyst'), validateSample, createSample);

router.route('/:id')
  .get(getSampleById)
  .put(protect, authorize('admin', 'analyst'), validateSample, updateSample)
  .delete(protect, authorize('admin', 'analyst'), deleteSample);

module.exports = router;
