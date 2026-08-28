const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send failed to ${to}: ${error.message}`);
    throw error;
  }
};

// Email Templates
const templates = {
  otp: (otp, purpose) => ({
    subject: `TrustNest - Your OTP: ${otp}`,
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#ec4899);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-1px;">🏠 TrustNest</h1>
          <p style="margin:8px 0 0;opacity:.8;font-size:14px;">Find Trusted Caregivers Near You</p>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="color:#6366f1;margin:0 0 16px;">Verification Code</h2>
          <p style="color:#a1a1aa;margin:0 0 24px;">Use the OTP below to ${purpose}. Valid for 10 minutes.</p>
          <div style="background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(236,72,153,.1));border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
            <span style="font-size:48px;font-weight:900;letter-spacing:12px;color:#6366f1;">${otp}</span>
          </div>
          <p style="color:#71717a;font-size:13px;margin:16px 0 0;">Never share this OTP with anyone. TrustNest will never ask for it.</p>
        </div>
        <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
          <p style="color:#52525b;font-size:12px;margin:0;">© 2024 TrustNest. All rights reserved.</p>
        </div>
      </div>`,
  }),

  bookingConfirmation: (booking, workerName) => ({
    subject: `TrustNest - Booking Confirmed #${booking.bookingId}`,
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">✅ Booking Confirmed!</h1>
        </div>
        <div style="padding:32px;">
          <p>Your booking <strong style="color:#6366f1;">#${booking.bookingId}</strong> with <strong>${workerName}</strong> has been confirmed.</p>
          <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:20px;margin:20px 0;">
            <p style="margin:4px 0;color:#a1a1aa;">Service: <strong style="color:#fff;">${booking.serviceLabel || booking.service}</strong></p>
            <p style="margin:4px 0;color:#a1a1aa;">Date: <strong style="color:#fff;">${new Date(booking.startDate).toLocaleDateString('en-IN')}</strong></p>
            <p style="margin:4px 0;color:#a1a1aa;">Amount: <strong style="color:#10b981;">₹${booking.totalAmount}</strong></p>
          </div>
          <p style="color:#a1a1aa;font-size:14px;">Log in to your TrustNest account to track your booking in real-time.</p>
        </div>
      </div>`,
  }),

  welcomeEmail: (name, role) => ({
    subject: `Welcome to TrustNest, ${name}! 🏠`,
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#ec4899);padding:40px 32px;text-align:center;">
          <h1 style="margin:0;font-size:28px;">Welcome to TrustNest! 🎉</h1>
        </div>
        <div style="padding:40px 32px;">
          <h2 style="color:#6366f1;">Hi ${name},</h2>
          <p style="color:#a1a1aa;line-height:1.7;">You have successfully registered as a <strong style="color:#fff;">${role}</strong> on TrustNest — India's most trusted platform for verified household workers.</p>
          ${role === 'worker' ? '<p style="color:#f59e0b;">⚡ Complete your profile and submit documents for verification to start receiving bookings!</p>' : '<p style="color:#10b981;">🔍 Start searching for verified workers near you right now!</p>'}
        </div>
      </div>`,
  }),

  passwordReset: (resetUrl) => ({
    subject: 'TrustNest - Password Reset Request',
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">🔐 Password Reset</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#a1a1aa;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#ec4899);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;margin:20px 0;">Reset Password</a>
          <p style="color:#71717a;font-size:12px;">If you did not request this, ignore this email.</p>
        </div>
      </div>`,
  }),

  verificationApproved: (workerName) => ({
    subject: '🎉 TrustNest - Your Profile is Verified!',
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f1a;color:#fff;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">✅ Profile Verified!</h1>
        </div>
        <div style="padding:32px;">
          <p>Congratulations <strong>${workerName}</strong>! Your TrustNest profile has been verified.</p>
          <p style="color:#10b981;">You now have the <strong>Verified Badge</strong> and will appear in customer searches. Start receiving bookings!</p>
        </div>
      </div>`,
  }),
};

module.exports = { sendEmail, templates };
