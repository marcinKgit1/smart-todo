
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartSuggestions = async (context: string): Promise<SuggestionResponse> => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3-5 productive tasks or subtasks based on the following context: "${context}". Make them actionable and concise.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                category: { type: Type.STRING }
              },
              required: ['text', 'priority', 'category']
            }
          }
        },
        required: ['suggestions']
      }
    }
  });

  const response = await model;
  try {
    return JSON.parse(response.text || '{"suggestions": []}');
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return { suggestions: [] };
  }
};
