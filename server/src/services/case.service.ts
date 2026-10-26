import mongoose from 'mongoose';
import type { GeneratedCase } from '../domain';
import { CaseModel, type StoredCase } from '../models/Case';

export function validCaseId(id: string) { return mongoose.isValidObjectId(id); }
export async function saveCase(data: GeneratedCase) { return CaseModel.create({ ...data, status: 'active' }); }
export async function findActiveCase(id: string) {
  const createdBefore = new Date(Date.now() - Number(process.env.CASE_TTL_HOURS ?? 24) * 3600000);
  return CaseModel.findOne({ _id: id, createdAt: { $gte: createdBefore } }).lean<StoredCase & { _id: unknown }>();
}
export async function caseHasExpired(id: string) {
  const createdBefore = new Date(Date.now() - Number(process.env.CASE_TTL_HOURS ?? 24) * 3600000);
  return Boolean(await CaseModel.exists({ _id: id, createdAt: { $lt: createdBefore } }));
}
export async function accuse(doc: StoredCase & { _id: unknown }, suspectId: string) {
  const updated = await CaseModel.findOneAndUpdate({ _id: doc._id, status: 'active' }, { $set: { status: 'solved', selectedSuspectId: suspectId, isCorrect: suspectId === doc.solution.culpritId } }, { new: true }).lean<StoredCase & { _id: unknown }>();
  if (updated) return updated;
  return (await CaseModel.findById(doc._id).lean<StoredCase & { _id: unknown }>()) ?? doc;
}
