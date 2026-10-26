import mongoose, { Schema } from 'mongoose';
import type { GeneratedCase } from '../domain';

export interface StoredCase extends Omit<GeneratedCase, 'solution'> {
  solution: GeneratedCase['solution'];
  status: 'active' | 'solved';
  selectedSuspectId?: string;
  isCorrect?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const CaseSchema = new Schema<any>({
  title: { type: String, required: true }, theme: { type: String, required: true }, difficulty: { type: String, required: true }, premise: { type: String, required: true },
  briefing: { type: Schema.Types.Mixed, required: true }, suspects: { type: [Schema.Types.Mixed], required: true }, evidence: { type: [Schema.Types.Mixed], required: true }, solution: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['active','solved'], default: 'active' }, selectedSuspectId: String, isCorrect: Boolean
}, { timestamps: true });
CaseSchema.index({ createdAt: 1 });
export const CaseModel = mongoose.models.MysteryCase || mongoose.model<StoredCase>('MysteryCase', CaseSchema);
