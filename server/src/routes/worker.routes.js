const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getFeaturedWorkers,
  getWorkerById,
  getMyWorkerProfile,
  updateMyWorkerProfile,
  toggleAvailability,
  uploadVerificationDocument,
} = require('../controllers/worker.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { uploadSingle, handleMulterError } = require('../middleware/upload.middleware');

// Public endpoints
router.get('/', getWorkers);
router.get('/featured', getFeaturedWorkers);

// Worker protected endpoints
router.get('/me/profile', protect, authorize('worker'), getMyWorkerProfile);
router.put('/me/profile', protect, authorize('worker'), updateMyWorkerProfile);
router.patch('/me/availability', protect, authorize('worker'), toggleAvailability);
router.post(
  '/me/documents',
  protect,
  authorize('worker'),
  uploadSingle('file', 'documents', 10),
  handleMulterError,
  uploadVerificationDocument
);

// Single worker public details (must come after /me/* to prevent :id matching "me")
router.get('/:id', getWorkerById);

module.exports = router;
