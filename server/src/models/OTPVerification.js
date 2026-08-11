const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true }, // email or phone
    type: { type: String, enum: ['email', 'phone'], required: true },
    purpose: {
      type: String,
      enum: ['register', 'login', 'forgot_password', 'verify_email', 'verify_phone'],
      required: true,
    },
    otp: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-expire documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ identifier: 1, purpose: 1 });

const OTPVerification = mongoose.model('OTPVerification', otpSchema);
module.exports = OTPVerification;
