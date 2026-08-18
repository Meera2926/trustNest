const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
    note: { type: String, maxlength: 200 },
    tags: [String],
  },
  { timestamps: true }
);

favoriteSchema.index({ customer: 1, worker: 1 }, { unique: true });
favoriteSchema.index({ customer: 1, createdAt: -1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
