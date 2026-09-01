import AuditLog from '../models/AuditLog.js';

/**
 * Middleware to log admin actions.
 * @param {string} action - The action being performed (e.g., 'APPROVE_JOB', 'SUSPEND_USER')
 * @param {string} resource - The resource being modified (e.g., 'Job', 'User')
 */
export const logAdminAction = (action, resource) => {
  return async (req, res, next) => {
    // Store original send function to intercept response
    const originalSend = res.send;
    
    res.send = function (data) {
      // Only log if the request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Run logging asynchronously so it doesn't block the response
        try {
          const resourceId = req.params.id || req.body.id || req.body[`${resource.toLowerCase()}Id`];
          
          AuditLog.create({
            admin: req.user._id,
            action,
            resource,
            resourceId,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: req.method !== 'GET' ? req.body : undefined,
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
          }).catch(err => console.error('Failed to save audit log:', err));
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      }
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};
