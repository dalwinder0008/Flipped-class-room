import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in the environment.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function analyzeSentiment(text: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze the sentiment of the following student feedback for a flipped classroom:
  "${text}"
  
  Provide the analysis in JSON format with the following fields:
  - sentiment: "Positive", "Negative", or "Neutral"
  - confidence: a number between 0 and 1
  - keywords: an array of 3-5 key themes or words
  - summary: a brief 1-sentence summary of the feedback`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ["Positive", "Negative", "Neutral"] },
            confidence: { type: Type.NUMBER },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ["sentiment", "confidence", "keywords", "summary"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      sentiment: "Neutral",
      confidence: 0.5,
      keywords: ["error"],
      summary: "Analysis failed."
    };
  }
}
