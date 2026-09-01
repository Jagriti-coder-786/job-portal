import JobAlert from '../models/JobAlert.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createAlert = asyncHandler(async (req, res) => {
  const { keyword, location, frequency } = req.body;

  const count = await JobAlert.countDocuments({ user: req.user._id });
  if (count >= 10) {
    throw ApiError.badRequest('You can only have up to 10 job alerts.');
  }

  const alert = await JobAlert.create({
    user: req.user._id,
    keyword,
    location,
    frequency
  });

  res.status(201).json({
    ...ApiResponse.created('Job alert created successfully'),
    data: { alert },
  });
});

export const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await JobAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
  
  res.json({
    ...ApiResponse.success('Job alerts fetched'),
    data: { alerts },
  });
});

export const updateAlert = asyncHandler(async (req, res) => {
  const alert = await JobAlert.findOne({ _id: req.params.id, user: req.user._id });

  if (!alert) {
    throw ApiError.notFound('Job alert not found');
  }

  const { keyword, location, frequency, isActive } = req.body;
  if (keyword !== undefined) alert.keyword = keyword;
  if (location !== undefined) alert.location = location;
  if (frequency !== undefined) alert.frequency = frequency;
  if (isActive !== undefined) alert.isActive = isActive;

  await alert.save();

  res.json({
    ...ApiResponse.success('Job alert updated'),
    data: { alert },
  });
});

export const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await JobAlert.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!alert) {
    throw ApiError.notFound('Job alert not found');
  }

  res.json(ApiResponse.success('Job alert deleted'));
});
