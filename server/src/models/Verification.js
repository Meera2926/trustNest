const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
    officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assigned verification officer
    assignedAt: Date,

    // Document checks
    checks: {
      governmentId: {
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        documentUrl: String,
        documentType: String,
        reviewNote: String,
        reviewedAt: Date,
      },
      policeVerification: {
        status: { type: String, enum: ['not_submitted', 'pending', 'approved', 'rejected'], default: 'not_submitted' },
        certificateUrl: String,
        certificateNumber: String,
        issuedBy: String,
        reviewNote: String,
        reviewedAt: Date,
      },
      faceMatch: {
        status: { type: String, enum: ['pending', 'matched', 'failed', 'manual_review'], default: 'pending' },
        selfieUrl: String,
        idPhotoUrl: String,
        matchScore: Number, // 0-100
        reviewNote: String,
        reviewedAt: Date,
      },
      certificates: [{
        name: String,
        url: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        reviewNote: String,
        reviewedAt: Date,
      }],
    },

    // Overall
    overallStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'approved', 'rejected', 'resubmission_required'],
      default: 'pending',
    },
    rejectionReason: String,
    approvedAt: Date,
    rejectedAt: Date,
    notes: String, // Officer notes
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  },
  { timestamps: true }
);

verificationSchema.index({ worker: 1 });
verificationSchema.index({ officer: 1, overallStatus: 1 });
verificationSchema.index({ overallStatus: 1, createdAt: 1 });

const Verification = mongoose.model('Verification', verificationSchema);
module.exports = Verification;
