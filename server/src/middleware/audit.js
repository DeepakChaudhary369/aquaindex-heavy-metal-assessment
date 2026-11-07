const AuditLog = require('../models/AuditLog');

const logAudit = async ({ userId = null, action, entityType, entityId = null, details = {}, req = null }) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || ''
      : '';

    await AuditLog.create({
      userId: userId || (req?.user?._id ?? null),
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      details,
      ipAddress: String(ipAddress),
      timestamp: new Date(),
    });
  } catch (err) {
    // Audit logging failure should not crash main business logic
    console.error('[AuditLog Error] Failed to record audit entry:', err.message);
  }
};

module.exports = { logAudit };
