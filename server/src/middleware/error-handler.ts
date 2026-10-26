import type { ErrorRequestHandler, RequestHandler } from 'express';

export class ApiError extends Error { constructor(public status: number, public code: string, message: string) { super(message); } }
export const notFound: RequestHandler = (_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'That API route was not found.'));
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const dependencyDown = err instanceof Error && /Mongo|Mongoose|ECONNREFUSED|server selection/i.test(`${err.name} ${err.message}`);
  const error = err instanceof ApiError ? err : dependencyDown ? new ApiError(503, 'SERVICE_UNAVAILABLE', 'The case service is temporarily unavailable. Please try again shortly.') : new ApiError(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.');
  if (!(err instanceof ApiError)) console.error('Request failed:', err instanceof Error ? err.message : 'unknown error');
  res.status(error.status).json({ error: { code: error.code, message: error.message } });
};
