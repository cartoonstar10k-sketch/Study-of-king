
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateQuestion = async (
  subject: string,
  difficulty: Difficulty,
  language: string,
  country: string = "Global"
): Promise<Question> => {
  const isGlobal = country === "Global";
  const locationContext = isGlobal 
    ? "global context" 
    : `the specific region of ${country}, focusing on its local nuances, regional history, indigenous cultures, and specific geographical traits`;

  const prompt = `Generate a single, unique, and highly challenging multiple-choice question for a "Global Polymath Quest" app.
  
  CONTEXT:
  - Subject: ${subject}
  - Regional Focus: ${locationContext}
  - Difficulty: ${difficulty} (Scale: Beginner, Intermediate, Advanced, Expert, Master)
  - Output Language: ${language} (Question and all options MUST be in this language)

  REQUIREMENTS:
  - If a specific region (${country}) is selected, the question MUST deeply relate to that region's unique contribution to the subject. For example, if region is "Japan" and subject is "Science", ask about Japanese Nobel laureates or specific local innovations.
  - The question should feel like cultural or regional trivia mixed with academic depth.
  - Avoid generic questions. Be specific.
  - Provide exactly 4 plausible options.
  - Provide a detailed, interesting, and educational explanation for the correct answer.

  Ensure the tone is professional yet engaging.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The quiz question text." },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: 4,
            maxItems: 4,
            description: "Four possible answers."
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)." },
          explanation: { type: Type.STRING, description: "A brief, interesting explanation of the correct answer." }
        },
        required: ["text", "options", "correctAnswerIndex", "explanation"]
      }
    }
  });

  const data = JSON.parse(response.text);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    text: data.text,
    options: data.options,
    correctAnswerIndex: data.correctAnswerIndex,
    explanation: data.explanation,
    difficulty,
    subject,
    language
  };
};
