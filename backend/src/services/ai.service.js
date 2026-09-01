import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';

/**
 * AI Resume Matching Service using Google Gemini.
 * Returns a structured match analysis between a candidate profile and job description.
 */

let genAI = null;

const getGenAI = () => {
  if (!env.GEMINI_API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI;
};

export const isAIAvailable = () => {
  return !!env.GEMINI_API_KEY;
};

export const analyzeMatch = async (userProfile, jobDetails) => {
  const ai = getGenAI();
  if (!ai) {
    return null;
  }

  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert HR analyst. Analyze how well a candidate matches a job posting and return a JSON response.

CANDIDATE PROFILE:
- Name: ${userProfile.name}
- Skills: ${(userProfile.skills || []).join(', ') || 'Not specified'}
- Headline: ${userProfile.headline || 'Not specified'}
- Bio: ${userProfile.bio || 'Not specified'}
- Education: ${(userProfile.education || []).map(e => `${e.degree} in ${e.field} from ${e.institution}`).join('; ') || 'Not specified'}
- Experience: ${(userProfile.experience || []).map(e => `${e.title} at ${e.company}`).join('; ') || 'Not specified'}

JOB POSTING:
- Title: ${jobDetails.title}
- Description: ${jobDetails.description}
- Required Skills: ${(jobDetails.skills || []).join(', ')}
- Requirements: ${(jobDetails.requirements || []).join('; ')}
- Experience Level: ${jobDetails.experienceLevel}

Respond ONLY with a valid JSON object in this exact format:
{
  "matchScore": <number 0-100>,
  "matchingSkills": [<list of skills the candidate has that match the job>],
  "missingSkills": [<list of required skills the candidate lacks>],
  "suggestions": [<2-4 actionable improvement suggestions>],
  "summary": "<2-3 sentence explanation of the match>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      matchScore: Math.min(100, Math.max(0, parsed.matchScore || 0)),
      matchingSkills: parsed.matchingSkills || [],
      missingSkills: parsed.missingSkills || [],
      suggestions: parsed.suggestions || [],
      summary: parsed.summary || 'Analysis unavailable.',
    };
  } catch (error) {
    console.error('AI analysis error:', error.message);
    // Return a fallback simple match using keyword comparison
    return generateSimpleMatch(userProfile, jobDetails);
  }
};

/**
 * Fallback keyword-based matching when AI is unavailable or fails.
 */
function generateSimpleMatch(userProfile, jobDetails) {
  const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
  const jobSkills = (jobDetails.skills || []).map(s => s.toLowerCase());

  const matchingSkills = jobSkills.filter(s => userSkills.some(us => us.includes(s) || s.includes(us)));
  const missingSkills = jobSkills.filter(s => !userSkills.some(us => us.includes(s) || s.includes(us)));

  const matchScore = jobSkills.length > 0
    ? Math.round((matchingSkills.length / jobSkills.length) * 100)
    : 0;

  return {
    matchScore,
    matchingSkills,
    missingSkills,
    suggestions: missingSkills.slice(0, 3).map(s => `Learn ${s} fundamentals`),
    summary: `Based on keyword matching, you match ${matchScore}% of the required skills. ${missingSkills.length > 0 ? `Consider learning: ${missingSkills.slice(0, 3).join(', ')}.` : 'Great match!'}`,
  };
}
