import ApiError from '../utils/ApiError.js';

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Usage: validate(myZodSchema)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    throw ApiError.badRequest('Validation failed', errors);
  }

  req.validatedBody = result.data;
  next();
};

export default validate;
