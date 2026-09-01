import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
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
 * Parses a PDF buffer and extracts structured data using Gemini AI.
 * 
 * @param {Buffer} pdfBuffer - The raw buffer of the PDF file
 * @returns {Object} Structured data { name, email, phone, location, headline, bio, skills, experience, education }
 */
export const parseResumeToJSON = async (pdfBuffer) => {
  try {
    // 1. Extract raw text from PDF
    const data = await pdf(pdfBuffer);
    const rawText = data.text;

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Could not extract text from the PDF');
    }

    // 2. Setup AI model with JSON Schema for deterministic output
    const ai = getGenAI();
    if (!ai) {
      throw new Error('AI not configured');
    }

    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: "Candidate full name" },
            email: { type: SchemaType.STRING, description: "Candidate email address" },
            phone: { type: SchemaType.STRING, description: "Candidate phone number" },
            location: { type: SchemaType.STRING, description: "Candidate location (city, state, country)" },
            headline: { type: SchemaType.STRING, description: "A brief 1-line professional headline" },
            bio: { type: SchemaType.STRING, description: "A short professional summary or bio" },
            skills: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Array of technical and soft skills"
            },
            experience: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING, description: "Job title" },
                  company: { type: SchemaType.STRING, description: "Company name" },
                  location: { type: SchemaType.STRING, description: "Job location" },
                  startDate: { type: SchemaType.STRING, description: "Start date (YYYY-MM-DD or YYYY-MM)" },
                  endDate: { type: SchemaType.STRING, description: "End date (YYYY-MM-DD or YYYY-MM). Leave empty if current." },
                  current: { type: SchemaType.BOOLEAN, description: "True if currently working here" },
                  description: { type: SchemaType.STRING, description: "Job responsibilities and achievements" }
                }
              }
            },
            education: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  school: { type: SchemaType.STRING, description: "School or University name" },
                  degree: { type: SchemaType.STRING, description: "Degree obtained" },
                  fieldOfStudy: { type: SchemaType.STRING, description: "Major or field of study" },
                  startDate: { type: SchemaType.STRING, description: "Start date" },
                  endDate: { type: SchemaType.STRING, description: "End date" },
                  current: { type: SchemaType.BOOLEAN, description: "True if currently studying" }
                }
              }
            }
          }
        }
      }
    });

    const prompt = `
      You are an expert ATS system. Extract the following information from this raw resume text.
      Format the output as a valid JSON object matching the provided schema.
      If a field is missing in the resume, leave it empty or null. Do not hallucinate information.
      
      Resume Text:
      ${rawText.substring(0, 15000)} // Limit text to avoid token limits if it's too long
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON string from Gemini
    const structuredData = JSON.parse(responseText);
    
    return structuredData;
  } catch (error) {
    console.error('Resume parsing failed:', error);
    throw new Error('Failed to parse resume: ' + error.message);
  }
};
