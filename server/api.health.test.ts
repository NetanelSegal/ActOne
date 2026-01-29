import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('API health', () => {
  it('GET /api/health returns ok and timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('timestamp');
  });
});
