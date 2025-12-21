
import { GoogleGenAI, Type } from "@google/genai";
import { WordData, AnalysisResult } from "../types";

const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const analyzeTextWithGemini = async (text: string): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const truncatedText = text.length > 20000 ? text.substring(0, 20000) + "..." : text;

  const prompt = `
    Analyze the following Chinese text for keyword extraction and sentiment analysis.
    
    1. Keywords: Extract the top 50-80 most significant keywords/concepts with a relevance score (1-100).
    2. Sentiment: Identify the primary emotions (e.g., Joy 喜悦, Anger 愤怒, Sadness 悲伤, Fear 恐惧, Surprise 惊讶, Neutral 中性). 
       Provide a score for each emotion present (total score should reflect intensity) and a brief explanation in Chinese for the overall tone.
    
    Text snippet:
    "${truncatedText}"
  `;

  try {
    const response = await ai.models.generateContent({
      // Fix: Use 'gemini-3-flash-preview' for basic text tasks as per guidelines
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyword: { type: Type.STRING },
                  score: { type: Type.INTEGER }
                },
                required: ["keyword", "score"]
              }
            },
            sentiment: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["label", "score", "explanation"]
              }
            },
            overallTone: { type: Type.STRING }
          },
          required: ["keywords", "sentiment", "overallTone"]
        }
      }
    });

    // Fix: Access .text property directly (not a method) as per SDK guidelines
    const result = JSON.parse(response.text || "{}");

    // Map colors to common labels
    const colorMap: Record<string, string> = {
      '喜悦': '#fbbf24',
      'Joy': '#fbbf24',
      '愤怒': '#ef4444',
      'Anger': '#ef4444',
      '悲伤': '#3b82f6',
      'Sadness': '#3b82f6',
      '恐惧': '#a855f7',
      'Fear': '#a855f7',
      '惊讶': '#ec4899',
      'Surprise': '#ec4899',
      '中性': '#94a3b8',
      'Neutral': '#94a3b8'
    };

    return {
      keywords: (result.keywords || []).map((item: any) => ({
        text: item.keyword,
        value: item.score
      })).sort((a: any, b: any) => b.value - a.value),
      sentiment: (result.sentiment || []).map((item: any) => ({
        ...item,
        color: colorMap[item.label] || colorMap[item.label.split(' ')[0]] || '#6366f1'
      })),
      overallTone: result.overallTone || ""
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
