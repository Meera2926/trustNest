const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameHindi: String,
    description: String,
    icon: String,        // emoji or icon name
    image: String,       // Cloudinary URL
    category: {
      type: String,
      enum: ['household', 'care', 'transport', 'specialized', 'custom'],
      default: 'household',
    },
    isActive: { type: Boolean, default: true },
    isCustom: { type: Boolean, default: false },
    baseHourlyRate: { type: Number, default: 0 },
    baseDailyRate: { type: Number, default: 0 },
    baseMonthlyRate: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalWorkers: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    tags: [String],
    sortOrder: { type: Number, default: 0 },
    color: String,      // hex color for UI
    gradient: String,   // CSS gradient
  },
  { timestamps: true }
);

serviceSchema.index({ key: 1 });
serviceSchema.index({ isActive: 1, sortOrder: 1 });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
