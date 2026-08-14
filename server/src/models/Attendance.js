const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    date: { type: Date, required: true },
    checkIn: {
      time: Date,
      location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
      address: String,
      photo: String,
    },
    checkOut: {
      time: Date,
      location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
      address: String,
      photo: String,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'on_leave'],
      default: 'present',
    },
    workingHours: Number, // calculated on check-out
    isVerified: { type: Boolean, default: false },
    notes: String,
    leaveType: { type: String, enum: ['sick', 'personal', 'emergency', 'planned'] },
  },
  { timestamps: true }
);

attendanceSchema.index({ worker: 1, date: -1 });
attendanceSchema.index({ booking: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
