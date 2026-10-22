const {
  getAIWorkerRecommendations,
  calculateReliabilityScore,
  generateReviewSummary,
  getAIChatResponse,
} = require('../services/ai.service');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get AI-driven worker recommendations
// @route   POST /api/v1/ai/recommendations
// @access  Private (Customer)
const recommendWorkers = asyncHandler(async (req, res) => {
  const { service, location, budget, filters } = req.body;

  if (!service) {
    throw ApiError.badRequest('Service category is required for AI recommendations');
  }

  const recommendations = await getAIWorkerRecommendations({
    customerId: req.user?._id,
    service,
    location,
    budget,
    filters: filters || {},
  });

  res.status(200).json(
    new ApiResponse(200, recommendations, 'AI recommendations generated successfully')
  );
});

// @desc    Interactive AI Assistant Chat for service queries
// @route   POST /api/v1/ai/chat
// @access  Public / Optional Auth
const chatWithAssistant = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    throw ApiError.badRequest('Message is required');
  }

  try {
    const reply = await getAIChatResponse({
      userId: req.user?._id,
      userRole: req.user?.role || 'guest',
      message,
      conversationHistory,
    });

    res.status(200).json(new ApiResponse(200, { reply }, 'AI response generated'));
  } catch (err) {
    // Graceful fallback if Gemini API key isn't provided in development
    res.status(200).json(
      new ApiResponse(
        200,
        {
          reply: `Hello! I am your TrustNest Assistant. I can help you find verified cleaners, plumbers, electricians, and technicians in your area. How can I assist you today?`,
        },
        'Fallback assistant response'
      )
    );
  }
});

// @desc    Generate AI review summary for a worker profile
// @route   POST /api/v1/ai/workers/:id/summarize-reviews
// @access  Private (Admin / Worker)
const summarizeWorkerReviews = asyncHandler(async (req, res) => {
  const workerProfile = await WorkerProfile.findById(req.params.id);
  if (!workerProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  const summary = await generateReviewSummary(workerProfile._id);

  if (summary) {
    workerProfile.aiReviewSummary = summary;
    workerProfile.aiReviewSummaryUpdatedAt = new Date();
    await workerProfile.save();
  }

  res.status(200).json(
    new ApiResponse(200, { summary }, 'AI review summary generated successfully')
  );
});

// @desc    Calculate and retrieve worker reliability trust score breakdown
// @route   GET /api/v1/ai/workers/:id/trust-score
// @access  Public
const getWorkerTrustScore = asyncHandler(async (req, res) => {
  const result = await calculateReliabilityScore(req.params.id);
  if (!result) {
    throw ApiError.notFound('Worker profile not found');
  }

  // Update worker profile with fresh score and badges
  await WorkerProfile.findByIdAndUpdate(req.params.id, {
    trustScore: result.total,
    trustScoreBreakdown: result.breakdown,
    badges: result.badges,
    lastTrustScoreUpdate: new Date(),
  });

  res.status(200).json(new ApiResponse(200, result, 'Trust score calculated'));
});

module.exports = {
  recommendWorkers,
  chatWithAssistant,
  summarizeWorkerReviews,
  getWorkerTrustScore,
};
