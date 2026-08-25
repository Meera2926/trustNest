const ApiError = require('../utils/ApiError');

/**
 * Role-based access control middleware
 * Usage: authorize('admin', 'verification_officer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(
        `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      ));
    }
    next();
  };
};

/**
 * Check if user owns the resource or is admin
 */
const ownerOrAdmin = (userIdField = 'userId') => {
  return (req, res, next) => {
    const resourceOwnerId = req.params[userIdField] || req.body[userIdField];
    const isOwner = req.user._id.toString() === resourceOwnerId?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(ApiError.forbidden('Access denied'));
    }
    next();
  };
};

module.exports = { authorize, ownerOrAdmin };
