const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['worker', 'customer'] },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: String,
    accuracy: Number,   // GPS accuracy in meters
    speed: Number,      // km/h
    heading: Number,    // degrees
    altitude: Number,
    isSharing: { type: Boolean, default: false },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // live tracking during booking
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL index: auto-delete old location records after 24 hours (keeps only live data)
locationSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 86400 });
locationSchema.index({ location: '2dsphere' });
locationSchema.index({ user: 1, recordedAt: -1 });

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;
