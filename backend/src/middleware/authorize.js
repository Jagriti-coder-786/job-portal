import ApiError from '../utils/ApiError.js';

/**
 * Role-based authorization middleware.
 * Usage: authorize('admin', 'recruiter')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource`);
    }

    next();
  };
};

export default authorize;
