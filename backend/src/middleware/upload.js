import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

// Use memory storage so files go directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isImage = allowedImageTypes.test(ext);
  const isDoc = allowedDocTypes.test(ext);

  if (isImage || isDoc) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type .${ext} is not allowed. Allowed: jpeg, jpg, png, gif, webp, pdf, doc, docx`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export const uploadSingle = (fieldName) => upload.single(fieldName);

export default upload;
