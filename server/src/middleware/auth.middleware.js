const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verify JWT or Firebase token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Bearer token in header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check cookie
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication token required');
  }

  try {
    // Try JWT first
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) throw ApiError.unauthorized('User not found');
    if (!user.isActive) throw ApiError.forbidden('Account deactivated');
    if (user.isSuspended) throw ApiError.forbidden(`Account suspended: ${user.suspendedReason || 'Contact support'}`);

    req.user = user;
    return next();
  } catch (jwtError) {
    // If JWT fails, try Firebase token
    if (jwtError.name === 'JsonWebTokenError' || jwtError.name === 'TokenExpiredError') {
      try {
        const firebaseDecoded = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({
          $or: [{ googleId: firebaseDecoded.uid }, { email: firebaseDecoded.email }]
        }).select('-password -refreshToken');

        if (!user) throw ApiError.unauthorized('User not registered. Please sign up first.');
        if (!user.isActive) throw ApiError.forbidden('Account deactivated');
        if (user.isSuspended) throw ApiError.forbidden(`Account suspended: ${user.suspendedReason}`);

        req.user = user;
        req.firebaseUser = firebaseDecoded;
        return next();
      } catch (firebaseError) {
        throw ApiError.unauthorized('Invalid or expired token');
      }
    }
    throw ApiError.unauthorized('Invalid or expired token');
  }
});

/**
 * Optional auth - attaches user if token present, doesn't block if absent
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');
  } catch {
    // Silently fail for optional auth
  }
  next();
});

module.exports = { protect, optionalAuth };
