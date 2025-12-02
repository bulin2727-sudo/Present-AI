import { GoogleGenAI, Type } from '@google/genai';
import { Rubric, GradingResult } from '../types';

export const gradePresentation = async (transcript: string, rubric: Rubric, apiKey: string): Promise<GradingResult> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are an expert presentation coach. 
    Evaluate the following presentation transcript based strictly on the provided rubric.
    
    Transcript:
    "${transcript}"

    Rubric Criteria:
    ${rubric.criteria.map(c => `- ${c.name} (${c.weight}%): ${c.description}`).join('\n')}

    Provide a detailed structured analysis.
    The 'score' for each criteria should be out of 10.
    The 'totalScore' should be a weighted average out of 100 based on the criteria weights.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalScore: { type: Type.NUMBER, description: "Final weighted score out of 100" },
          summary: { type: Type.STRING, description: "A brief executive summary of the performance" },
          strengths: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 3-5 key strengths"
          },
          improvements: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 3-5 specific areas for improvement"
          },
          criteriaBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criteriaId: { type: Type.STRING },
                name: { type: Type.STRING },
                score: { type: Type.NUMBER, description: "Score out of 10" },
                feedback: { type: Type.STRING, description: "Specific feedback for this criterion" }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from grading service");
  }

  return JSON.parse(response.text) as GradingResult;
};

export const parseRubricFromText = async (text: string, apiKey: string): Promise<Rubric> => {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Analyze the following text and extract a structured grading rubric.
    The user might have pasted a rough description, a list of bullet points, or raw text from a document.
    
    Text to analyze:
    "${text}"

    Tasks:
    1. Extract a suitable name and description for the rubric.
    2. Identify key grading criteria.
    3. Assign a weight (percentage) to each criterion. Ensure weights sum to 100. If weights are not specified, infer importance or distribute evenly.
    4. Generate a short, unique ID for the rubric and each criterion (e.g., 'clarity', 'content').
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique slug for the rubric" },
          name: { type: Type.STRING, description: "Display name of the rubric" },
          description: { type: Type.STRING, description: "Brief description of what this rubric evaluates" },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                weight: { type: Type.NUMBER, description: "Weight out of 100" }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate rubric from text");
  }

  return JSON.parse(response.text) as Rubric;
};
