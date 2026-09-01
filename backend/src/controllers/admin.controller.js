import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import SearchLog from '../models/SearchLog.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

// @desc    Get platform statistics
// @route   GET /api/admin/stats
export const getStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers, totalRecruiters, totalCompanies, totalJobs, totalApplications,
    pendingCompanies, activeJobs, pendingJobs
  ] = await Promise.all([
    User.countDocuments({ role: 'seeker' }),
    User.countDocuments({ role: 'recruiter' }),
    Company.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Company.countDocuments({ status: 'pending' }),
    Job.countDocuments({ status: 'open' }),
    Job.countDocuments({ status: 'pending' }),
  ]);

  // Funnel logic
  const funnelStats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const funnelMap = funnelStats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const appliedCount = totalApplications;
  const underReviewCount = (funnelMap['reviewing'] || 0) + (funnelMap['shortlisted'] || 0) + (funnelMap['hired'] || 0) + (funnelMap['rejected'] || 0); // Anything past applied
  const shortlistedCount = (funnelMap['shortlisted'] || 0) + (funnelMap['hired'] || 0);
  const hiredCount = funnelMap['hired'] || 0;

  const funnel = {
    applied: appliedCount,
    underReview: underReviewCount,
    shortlisted: shortlistedCount,
    hired: hiredCount,
    conversionRate: appliedCount ? ((hiredCount / appliedCount) * 100).toFixed(1) : 0
  };

  // Activity over last 30 days (Users, Jobs, Applications)
  const activityTimeline = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Job.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Application.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Popular Job Categories
  const jobsByCategory = await Job.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  // Top Skills
  const topSkills = await Job.aggregate([
    { $unwind: "$skills" },
    { $group: { _id: "$skills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Top Companies by Job Postings
  const topCompanies = await Job.aggregate([
    { $group: { _id: '$company', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'companyDetails' } },
    { $unwind: '$companyDetails' },
    { $project: { _id: 1, count: 1, name: '$companyDetails.name' } }
  ]);

  // Most Searched Keywords
  const topSearches = await SearchLog.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: "$keyword", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    ...ApiResponse.success('Stats fetched'),
    data: {
      overview: {
        totalUsers,
        totalRecruiters,
        totalCompanies,
        totalJobs,
        totalApplications,
        pendingCompanies,
        activeJobs,
        pendingJobs,
      },
      funnel,
      activityTimeline: {
        users: activityTimeline[0],
        jobs: activityTimeline[1],
        applications: activityTimeline[2],
      },
      jobsByCategory,
      topSkills,
      topCompanies,
      topSearches
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, status } = req.query;
  const query = {};

  if (role) query.role = role;
  if (status) query.status = status;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    ...ApiResponse.success('Users fetched'),
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get all recruiters
// @route   GET /api/admin/recruiters
export const getRecruiters = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = { role: 'recruiter' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const recruiters = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    ...ApiResponse.success('Recruiters fetched'),
    data: {
      recruiters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get all companies (admin)
// @route   GET /api/admin/companies
export const getCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const query = {};

  if (status) query.status = status;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Company.countDocuments(query);
  const companies = await Company.find(query)
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    ...ApiResponse.success('Companies fetched'),
    data: {
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Approve/reject company
// @route   PUT /api/admin/companies/:id/status
export const updateCompanyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw ApiError.badRequest('Status must be approved or rejected');
  }

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('owner', 'name email');

  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  // Notify owner
  await Notification.create({
    user: company.owner._id,
    type: status === 'approved' ? NOTIFICATION_TYPES.COMPANY_APPROVED : NOTIFICATION_TYPES.COMPANY_REJECTED,
    title: `Company ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `Your company "${company.name}" has been ${status} by the admin.`,
  });

  res.json({
    ...ApiResponse.success(`Company ${status}`),
    data: { company },
  });
});

// @desc    Get all jobs (admin)
// @route   GET /api/admin/jobs
export const getJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const query = {};

  if (status) query.status = status;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('company', 'name logo')
    .populate('postedBy', 'name email')
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

// @desc    Approve/reject job
// @route   PUT /api/admin/jobs/:id/status
export const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const notifType = status === 'open' ? NOTIFICATION_TYPES.JOB_APPROVED : NOTIFICATION_TYPES.JOB_REJECTED;
  await Notification.create({
    user: job.postedBy,
    type: notifType,
    title: `Job ${status === 'open' ? 'Approved' : 'Rejected'}`,
    message: `Your job posting "${job.title}" has been ${status === 'open' ? 'approved' : 'rejected'}.`,
    relatedJob: job._id,
  });

  res.json({
    ...ApiResponse.success(`Job status updated to ${status}`),
    data: { job },
  });
});

// @desc    Delete job (admin)
// @route   DELETE /api/admin/jobs/:id
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  await Application.deleteMany({ job: job._id });
  await Job.findByIdAndDelete(req.params.id);

  res.json(ApiResponse.success('Job deleted'));
});

// @desc    Suspend/unsuspend user
// @route   PUT /api/admin/users/:id/suspend
export const toggleSuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.role === 'admin') {
    throw ApiError.badRequest('Cannot suspend an admin');
  }

  user.status = user.status === 'active' ? 'suspended' : 'active';
  await user.save();

  const type = user.status === 'suspended' ? NOTIFICATION_TYPES.ACCOUNT_SUSPENDED : NOTIFICATION_TYPES.ACCOUNT_ACTIVATED;
  await Notification.create({
    user: user._id,
    type,
    title: user.status === 'suspended' ? 'Account Suspended' : 'Account Activated',
    message: user.status === 'suspended'
      ? 'Your account has been suspended. Contact support for more details.'
      : 'Your account has been reactivated.',
  });

  res.json({
    ...ApiResponse.success(`User ${user.status === 'suspended' ? 'suspended' : 'activated'}`),
    data: { user },
  });
});

// @desc    Get recent activity
// @route   GET /api/admin/activity
export const getRecentActivity = asyncHandler(async (req, res) => {
  const [recentUsers, recentJobs, recentApplications] = await Promise.all([
    User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(10),
    Job.find().select('title status createdAt').populate('company', 'name').sort({ createdAt: -1 }).limit(10),
    Application.find().select('status createdAt')
      .populate('applicant', 'name')
      .populate('job', 'title')
      .sort({ createdAt: -1 }).limit(10),
  ]);

  res.json({
    ...ApiResponse.success('Recent activity fetched'),
    data: { recentUsers, recentJobs, recentApplications },
  });
});
