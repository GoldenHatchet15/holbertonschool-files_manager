import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from './server';

describe('server Tests', () => {
  it('should respond to GET /status', async () => {
    expect.assertions(2); // Specify the number of assertions

    const response = await request(app).get('/status');

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      redis: true,
      db: true,
    });
  });

  it('should respond to GET /stats', async () => {
    expect.assertions(3); // Specify the number of assertions

    const response = await request(app).get('/stats');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('files');
  });
});
