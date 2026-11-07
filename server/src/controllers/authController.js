const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAudit } = require('../middleware/audit');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await User.hashPassword(password);
    const userRole = role && ['admin', 'analyst', 'viewer'].includes(role) ? role : 'analyst';

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: userRole,
    });

    const token = generateToken(user._id);

    await logAudit({
      userId: user._id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const rawIdentifier = (req.body.email || req.body.username || req.body.id || req.body.loginIdentifier || '').trim();
    const { password } = req.body;

    const identifierLower = rawIdentifier.toLowerCase();

    // Query by email, username, or known default role identifier
    const user = await User.findOne({
      $or: [
        { email: identifierLower },
        { username: identifierLower },
        { role: identifierLower },
      ],
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid User ID/Email or password combination.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.',
      });
    }

    const token = generateToken(user._id);

    await logAudit({
      userId: user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Sign-in successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id).select('+passwordHash');

    if (name) user.name = name.trim();
    if (password && password.length >= 6) {
      user.passwordHash = await User.hashPassword(password);
    }

    await user.save();

    await logAudit({
      userId: user._id,
      action: 'UPDATE_PROFILE',
      entityType: 'User',
      entityId: user._id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/auth/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'analyst', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Valid roles are: admin, analyst, viewer',
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found',
      });
    }

    // Protect last admin from demoting themselves
    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Operation denied: Cannot demote the last administrator in the system.',
        });
      }
    }

    const oldRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await logAudit({
      userId: req.user._id,
      action: 'UPDATE_USER_ROLE',
      entityType: 'User',
      entityId: targetUser._id,
      details: { email: targetUser.email, previousRole: oldRole, updatedRole: role },
      req,
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a registered email address.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with that email address.',
      });
    }

    const resetToken = jwt.sign(
      { id: user._id, email: user.email, purpose: 'pwd_reset' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    await logAudit({
      userId: user._id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Account verified. You may now specify your new security password.',
      data: {
        email: user.email,
        name: user.name,
        resetToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with verified token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    let user;
    if (resetToken) {
      try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'fallback_secret');
        user = await User.findById(decoded.id).select('+passwordHash');
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Reset token has expired or is invalid. Please request a new verification.',
        });
      }
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    await logAudit({
      userId: user._id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Password successfully updated. You may now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserRole,
  forgotPassword,
  resetPassword,
};
