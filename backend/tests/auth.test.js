import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'seeker',
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toEqual(testUser.email);
  });

  it('should not register a user with an existing email', async () => {
    // First registration
    await request(app).post('/api/auth/register').send(testUser);
    
    // Second registration attempt
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(409);
    expect(res.body.success).toBeFalsy();
  });

  it('should login an existing user', async () => {
    // Register first
    await request(app).post('/api/auth/register').send(testUser);

    // Try login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty('token');
  });

  it('should fail login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBeFalsy();
  });
});
