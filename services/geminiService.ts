
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionResponse } from "../types.ts";

export const getSmartSuggestions = async (context: string): Promise<SuggestionResponse> => {
  // Bezpieczny dostęp do klucza API ze zmiennych środowiskowych
  const apiKey = (window as any).process?.env?.API_KEY || (process as any)?.env?.API_KEY || '';
  
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3-5 productive tasks or subtasks based on the following context: "${context}". Make them actionable and concise. Return results in Polish.`,
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

  try {
    return JSON.parse(response.text || '{"suggestions": []}');
  } catch (error) {
    console.error("Błąd parsowania odpowiedzi Gemini", error);
    return { suggestions: [] };
  }
};
