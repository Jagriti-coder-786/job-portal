import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

import { getIO } from '../socket.js';
import { sendEmail } from '../services/email.service.js';
import { getStatusUpdateTemplate, getInterviewScheduledTemplate } from '../utils/emailTemplates.js';

// @desc    Apply for a job
// @route   POST /api/applications
export const applyForJob = asyncHandler(async (req, res) => {
  const { job: jobId, coverLetter } = req.validatedBody;

  const job = await Job.findById(jobId).populate('postedBy', 'name');
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.status !== 'open') {
    throw ApiError.badRequest('This job is no longer accepting applications');
  }

  // Check if already applied
  const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
  if (existing) {
    throw ApiError.conflict('You have already applied for this job');
  }

  // Handle resume: use uploaded file or user's saved resume
  let resumeUrl = req.user.resume;
  let resumeName = req.user.resumeOriginalName;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'jobportal/resumes', 'raw');
    resumeUrl = result.url;
    resumeName = req.file.originalname;
  }

  if (!resumeUrl) {
    throw ApiError.badRequest('Please upload a resume or add one to your profile first');
  }

  // Calculate Match Score deterministic
  const matchResult = calculateMatchScore(job, req.user);

  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resume: resumeUrl,
    resumeOriginalName: resumeName,
    coverLetter,
    matchScore: matchResult?.score || 0,
    matchDetails: matchResult?.details || {},
  });

  // Calculate AI match explanation asynchronously so it doesn't block the request
  generateMatchExplanation(job, req.user, matchResult)
    .then(async (explanation) => {
      application.matchExplanation = explanation;
      await application.save();
    })
    .catch(err => console.error('Failed to generate match explanation async:', err));

  // Increment application count
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  // Notify recruiter
  await Notification.create({
    user: job.postedBy._id,
    type: NOTIFICATION_TYPES.NEW_APPLICATION,
    title: 'New Application',
    message: `${req.user.name} applied for ${job.title}`,
    relatedJob: jobId,
    relatedApplication: application._id,
  });

  const populated = await Application.findById(application._id)
    .populate('job', 'title company')
    .populate('applicant', 'name email avatar');

  res.status(201).json({
    ...ApiResponse.created('Application submitted successfully'),
    data: { application: populated },
  });
});

// @desc    Get my applications (seeker)
// @route   GET /api/applications/my
export const getMyApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, job } = req.query;
  const query = { applicant: req.user._id };

  if (status) {
    query.status = status;
  }

  if (job) {
    query.job = job;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Application.countDocuments(query);
  const applications = await Application.find(query)
    .populate({
      path: 'job',
      select: 'title location salary jobType company status',
      populate: { path: 'company', select: 'name logo' },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    ...ApiResponse.success('Applications fetched'),
    data: {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get applicants for a job (recruiter)
// @route   GET /api/applications/job/:jobId
export const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  const { page = 1, limit = 10, status, search, sort = 'newest' } = req.query;
  const query = { job: req.params.jobId };

  if (status) {
    query.status = status;
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'matchScore') {
    sortOption = { matchScore: -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Application.countDocuments(query);
  let applications = await Application.find(query)
    .populate('applicant', 'name email avatar skills headline location phone')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  // Search filter on populated applicant
  if (search) {
    applications = applications.filter(app =>
      app.applicant.name.toLowerCase().includes(search.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(search.toLowerCase()) ||
      (app.applicant.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
    );
  }

  res.json({
    ...ApiResponse.success('Applicants fetched'),
    data: {
      applications,
      job: { _id: job._id, title: job.title },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Update application status (recruiter)
// @route   PUT /api/applications/:id/status
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.validatedBody;

  const application = await Application.findById(req.params.id)
    .populate('job', 'title postedBy');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  // If status is changing, add to timeline
  if (application.status !== status) {
    application.status = status;
    application.timeline.push({
      status,
      comment: notes || `Status updated to ${status}`,
      updatedBy: req.user._id
    });
  }
  
  if (notes) application.notes = notes;
  await application.save();

  // Notify applicant
  const statusMessages = {
    'under-review': 'Your application is now under review',
    'shortlisted': 'Congratulations! You have been shortlisted',
    'interview': 'You have been selected for an interview',
    'rejected': 'Your application was not selected at this time',
    'hired': 'Congratulations! You have been hired!',
  };

  await Notification.create({
    user: application.applicant,
    type: NOTIFICATION_TYPES.APPLICATION_UPDATE,
    title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: statusMessages[status] || `Your application status has been updated to ${status}`,
    relatedJob: application.job._id,
    relatedApplication: application._id,
  });

  // Send Email
  const applicant = await User.findById(application.applicant).select('name email');
  if (applicant) {
    const emailHtml = getStatusUpdateTemplate(
      applicant.name,
      application.job.title,
      application.job.postedBy.name || 'Our Company',
      status,
      notes
    );
    sendEmail(applicant.email, `Application Update: ${application.job.title}`, emailHtml);
  }

  res.json({
    ...ApiResponse.success('Application status updated'),
    data: { application },
  });
});

// @desc    Withdraw application (seeker)
// @route   PUT /api/applications/:id/withdraw
export const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  if (application.applicant.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  if (['hired', 'rejected'].includes(application.status)) {
    throw ApiError.badRequest('Cannot withdraw this application');
  }

  await Application.findByIdAndDelete(req.params.id);
  await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

  res.json(ApiResponse.success('Application withdrawn'));
});

// @desc    Download applicant resume
// @route   GET /api/applications/:id/resume
export const downloadApplicantResume = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job', 'postedBy')
    .populate('applicant', 'name');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  res.json({
    ...ApiResponse.success('Resume URL fetched'),
    data: {
      url: application.resume,
      filename: application.resumeOriginalName || `${application.applicant.name}_resume.pdf`,
    },
  });
});

// @desc    Bulk update applications status (recruiter)
// @route   PUT /api/applications/bulk-update
export const bulkUpdateApplications = asyncHandler(async (req, res) => {
  const { applicationIds, status, notes } = req.validatedBody;

  if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
    throw ApiError.badRequest('Please provide an array of application IDs');
  }

  // Find all applications and verify ownership
  const applications = await Application.find({ _id: { $in: applicationIds } }).populate('job', 'postedBy title');
  
  const bulkOps = [];
  const notificationsToCreate = [];

  for (const app of applications) {
    if (app.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      continue; // Skip if not authorized
    }

    if (app.status !== status) {
      app.status = status;
      if (notes) app.notes = notes;
      
      app.timeline.push({
        status,
        comment: notes || `Status bulk updated to ${status}`,
        updatedBy: req.user._id
      });
      
      await app.save();

      // Prepare notification
      const statusMessages = {
        'screening': 'Your application is in the screening phase',
        'under-review': 'Your application is now under review',
        'shortlisted': 'Congratulations! You have been shortlisted',
        'interview': 'You have been selected for an interview',
        'offer': 'Congratulations! You have received an offer',
        'rejected': 'Your application was not selected at this time',
        'hired': 'Congratulations! You have been hired!',
      };

      notificationsToCreate.push({
        user: app.applicant,
        type: NOTIFICATION_TYPES.APPLICATION_UPDATE,
        title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: statusMessages[status] || `Your application status has been updated to ${status}`,
      });

      // Send Email
      const applicant = await User.findById(app.applicant).select('name email');
      if (applicant) {
        const emailHtml = getStatusUpdateTemplate(
          applicant.name,
          app.job.title,
          app.job.postedBy.name || 'Our Company',
          status,
          notes
        );
        sendEmail(applicant.email, `Application Update: ${app.job.title}`, emailHtml);
      }
    }
  }

  if (notificationsToCreate.length > 0) {
    await Notification.insertMany(notificationsToCreate);
  }

  res.json(ApiResponse.success(`Successfully updated ${notificationsToCreate.length} applications`));
});

// @desc    Schedule interview (recruiter)
// @route   PUT /api/applications/:id/interview
export const scheduleInterview = asyncHandler(async (req, res) => {
  const { date, time, link, notes } = req.validatedBody;

  const application = await Application.findById(req.params.id)
    .populate('job', 'title postedBy');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  application.interview = {
    date,
    time,
    link,
    notes,
    status: 'scheduled'
  };
  
  if (application.status !== 'interview') {
    application.status = 'interview';
    application.timeline.push({
      status: 'interview',
      comment: 'Interview scheduled',
      updatedBy: req.user._id
    });
  }

  await application.save();

  // Notify applicant
  const notification = await Notification.create({
    user: application.applicant,
    type: NOTIFICATION_TYPES.APPLICATION_UPDATE,
    title: 'Interview Scheduled',
    message: `An interview for ${application.job.title} has been scheduled on ${new Date(date).toLocaleDateString()} at ${time}`,
    relatedApplication: application._id,
  });

  // Send Email
  const applicant = await User.findById(application.applicant).select('name email');
  if (applicant) {
    const emailHtml = getInterviewScheduledTemplate(
      applicant.name,
      application.job.title,
      application.job.postedBy.name || 'Our Company',
      date,
      time,
      link,
      notes
    );
    sendEmail(applicant.email, `Interview Scheduled: ${application.job.title}`, emailHtml);
  }

  // Emit socket event if io is available
  try {
    const io = getIO();
    io.to(application.applicant.toString()).emit('notification', notification);
  } catch (e) {
    console.error('Socket not initialized or failed to emit', e);
  }

  res.json({
    ...ApiResponse.success('Interview scheduled successfully'),
    data: { application },
  });
});
