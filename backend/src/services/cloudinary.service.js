import { cloudinary } from '../config/cloudinary.js';
import env from '../config/env.js';

/**
 * Upload a file buffer to Cloudinary.
 * Falls back to a placeholder URL if Cloudinary is not configured.
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'jobportal', resourceType = 'auto') => {
  if (!env.CLOUDINARY_CLOUD_NAME) {
    // Cloudinary not configured — return a data URL or placeholder
    const base64 = fileBuffer.toString('base64');
    const mimeType = resourceType === 'image' ? 'image/png' : 'application/pdf';
    return {
      url: `data:${mimeType};base64,${base64.substring(0, 100)}...`,
      publicId: 'local-' + Date.now(),
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public ID.
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!env.CLOUDINARY_CLOUD_NAME || !publicId || publicId.startsWith('local-')) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};
