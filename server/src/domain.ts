import { z } from 'zod';

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);
export const themeSchema = z.enum(['auto', 'crime', 'theft', 'sabotage', 'missing_object', 'secret_deception']);
export const messageSchema = z.object({ time: z.string().max(40), sender: z.string().max(80), text: z.string().max(1200) });
const contentSchema = z.discriminatedUnion('format', [
  z.object({ format: z.literal('messages'), messages: z.array(messageSchema).min(3).max(10) }),
  z.object({ format: z.literal('text'), text: z.string().min(10).max(5000) }),
  z.object({ format: z.literal('image_description'), description: z.string().min(10).max(1500), visualDetails: z.array(z.string().max(300)).min(1).max(8), imageUrl: z.string().url().optional() }),
  z.object({ format: z.literal('transcript'), transcript: z.string().min(10).max(3000), recordedAt: z.string().max(100), durationSeconds: z.number().positive().max(3600).optional() }),
  z.object({ format: z.literal('log'), entries: z.array(z.object({ time: z.string().max(40), event: z.string().max(500) })).min(1).max(20) })
]);
export const generatedCaseSchema = z.object({
  title: z.string().min(3).max(120), theme: themeSchema.exclude(['auto']), difficulty: difficultySchema, premise: z.string().min(30).max(800),
  briefing: z.object({ incident: z.string().min(20).max(2000), location: z.string().min(2).max(200), occurredAt: z.string().max(100), discoveredAt: z.string().max(100), objective: z.string().min(10).max(500), timeline: z.array(z.object({ time: z.string().max(100), event: z.string().min(4).max(500), relatedSuspectIds: z.array(z.string().max(80)).max(5) })).min(2).max(10) }),
  suspects: z.array(z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(100), role: z.string().min(2).max(150), description: z.string().min(5).max(700), motive: z.string().min(5).max(700), alibi: z.string().min(5).max(700), opportunity: z.string().min(5).max(700), initialSuspicion: z.string().min(5).max(700) })).min(3).max(5),
  evidence: z.array(z.object({ id: z.string().min(1).max(80), type: z.enum(['chat_transcript','document','image_clue','audio_transcript','timeline_log']), title: z.string().min(2).max(150), sourceLabel: z.string().min(2).max(150), createdAt: z.string().max(100), summary: z.string().min(5).max(500), content: contentSchema, clueSignificance: z.string().min(5).max(1000), relatedSuspectIds: z.array(z.string().max(80)).max(5), isRedHerring: z.boolean() })).min(5).max(8),
  solution: z.object({ culpritId: z.string().min(1).max(80), motive: z.string().min(5).max(1000), methodSummary: z.string().min(5).max(1000), timelineSummary: z.string().min(5).max(1500), reasoning: z.string().min(10).max(3000), keyEvidenceIds: z.array(z.string().min(1).max(80)).min(2).max(8), suspectEliminations: z.array(z.object({ suspectId: z.string().min(1).max(80), reason: z.string().min(5).max(700) })).max(5) })
});
export type GeneratedCase = z.infer<typeof generatedCaseSchema>;

export const createCaseSchema = z.object({ premise: z.string().trim().min(30).max(800), difficulty: difficultySchema.default('medium'), theme: themeSchema.default('auto') });
export const accusationSchema = z.object({ suspectId: z.string().min(1).max(80) });

export function validateReferences(data: GeneratedCase): string[] {
  const errors: string[] = [];
  const suspectIds = data.suspects.map((s) => s.id), evidenceIds = data.evidence.map((e) => e.id);
  if (new Set(suspectIds).size !== suspectIds.length) errors.push('duplicate suspect IDs');
  if (new Set(evidenceIds).size !== evidenceIds.length) errors.push('duplicate evidence IDs');
  if (!suspectIds.includes(data.solution.culpritId)) errors.push('culprit ID is unknown');
  if (data.solution.keyEvidenceIds.some((id) => !evidenceIds.includes(id))) errors.push('key evidence ID is unknown');
  if (new Set(data.solution.keyEvidenceIds).size < 2) errors.push('at least two distinct key evidence IDs are required');
  const suspectSet = new Set(suspectIds);
  if (data.evidence.some((e) => e.relatedSuspectIds.some((id) => !suspectSet.has(id)))) errors.push('evidence references an unknown suspect');
  if (data.briefing.timeline.some((t) => t.relatedSuspectIds.some((id) => !suspectSet.has(id)))) errors.push('timeline references an unknown suspect');
  if (data.solution.suspectEliminations.some((e) => !suspectSet.has(e.suspectId))) errors.push('elimination references an unknown suspect');
  const matchingFormat: Record<string, string> = { chat_transcript: 'messages', document: 'text', image_clue: 'image_description', audio_transcript: 'transcript', timeline_log: 'log' };
  if (data.evidence.some((e) => e.content.format !== matchingFormat[e.type])) errors.push('evidence type does not match its content format');
  const counts = { easy: [3,5], medium: [4,6], hard: [5,8] }[data.difficulty];
  if (data.suspects.length !== counts[0]) errors.push(`difficulty requires ${counts[0]} suspects`);
  if (data.difficulty === 'easy' && data.evidence.length !== 5) errors.push('easy difficulty requires 5 evidence items');
  if (data.difficulty === 'medium' && (data.evidence.length < 6 || data.evidence.length > 7)) errors.push('medium difficulty requires 6-7 evidence items');
  if (data.difficulty === 'hard' && data.evidence.length !== 8) errors.push('hard difficulty requires 8 evidence items');
  return errors;
}
