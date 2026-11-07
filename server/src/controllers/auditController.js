const AuditLog = require('../models/AuditLog');

// @desc    Get paginated audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, page = 1, limit = 30 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email role')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
