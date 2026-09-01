import ApiError from '../utils/ApiError.js';

/**
 * Middleware to check the quality of a job post before creating/updating.
 * Returns a quality score and optional warnings, or rejects if too low.
 */
export const checkJobQuality = (req, res, next) => {
  const job = req.body;
  let score = 100;
  const warnings = [];

  // Check description length
  if (!job.description || job.description.length < 200) {
    score -= 20;
    warnings.push('Description is too short (less than 200 characters). A detailed description attracts better candidates.');
  }

  // Check requirements length
  if (!job.requirements || job.requirements.length < 3) {
    score -= 15;
    warnings.push('Too few requirements. List at least 3 clear requirements.');
  } else if (job.requirements.length > 15) {
    score -= 10;
    warnings.push('Too many requirements (more than 15). This might deter good candidates.');
  }

  // Check salary
  if (!job.salary || (!job.salary.min && !job.salary.max)) {
    score -= 20;
    warnings.push('Missing salary information. Jobs with salaries get up to 50% more applications.');
  }

  // Check location
  if (job.workMode !== 'remote' && !job.location) {
    score -= 15;
    warnings.push('Location is missing for a non-remote job.');
  }
  
  // Check skills
  if (!job.skills || job.skills.length === 0) {
    score -= 10;
    warnings.push('Missing specific skills. AI matching requires skills to work correctly.');
  }

  // Potentially discriminatory wording check (very basic heuristic)
  const discriminatoryWords = ['young', 'energetic', 'recent graduate', 'digital native', 'native english speaker', 'strong man'];
  const descLower = (job.description || '').toLowerCase();
  
  const foundDiscriminatory = discriminatoryWords.filter(word => descLower.includes(word));
  if (foundDiscriminatory.length > 0) {
    score -= 25;
    warnings.push(`Potentially discriminatory wording detected: ${foundDiscriminatory.join(', ')}.`);
  }

  // Inject quality data into request so the controller can use it or save it
  req.jobQuality = {
    score,
    warnings,
  };

  // If score is below a certain threshold, we can either reject or just warn.
  // For this ATS, let's reject if below 50.
  if (score < 50) {
    return next(ApiError.badRequest(`Job Quality Score too low (${score}/100). Please improve the job post. Warnings: ${warnings.join(' ')}`));
  }

  next();
};
