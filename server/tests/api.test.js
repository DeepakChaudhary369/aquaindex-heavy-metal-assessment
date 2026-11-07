const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/heavy_metal_db');
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Heavy Metal Pollution API Integration Suite', () => {
  let analystToken = '';
  let adminToken = '';

  test('GET /api/health should return HEALTHY and connected database status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.database.connected).toBe(true);
  });

  test('POST /api/auth/login should authenticate analyst and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'analyst@environmental.org',
        password: 'Analyst@12345',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('analyst');
    analystToken = res.body.data.token;
  });

  test('POST /api/auth/login should authenticate admin and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@environmental.org',
        password: 'Admin@12345',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
    adminToken = res.body.data.token;
  });

  test('GET /api/auth/me should return current user details with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('analyst@environmental.org');
  });

  test('GET /api/auth/me should reject request without token (401)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/samples should retrieve paginated water samples list', async () => {
    const res = await request(app).get('/api/samples?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('POST /api/samples should create new sample with validation and unit conversion', async () => {
    const WaterSample = require('../src/models/WaterSample');
    await WaterSample.deleteOne({ sampleId: 'TEST-SMP-999' });

    const samplePayload = {
      sampleId: 'TEST-SMP-999',
      location: 'Integration Test Lake Site',
      waterSource: 'lake',
      collectionDate: new Date().toISOString(),
      coordinates: { latitude: 28.6139, longitude: 77.209 },
      measurements: [
        { metalSymbol: 'Pb', rawValue: 5, rawUnit: 'µg/L' }, // 0.005 mg/L
        { metalSymbol: 'Cd', rawValue: 1, rawUnit: 'µg/L' }, // 0.001 mg/L
      ],
      autoAssess: true,
      standardAuthority: 'WHO',
    };

    const res = await request(app)
      .post('/api/samples')
      .set('Authorization', `Bearer ${analystToken}`)
      .send(samplePayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sampleId).toBe('TEST-SMP-999');
    expect(res.body.data.measurements[0].normalizedValueMgL).toBe(0.005);
    expect(res.body.assessment).toBeDefined();
    expect(res.body.assessment.hpiValue).toBeGreaterThan(0);
  });

  test('GET /api/standards should list official WHO and BIS standards', async () => {
    const res = await request(app).get('/api/standards?authority=WHO');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  test('GET /api/dashboard/summary should return computed environmental metrics', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSamples).toBeGreaterThan(0);
    expect(res.body.data.locationsMonitored).toBeGreaterThan(0);
  });

  test('GET /api/dashboard/trends should return timeline data and metal averages', async () => {
    const res = await request(app).get('/api/dashboard/trends');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.timelineData)).toBe(true);
    expect(Array.isArray(res.body.data.metalAverages)).toBe(true);
  });

  test('POST /api/standards should restrict standard creation to admin (403 for analyst)', async () => {
    const res = await request(app)
      .post('/api/standards')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({
        metalSymbol: 'Co',
        metalName: 'Cobalt',
        limitValue: 0.05,
        unit: 'mg/L',
        authority: 'CUSTOM',
        documentTitle: 'Test Standard',
        version: '1.0',
      });

    expect(res.status).toBe(403);
  });
});
