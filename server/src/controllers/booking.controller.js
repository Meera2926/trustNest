const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const CustomerProfile = require('../models/CustomerProfile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('../services/notification.service');

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private (Customer)
const createBooking = asyncHandler(async (req, res) => {
  const {
    workerId,
    service,
    serviceLabel,
    startDate,
    endDate,
    startTime,
    endTime,
    duration = 2,
    serviceAddress,
    specialRequirements,
    bookingType = 'scheduled',
  } = req.body;

  if (!workerId || !service || !startDate) {
    throw ApiError.badRequest('Worker, service, and start date are required');
  }

  // Find worker profile
  const workerProfile = await WorkerProfile.findOne({
    $or: [{ _id: workerId }, { user: workerId }]
  }).populate('user', 'name email phone');

  if (!workerProfile) {
    throw ApiError.notFound('Worker not found');
  }

  // Calculate pricing
  const hourlyRate = workerProfile.hourlyRate || 25;
  const totalHours = Math.max(1, Number(duration));
  const subtotal = hourlyRate * totalHours;
  const platformFeeRate = Number(process.env.PLATFORM_FEE_PERCENT || 10) / 100;
  const platformFee = Math.round(subtotal * platformFeeRate);
  const tax = Math.round((subtotal + platformFee) * 0.05); // 5% GST/Tax
  const totalAmount = subtotal + platformFee + tax;

  const booking = await Booking.create({
    customer: req.user._id,
    worker: workerProfile.user._id,
    workerProfile: workerProfile._id,
    service,
    serviceLabel: serviceLabel || service,
    bookingType,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : new Date(startDate),
    startTime: startTime || '10:00',
    endTime: endTime || '12:00',
    duration: totalHours,
    serviceAddress: serviceAddress || { city: 'Default' },
    specialRequirements,
    hourlyRate,
    totalHours,
    subtotal,
    platformFee,
    tax,
    totalAmount,
    status: 'pending',
    timeline: [
      {
        status: 'pending',
        note: 'Booking requested by customer',
        updatedBy: req.user._id,
        timestamp: new Date(),
      },
    ],
  });

  // Notify worker of new booking request
  await createNotification({
    recipientId: workerProfile.user._id,
    senderId: req.user._id,
    type: 'booking_request',
    title: 'New Booking Request',
    body: `${req.user.name} has requested a booking for ${serviceLabel || service} on ${new Date(startDate).toLocaleDateString()}.`,
    booking: booking._id,
    channels: { inApp: true, email: true },
    actionUrl: `/worker/bookings/${booking._id}`,
  });

  res.status(201).json(new ApiResponse(201, booking, 'Booking created successfully'));
});

// @desc    Get user's bookings (customer or worker)
// @route   GET /api/v1/bookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  if (req.user.role === 'worker') {
    query.worker = req.user._id;
  } else if (req.user.role === 'customer') {
    query.customer = req.user._id;
  }

  if (status) {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('worker', 'name email phone avatar')
      .populate('workerProfile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
      'Bookings retrieved successfully'
    )
  );
});

// @desc    Get single booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name email phone avatar')
    .populate('worker', 'name email phone avatar')
    .populate('workerProfile');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  const isCustomer = booking.customer._id.equals(req.user._id);
  const isWorker = booking.worker._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isWorker && !isAdmin) {
    throw ApiError.forbidden('You are not authorized to view this booking');
  }

  res.status(200).json(new ApiResponse(200, booking, 'Booking details retrieved'));
});

// @desc    Update booking status (accept, reject, start, complete, cancel)
// @route   PATCH /api/v1/bookings/:id/status
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, note, cancellationReason } = req.body;

  const validStatuses = ['accepted', 'rejected', 'active', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  const isCustomer = booking.customer.equals(req.user._id);
  const isWorker = booking.worker.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isCustomer && !isWorker && !isAdmin) {
    throw ApiError.forbidden('Unauthorized to update this booking');
  }

  // State transition authorization rules
  if ((status === 'accepted' || status === 'rejected' || status === 'active') && !isWorker && !isAdmin) {
    throw ApiError.forbidden('Only the assigned worker can accept, reject, or start a booking');
  }

  booking.status = status;
  if (status === 'cancelled') {
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = cancellationReason || note || 'Cancelled by user';
    booking.cancelledAt = new Date();
  }

  booking.timeline.push({
    status,
    note: note || `Status updated to ${status}`,
    updatedBy: req.user._id,
    timestamp: new Date(),
  });

  // If completed, update metrics
  if (status === 'completed') {
    await Promise.all([
      WorkerProfile.updateOne(
        { user: booking.worker },
        { $inc: { completedBookings: 1, totalBookings: 1 } }
      ),
      CustomerProfile.updateOne(
        { user: booking.customer },
        { $inc: { completedBookings: 1, totalBookings: 1, totalSpent: booking.totalAmount || 0 } }
      ),
    ]);
  }

  await booking.save();

  // Notify counterpart
  const recipientId = isCustomer ? booking.worker : booking.customer;
  await createNotification({
    recipientId,
    senderId: req.user._id,
    type: `booking_${status}`,
    title: `Booking ${status.toUpperCase()}`,
    body: `Booking #${booking.bookingId} status has been updated to ${status}.`,
    booking: booking._id,
    channels: { inApp: true, email: true },
    actionUrl: `/customer/bookings/${booking._id}`,
  });

  res.status(200).json(new ApiResponse(200, booking, `Booking marked as ${status}`));
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
};
