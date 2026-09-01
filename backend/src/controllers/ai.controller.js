import User from '../models/User.js';
import Job from '../models/Job.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { analyzeMatch, isAIAvailable } from '../services/ai.service.js';

// @desc    Analyze resume match for a job
// @route   POST /api/ai/match
export const getResumeMatch = asyncHandler(async (req, res) => {
  if (!isAIAvailable()) {
    // Use fallback matching
    const user = await User.findById(req.user._id);
    const job = await Job.findById(req.body.jobId);

    if (!job) throw ApiError.notFound('Job not found');

    const result = await analyzeMatch(user, job);
    return res.json({
      ...ApiResponse.success('Match analysis complete (keyword-based)'),
      data: { match: result, aiPowered: false },
    });
  }

  const user = await User.findById(req.user._id);
  const job = await Job.findById(req.body.jobId)
    .populate('company', 'name');

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const result = await analyzeMatch(user, job);

  res.json({
    ...ApiResponse.success('Match analysis complete'),
    data: { match: result, aiPowered: true },
  });
});

// @desc    Check if AI is available
// @route   GET /api/ai/status
export const getAIStatus = asyncHandler(async (req, res) => {
  res.json({
    ...ApiResponse.success('AI status'),
    data: { available: isAIAvailable() },
  });
});
