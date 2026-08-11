const mongoose = require('mongoose');

const SERVICES = [
  'house_maid', 'cook', 'driver', 'babysitter',
  'patient_care', 'elder_care', 'nurse', 'laundry',
  'cleaner', 'gardener', 'pet_care', 'custom'
];

const documentSchema = new mongoose.Schema({
  type: { type: String, enum: ['government_id', 'police_verification', 'certificate', 'introduction_video', 'photo'] },
  url: String,
  publicId: String,
  name: String,
  verifiedAt: Date,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectedReason: String,
}, { _id: false });

const referenceSchema = new mongoose.Schema({
  employerName: String,
  relationship: String,
  phone: String,
  email: String,
  duration: String,
  role: String,
  canContact: { type: Boolean, default: true },
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  startTime: { type: String, default: '08:00' },
  endTime: { type: String, default: '20:00' },
  isAvailableNow: { type: Boolean, default: false },
  isFullTime: { type: Boolean, default: false },
  isPartTime: { type: Boolean, default: false },
  isLiveIn: { type: Boolean, default: false },
}, { _id: false });

const workerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Basic Info
    age: { type: Number, min: 18, max: 70 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: Date,
    bio: { type: String, maxlength: 1000 },
    photo: { url: String, publicId: String },
    introductionVideo: { url: String, publicId: String },

    // Professional
    services: [{ type: String, enum: SERVICES }],
    experience: { type: Number, min: 0, max: 50, default: 0 }, // years
    languages: [{ type: String }],
    education: String,
    skills: [String],

    // Rates
    hourlyRate: { type: Number, min: 0 },
    dailyRate: { type: Number, min: 0 },
    monthlyRate: { type: Number, min: 0 },
    expectedSalary: { type: Number, min: 0 },
    negotiable: { type: Boolean, default: true },

    // Location
    address: {
      street: String,
      city: { type: String, required: true },
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    workingRadius: { type: Number, default: 10, enum: [2, 5, 10, 15, 25, 50] }, // km

    // Availability
    availability: availabilitySchema,

    // Documents
    documents: [documentSchema],
    governmentIdType: { type: String, enum: ['aadhaar', 'pan', 'passport', 'voter_id', 'driving_license'] },
    governmentIdNumber: { type: String, select: false },

    // Emergency Contact
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },

    // References
    references: [referenceSchema],

    // Verification Status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected', 'suspended'],
      default: 'pending',
    },
    verificationNote: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    policeVerificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'not_submitted',
    },
    faceMatchStatus: {
      type: String,
      enum: ['not_done', 'matched', 'failed'],
      default: 'not_done',
    },

    // AI Trust Score
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    trustScoreBreakdown: {
      verificationScore: { type: Number, default: 0 },
      ratingsScore: { type: Number, default: 0 },
      workHistoryScore: { type: Number, default: 0 },
      activityScore: { type: Number, default: 0 },
      attendanceScore: { type: Number, default: 0 },
      responseScore: { type: Number, default: 0 },
    },
    lastTrustScoreUpdate: Date,

    // Stats
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // avg minutes
    completionRate: { type: Number, default: 0 }, // percentage
    attendanceRate: { type: Number, default: 100 }, // percentage

    // Badges & Featured
    badges: [{
      type: String,
      enum: ['top_rated', 'verified', 'background_checked', 'police_verified', 'experienced', 'quick_responder', 'highly_recommended']
    }],
    isFeatured: { type: Boolean, default: false },
    featuredUntil: Date,

    // AI Review Summary
    aiReviewSummary: { type: String },
    aiReviewSummaryUpdatedAt: Date,

    // Views
    profileViews: { type: Number, default: 0 },
    searchAppearances: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geospatial index for location-based search
workerProfileSchema.index({ location: '2dsphere' });
workerProfileSchema.index({ services: 1, status: 1 });
workerProfileSchema.index({ 'address.city': 1, status: 1 });
workerProfileSchema.index({ trustScore: -1, status: 1 });
workerProfileSchema.index({ averageRating: -1, status: 1 });
workerProfileSchema.index({ user: 1 });

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);
module.exports = WorkerProfile;
