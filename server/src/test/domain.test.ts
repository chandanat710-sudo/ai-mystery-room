import { describe, expect, it } from 'vitest';
import { createCaseSchema, validateReferences, type GeneratedCase } from '../domain';
import { mysteryPrompt } from '../prompts/mystery.prompt';
import { toPublicCase, toVerdict } from '../services/public-case';

const sample = (difficulty: 'easy'|'medium'|'hard' = 'easy'): GeneratedCase => ({
  title: 'The Quiet Gallery', theme: 'theft', difficulty, premise: 'A quiet gallery loses its only moonstone on a rainy opening night.',
  briefing: { incident: 'A rare moonstone disappeared from the gallery during the opening.', location: 'Northglass Gallery', occurredAt: '20:15', discoveredAt: '20:40', objective: 'Identify who took the stone and explain the clues.', timeline: [{ time: '20:00', event: 'Guests arrived at the gallery.', relatedSuspectIds: ['suspect_1'] }, { time: '20:15', event: 'The display case was found open.', relatedSuspectIds: [] }] },
  suspects: ['Ari','Bea','Cal'].map((name,i)=>({id:`suspect_${i+1}`,name,role:'Gallery guest',description:'A visitor with a connection to the gallery.',motive:'Wanted to preserve a family memory.',alibi:'Claims to have been in the lobby.',opportunity:'Could enter the east room.',initialSuspicion:'Was near the gallery.'})),
  evidence: [1,2,3,4,5].map(i=>({id:`evidence_${i}`,type:'document' as const,title:`Note ${i}`,sourceLabel:'Fictional gallery record',createdAt:'20:00',summary:'A short description of this record.',content:{format:'text' as const,text:'A visitor signed the gallery guestbook before the display was opened.'},clueSignificance:'This record places Ari near the display at the relevant time.',relatedSuspectIds:['suspect_1'],isRedHerring:false})),
  solution:{culpritId:'suspect_1',motive:'Ari wanted to preserve a family memory.',methodSummary:'Ari took the moonstone during the gallery event.',timelineSummary:'Ari entered before the opening and left after the display was checked.',reasoning:'The guest record and access log place Ari at the display during the incident.',keyEvidenceIds:['evidence_1','evidence_2'],suspectEliminations:[{suspectId:'suspect_2',reason:'A separate record places Bea elsewhere.'}]}
});

describe('request and generated case validation', () => {
  it('prompts for all required nested briefing, evidence, and solution fields', () => {
    const prompt = mysteryPrompt('A quiet gallery loses its only moonstone on a rainy opening night.', 'easy', 'theft');
    for (const field of ['occurredAt', 'discoveredAt', 'relatedSuspectIds', 'clueSignificance', 'isRedHerring', 'suspectId', 'keyEvidenceIds']) {
      expect(prompt).toContain(field);
    }
  });
  it('trims and accepts valid premises and rejects short premises', () => {
    expect(createCaseSchema.safeParse({premise:'  A quiet gallery loses its only moonstone on a rainy opening night.  ',difficulty:'easy',theme:'theft'}).success).toBe(true);
    expect(createCaseSchema.safeParse({premise:'too short',difficulty:'easy',theme:'theft'}).success).toBe(false);
  });
  it('rejects duplicate IDs and unknown references', () => {
    const data=sample(); data.suspects[1]!.id='suspect_1';
    expect(validateReferences(data)).toContain('duplicate suspect IDs');
    const other=sample(); other.solution.culpritId='unknown';
    expect(validateReferences(other)).toContain('culprit ID is unknown');
  });
  it('requires difficulty-specific case counts', () => {
    const data=sample('medium');
    expect(validateReferences(data)).toContain('difficulty requires 4 suspects');
    expect(validateReferences(data)).toContain('medium difficulty requires 6-7 evidence items');
  });
  it('strips private solution and clue significance from the public case', () => {
    const doc={...sample(),_id:'case-id',status:'active' as const,createdAt:new Date('2026-01-01T00:00:00.000Z'),updatedAt:new Date()};
    const dto=toPublicCase(doc);
    expect(dto).not.toHaveProperty('solution');
    expect(dto.evidence[0]).not.toHaveProperty('clueSignificance');
  });
  it('returns the persisted correct or incorrect verdict and reveals the culprit only there', () => {
    const doc={...sample(),_id:'case-id',status:'solved' as const,selectedSuspectId:'suspect_2',isCorrect:false,createdAt:new Date(),updatedAt:new Date()};
    const result=toVerdict(doc);
    expect(result.correct).toBe(false);
    expect(result.selectedSuspectId).toBe('suspect_2');
    expect(result.culprit.name).toBe('Ari');
    expect(result.reveal.keyEvidenceIds).toEqual(['evidence_1','evidence_2']);
  });
});
