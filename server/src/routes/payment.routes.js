const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentByBooking,
  processRefund,
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All payment endpoints are protected
router.use(protect);

router.post('/create-order', authorize('customer', 'admin'), createPaymentOrder);
router.post('/verify', authorize('customer', 'admin'), verifyPayment);
router.get('/booking/:bookingId', getPaymentByBooking);
router.post('/:id/refund', authorize('admin'), processRefund);

module.exports = router;
