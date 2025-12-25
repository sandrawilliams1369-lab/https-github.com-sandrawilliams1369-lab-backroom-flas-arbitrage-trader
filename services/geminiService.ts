
import { GoogleGenAI, Type } from "@google/genai";
import { MIRROR_SYNTHESIS_PROMPT } from "../constants";

// Initialize GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAgentAnalysis = async (userPrompt: string, marketData: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Current Market Context: ${JSON.stringify(marketData)}\n\nUser Question: ${userPrompt}`,
    config: {
      systemInstruction: MIRROR_SYNTHESIS_PROMPT,
      temperature: 0.7,
    }
  });

  return response.text;
};

export const generateFlashcard = async (marketEvent: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 'Mirror Synthesis Retentive Flashcard' based on this market event: ${marketEvent}. 
               If it's a trade result, explain the structural reasons for success or failure.
               Format as JSON with: topic, content (the lesson/fact), reasoning (why it matters), and crystallizationLevel (a number 0-100).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          content: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          crystallizationLevel: { type: Type.NUMBER }
        },
        required: ["topic", "content", "reasoning", "crystallizationLevel"]
      }
    }
  });

  try {
    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch (e) {
    console.error("Failed to parse flashcard JSON", e);
    return null;
  }
};

export const getStructuredMirrorAnalysis = async (trade: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Perform a detailed 5-layer Mirror Synthesis analysis on this trade execution: ${JSON.stringify(trade)}.
               Provide a structured breakdown for each layer:
               L1 (Sensory): Data captured.
               L2 (Pattern): Inefficiency recognized.
               L3 (Risk): Confidence and Safety Corridors.
               L4 (Strategic): Temporal significance.
               L5 (Crystallization): Final self-reflection.`,
    config: {
      systemInstruction: MIRROR_SYNTHESIS_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          layers: {
            type: Type.OBJECT,
            properties: {
              l1: { type: Type.STRING },
              l2: { type: Type.STRING },
              l3: { type: Type.STRING },
              l4: { type: Type.STRING },
              l5: { type: Type.STRING }
            },
            required: ["l1", "l2", "l3", "l4", "l5"]
          }
        },
        required: ["summary", "layers"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Mirror Analysis JSON Parse Error", e);
    return null;
  }
};

export const analyzeTradeOutcome = async (trade: any) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a post-trade Mirror Synthesis analysis on this trade: ${JSON.stringify(trade)}. 
                 Explain why it was a good or bad move using L1-L5 reasoning. Return strictly text.`,
      config: {
        systemInstruction: MIRROR_SYNTHESIS_PROMPT,
        temperature: 0.5,
      }
    });
    return response.text;
};
