const express = require('express');
const router = express.Router();
const {
  getStandards,
  createStandard,
  updateStandard,
  deleteStandard,
  resetDefaultStandards,
} = require('../controllers/standardController');
const { validateStandard } = require('../validators/standardValidator');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getStandards)
  .post(protect, authorize('admin'), validateStandard, createStandard);

router.post('/reset-defaults', protect, authorize('admin'), resetDefaultStandards);

router.route('/:id')
  .put(protect, authorize('admin'), validateStandard, updateStandard)
  .delete(protect, authorize('admin'), deleteStandard);

module.exports = router;
