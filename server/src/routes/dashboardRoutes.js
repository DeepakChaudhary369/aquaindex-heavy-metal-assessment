const express = require('express');
const router = express.Router();
const { getSummary, getTrends } = require('../controllers/dashboardController');

router.get('/summary', getSummary);
router.get('/trends', getTrends);

module.exports = router;
