const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    type: {
      type: String,
      enum: ['text', 'voice', 'image', 'document', 'location', 'booking_update', 'system'],
      default: 'text',
    },
    content: { type: String, maxlength: 5000 },

    // Media
    media: {
      url: String,
      publicId: String,
      mimeType: String,
      duration: Number, // seconds for voice
      size: Number,     // bytes
      thumbnail: String,
    },

    // Location share
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
      address: String,
    },

    // Read receipts
    isRead: { type: Boolean, default: false },
    readAt: Date,
    deliveredAt: Date,

    // Reactions
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: String,
    }],

    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // For system messages
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
