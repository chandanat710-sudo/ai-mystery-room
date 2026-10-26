export type Suspect = { id: string; name: string; role: string; description: string; motive: string; alibi: string; opportunity: string; initialSuspicion: string };
export type Evidence = { id: string; type: string; title: string; sourceLabel: string; createdAt: string; summary: string; content: Record<string, unknown>; relatedSuspectIds: string[]; isRedHerring: boolean };
export type MysteryCase = { id: string; title: string; theme: string; difficulty: string; premise: string; briefing: { incident: string; location: string; occurredAt: string; discoveredAt: string; objective: string; timeline: { time: string; event: string; relatedSuspectIds: string[] }[] }; suspects: Suspect[]; evidence: Evidence[]; status: string; createdAt: string };
export type Verdict = { correct: boolean; selectedSuspectId: string; culprit: { id: string; name: string }; reveal: { motive: string; methodSummary: string; timelineSummary: string; reasoning: string; keyEvidenceIds: string[]; suspectEliminations: { suspectId: string; reason: string }[] }; evidence: (Evidence & { clueSignificance: string })[] };
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? 'The service is unavailable. Please try again.');
  return data as T;
}
export const api = {
  create: (body: { premise: string; difficulty: string; theme: string }) => request<{ case: MysteryCase }>('/api/v1/cases', { method: 'POST', body: JSON.stringify(body) }),
  get: (id: string) => request<{ case: MysteryCase }>(`/api/v1/cases/${encodeURIComponent(id)}`),
  accuse: (id: string, suspectId: string) => request<{ result: Verdict }>(`/api/v1/cases/${encodeURIComponent(id)}/accusation`, { method: 'POST', body: JSON.stringify({ suspectId }) })
};
