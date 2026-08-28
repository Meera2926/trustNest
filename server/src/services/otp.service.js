const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OTPVerification = require('../models/OTPVerification');
const { sendEmail, templates } = require('./email.service');
const ApiError = require('../utils/ApiError');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const createAndSendOTP = async ({ identifier, type, purpose }) => {
  // Check rate limiting: max 3 OTPs per 10 minutes
  const recent = await OTPVerification.countDocuments({
    identifier,
    purpose,
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
  });
  if (recent >= 3) {
    throw ApiError.tooManyRequests('Too many OTP requests. Please wait 10 minutes.');
  }

  // Invalidate old OTPs
  await OTPVerification.deleteMany({ identifier, purpose });

  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await OTPVerification.create({
    identifier,
    type,
    purpose,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + parseInt(process.env.OTP_EXPIRE || 10) * 60 * 1000),
  });

  if (type === 'email') {
    const purposeLabels = {
      register: 'complete registration',
      login: 'log in',
      forgot_password: 'reset your password',
      verify_email: 'verify your email',
      verify_phone: 'verify your phone',
    };
    const tmpl = templates.otp(otp, purposeLabels[purpose] || purpose);
    await sendEmail({ to: identifier, ...tmpl });
  }
  // For phone OTP: integrate Twilio here
  // else if (type === 'phone') { await twilioClient.messages.create(...) }

  return { message: `OTP sent to ${type === 'email' ? identifier : 'your phone'}` };
};

const verifyOTP = async ({ identifier, otp, purpose }) => {
  const record = await OTPVerification.findOne({ identifier, purpose, isUsed: false }).select('+otp');

  if (!record) {
    throw ApiError.badRequest('OTP not found or already used. Request a new one.');
  }

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    throw ApiError.badRequest('OTP expired. Please request a new one.');
  }

  if (record.attempts >= record.maxAttempts) {
    await record.deleteOne();
    throw ApiError.tooManyRequests('Too many failed attempts. Request a new OTP.');
  }

  const isValid = await bcrypt.compare(otp, record.otp);
  if (!isValid) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest(`Incorrect OTP. ${record.maxAttempts - record.attempts} attempts remaining.`);
  }

  // Mark as used
  record.isUsed = true;
  await record.save();

  return true;
};

module.exports = { createAndSendOTP, verifyOTP };
