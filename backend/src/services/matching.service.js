import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';

let genAI = null;
const getGenAI = () => {
  if (!env.GEMINI_API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Calculates a match score between a candidate's profile and a job's requirements.
 * This is a deterministic heuristic-based engine.
 * 
 * @param {Object} job - The job document
 * @param {Object} user - The user document (candidate)
 * @returns {Object} { score: number, details: Object }
 */
export const calculateMatchScore = (job, user) => {
  let totalScore = 0;
  const maxScore = 100;
  const details = {};

  // 1. Skills Match (Weight: 50%)
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const userSkills = (user.skills || []).map(s => s.toLowerCase());
  
  if (jobSkills.length > 0) {
    const matchedSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );
    const skillScore = (matchedSkills.length / jobSkills.length) * 50;
    totalScore += skillScore;
    details.skills = { score: Math.round(skillScore), matched: matchedSkills.length, total: jobSkills.length, items: matchedSkills };
  } else {
    totalScore += 50; // Give full skill points if job has no specific skills
    details.skills = { score: 50, matched: 0, total: 0, items: [] };
  }

  // 2. Experience Match (Weight: 30%)
  // Calculate user total years of experience
  let totalYearsExp = 0;
  if (user.experience && user.experience.length > 0) {
    user.experience.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);
      const diffTime = Math.abs(end - start);
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
      totalYearsExp += diffYears;
    });
  }

  const jobExpMapping = {
    'entry': 0,
    'mid': 3,
    'senior': 5,
    'lead': 8
  };
  const requiredExp = jobExpMapping[job.experienceLevel] || 0;
  
  let expScore = 0;
  if (totalYearsExp >= requiredExp) {
    expScore = 30; // Exceeds or meets requirement
  } else if (totalYearsExp > 0 && requiredExp > 0) {
    expScore = (totalYearsExp / requiredExp) * 30; // Partial match
  } else if (requiredExp === 0) {
    expScore = 30;
  }
  
  totalScore += expScore;
  details.experience = { score: Math.round(expScore), userYears: totalYearsExp.toFixed(1), requiredLevel: job.experienceLevel };

  // 3. Location/Work Match (Weight: 20%)
  let locationScore = 0;
  if (job.workMode === 'remote') {
    locationScore = 20;
  } else if (job.location && user.location) {
    if (job.location.toLowerCase().includes(user.location.toLowerCase()) || 
        user.location.toLowerCase().includes(job.location.toLowerCase())) {
      locationScore = 20;
    } else {
      locationScore = 5;
    }
  } else {
    locationScore = 10;
  }
  
  totalScore += locationScore;
  details.location = { score: Math.round(locationScore), jobLocation: job.location, userLocation: user.location, workMode: job.workMode };

  return {
    score: Math.min(Math.round(totalScore), 100),
    details
  };
};

/**
 * Generates an AI explanation for why a candidate matches a job.
 * Falls back to a deterministic template if AI fails.
 * 
 * @param {Object} job - The job document
 * @param {Object} user - The user document (candidate)
 * @param {Object} matchResult - The result from calculateMatchScore
 */
export const generateMatchExplanation = async (job, user, matchResult) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      throw new Error('AI not configured');
    }
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert ATS (Applicant Tracking System). 
      Explain briefly (in 2-3 sentences) why this candidate is a good match for this job, based on the following data:
      
      Job Title: ${job.title}
      Job Required Skills: ${job.skills?.join(', ')}
      Job Experience Level: ${job.experienceLevel}
      
      Candidate Name: ${user.name}
      Candidate Skills: ${user.skills?.join(', ')}
      Candidate Experience: ${matchResult.details.experience.userYears} years
      
      Overall Match Score calculated by system: ${matchResult.score}%
      
      Keep the tone professional and objective. Focus on what matches well.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI match explanation failed, falling back to heuristics:', error.message);
    
    // Fallback deterministic explanation
    const { score, details } = matchResult;
    let explanation = `Candidate has a ${score}% match score. `;
    
    if (details.skills.matched > 0) {
      explanation += `They possess ${details.skills.matched} out of ${details.skills.total} required skills. `;
    }
    
    if (details.experience.score >= 30) {
      explanation += `Their experience level meets or exceeds the requirements for this ${job.experienceLevel} role.`;
    } else {
      explanation += `They have ${details.experience.userYears} years of experience for this ${job.experienceLevel} role.`;
    }
    
    return explanation;
  }
};
