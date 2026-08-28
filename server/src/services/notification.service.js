const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail, templates } = require('./email.service');
const logger = require('../utils/logger');

let io; // Socket.io instance (set from socket.js)

const setIO = (socketIO) => { io = socketIO; };

/**
 * Create notification and deliver via all configured channels
 */
const createNotification = async ({
  recipientId,
  senderId = null,
  type,
  title,
  body,
  data = {},
  booking = null,
  worker = null,
  channels = { inApp: true },
  actionUrl = '',
  priority = 'normal',
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      body,
      data,
      booking,
      worker,
      channels,
      actionUrl,
      priority,
    });

    // In-App: emit via Socket.io if user is connected
    if (channels.inApp && io) {
      io.to(`user:${recipientId}`).emit('notification', {
        ...notification.toObject(),
        sender: senderId,
      });
    }

    // Email notification
    if (channels.email) {
      const recipient = await User.findById(recipientId).select('email name notificationPreferences');
      if (recipient?.email && recipient.notificationPreferences?.email) {
        try {
          await sendEmail({
            to: recipient.email,
            subject: title,
            html: `<div style="font-family:Arial;padding:20px;"><h3>${title}</h3><p>${body}</p>${actionUrl ? `<a href="${actionUrl}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">View Details</a>` : ''}</div>`,
          });
          notification.emailSent = true;
          await notification.save();
        } catch (emailError) {
          logger.warn(`Email notification failed for user ${recipientId}: ${emailError.message}`);
        }
      }
    }

    return notification;
  } catch (error) {
    logger.error('Create notification error:', error.message);
  }
};

// Shorthand notification creators
const notifyBookingRequest = (workerId, customerId, booking) =>
  createNotification({
    recipientId: workerId,
    senderId: customerId,
    type: 'booking_request',
    title: '📋 New Booking Request',
    body: `You have a new booking request for ${booking.serviceLabel || booking.service}`,
    booking: booking._id,
    channels: { inApp: true, email: true },
    actionUrl: `/dashboard/worker/bookings/${booking._id}`,
    priority: 'high',
  });

const notifyBookingAccepted = (customerId, workerId, booking) =>
  createNotification({
    recipientId: customerId,
    senderId: workerId,
    type: 'booking_accepted',
    title: '✅ Booking Accepted!',
    body: `Your booking #${booking.bookingId} has been accepted`,
    booking: booking._id,
    channels: { inApp: true, email: true },
    actionUrl: `/bookings/${booking._id}`,
    priority: 'high',
  });

const notifyBookingRejected = (customerId, workerId, booking) =>
  createNotification({
    recipientId: customerId,
    senderId: workerId,
    type: 'booking_rejected',
    title: '❌ Booking Rejected',
    body: `Your booking request was not accepted. Try booking another worker.`,
    booking: booking._id,
    channels: { inApp: true, email: true },
    actionUrl: `/search`,
    priority: 'high',
  });

const notifyBookingCompleted = (customerId, workerId, booking) =>
  createNotification({
    recipientId: customerId,
    senderId: workerId,
    type: 'booking_completed',
    title: '🎉 Booking Completed',
    body: `Your booking #${booking.bookingId} is complete. Please leave a review!`,
    booking: booking._id,
    channels: { inApp: true, email: true },
    actionUrl: `/bookings/${booking._id}/review`,
    priority: 'normal',
  });

const notifyPaymentReceived = (workerId, amount) =>
  createNotification({
    recipientId: workerId,
    type: 'payment_received',
    title: '💰 Payment Received',
    body: `₹${amount} has been credited for your completed booking.`,
    channels: { inApp: true },
    priority: 'normal',
  });

const notifyVerificationApproved = (workerId) =>
  createNotification({
    recipientId: workerId,
    type: 'verification_approved',
    title: '🎉 Profile Verified!',
    body: 'Congratulations! Your profile has been verified. You can now receive bookings.',
    channels: { inApp: true, email: true },
    actionUrl: '/dashboard/worker',
    priority: 'high',
  });

const notifyVerificationRejected = (workerId, reason) =>
  createNotification({
    recipientId: workerId,
    type: 'verification_rejected',
    title: '⚠️ Verification Issue',
    body: `Your documents need attention: ${reason}`,
    channels: { inApp: true, email: true },
    actionUrl: '/dashboard/worker/documents',
    priority: 'high',
  });

module.exports = {
  setIO,
  createNotification,
  notifyBookingRequest,
  notifyBookingAccepted,
  notifyBookingRejected,
  notifyBookingCompleted,
  notifyPaymentReceived,
  notifyVerificationApproved,
  notifyVerificationRejected,
};
