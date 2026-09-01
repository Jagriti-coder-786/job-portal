import request from 'supertest';
import app from '../src/app.js';

describe('Job Endpoints', () => {
  let token;
  let companyId;
  let jobId;

  beforeEach(async () => {
    // 1. Register user
    const resAuth = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Recruiter User',
        email: 'recruiter@example.com',
        password: 'password123',
        role: 'recruiter'
      });
    token = resAuth.body.data.token;

    // 2. Create company
    const resCompany = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Company',
        website: 'https://testcompany.com',
        location: 'New York',
        description: 'Test description',
        industry: 'Technology',
      });
    companyId = resCompany.body.data.company._id;
  });

  it('should create a new job', async () => {
    const jobData = {
      title: 'Software Engineer',
      description: 'We are looking for a software engineer.',
      company: companyId,
      location: 'Remote',
      type: 'full-time',
      experienceLevel: 'mid',
      salary: {
        min: 60000,
        max: 100000,
        currency: 'USD'
      },
      skills: ['JavaScript', 'React', 'Node.js'],
      requirements: ['3 years experience'],
      responsibilities: ['Write code'],
      workMode: 'remote'
    };

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(jobData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.job.title).toEqual('Software Engineer');
    
    jobId = res.body.data.job._id;
  });

  it('should get all jobs', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.data.jobs)).toBeTruthy();
  });
});
