const Review = require('../models/Review');
const Booking = require('../models/Booking');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { calculateReliabilityScore, detectReviewFraud } = require('../services/ai.service');
const { createNotification } = require('../services/notification.service');

// @desc    Create review for completed booking
// @route   POST /api/v1/reviews
// @access  Private (Customer)
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment, ratings, tags, photos } = req.body;

  if (!bookingId || !rating) {
    throw ApiError.badRequest('Booking ID and numerical rating (1-5) are required');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (!booking.customer.equals(req.user._id) && req.user.role !== 'admin') {
    throw ApiError.forbidden('Only the customer who booked this service can submit a review');
  }

  if (booking.status !== 'completed') {
    throw ApiError.badRequest('Reviews can only be submitted for completed bookings');
  }

  const existingReview = await Review.findOne({ booking: booking._id });
  if (existingReview) {
    throw ApiError.badRequest('A review has already been submitted for this booking');
  }

  // AI Fraud check
  const fraudAnalysis = await detectReviewFraud({
    reviewer: req.user._id,
    rating,
    comment,
    bookingId: booking._id,
  });

  const review = await Review.create({
    booking: booking._id,
    reviewer: req.user._id,
    worker: booking.worker,
    workerProfile: booking.workerProfile,
    rating: Number(rating),
    comment,
    ratings,
    tags,
    photos: photos || [],
    fraudScore: fraudAnalysis.fraudScore,
    fraudFlags: fraudAnalysis.flags,
    isFlagged: fraudAnalysis.isSuspicious,
  });

  // Update booking review status
  booking.isReviewed = true;
  booking.reviewId = review._id;
  await booking.save();

  // Recalculate Worker average rating & total reviews
  const reviewStats = await Review.aggregate([
    { $match: { workerProfile: booking.workerProfile, isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (reviewStats.length > 0) {
    const avgRating = Math.round(reviewStats[0].averageRating * 10) / 10;
    const totalReviews = reviewStats[0].totalReviews;

    await WorkerProfile.findByIdAndUpdate(booking.workerProfile, {
      averageRating: avgRating,
      totalReviews,
    });

    // Update AI trust score and badges
    const trustResult = await calculateReliabilityScore(booking.workerProfile);
    if (trustResult) {
      await WorkerProfile.findByIdAndUpdate(booking.workerProfile, {
        trustScore: trustResult.total,
        trustScoreBreakdown: trustResult.breakdown,
        badges: trustResult.badges,
        lastTrustScoreUpdate: new Date(),
      });
    }
  }

  // Notify worker of review
  await createNotification({
    recipientId: booking.worker,
    senderId: req.user._id,
    type: 'new_review',
    title: 'New Review Received',
    body: `${req.user.name} rated your service ${rating}/5 stars: "${comment ? comment.substring(0, 60) + '...' : 'Great job!'}"`,
    booking: booking._id,
    channels: { inApp: true, email: true },
  });

  res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

// @desc    Get all reviews for a worker
// @route   GET /api/v1/reviews/worker/:workerId
// @access  Public
const getWorkerReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

  const query = {
    $or: [{ workerProfile: req.params.workerId }, { worker: req.params.workerId }],
    isApproved: true,
  };

  const sortOptions = {};
  if (sortBy === 'rating_high') sortOptions.rating = -1;
  else if (sortBy === 'rating_low') sortOptions.rating = 1;
  else sortOptions.createdAt = -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('reviewer', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
      'Reviews fetched'
    )
  );
});

// @desc    Worker response to a review
// @route   POST /api/v1/reviews/:id/reply
// @access  Private (Worker)
const replyToReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;

  if (!reply) throw ApiError.badRequest('Reply text is required');

  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  if (!review.worker.equals(req.user._id) && req.user.role !== 'admin') {
    throw ApiError.forbidden('Only the reviewed worker can reply to this review');
  }

  review.workerReply = reply;
  review.workerRepliedAt = new Date();
  await review.save();

  res.status(200).json(new ApiResponse(200, review, 'Reply posted successfully'));
});

// @desc    Vote review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private
const voteHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');

  const alreadyVoted = review.helpfulVotes.some((id) => id.equals(req.user._id));

  if (alreadyVoted) {
    review.helpfulVotes = review.helpfulVotes.filter((id) => !id.equals(req.user._id));
    review.helpfulCount = Math.max(0, review.helpfulCount - 1);
  } else {
    review.helpfulVotes.push(req.user._id);
    review.helpfulCount += 1;
  }

  await review.save();

  res.status(200).json(
    new ApiResponse(200, { helpfulCount: review.helpfulCount, hasVoted: !alreadyVoted }, 'Vote updated')
  );
});

module.exports = {
  createReview,
  getWorkerReviews,
  replyToReview,
  voteHelpful,
};
