const express = require('express');
const {
  registerCustomer,
  registerWorker,
  login,
  googleLogin,
  logout,
  sendOtp,
  verifyOtp,
  getMe,
  refreshToken
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth routes (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.post('/register/customer', authLimiter, registerCustomer);
router.post('/register/worker', authLimiter, registerWorker);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
