const { check, validationResult } = require('express-validator');

const validateStandard = [
  check('metalSymbol')
    .trim()
    .notEmpty()
    .withMessage('Metal chemical symbol is required (e.g. Pb, Cd, As)'),

  check('metalName')
    .trim()
    .notEmpty()
    .withMessage('Metal name is required (e.g. Lead, Cadmium)'),

  check('limitValue')
    .notEmpty()
    .withMessage('Limit value is required')
    .isFloat({ gt: 0 })
    .withMessage('Limit value must be a positive number'),

  check('unit')
    .optional()
    .isIn(['mg/L', 'µg/L', 'ppm', 'ppb'])
    .withMessage('Unit must be mg/L, µg/L, ppm, or ppb'),

  check('authority')
    .trim()
    .notEmpty()
    .withMessage('Authority/organization is required')
    .isIn(['WHO', 'BIS', 'USEPA', 'EU', 'CUSTOM'])
    .withMessage('Authority must be WHO, BIS, USEPA, EU, or CUSTOM'),

  check('documentTitle')
    .trim()
    .notEmpty()
    .withMessage('Document title/source citation is required'),

  check('version')
    .trim()
    .notEmpty()
    .withMessage('Version identifier is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Standard validation failed',
        errors: errors.array().map((err) => `${err.path || err.param}: ${err.msg}`),
      });
    }
    next();
  },
];

module.exports = { validateStandard };
