const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { uploadFile } = require('../services/cloudinary.service');

// @desc    Get all workers with search, filter, and location query
// @route   GET /api/v1/workers
// @access  Public
const getWorkers = asyncHandler(async (req, res) => {
  const {
    service,
    city,
    lat,
    lng,
    radius = 15, // km
    minRating,
    maxHourlyRate,
    isAvailableNow,
    status = 'verified',
    page = 1,
    limit = 10,
    sortBy = 'trustScore',
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (service) query.services = service;
  if (city) query['address.city'] = new RegExp(`^${city}$`, 'i');
  if (isAvailableNow === 'true') query['availability.isAvailableNow'] = true;
  if (minRating) query.averageRating = { $gte: Number(minRating) };
  if (maxHourlyRate) query.hourlyRate = { $lte: Number(maxHourlyRate) };

  // Geospatial query if coordinates supplied
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: Number(radius) * 1000, // meters
      },
    };
  }

  const sortOptions = {};
  if (sortBy === 'rating') sortOptions.averageRating = -1;
  else if (sortBy === 'rate_asc') sortOptions.hourlyRate = 1;
  else if (sortBy === 'rate_desc') sortOptions.hourlyRate = -1;
  else if (sortBy === 'experience') sortOptions.experience = -1;
  else sortOptions.trustScore = -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [workers, total] = await Promise.all([
    WorkerProfile.find(query)
      .populate('user', 'name email phone avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    WorkerProfile.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        workers,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
      'Workers fetched successfully'
    )
  );
});

// @desc    Get featured top-rated workers
// @route   GET /api/v1/workers/featured
// @access  Public
const getFeaturedWorkers = asyncHandler(async (req, res) => {
  const workers = await WorkerProfile.find({
    status: { $in: ['verified', 'under_review', 'pending'] },
  })
    .populate('user', 'name avatar')
    .sort({ trustScore: -1, averageRating: -1 })
    .limit(8);

  res.status(200).json(new ApiResponse(200, workers, 'Featured workers fetched successfully'));
});

// @desc    Get single worker profile by ID
// @route   GET /api/v1/workers/:id
// @access  Public
const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await WorkerProfile.findById(req.params.id)
    .populate('user', 'name email phone avatar createdAt');

  if (!worker) {
    throw ApiError.notFound('Worker profile not found');
  }

  // Increment profile views
  worker.profileViews = (worker.profileViews || 0) + 1;
  await worker.save({ validateBeforeSave: false });

  // Get recent reviews
  const reviews = await Review.find({ worker: worker.user._id, isHidden: { $ne: true } })
    .populate('customer', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json(new ApiResponse(200, { worker, reviews }, 'Worker profile retrieved'));
});

// @desc    Get logged in worker's own profile
// @route   GET /api/v1/workers/me/profile
// @access  Private (Worker)
const getMyWorkerProfile = asyncHandler(async (req, res) => {
  let profile = await WorkerProfile.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar');

  if (!profile) {
    profile = await WorkerProfile.create({
      user: req.user._id,
      address: { city: 'Default' },
    });
  }

  res.status(200).json(new ApiResponse(200, profile, 'Profile fetched successfully'));
});

// @desc    Update worker profile
// @route   PUT /api/v1/workers/me/profile
// @access  Private (Worker)
const updateMyWorkerProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'bio', 'age', 'gender', 'dateOfBirth', 'services', 'experience',
    'languages', 'education', 'skills', 'hourlyRate', 'dailyRate',
    'monthlyRate', 'expectedSalary', 'negotiable', 'address', 'workingRadius',
    'availability', 'emergencyContact', 'references'
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Handle location coordinates if provided [lng, lat]
  if (req.body.coordinates && Array.isArray(req.body.coordinates)) {
    updateData.location = {
      type: 'Point',
      coordinates: req.body.coordinates,
    };
  }

  let profile = await WorkerProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('user', 'name email phone avatar');

  if (!profile) {
    profile = await WorkerProfile.create({
      user: req.user._id,
      ...updateData,
    });
  }

  res.status(200).json(new ApiResponse(200, profile, 'Profile updated successfully'));
});

// @desc    Toggle real-time availability (Online/Offline)
// @route   PATCH /api/v1/workers/me/availability
// @access  Private (Worker)
const toggleAvailability = asyncHandler(async (req, res) => {
  const profile = await WorkerProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw ApiError.notFound('Worker profile not found');
  }

  const isAvailableNow = req.body.isAvailableNow !== undefined
    ? req.body.isAvailableNow
    : !profile.availability?.isAvailableNow;

  if (!profile.availability) {
    profile.availability = {};
  }
  profile.availability.isAvailableNow = isAvailableNow;
  await profile.save();

  res.status(200).json(new ApiResponse(200, { isAvailableNow }, `Status updated: ${isAvailableNow ? 'Online' : 'Offline'}`));
});

// @desc    Upload worker verification document or photo
// @route   POST /api/v1/workers/me/documents
// @access  Private (Worker)
const uploadVerificationDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('File is required for upload');
  }

  const { documentType, name } = req.body;
  if (!documentType) {
    throw ApiError.badRequest('Document type is required (e.g., government_id, police_verification, certificate, photo)');
  }

  const cloudResult = await uploadFile(req.file.buffer, 'document');

  const profile = await WorkerProfile.findOne({ user: req.user._id });
  if (!profile) throw ApiError.notFound('Worker profile not found');

  const newDoc = {
    type: documentType,
    url: cloudResult.secure_url,
    publicId: cloudResult.public_id,
    name: name || req.file.originalname,
    status: 'pending',
  };

  profile.documents.push(newDoc);
  if (profile.status === 'rejected') {
    profile.status = 'under_review';
  }
  await profile.save();

  res.status(201).json(new ApiResponse(201, newDoc, 'Document uploaded successfully and queued for verification'));
});

module.exports = {
  getWorkers,
  getFeaturedWorkers,
  getWorkerById,
  getMyWorkerProfile,
  updateMyWorkerProfile,
  toggleAvailability,
  uploadVerificationDocument,
};
