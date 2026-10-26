import { generatedCaseSchema, validateReferences, type GeneratedCase } from '../domain';
import { mysteryPrompt } from '../prompts/mystery.prompt';
import { generateJson } from './gemini.service';

export async function generateMystery(premise: string, difficulty: string, theme: string): Promise<GeneratedCase> {
  let raw = '', errors = '';
  for (let attempt = 0; attempt < 2; attempt += 1) {
    raw = await generateJson(mysteryPrompt(premise, difficulty, theme, attempt ? `${errors}\nInvalid output: ${raw.slice(0, 18000)}` : undefined));
    let json: unknown;
    try { json = JSON.parse(raw); }
    catch { errors = 'response was not valid JSON'; continue; }
    const parsed = generatedCaseSchema.safeParse(json);
    if (!parsed.success) { errors = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '); continue; }
    const refs = validateReferences(parsed.data);
    if (refs.length) { errors = refs.join('; '); continue; }
    return parsed.data;
  }
  throw new Error(`Generation output failed validation: ${errors}`);
}
