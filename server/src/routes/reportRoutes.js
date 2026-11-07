const express = require('express');
const router = express.Router();
const { exportSamplesCSV, exportAssessmentsCSV } = require('../controllers/reportController');

router.get('/samples.csv', exportSamplesCSV);
router.get('/assessments.csv', exportAssessmentsCSV);

module.exports = router;
