const CustomerProfile = require('../models/CustomerProfile');
const Favorite = require('../models/Favorite');
const WorkerProfile = require('../models/WorkerProfile');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get logged in customer profile
// @route   GET /api/v1/customers/me/profile
// @access  Private (Customer)
const getMyCustomerProfile = asyncHandler(async (req, res) => {
  let profile = await CustomerProfile.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar');

  if (!profile) {
    profile = await CustomerProfile.create({ user: req.user._id });
  }

  res.status(200).json(new ApiResponse(200, profile, 'Profile retrieved'));
});

// @desc    Update customer profile
// @route   PUT /api/v1/customers/me/profile
// @access  Private (Customer)
const updateMyCustomerProfile = asyncHandler(async (req, res) => {
  const { bio, address, preferences, coordinates } = req.body;

  const updateData = {};
  if (bio !== undefined) updateData.bio = bio;
  if (address !== undefined) updateData.address = address;
  if (preferences !== undefined) updateData.preferences = preferences;

  if (coordinates && Array.isArray(coordinates)) {
    updateData.location = {
      type: 'Point',
      coordinates,
    };
  }

  const profile = await CustomerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updateData },
    { new: true, upsert: true, runValidators: true }
  ).populate('user', 'name email phone avatar');

  res.status(200).json(new ApiResponse(200, profile, 'Profile updated successfully'));
});

// @desc    Add saved address
// @route   POST /api/v1/customers/me/addresses
// @access  Private (Customer)
const addSavedAddress = asyncHandler(async (req, res) => {
  const { label, address, coordinates } = req.body;

  if (!address) {
    throw ApiError.badRequest('Address string is required');
  }

  const profile = await CustomerProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Profile not found');

  const newAddress = {
    label: label || 'Home',
    address,
    location: {
      type: 'Point',
      coordinates: coordinates || [0, 0],
    },
  };

  profile.savedAddresses.push(newAddress);
  await profile.save();

  res.status(201).json(new ApiResponse(201, profile.savedAddresses, 'Address saved'));
});

// @desc    Remove saved address
// @route   DELETE /api/v1/customers/me/addresses/:addressId
// @access  Private (Customer)
const removeSavedAddress = asyncHandler(async (req, res) => {
  const profile = await CustomerProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Profile not found');

  profile.savedAddresses = profile.savedAddresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  );
  await profile.save();

  res.status(200).json(new ApiResponse(200, profile.savedAddresses, 'Address removed'));
});

// @desc    Update SOS Emergency Contacts
// @route   PUT /api/v1/customers/me/sos-contacts
// @access  Private (Customer)
const updateSOSContacts = asyncHandler(async (req, res) => {
  const { contacts } = req.body;

  if (!Array.isArray(contacts)) {
    throw ApiError.badRequest('Contacts must be an array of contact objects');
  }

  const profile = await CustomerProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Profile not found');

  profile.sosContacts = contacts.slice(0, 5); // Limit to top 5 emergency contacts
  await profile.save();

  res.status(200).json(new ApiResponse(200, profile.sosContacts, 'SOS emergency contacts updated'));
});

// @desc    Toggle favorite a worker
// @route   POST /api/v1/customers/favorites/:workerId
// @access  Private (Customer)
const toggleFavoriteWorker = asyncHandler(async (req, res) => {
  const { workerId } = req.params;

  const workerProfile = await WorkerProfile.findOne({
    $or: [{ _id: workerId }, { user: workerId }]
  });

  if (!workerProfile) {
    throw ApiError.notFound('Worker profile not found');
  }

  const existingFav = await Favorite.findOne({
    customer: req.user._id,
    worker: workerProfile.user,
  });

  if (existingFav) {
    await Favorite.findByIdAndDelete(existingFav._id);
    return res.status(200).json(new ApiResponse(200, { isFavorited: false }, 'Worker removed from favorites'));
  }

  await Favorite.create({
    customer: req.user._id,
    worker: workerProfile.user,
    workerProfile: workerProfile._id,
  });

  res.status(201).json(new ApiResponse(201, { isFavorited: true }, 'Worker added to favorites'));
});

// @desc    Get customer's favorite workers
// @route   GET /api/v1/customers/me/favorites
// @access  Private (Customer)
const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ customer: req.user._id })
    .populate({
      path: 'workerProfile',
      populate: { path: 'user', select: 'name avatar email phone' },
    })
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, favorites, 'Favorites fetched'));
});

module.exports = {
  getMyCustomerProfile,
  updateMyCustomerProfile,
  addSavedAddress,
  removeSavedAddress,
  updateSOSContacts,
  toggleFavoriteWorker,
  getMyFavorites,
};
