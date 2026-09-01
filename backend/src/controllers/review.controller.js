import Review from '../models/Review.js';
import Company from '../models/Company.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Add review for a company
// @route   POST /api/companies/:companyId/reviews
export const addReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const companyId = req.params.companyId;

  const company = await Company.findById(companyId);
  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({ company: companyId, user: req.user._id });
  if (existingReview) {
    throw ApiError.badRequest('You have already reviewed this company');
  }

  const review = await Review.create({
    company: companyId,
    user: req.user._id,
    rating,
    title,
    comment
  });

  // Calculate new average rating
  const reviews = await Review.find({ company: companyId });
  const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
  
  company.averageRating = Number((totalRating / reviews.length).toFixed(1));
  company.reviewCount = reviews.length;
  await company.save();

  // Populate user info for frontend
  await review.populate('user', 'name avatar');

  res.status(201).json({
    ...ApiResponse.created('Review added successfully'),
    data: { review },
  });
});

// @desc    Get reviews for a company
// @route   GET /api/companies/:companyId/reviews
export const getCompanyReviews = asyncHandler(async (req, res) => {
  const companyId = req.params.companyId;

  const reviews = await Review.find({ company: companyId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({
    ...ApiResponse.success('Reviews fetched'),
    data: { reviews },
  });
});
