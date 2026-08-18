const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

    category: {
      type: String,
      enum: [
        'fake_profile', 'fraud', 'harassment', 'theft', 'no_show',
        'poor_service', 'fake_review', 'duplicate_account', 'inappropriate_behavior',
        'spam', 'safety_concern', 'other'
      ],
      required: true,
    },
    description: { type: String, required: true, maxlength: 2000 },
    evidence: [{ url: String, publicId: String, type: String }],

    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'dismissed', 'escalated'],
      default: 'open',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    resolution: String,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actionTaken: {
      type: String,
      enum: ['warning_issued', 'account_suspended', 'account_banned', 'no_action', 'other'],
    },

    // AI Fraud Detection
    isAutomated: { type: Boolean, default: false },
    aiConfidenceScore: Number,
    aiFlags: [String],
  },
  { timestamps: true }
);

complaintSchema.index({ reportedUser: 1, status: 1 });
complaintSchema.index({ reporter: 1 });
complaintSchema.index({ status: 1, priority: 1, createdAt: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
