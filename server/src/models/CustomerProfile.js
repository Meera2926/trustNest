const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, maxlength: 500 },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    preferences: {
      preferredGender: { type: String, enum: ['male', 'female', 'no_preference'], default: 'no_preference' },
      preferredLanguages: [String],
      maxBudgetHourly: Number,
      maxBudgetMonthly: Number,
      searchRadius: { type: Number, default: 10 },
    },
    savedAddresses: [{
      label: String,
      address: String,
      location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
    }],
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    // Emergency SOS
    sosContacts: [{
      name: String,
      phone: String,
      relationship: String,
    }],
    isTrustedCustomer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

customerProfileSchema.index({ location: '2dsphere' });
customerProfileSchema.index({ user: 1 });

const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema);
module.exports = CustomerProfile;
