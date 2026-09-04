const User = require('../models/User');
const CustomerProfile = require('../models/CustomerProfile');
const WorkerProfile = require('../models/WorkerProfile');
const { generateAccessToken, generateRefreshToken, setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/generateToken');
const { createAndSendOTP, verifyOTP } = require('../services/otp.service');
const { templates, sendEmail } = require('../services/email.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');

// @desc    Register new customer
// @route   POST /api/v1/auth/register/customer
// @access  Public
const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw ApiError.conflict('User with this email or phone already exists');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'customer',
  });

  await CustomerProfile.create({ user: user._id });

  // Send verification OTP automatically
  await createAndSendOTP({ identifier: email, type: 'email', purpose: 'verify_email' });
  
  // Send Welcome Email
  try {
    const tmpl = templates.welcomeEmail(name, 'customer');
    await sendEmail({ to: email, ...tmpl });
  } catch (err) {
    // Ignore email errors on registration so it doesn't fail
  }

  res.status(201).json(new ApiResponse(201, { userId: user._id }, 'Registration successful. Please verify your email.'));
});

// @desc    Register new worker
// @route   POST /api/v1/auth/register/worker
// @access  Public
const registerWorker = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw ApiError.conflict('User with this email or phone already exists');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'worker',
  });

  await WorkerProfile.create({ user: user._id });

  // Send verification OTP automatically
  await createAndSendOTP({ identifier: email, type: 'email', purpose: 'verify_email' });

  // Send Welcome Email
  try {
    const tmpl = templates.welcomeEmail(name, 'worker');
    await sendEmail({ to: email, ...tmpl });
  } catch (err) {
     // Ignore email errors
  }

  res.status(201).json(new ApiResponse(201, { userId: user._id }, 'Registration successful. Please verify your email.'));
});

// @desc    Login user (Email + Password)
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (user.isSuspended) {
    throw ApiError.forbidden(`Account suspended: ${user.suspendedReason}`);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json(new ApiResponse(200, {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      isProfileComplete: user.isProfileComplete
    },
    accessToken
  }, 'Login successful'));
});

// @desc    Send OTP
// @route   POST /api/v1/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { identifier, type, purpose } = req.body; // type = 'email' | 'phone', purpose = 'login' | 'verify_email' etc.
  
  const result = await createAndSendOTP({ identifier, type, purpose });
  res.status(200).json(new ApiResponse(200, null, result.message));
});

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { identifier, otp, purpose } = req.body;

  await verifyOTP({ identifier, otp, purpose });

  let user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

  if (purpose === 'verify_email' && user) {
    user.isEmailVerified = true;
    await user.save();
    return res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
  }

  if (purpose === 'login' && user) {
    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json(new ApiResponse(200, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isProfileComplete: user.isProfileComplete
      },
      accessToken
    }, 'Login successful'));
  }

  res.status(200).json(new ApiResponse(200, null, 'OTP verified successfully'));
});

// @desc    Google Login
// @route   POST /api/v1/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { token, role } = req.body; // FireBase token from client
    
    // We already have Firebase verify in auth middleware but here we verify manually to login/register
    const admin = require('../config/firebase');
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const { uid, email, name, picture } = decodedToken;
    
    let user = await User.findOne({ email });
    
    if (!user) {
        if (!role) {
            throw ApiError.badRequest('Role is required for new registration');
        }
        user = await User.create({
            name,
            email,
            googleId: uid,
            isEmailVerified: true,
            role,
            avatar: { url: picture || '' }
        });

        if(role === 'customer') await CustomerProfile.create({ user: user._id });
        if(role === 'worker') await WorkerProfile.create({ user: user._id });
        
        try {
            const tmpl = templates.welcomeEmail(name, role);
            await sendEmail({ to: email, ...tmpl });
        } catch (err) {}
    } else {
        // Update googleId if they registered with email previously
        if(!user.googleId) {
            user.googleId = uid;
            user.isEmailVerified = true;
            await user.save();
        }
    }

    if (user.isSuspended) {
        throw ApiError.forbidden(`Account suspended: ${user.suspendedReason}`);
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json(new ApiResponse(200, {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
            isProfileComplete: user.isProfileComplete
        },
        accessToken
    }, 'Google Login successful'));
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = undefined;
    user.isOnline = false;
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });
  }

  clearRefreshTokenCookie(res);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  let profile = null;
  if (user.role === 'customer') {
    profile = await CustomerProfile.findOne({ user: user._id });
  } else if (user.role === 'worker') {
    profile = await WorkerProfile.findOne({ user: user._id });
  }

  res.status(200).json(new ApiResponse(200, { user, profile }));
});

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        throw ApiError.unauthorized('No refresh token provided');
    }

    try {
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('+refreshToken');
        
        if (!user || !user.refreshToken) {
             throw ApiError.unauthorized('Invalid refresh token');
        }
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        if (hashedToken !== user.refreshToken) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        const accessToken = generateAccessToken(user._id, user.role);
        res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
    } catch(err) {
        clearRefreshTokenCookie(res);
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }
});


module.exports = {
  registerCustomer,
  registerWorker,
  login,
  googleLogin,
  logout,
  sendOtp,
  verifyOtp,
  getMe,
  refreshToken
};
