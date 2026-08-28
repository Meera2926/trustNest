const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const uploadToCloudinary = async (fileBuffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `trustnest/${folder}`,
        resource_type: options.resourceType || 'auto',
        transformation: options.transformation || [],
        ...options,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
  }
};

// Upload presets for different file types
const uploadPresets = {
  avatar: { folder: 'avatars', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 85 }] },
  document: { folder: 'documents', resourceType: 'auto' },
  video: { folder: 'videos', resourceType: 'video', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
  audio: { folder: 'audio', resourceType: 'auto' },
  evidence: { folder: 'evidence', resourceType: 'auto' },
  review_photo: { folder: 'reviews', transformation: [{ width: 800, quality: 80 }] },
};

const uploadFile = async (fileBuffer, type = 'document', extraOptions = {}) => {
  const preset = uploadPresets[type] || uploadPresets.document;
  return uploadToCloudinary(fileBuffer, preset.folder, { ...preset, ...extraOptions });
};

module.exports = { uploadFile, deleteFromCloudinary };
