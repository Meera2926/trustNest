const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  status: String,
  note: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true }, // TN-2024-XXXXXX
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile' },
    service: { type: String, required: true },
    serviceLabel: String,

    // Schedule
    bookingType: { type: String, enum: ['instant', 'scheduled', 'recurring'], default: 'scheduled' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    startTime: String,
    endTime: String,
    duration: Number, // hours
    isRecurring: { type: Boolean, default: false },
    recurringPattern: { type: String, enum: ['daily', 'weekly', 'monthly'] },

    // Location
    serviceAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      fullAddress: String,
      location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
      },
    },

    // Status Flow
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled', 'disputed'],
      default: 'pending',
    },
    timeline: [timelineSchema],

    // Pricing
    hourlyRate: Number,
    totalHours: Number,
    subtotal: Number,
    platformFee: Number,
    tax: Number,
    discount: Number,
    totalAmount: { type: Number },
    currency: { type: String, default: 'INR' },

    // Payment
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },
    paymentMethod: { type: String, enum: ['razorpay', 'cash', 'upi', 'bank'] },
    paymentId: String, // Razorpay payment ID

    // Cancellation
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
    cancelledAt: Date,

    // Review
    isReviewed: { type: Boolean, default: false },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },

    // Worker Response
    workerResponseDeadline: Date,
    workerNotes: String,
    customerNotes: String,

    // Special Requirements
    specialRequirements: String,
    numberOfRooms: Number,
    hasChildren: Boolean,
    hasPets: Boolean,
    hasElderlyPerson: Boolean,
    hasPatient: Boolean,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate booking ID
bookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    const year = new Date().getFullYear();
    this.bookingId = `TN-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ worker: 1, status: 1 });
bookingSchema.index({ status: 1, startDate: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
