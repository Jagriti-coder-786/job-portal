import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Generate JWT token and set it as an httpOnly cookie.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRE,
  });
};

export const setTokenCookie = (res, token, refreshToken) => {
  const isProd = env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  // Access token cookie (e.g., 15 mins)
  res.cookie('token', token, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, 
  });

  // Refresh token cookie (e.g., 7 days)
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};
