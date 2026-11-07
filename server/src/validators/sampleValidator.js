const { check, validationResult } = require('express-validator');
const { UNIT_CONVERSION_FACTORS, normalizeToMgL } = require('../services/calculationService');

const validateSample = [
  check('sampleId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Sample ID must be between 3 and 50 characters'),

  check('location')
    .trim()
    .notEmpty()
    .withMessage('Location name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Location name must be between 2 and 150 characters'),

  check('waterSource')
    .notEmpty()
    .withMessage('Water source is required')
    .custom((val) => {
      const allowed = [
        'river',
        'lake',
        'groundwater',
        'pond',
        'other',
        'hand pump',
        'surface water',
        'municipal supply',
        'lake / reservoir',
        'agricultural / surface pond',
        'industrial outfall / other',
        'groundwater / borewell',
      ];
      if (!val || !allowed.includes(val.toLowerCase().trim())) {
        throw new Error(`Water source must be one of: Hand pump, Surface water, Groundwater, Municipal supply, River, Lake, Pond, Other`);
      }
      return true;
    }),

  check('district')
    .optional()
    .trim(),

  check('state')
    .optional()
    .trim(),

  check('pH')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === undefined || val === '') return true;
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 14) {
        throw new Error('pH must be a valid number between 0 and 14');
      }
      return true;
    }),

  check('tdsMgL')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === undefined || val === '') return true;
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        throw new Error('TDS must be a positive number');
      }
      return true;
    }),

  check('turbidityNtu')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === undefined || val === '') return true;
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        throw new Error('Turbidity must be a positive number');
      }
      return true;
    }),

  check('collectionDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Collection date must be a valid date/timestamp'),

  check('coordinates.latitude')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === undefined || val === '') return true;
      const num = Number(val);
      if (isNaN(num) || num < -90 || num > 90) {
        throw new Error('Latitude must be a valid number between -90 and 90');
      }
      return true;
    }),

  check('coordinates.longitude')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === undefined || val === '') return true;
      const num = Number(val);
      if (isNaN(num) || num < -180 || num > 180) {
        throw new Error('Longitude must be a valid number between -180 and 180');
      }
      return true;
    }),

  check('measurements')
    .isArray({ min: 1 })
    .withMessage('At least one heavy metal measurement must be provided'),

  check('measurements.*.metalSymbol')
    .trim()
    .notEmpty()
    .withMessage('Each measurement must have a valid chemical symbol (e.g., Pb, Cd, Cr)'),

  check('measurements.*.rawValue')
    .notEmpty()
    .withMessage('Measurement value cannot be empty')
    .custom((val) => {
      const num = Number(val);
      if (isNaN(num)) {
        throw new Error('Concentration must be a valid number');
      }
      if (num < 0) {
        throw new Error('Concentration cannot be negative');
      }
      return true;
    }),

  check('measurements.*.rawUnit')
    .notEmpty()
    .withMessage('Unit is required for each metal measurement')
    .isIn(Object.keys(UNIT_CONVERSION_FACTORS))
    .withMessage('Unit must be one of: mg/L, µg/L, ppm, ppb'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Sample validation failed',
        errors: errors.array().map((err) => `${err.path || err.param}: ${err.msg}`),
      });
    }

    // Automatically compute normalizedValueMgL for all measurements
    try {
      req.body.measurements = req.body.measurements.map((m) => ({
        metalSymbol: m.metalSymbol.trim().toUpperCase(),
        rawValue: Number(m.rawValue),
        rawUnit: m.rawUnit,
        normalizedValueMgL: normalizeToMgL(Number(m.rawValue), m.rawUnit),
        notes: m.notes ? m.notes.trim() : '',
      }));
    } catch (normErr) {
      return res.status(400).json({
        success: false,
        message: 'Unit normalization error: ' + normErr.message,
      });
    }

    next();
  },
];

module.exports = { validateSample };
