
import { GoogleGenAI, Type } from "@google/genai";

export async function detectShoeFromImage(base64Image: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a professional footwear recognition system for store inventory management.
    
    CRITICAL RULES:
    1. Identify the brand, model silhouette, and color.
    2. Estimate both the typical WHOLESALE price (store cost) and RETAIL price (selling price) in Indian Rupees (INR).
    3. Always return a valid JSON matching the schema.
    4. Provide a 'confidence' score from 0 to 1.
  `;

  const prompt = `
    Analyze this image for a shoe. 
    Return the Brand, Color, Estimated EU Size, Estimated Wholesale Price, and Estimated Retail Price in Indian Rupees (INR).
    If no shoe is visible, set brand to "None detected" and confidence to 0.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            color: { type: Type.STRING, description: "Primary colorway" },
            size: { type: Type.STRING, description: "Estimated EU size" },
            wholesalePrice: { type: Type.NUMBER, description: "Estimated wholesale cost in INR" },
            retailerPrice: { type: Type.NUMBER, description: "Estimated retail price in INR" },
            brand: { type: Type.STRING, description: "Detected brand name" },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-1" },
            notes: { type: Type.STRING, description: "Troubleshooting note for the user" }
          },
          required: ["color", "size", "wholesalePrice", "retailerPrice", "brand", "confidence", "notes"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini AI Billing Error:", error);
    throw new Error("Failed to parse shoe features. Please ensure the shoe is clearly visible and try again.");
  }
}
