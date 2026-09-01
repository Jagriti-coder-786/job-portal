import Message from '../models/Message.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getIO } from '../socket.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

// @desc    Get messages for an application
// @route   GET /api/messages/:applicationId
export const getMessages = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  // Verify access
  const application = await Application.findById(applicationId).populate('job');
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  // Allow if admin, if applicant, or if recruiter who posted the job
  const isApplicant = application.applicant.toString() === req.user._id.toString();
  const isRecruiter = application.job.postedBy.toString() === req.user._id.toString();
  
  if (!isApplicant && !isRecruiter && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to view these messages');
  }

  // Mark unread messages as read
  await Message.updateMany(
    { application: applicationId, receiver: req.user._id, read: false },
    { $set: { read: true } }
  );

  const messages = await Message.find({ application: applicationId })
    .populate('sender', 'name avatar role')
    .sort({ createdAt: 1 });

  res.json({
    ...ApiResponse.success('Messages fetched'),
    data: { messages },
  });
});

// @desc    Send a message
// @route   POST /api/messages/:applicationId
export const sendMessage = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw ApiError.badRequest('Message content is required');
  }

  const application = await Application.findById(applicationId).populate('job');
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const isApplicant = application.applicant.toString() === req.user._id.toString();
  const isRecruiter = application.job.postedBy.toString() === req.user._id.toString();

  if (!isApplicant && !isRecruiter) {
    throw ApiError.forbidden('Not authorized to send messages for this application');
  }

  const receiverId = isApplicant ? application.job.postedBy : application.applicant;

  const message = await Message.create({
    application: applicationId,
    sender: req.user._id,
    receiver: receiverId,
    content,
  });

  await message.populate('sender', 'name avatar role');

  // Emit real-time message to the specific application room
  const io = getIO();
  io.to(`app_${applicationId}`).emit('new_message', message);

  // Notify the receiver (if they aren't in the room, they will see it via normal notifications)
  await Notification.create({
    user: receiverId,
    type: NOTIFICATION_TYPES.APPLICATION_STATUS, // Reusing status or create a new type
    title: 'New Message',
    message: `You have a new message regarding application for ${application.job.title}`,
    relatedJob: application.job._id
  });

  // Also emit notification directly to user's personal room
  io.to(receiverId.toString()).emit('new_notification', {
    title: 'New Message',
    message: `You have a new message from ${req.user.name}`
  });

  res.status(201).json({
    ...ApiResponse.created('Message sent'),
    data: { message },
  });
});
