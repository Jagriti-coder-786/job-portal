import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { parseResumeToJSON } from '../services/resumeParser.service.js';

// @desc    Get own profile
// @route   GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    ...ApiResponse.success('Profile fetched'),
    data: { user },
  });
});

// @desc    Update profile
// @route   PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'bio', 'headline', 'location', 'skills', 'education', 'experience'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.validatedBody[field] !== undefined) {
      updates[field] = req.validatedBody[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    ...ApiResponse.success('Profile updated'),
    data: { user },
  });
});

// @desc    Upload avatar
// @route   PUT /api/users/avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'jobportal/avatars', 'image');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.url },
    { new: true }
  );

  res.json({
    ...ApiResponse.success('Avatar uploaded'),
    data: { user },
  });
});

// @desc    Upload resume
// @route   PUT /api/users/resume
export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload a resume (PDF, DOC, or DOCX)');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'jobportal/resumes', 'raw');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      resume: result.url,
      resumeOriginalName: req.file.originalname,
    },
    { new: true }
  );

  res.json({
    ...ApiResponse.success('Resume uploaded'),
    data: { user },
  });
});

// @desc    Parse resume (PDF) to structured data
// @route   POST /api/users/resume/parse
export const parseResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload a resume PDF to parse');
  }
  
  if (req.file.mimetype !== 'application/pdf') {
    throw ApiError.badRequest('Only PDF files are supported for parsing');
  }

  const structuredData = await parseResumeToJSON(req.file.buffer);

  res.json({
    ...ApiResponse.success('Resume parsed successfully'),
    data: structuredData,
  });
});

// @desc    Download resume
// @route   GET /api/users/resume/download
export const downloadResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.resume) {
    throw ApiError.notFound('No resume uploaded');
  }

  res.json({
    ...ApiResponse.success('Resume URL fetched'),
    data: {
      url: user.resume,
      filename: user.resumeOriginalName || 'resume.pdf',
    },
  });
});

// @desc    Get public profile by ID
// @route   GET /api/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({
    ...ApiResponse.success('User fetched'),
    data: { user },
  });
});

// @desc    Get public profile by ID
// @route   GET /api/users/profile/:id
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name avatar bio headline location skills education experience role createdAt');

  if (!user || user.role !== 'seeker') {
    throw ApiError.notFound('Profile not found');
  }

  res.json({
    ...ApiResponse.success('Public profile fetched'),
    data: { user },
  });
});
