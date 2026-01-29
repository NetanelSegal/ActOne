import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('Auth API', () => {
  it('POST /api/auth/signup with invalid body returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login with invalid body returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/auth/me without session returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
