const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Store in memory for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const allowed = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    documents: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    videos: ['video/mp4', 'video/quicktime', 'video/webm', 'video/avi'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'],
    all: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf',
          'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  };

  const permitted = allowed[allowedTypes] || allowed.all;
  if (permitted.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Invalid file type. Allowed: ${allowedTypes}`), false);
  }
};

// Multer configurations for different upload types
const uploadSingle = (fieldName, type = 'all', maxSizeMB = 10) =>
  multer({
    storage,
    fileFilter: fileFilter(type),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  }).single(fieldName);

const uploadMultiple = (fieldName, maxCount = 5, type = 'all', maxSizeMB = 10) =>
  multer({
    storage,
    fileFilter: fileFilter(type),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  }).array(fieldName, maxCount);

const uploadFields = (fields) =>
  multer({
    storage,
    fileFilter: fileFilter('all'),
    limits: { fileSize: 50 * 1024 * 1024 },
  }).fields(fields);

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size too large'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, 'Too many files'));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};

module.exports = { uploadSingle, uploadMultiple, uploadFields, handleMulterError };
