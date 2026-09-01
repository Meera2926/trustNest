const { GoogleGenerativeAI } = require('@google/generative-ai');
const WorkerProfile = require('../models/WorkerProfile');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * ============================================================
 * 1. AI WORKER RECOMMENDATION
 * Weighted multi-factor scoring algorithm
 * ============================================================
 */
const getAIWorkerRecommendations = async ({ customerId, service, location, budget, filters = {} }) => {
  try {
    const query = {
      status: 'verified',
      services: service,
    };

    // Location-based radius query
    if (location?.coordinates) {
      const radius = filters.radius || 10;
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: location.coordinates },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      };
    }

    if (filters.gender) query.gender = filters.gender;
    if (filters.minExperience) query.experience = { $gte: filters.minExperience };
    if (budget?.max) query.hourlyRate = { $lte: budget.max };
    if (filters.languages?.length) query.languages = { $in: filters.languages };
    if (filters.verifiedOnly) query['checks.governmentId.status'] = 'approved';

    const workers = await WorkerProfile.find(query)
      .populate('user', 'name avatar isOnline lastSeen')
      .limit(50)
      .lean();

    // Get customer's past bookings for personalization
    const pastBookings = await Booking.find({
      customer: customerId,
      status: 'completed',
    }).select('worker').lean();
    const pastWorkerIds = new Set(pastBookings.map((b) => b.worker.toString()));

    // Scoring algorithm — weights total 100%
    const scored = workers.map((worker) => {
      let score = 0;
      const breakdown = {};

      // Distance score (25%) — closer = higher
      if (location?.coordinates && worker.location?.coordinates) {
        const dist = calculateDistance(location.coordinates, worker.location.coordinates);
        const distScore = Math.max(0, 25 - (dist / (filters.radius || 10)) * 25);
        breakdown.distance = Math.round(distScore);
        score += distScore;
      } else {
        score += 12.5; // neutral if no location
      }

      // Rating score (25%) — 5-star = 25 points
      const ratingScore = ((worker.averageRating || 0) / 5) * 25;
      breakdown.rating = Math.round(ratingScore);
      score += ratingScore;

      // Trust score (20%)
      const trustScore = ((worker.trustScore || 0) / 100) * 20;
      breakdown.trust = Math.round(trustScore);
      score += trustScore;

      // Experience score (10%) — capped at 10 years
      const expScore = (Math.min(worker.experience || 0, 10) / 10) * 10;
      breakdown.experience = Math.round(expScore);
      score += expScore;

      // Budget fit score (10%) — within budget = full points
      if (budget?.max && worker.hourlyRate) {
        const budgetScore = worker.hourlyRate <= budget.max ? 10 : Math.max(0, 10 - (worker.hourlyRate - budget.max) / budget.max * 10);
        breakdown.budget = Math.round(budgetScore);
        score += budgetScore;
      } else {
        score += 5;
      }

      // Language match score (5%)
      if (filters.languages?.length) {
        const langMatch = filters.languages.filter((l) => worker.languages?.includes(l)).length;
        const langScore = (langMatch / filters.languages.length) * 5;
        breakdown.languages = Math.round(langScore);
        score += langScore;
      } else {
        score += 5;
      }

      // Availability score (5%)
      if (worker.availability?.isAvailableNow) {
        score += 5;
        breakdown.availability = 5;
      }

      // Past booking bonus — returning workers get slight boost
      if (pastWorkerIds.has(worker.user?._id?.toString())) {
        score += 3;
        breakdown.returning = 3;
      }

      // Completion rate bonus (up to 5)
      const completionBonus = ((worker.completionRate || 0) / 100) * 5;
      score += completionBonus;

      return {
        ...worker,
        aiScore: Math.min(100, Math.round(score)),
        aiScoreBreakdown: breakdown,
        distance: location?.coordinates && worker.location?.coordinates
          ? Math.round(calculateDistance(location.coordinates, worker.location.coordinates) * 10) / 10
          : null,
      };
    });

    return scored
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 20);
  } catch (error) {
    logger.error('AI Recommendation error:', error);
    throw error;
  }
};

/**
 * ============================================================
 * 2. AI RELIABILITY SCORE (Trust Score Engine)
 * Multi-factor weighted score 0-100
 * ============================================================
 */
const calculateReliabilityScore = async (workerProfileId) => {
  const worker = await WorkerProfile.findById(workerProfileId);
  if (!worker) return null;

  const scores = {};

  // Completion Rate (25%) — based on completed vs total bookings
  const completionRate = worker.totalBookings > 0
    ? (worker.completedBookings / worker.totalBookings) * 100 : 50;
  scores.completionRate = Math.round((completionRate / 100) * 25);

  // Ratings Score (20%) — average rating out of 5
  scores.ratings = Math.round(((worker.averageRating || 0) / 5) * 20);

  // Verification Status (20%)
  let verificationPoints = 0;
  if (worker.status === 'verified') verificationPoints += 10;
  if (worker.policeVerificationStatus === 'approved') verificationPoints += 6;
  if (worker.faceMatchStatus === 'matched') verificationPoints += 4;
  scores.verification = verificationPoints;

  // Attendance Rate (15%)
  scores.attendance = Math.round(((worker.attendanceRate || 100) / 100) * 15);

  // Response Time Score (10%) — faster response = higher score
  // responseTime is average minutes to accept/reject
  const avgResponseTime = worker.responseTime || 60;
  const responseScore = avgResponseTime <= 5 ? 10
    : avgResponseTime <= 15 ? 8
    : avgResponseTime <= 30 ? 6
    : avgResponseTime <= 60 ? 4
    : 2;
  scores.responseTime = responseScore;

  // Experience Score (5%) — capped at 10 years
  scores.experience = Math.round((Math.min(worker.experience || 0, 10) / 10) * 5);

  // Complaint Penalty (deductions)
  const complaints = await Complaint.countDocuments({
    reportedUser: worker.user,
    status: { $in: ['resolved', 'under_review'] },
    createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }, // last 6 months
  });
  const penalty = Math.min(15, complaints * 5);

  // Total Score
  const totalRaw = Object.values(scores).reduce((a, b) => a + b, 0) - penalty;
  const total = Math.max(0, Math.min(100, totalRaw));

  return {
    total,
    breakdown: { ...scores, penalty: -penalty },
    badges: generateBadges(total, worker),
  };
};

const generateBadges = (score, worker) => {
  const badges = [];
  if (score >= 90) badges.push('top_rated');
  if (worker.policeVerificationStatus === 'approved') badges.push('police_verified');
  if (worker.faceMatchStatus === 'matched') badges.push('background_checked');
  if (worker.status === 'verified') badges.push('verified');
  if (worker.responseTime <= 10) badges.push('quick_responder');
  if (worker.experience >= 5) badges.push('experienced');
  if (worker.averageRating >= 4.5 && worker.totalReviews >= 10) badges.push('highly_recommended');
  return badges;
};

/**
 * ============================================================
 * 3. AI REVIEW SUMMARY (Gemini API)
 * Summarize all reviews into a human-readable paragraph
 * ============================================================
 */
const generateReviewSummary = async (workerProfileId) => {
  try {
    const reviews = await Review.find({
      workerProfile: workerProfileId,
      isApproved: true,
    })
      .select('rating comment tags')
      .limit(100)
      .lean();

    if (reviews.length < 3) {
      return reviews.length === 0
        ? 'No reviews yet. Be the first to review!'
        : 'Not enough reviews for a summary.';
    }

    const reviewTexts = reviews
      .filter((r) => r.comment)
      .map((r) => `Rating: ${r.rating}/5 — "${r.comment}"`)
      .slice(0, 30)
      .join('\n');

    const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
    const allTags = reviews.flatMap((r) => r.tags || []);
    const tagFreq = allTags.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
    const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map((e) => e[0]);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an AI assistant for TrustNest, a household worker platform. 
Summarize the following ${reviews.length} customer reviews for a worker in 2-3 concise sentences.
Average rating: ${avgRating}/5. Most common tags: ${topTags.join(', ')}.
Be specific about strengths and any consistent criticisms. Keep it factual and balanced.

Reviews:
${reviewTexts}

Write a professional summary starting with "Customers" or "Clients":`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    logger.error('AI Review Summary error:', error.message);
    // Fallback: algorithmic summary
    return generateAlgorithmicSummary(workerProfileId);
  }
};

const generateAlgorithmicSummary = async (workerProfileId) => {
  const reviews = await Review.find({ workerProfile: workerProfileId, isApproved: true }).lean();
  if (!reviews.length) return 'No reviews yet.';
  const avg = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
  const positive = reviews.filter((r) => r.rating >= 4).length;
  const pct = Math.round((positive / reviews.length) * 100);
  return `Based on ${reviews.length} reviews with an average rating of ${avg}/5, ${pct}% of customers gave positive feedback.`;
};

/**
 * ============================================================
 * 4. AI CHAT ASSISTANT (Gemini API)
 * Answer questions about workers, pricing, bookings
 * ============================================================
 */
const getAIChatResponse = async ({ userMessage, context = {}, conversationHistory = [] }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are TrustBot, the AI assistant for TrustNest — India's most trusted platform for finding verified household workers (maids, cooks, drivers, babysitters, nurses, caretakers, gardeners, etc.).

Your capabilities:
- Help customers find the right worker for their needs
- Explain service categories and pricing
- Help with booking questions
- Explain the verification process
- Answer FAQs about the platform
- Recommend services based on user needs

Platform context:
- Services: House Maid, Cook, Driver, Babysitter, Patient Care, Elder Care, Nurse, Laundry, Cleaner, Gardener, Pet Care
- All workers go through document verification and background checks
- Trust Score: 0-100 based on verification, ratings, experience, attendance
- Bookings: instant or scheduled, hourly/daily/monthly rates
- Payments: Razorpay (UPI, Card, Net Banking)
- Location: India-based service

${context.workerInfo ? `Current worker context: ${JSON.stringify(context.workerInfo)}` : ''}
${context.userRole ? `User is a: ${context.userRole}` : ''}

Keep responses concise, helpful, and friendly. Use simple language. If you cannot answer something specific, direct them to contact support.`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Hello! I\'m TrustBot. I\'m here to help you find the perfect verified household worker. How can I assist you today?' }] },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text().trim();
  } catch (error) {
    logger.error('AI Chat error:', error.message);
    return "I'm having trouble connecting right now. Please try again or contact our support team.";
  }
};

/**
 * ============================================================
 * 5. FRAUD DETECTION
 * Detect fake reviews, duplicate accounts, spam
 * ============================================================
 */
const detectReviewFraud = async (reviewData) => {
  const flags = [];
  let fraudScore = 0;

  // Check 1: Review submitted too quickly after booking completion
  if (reviewData.booking) {
    const booking = await Booking.findById(reviewData.booking);
    if (booking) {
      const timeDiff = (Date.now() - booking.updatedAt) / (1000 * 60); // minutes
      if (timeDiff < 2) {
        flags.push('too_fast_review');
        fraudScore += 30;
      }
    }
  }

  // Check 2: Very short generic comments from high-rating reviews
  const genericPhrases = ['great', 'good', 'nice', 'ok', 'okay', 'fine', 'best'];
  if (reviewData.rating === 5 && reviewData.comment) {
    const words = reviewData.comment.toLowerCase().split(' ').filter(Boolean);
    if (words.length <= 3 && genericPhrases.some((p) => words.includes(p))) {
      flags.push('generic_positive_comment');
      fraudScore += 20;
    }
  }

  // Check 3: Reviewer reviews many workers in a short time
  const recentReviews = await Review.countDocuments({
    reviewer: reviewData.reviewer,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recentReviews >= 5) {
    flags.push('high_review_frequency');
    fraudScore += 25;
  }

  // Check 4: New account submitting review
  const User = require('../models/User');
  const reviewer = await User.findById(reviewData.reviewer);
  if (reviewer) {
    const accountAge = (Date.now() - reviewer.createdAt) / (1000 * 60 * 60 * 24); // days
    if (accountAge < 1) {
      flags.push('new_account');
      fraudScore += 20;
    }
  }

  // Check 5: Exact same comment as previous review
  if (reviewData.comment && reviewData.comment.length > 10) {
    const duplicate = await Review.findOne({
      comment: reviewData.comment,
      reviewer: reviewData.reviewer,
    });
    if (duplicate) {
      flags.push('duplicate_comment');
      fraudScore += 40;
    }
  }

  return {
    fraudScore: Math.min(100, fraudScore),
    flags,
    isSuspicious: fraudScore >= 50,
  };
};

const detectDuplicateAccount = async (userData) => {
  const User = require('../models/User');
  const flags = [];
  let score = 0;

  // Check same IP (would need request metadata)
  // Check same device fingerprint
  // Check similar name variations
  if (userData.email) {
    const localPart = userData.email.split('@')[0];
    const suspicious = await User.findOne({
      email: { $regex: localPart.replace(/[0-9]/g, ''), $options: 'i' },
      _id: { $ne: userData._id },
    });
    if (suspicious) {
      flags.push('similar_email');
      score += 30;
    }
  }

  return { score, flags, isSuspicious: score >= 50 };
};

// Helper: Calculate distance between two [lng, lat] coordinates (km)
const calculateDistance = ([lng1, lat1], [lng2, lat2]) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = {
  getAIWorkerRecommendations,
  calculateReliabilityScore,
  generateReviewSummary,
  getAIChatResponse,
  detectReviewFraud,
  detectDuplicateAccount,
};
