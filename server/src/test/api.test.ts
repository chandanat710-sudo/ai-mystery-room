import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('API basics', () => {
  const app = createApp('http://localhost:5173');
  it('returns a secret-free health response', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
  it('rejects malformed case IDs before querying MongoDB', async () => {
    const response = await request(app).get('/api/v1/cases/not-a-mongo-id');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_CASE_ID');
    expect(response.body.error).not.toHaveProperty('stack');
  });
});
