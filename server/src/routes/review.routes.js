const express = require('express');
const router = express.Router();
const {
  createReview,
  getWorkerReviews,
  replyToReview,
  voteHelpful,
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Public
router.get('/worker/:workerId', getWorkerReviews);

// Protected
router.use(protect);
router.post('/', authorize('customer', 'admin'), createReview);
router.post('/:id/reply', authorize('worker', 'admin'), replyToReview);
router.post('/:id/helpful', voteHelpful);

module.exports = router;
