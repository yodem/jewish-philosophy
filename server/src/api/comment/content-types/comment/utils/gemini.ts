import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEFAULT_GEMINI_MODEL, LOG_PREFIX } from "./constants";

interface GeminiConfig {
  apiKey: string;
  model?: string;
}

function getGeminiConfig(): GeminiConfig | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
  };
}

export async function generateContent(prompt: string): Promise<string | null> {
  const config = getGeminiConfig();
  if (!config) return null;

  const genAI = new GoogleGenerativeAI(config.apiKey);
  const model = genAI.getGenerativeModel({ model: config.model! });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

function cleanResponseText(text: string): string {
  let clean = text.trim();
  if (clean.startsWith("```json")) clean = clean.replace(/^```json\s*/, "");
  if (clean.startsWith("```")) clean = clean.replace(/^```\s*/, "");
  if (clean.endsWith("```")) clean = clean.replace(/\s*```$/, "");
  return clean.trim();
}

export function parseCategories(
  responseText: string,
  validNames: string[]
): string[] {
  try {
    const parsed = JSON.parse(cleanResponseText(responseText));
    const arr = Array.isArray(parsed) ? parsed : parsed?.categories;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (c: unknown) => typeof c === "string" && validNames.includes(c.trim())
    );
  } catch {
    return validNames.filter((name) => responseText.includes(name));
  }
}
