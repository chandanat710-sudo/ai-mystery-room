import type { StoredCase } from '../models/Case';

export function toPublicCase(doc: StoredCase & { _id: unknown }) {
  return {
    id: String(doc._id), title: doc.title, theme: doc.theme, difficulty: doc.difficulty, premise: doc.premise,
    briefing: doc.briefing, suspects: doc.suspects,
    evidence: doc.evidence.map(({ clueSignificance: _hidden, ...item }) => item),
    status: doc.status, createdAt: doc.createdAt.toISOString()
  };
}
export function toVerdict(doc: StoredCase & { _id: unknown }) {
  return { correct: doc.isCorrect, selectedSuspectId: doc.selectedSuspectId, culprit: { id: doc.solution.culpritId, name: doc.suspects.find((s) => s.id === doc.solution.culpritId)?.name }, reveal: doc.solution, evidence: doc.evidence };
}
