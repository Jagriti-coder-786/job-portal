import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken, generateRefreshToken, setTokenCookie } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validatedBody;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  
  user.refreshToken = refreshToken;
  await user.save();

  setTokenCookie(res, token, refreshToken);

  res.status(201).json({
    ...ApiResponse.created('Registration successful'),
    data: { user, token },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;

  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status === 'suspended') {
    throw ApiError.forbidden('Your account has been suspended. Contact support.');
  }

  if (user.isLocked) {
    throw ApiError.unauthorized('Account is temporarily locked due to too many failed login attempts. Please try again later.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.loginAttempts += 1;
    // Lock for 1 hour after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 60 * 60 * 1000;
    }
    await user.save();
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  
  user.refreshToken = refreshToken;
  await user.save();

  setTokenCookie(res, token, refreshToken);

  // Remove password from response
  user.password = undefined;

  res.json({
    ...ApiResponse.success('Login successful'),
    data: { user, token },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  // Also clear the user's refresh token in DB if possible
  if (req.user) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  const isProd = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0),
  };

  res.cookie('token', '', cookieOptions);
  res.cookie('refreshToken', '', cookieOptions);

  res.json(ApiResponse.success('Logged out successfully'));
});

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    ...ApiResponse.success('User fetched'),
    data: { user },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validatedBody;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json(ApiResponse.success('Password changed successfully'));
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (user.status === 'suspended') {
    throw ApiError.forbidden('Your account has been suspended.');
  }

  const newToken = generateToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  setTokenCookie(res, newToken, newRefreshToken);

  res.json({
    ...ApiResponse.success('Token refreshed successfully'),
    data: { token: newToken },
  });
});
