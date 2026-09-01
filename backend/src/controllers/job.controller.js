import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateMatchScore } from '../services/matching.service.js';
import JobAlert from '../models/JobAlert.js';
import Notification from '../models/Notification.js';
import SearchLog from '../models/SearchLog.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

// @desc    Create job posting
// @route   POST /api/jobs
export const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.validatedBody.company);

  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  if (company.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized to post jobs for this company');
  }

  if (company.status !== 'approved') {
    throw ApiError.badRequest('Company must be approved before posting jobs');
  }

  const job = await Job.create({
    ...req.validatedBody,
    postedBy: req.user._id,
  });

  const populatedJob = await Job.findById(job._id)
    .populate('company', 'name logo location')
    .populate('postedBy', 'name');

  // Trigger Job Alerts asynchronously
  setImmediate(async () => {
    try {
      const activeAlerts = await JobAlert.find({ isActive: true });
      const notificationsToCreate = [];
      
      for (const alert of activeAlerts) {
        // Simple matching logic
        const matchesKeyword = !alert.keyword || 
          job.title.toLowerCase().includes(alert.keyword.toLowerCase()) || 
          job.description.toLowerCase().includes(alert.keyword.toLowerCase());
          
        const matchesLocation = !alert.location || 
          job.location.toLowerCase().includes(alert.location.toLowerCase());

        if (matchesKeyword && matchesLocation) {
          notificationsToCreate.push({
            user: alert.user,
            type: NOTIFICATION_TYPES.JOB_ALERT,
            title: 'New Job Alert',
            message: `A new job matching your alert "${alert.keyword}" has been posted: ${job.title}`,
            relatedJob: job._id
          });
        }
      }

      if (notificationsToCreate.length > 0) {
        await Notification.insertMany(notificationsToCreate);
      }
    } catch (err) {
      console.error('Failed to process job alerts:', err);
    }
  });

  res.status(201).json({
    ...ApiResponse.created('Job posted successfully'),
    data: { job: populatedJob },
  });
});

// @desc    Search/list jobs
// @route   GET /api/jobs
export const getJobs = asyncHandler(async (req, res) => {
  const {
    search, location, jobType, experienceLevel, workMode,
    minSalary, maxSalary, company, category, skills,
    sort = 'newest', page = 1, limit = 12, status,
  } = req.query;

  const query = {};

  // Default to open jobs for public
  if (status) {
    query.status = status;
  } else {
    query.status = 'open';
  }

  // Text search
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } },
    ];
    
    // Log search asynchronously
    setImmediate(async () => {
      try {
        await SearchLog.create({
          keyword: search,
          user: req.user?._id || null,
          location: location || null
        });
      } catch (err) {
        console.error('Failed to log search:', err);
      }
    });
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (jobType) {
    query.jobType = jobType;
  }

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  if (workMode) {
    query.workMode = workMode;
  }

  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  if (company) {
    query.company = company;
  }

  if (skills) {
    const skillsArray = skills.split(',').map(s => s.trim());
    query.skills = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
  }

  if (minSalary) {
    query['salary.min'] = { $gte: parseInt(minSalary) };
  }

  if (maxSalary) {
    query['salary.max'] = { $lte: parseInt(maxSalary) };
  }

  // Sorting
  let sortOption = {};
  switch (sort) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'salary-high':
      sortOption = { 'salary.max': -1 };
      break;
    case 'salary-low':
      sortOption = { 'salary.min': 1 };
      break;
    case 'applications':
      sortOption = { applicationsCount: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('company', 'name logo location industry')
    .populate('postedBy', 'name')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    ...ApiResponse.success('Jobs fetched'),
    data: {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get single job
// @route   GET /api/jobs/:id
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('company', 'name logo location description website industry size')
    .populate('postedBy', 'name');

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  res.json({
    ...ApiResponse.success('Job fetched'),
    data: { job },
  });
});

// @desc    Update job
// @route   PUT /api/jobs/:id
export const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to update this job');
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.validatedBody, {
    new: true,
    runValidators: true,
  }).populate('company', 'name logo location').populate('postedBy', 'name');

  res.json({
    ...ApiResponse.success('Job updated'),
    data: { job },
  });
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to delete this job');
  }

  // Also delete all related applications
  await Application.deleteMany({ job: job._id });
  await Job.findByIdAndDelete(req.params.id);

  res.json(ApiResponse.success('Job deleted'));
});

// @desc    Update job status (open/close)
// @route   PUT /api/jobs/:id/status
export const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const job = await Job.findById(req.params.id);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  job.status = status;
  await job.save();

  res.json({
    ...ApiResponse.success(`Job ${status}`),
    data: { job },
  });
});

// @desc    Get recruiter's jobs
// @route   GET /api/jobs/recruiter/my-jobs
export const getMyJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { postedBy: req.user._id };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('company', 'name logo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    ...ApiResponse.success('Jobs fetched'),
    data: {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get recommended jobs for seeker
// @route   GET /api/jobs/recommended
export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const user = req.user;

  // Get applied job IDs to exclude
  const appliedApps = await Application.find({ applicant: user._id }).select('job');
  const appliedJobIds = appliedApps.map(app => app.job);

  // Find open jobs
  // For production with thousands of jobs, this needs a better pre-filter or specialized recommendation DB
  // For now, we'll fetch up to 100 recent jobs and score them
  const potentialJobs = await Job.find({ 
    status: 'open',
    _id: { $nin: appliedJobIds }
  })
  .populate('company', 'name logo location industry')
  .limit(100)
  .lean();

  const scoredJobs = potentialJobs.map(job => {
    const match = calculateMatchScore(job, user);
    return {
      ...job,
      matchScore: match.score,
      matchDetails: match.details
    };
  });

  // Sort by score descending
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  const topJobs = scoredJobs.slice(0, parseInt(limit));

  res.json({
    ...ApiResponse.success('Recommended jobs fetched'),
    data: { jobs: topJobs },
  });
});
