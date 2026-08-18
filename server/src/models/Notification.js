const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: [
        'booking_request', 'booking_accepted', 'booking_rejected', 'booking_started',
        'booking_completed', 'booking_cancelled', 'booking_reminder',
        'payment_received', 'payment_failed', 'refund_initiated', 'refund_completed',
        'new_review', 'review_reply',
        'verification_approved', 'verification_rejected', 'document_uploaded',
        'new_message', 'offer', 'worker_nearby',
        'sos_alert', 'account_suspended', 'account_activated',
        'trust_score_update', 'badge_earned', 'profile_view',
        'system', 'promotion'
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,

    // Reference entities
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    isRead: { type: Boolean, default: false },
    readAt: Date,

    // Delivery channels
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
    pushSent: { type: Boolean, default: false },

    // Action
    actionUrl: String,
    actionLabel: String,

    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
