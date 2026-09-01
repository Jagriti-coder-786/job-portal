import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Toggle save/unsave job
// @route   POST /api/saved-jobs/:jobId
export const toggleSaveJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;

  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });

  if (existing) {
    await SavedJob.findByIdAndDelete(existing._id);
    res.json(ApiResponse.success('Job removed from saved'));
  } else {
    await SavedJob.create({ user: req.user._id, job: jobId });
    res.status(201).json(ApiResponse.created('Job saved'));
  }
});

// @desc    Get saved jobs
// @route   GET /api/saved-jobs
export const getSavedJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await SavedJob.countDocuments({ user: req.user._id });
  const savedJobs = await SavedJob.find({ user: req.user._id })
    .populate({
      path: 'job',
      populate: { path: 'company', select: 'name logo location' },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    ...ApiResponse.success('Saved jobs fetched'),
    data: {
      savedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Check if job is saved
// @route   GET /api/saved-jobs/check/:jobId
export const checkSavedJob = asyncHandler(async (req, res) => {
  const saved = await SavedJob.findOne({
    user: req.user._id,
    job: req.params.jobId,
  });

  res.json({
    ...ApiResponse.success('Check complete'),
    data: { isSaved: !!saved },
  });
});
