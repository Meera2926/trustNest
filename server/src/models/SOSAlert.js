const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'worker'] },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
      address: String,
    },
    message: { type: String, default: 'SOS Alert! I need immediate help.' },
    alertType: {
      type: String,
      enum: ['emergency', 'harassment', 'theft', 'accident', 'medical', 'safety'],
      default: 'emergency',
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved', 'false_alarm'],
      default: 'active',
    },
    notifiedContacts: [String],  // phone numbers notified
    notifiedAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acknowledgedAt: Date,
    resolvedAt: Date,
    resolutionNote: String,
  },
  { timestamps: true }
);

sosAlertSchema.index({ location: '2dsphere' });
sosAlertSchema.index({ sender: 1, status: 1 });
sosAlertSchema.index({ status: 1, createdAt: -1 });

const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);
module.exports = SOSAlert;
