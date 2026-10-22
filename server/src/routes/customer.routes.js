const express = require('express');
const router = express.Router();
const {
  getMyCustomerProfile,
  updateMyCustomerProfile,
  addSavedAddress,
  removeSavedAddress,
  updateSOSContacts,
  toggleFavoriteWorker,
  getMyFavorites,
} = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All customer routes are protected
router.use(protect);
router.use(authorize('customer', 'admin'));

router.get('/me/profile', getMyCustomerProfile);
router.put('/me/profile', updateMyCustomerProfile);

router.post('/me/addresses', addSavedAddress);
router.delete('/me/addresses/:addressId', removeSavedAddress);

router.put('/me/sos-contacts', updateSOSContacts);

router.post('/favorites/:workerId', toggleFavoriteWorker);
router.get('/me/favorites', getMyFavorites);

module.exports = router;
