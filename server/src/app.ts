import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { createCaseSchema, accusationSchema, validateReferences } from './domain';
import { ApiError, errorHandler, notFound } from './middleware/error-handler';
import { CaseModel } from './models/Case';
import { generateMystery } from './services/mystery-generation.service';
import { accuse, caseHasExpired, findActiveCase, saveCase, validCaseId } from './services/case.service';
import { toPublicCase, toVerdict } from './services/public-case';

export function createApp(clientOrigin = process.env.CLIENT_ORIGIN) {
  const app = express();
  app.disable('x-powered-by'); app.use(helmet());
  if (clientOrigin) app.use(cors({ origin: clientOrigin }));
  else if (process.env.NODE_ENV !== 'production') app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json({ limit: '32kb' }));
  const limiter = rateLimit({ windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000), limit: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10), standardHeaders: true, legacyHeaders: false });
  app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/api/v1/cases', limiter, async (req, res, next) => {
    try {
      const body = createCaseSchema.safeParse(req.body);
      if (!body.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Please enter a fictional premise between 30 and 800 characters and choose valid options.');
      if (/\b(doxx|dox|real person|my boss|my neighbor|kill|murder instructions|how to poison)\b/i.test(body.data.premise)) throw new ApiError(422, 'UNSAFE_PREMISE', 'Please fictionalize the premise and avoid targeting real people or requesting harmful details.');
      let data: Awaited<ReturnType<typeof generateMystery>>;
      try {
  data = await generateMystery(
    body.data.premise,
    body.data.difficulty,
    body.data.theme
  );
} catch (error) {
  console.error('Mystery generation failed:', error instanceof Error ? error.message : 'unknown error');
  throw new ApiError(
    502,
    'GENERATION_FAILED',
    'The case could not be created right now. Your premise is safe to retry.'
  );
}const refs = validateReferences(data); if (refs.length) throw new Error(refs.join(', '));
      const saved = await saveCase(data);
      res.status(201).json({ case: toPublicCase(saved.toObject() as never) });
    } catch (err) { next(err); }
  });
  app.get('/api/v1/cases/:caseId', async (req, res, next) => {
    try {
      const caseId = String(req.params.caseId);
      if (!validCaseId(caseId)) throw new ApiError(400, 'INVALID_CASE_ID', 'This case link is malformed.');
      const found = await findActiveCase(caseId);
      if (!found) { if (await caseHasExpired(caseId)) throw new ApiError(410, 'CASE_EXPIRED', 'This case has expired. Start a new mystery to continue.'); throw new ApiError(404, 'CASE_NOT_FOUND', 'This case was not found.'); }
      res.json({ case: toPublicCase(found) });
    } catch (err) { next(err); }
  });
  app.post('/api/v1/cases/:caseId/accusation', limiter, async (req, res, next) => {
    try {
      const caseId = String(req.params.caseId);
      if (!validCaseId(caseId)) throw new ApiError(400, 'INVALID_CASE_ID', 'This case link is malformed.');
      const body = accusationSchema.safeParse(req.body);
      if (!body.success) throw new ApiError(400, 'INVALID_SUSPECT', 'Choose a suspect from this case.');
      const found = await findActiveCase(caseId);
      if (!found) { if (await caseHasExpired(caseId)) throw new ApiError(410, 'CASE_EXPIRED', 'This case has expired. Start a new mystery to continue.'); throw new ApiError(404, 'CASE_NOT_FOUND', 'This case was not found.'); }
      if (!found.suspects.some((s) => s.id === body.data.suspectId)) throw new ApiError(400, 'INVALID_SUSPECT', 'Choose a suspect from this case.');
      const solved = found.status === 'solved' ? found : await accuse(found, body.data.suspectId);
      res.json({ result: toVerdict(solved) });
    } catch (err) { next(err); }
  });
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.resolve(__dirname, '../../client/dist');
    const indexFile = path.join(clientDist, 'index.html');
    if (fs.existsSync(indexFile)) {
      app.use(express.static(clientDist));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        res.sendFile(indexFile);
      });
    }
  }
  app.use(notFound); app.use(errorHandler);
  return app;
}
