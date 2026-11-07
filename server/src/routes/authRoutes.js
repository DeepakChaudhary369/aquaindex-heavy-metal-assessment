const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { protect, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin User Management Routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;

