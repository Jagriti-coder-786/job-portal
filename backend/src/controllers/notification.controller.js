import Notification from '../models/Notification.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get notifications
// @route   GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { user: req.user._id };

  if (unreadOnly === 'true') {
    query.read = false;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

  const notifications = await Notification.find(query)
    .populate('relatedJob', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    ...ApiResponse.success('Notifications fetched'),
    data: {
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  );

  res.json(ApiResponse.success('Notification marked as read'));
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.json(ApiResponse.success('All notifications marked as read'));
});
