const { check, validationResult } = require('express-validator');

const validateRegister = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please supply a valid email address')
    .normalizeEmail(),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  check('role')
    .optional()
    .isIn(['admin', 'analyst', 'viewer'])
    .withMessage('Role must be admin, analyst, or viewer'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration input',
        errors: errors.array().map((err) => err.msg),
      });
    }
    next();
  },
];

const validateLogin = [
  check('password').notEmpty().withMessage('Password is required'),

  (req, res, next) => {
    const identifier = req.body.email || req.body.username || req.body.id || req.body.loginIdentifier;
    if (!identifier || String(identifier).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Username or Email is required',
        errors: ['Please enter your username, ID, or email address'],
      });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login credentials format',
        errors: errors.array().map((err) => err.msg),
      });
    }
    next();
  },
];

module.exports = { validateRegister, validateLogin };
