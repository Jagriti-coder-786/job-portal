import Company from '../models/Company.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';

// @desc    Create company
// @route   POST /api/companies
export const createCompany = asyncHandler(async (req, res) => {
  const existing = await Company.findOne({ owner: req.user._id });
  if (existing) {
    throw ApiError.conflict('You already have a company registered. Update it instead.');
  }

  const company = await Company.create({
    ...req.validatedBody,
    owner: req.user._id,
  });

  res.status(201).json({
    ...ApiResponse.created('Company created successfully. It will be reviewed by admin.'),
    data: { company },
  });
});

// @desc    List companies
// @route   GET /api/companies
export const getCompanies = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const query = {};

  // Public users see only approved companies
  if (!req.user || req.user.role !== 'admin') {
    query.status = 'approved';
  } else if (status) {
    query.status = status;
  }

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

// @desc    Get single company
// @route   GET /api/companies/:id
export const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id).populate('owner', 'name email');

  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  res.json({
    ...ApiResponse.success('Company fetched'),
    data: { company },
  });
});

// @desc    Update company
// @route   PUT /api/companies/:id
export const updateCompany = asyncHandler(async (req, res) => {
  let company = await Company.findById(req.params.id);

  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to update this company');
  }

  company = await Company.findByIdAndUpdate(req.params.id, req.validatedBody, {
    new: true,
    runValidators: true,
  });

  res.json({
    ...ApiResponse.success('Company updated'),
    data: { company },
  });
});

// @desc    Upload company logo
// @route   PUT /api/companies/:id/logo
export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image');
  }

  let company = await Company.findById(req.params.id);

  if (!company) {
    throw ApiError.notFound('Company not found');
  }

  if (company.owner.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not authorized');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'jobportal/logos', 'image');

  company = await Company.findByIdAndUpdate(
    req.params.id,
    { logo: result.url },
    { new: true }
  );

  res.json({
    ...ApiResponse.success('Logo uploaded'),
    data: { company },
  });
});

// @desc    Get company owned by current recruiter
// @route   GET /api/companies/my/company
export const getMyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ owner: req.user._id });

  res.json({
    ...ApiResponse.success('Company fetched'),
    data: { company },
  });
});
