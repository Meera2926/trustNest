const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 2000 },

    // Detailed Ratings
    ratings: {
      punctuality: { type: Number, min: 1, max: 5 },
      quality: { type: Number, min: 1, max: 5 },
      behavior: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },

    // Tags
    tags: [{
      type: String,
      enum: ['punctual', 'trustworthy', 'skilled', 'professional', 'friendly',
             'hardworking', 'honest', 'reliable', 'clean', 'gentle_with_kids',
             'good_with_elderly', 'experienced', 'language_skills']
    }],

    // Photos with review
    photos: [{ url: String, publicId: String }],

    // Moderation
    isVerified: { type: Boolean, default: true }, // verified booking review
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
    isApproved: { type: Boolean, default: true },

    // AI Fraud Detection
    fraudScore: { type: Number, default: 0 }, // 0-100, higher = more suspicious
    fraudFlags: [String],

    // Helpful
    helpfulCount: { type: Number, default: 0 },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Worker Reply
    workerReply: { type: String, maxlength: 1000 },
    workerRepliedAt: Date,
  },
  { timestamps: true }
);

reviewSchema.index({ workerProfile: 1, isApproved: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
