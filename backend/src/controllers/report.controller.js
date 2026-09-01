import Report from '../models/Report.js';
import Job from '../models/Job.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const reportJob = asyncHandler(async (req, res) => {
  const { reason, description } = req.body;
  const { id: jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  // Check if user already reported this job
  const existingReport = await Report.findOne({ reporter: req.user._id, jobId });
  if (existingReport) {
    throw ApiError.badRequest('You have already reported this job');
  }

  const report = await Report.create({
    reporter: req.user._id,
    jobId,
    reason,
    description
  });

  res.status(201).json({
    ...ApiResponse.created('Report submitted successfully'),
    data: { report },
  });
});
