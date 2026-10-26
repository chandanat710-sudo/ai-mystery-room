import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { getEnv } from '../config/env';

export async function generateJson(prompt: string): Promise<string> {
  const env = getEnv();
  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey, httpOptions: { timeout: env.geminiTimeoutMs, retryOptions: { attempts: 2 } } });
  const isGemini3Or4 = /^gemini-(3|4)[.-]/.test(env.geminiModel);
  const baseConfig = {
    responseMimeType: 'application/json',
    maxOutputTokens: 8192,
    ...(isGemini3Or4 ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {})
  };
  const result = await ai.models.generateContent({ model: env.geminiModel, contents: prompt, config: baseConfig });
  if (!result.text) throw new Error('Gemini returned an empty response');
  return result.text;
}
