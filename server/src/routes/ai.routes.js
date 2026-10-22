const express = require('express');
const router = express.Router();
const {
  recommendWorkers,
  chatWithAssistant,
  summarizeWorkerReviews,
  getWorkerTrustScore,
} = require('../controllers/ai.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

router.post('/recommendations', protect, recommendWorkers);
router.post('/chat', optionalAuth, chatWithAssistant);
router.get('/workers/:id/trust-score', getWorkerTrustScore);
router.post('/workers/:id/summarize-reviews', protect, summarizeWorkerReviews);

module.exports = router;
