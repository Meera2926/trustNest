const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All booking routes require authentication
router.use(protect);

router.post('/', authorize('customer', 'admin'), createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
