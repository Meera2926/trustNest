const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, unique: true }, // TNP-XXXXXX
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Amounts
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    workerPayout: { type: Number }, // after platform fee
    currency: { type: String, default: 'INR' },

    // Razorpay
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // Status
    status: {
      type: String,
      enum: ['created', 'pending', 'completed', 'failed', 'refunded', 'partial_refund'],
      default: 'created',
    },
    method: { type: String, enum: ['razorpay', 'upi', 'card', 'netbanking', 'cash', 'wallet'] },

    // Invoice
    invoiceId: String,
    invoiceUrl: String,

    // Refund
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,

    // Metadata
    notes: mongoose.Schema.Types.Mixed,
    failureReason: String,
    paidAt: Date,
  },
  { timestamps: true }
);

paymentSchema.pre('save', async function (next) {
  if (!this.paymentId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentId = `TNP-${String(count + 1).padStart(8, '0')}`;
  }
  next();
});

paymentSchema.index({ booking: 1 });
paymentSchema.index({ customer: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
