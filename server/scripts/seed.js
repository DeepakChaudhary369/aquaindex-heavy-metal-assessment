require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const WaterSample = require('../src/models/WaterSample');
const ReferenceStandard = require('../src/models/ReferenceStandard');
const PollutionAssessment = require('../src/models/PollutionAssessment');
const AuditLog = require('../src/models/AuditLog');
const { OFFICIAL_STANDARDS } = require('../src/controllers/standardController');
const { performFullAssessment } = require('../src/services/calculationService');

const seedData = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Seed Error: MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      WaterSample.deleteMany({}),
      ReferenceStandard.deleteMany({}),
      PollutionAssessment.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 1. Create Default Users (Demo/Testing Accounts)
    console.log('[Seed] Creating demo users...');
    const adminPasswordHash = await User.hashPassword('Admin@12345');
    const analystPasswordHash = await User.hashPassword('Analyst@12345');
    const viewerPasswordHash = await User.hashPassword('Viewer@12345');

    const adminUser = await User.create({
      name: 'Dr. Sarah Mitchell (Lead Environmental Scientist)',
      username: 'admin',
      email: 'admin@environmental.org',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });

    const analystUser = await User.create({
      name: 'Rajesh Kumar (Water Quality Analyst)',
      username: 'analyst',
      email: 'analyst@environmental.org',
      passwordHash: analystPasswordHash,
      role: 'analyst',
    });

    const viewerUser = await User.create({
      name: 'Elena Rostova (Regulatory Auditor)',
      username: 'viewer',
      email: 'viewer@environmental.org',
      passwordHash: viewerPasswordHash,
      role: 'viewer',
    });

    console.log('[Seed] Created 3 users (Admin, Analyst, Viewer).');

    // 2. Seed Official Reference Standards (WHO & BIS)
    console.log('[Seed] Seeding authoritative reference standards (WHO 4th Ed & BIS IS 10500:2012)...');
    const standardsToInsert = OFFICIAL_STANDARDS.map((std) => ({
      ...std,
      createdBy: adminUser._id,
    }));
    const createdStandards = await ReferenceStandard.insertMany(standardsToInsert);
    console.log(`[Seed] Seeded ${createdStandards.length} reference standards.`);

    // WHO standards subset for calculation
    const whoStandards = createdStandards.filter((s) => s.authority === 'WHO');

    // 3. Seed Realistic Demonstration Water Samples
    console.log('[Seed] Seeding realistic demonstration water samples with coordinates...');

    const demoSamplesRaw = [
      {
        sampleId: 'SMP-2026-0001',
        location: 'Upper Ganga River - Rishikesh Ghat',
        coordinates: { latitude: 30.1033, longitude: 78.2948 },
        collectionDate: new Date('2026-09-15T08:30:00Z'),
        waterSource: 'river',
        notes: 'DEMO DATA: High altitude river upstream catchment area. Minimal human disturbance.',
        measurements: [
          { metalSymbol: 'PB', rawValue: 1.5, rawUnit: 'µg/L', normalizedValueMgL: 0.0015 },
          { metalSymbol: 'CD', rawValue: 0.2, rawUnit: 'µg/L', normalizedValueMgL: 0.0002 },
          { metalSymbol: 'CR', rawValue: 5.0, rawUnit: 'µg/L', normalizedValueMgL: 0.005 },
          { metalSymbol: 'CU', rawValue: 0.02, rawUnit: 'mg/L', normalizedValueMgL: 0.02 },
          { metalSymbol: 'ZN', rawValue: 0.08, rawUnit: 'mg/L', normalizedValueMgL: 0.08 },
          { metalSymbol: 'FE', rawValue: 0.09, rawUnit: 'mg/L', normalizedValueMgL: 0.09 },
          { metalSymbol: 'AS', rawValue: 1.0, rawUnit: 'µg/L', normalizedValueMgL: 0.001 },
        ],
      },
      {
        sampleId: 'SMP-2026-0002',
        location: 'Yamuna River - Okhla Barrage Downstream',
        coordinates: { latitude: 28.5441, longitude: 77.3094 },
        collectionDate: new Date('2026-09-20T10:15:00Z'),
        waterSource: 'river',
        notes: 'DEMO DATA: High urban and industrial discharge point. Known heavy metal enrichment zone.',
        measurements: [
          { metalSymbol: 'PB', rawValue: 42.0, rawUnit: 'µg/L', normalizedValueMgL: 0.042 },
          { metalSymbol: 'CD', rawValue: 9.5, rawUnit: 'µg/L', normalizedValueMgL: 0.0095 },
          { metalSymbol: 'CR', rawValue: 120.0, rawUnit: 'µg/L', normalizedValueMgL: 0.12 },
          { metalSymbol: 'CU', rawValue: 0.45, rawUnit: 'mg/L', normalizedValueMgL: 0.45 },
          { metalSymbol: 'ZN', rawValue: 2.1, rawUnit: 'mg/L', normalizedValueMgL: 2.1 },
          { metalSymbol: 'NI', rawValue: 95.0, rawUnit: 'µg/L', normalizedValueMgL: 0.095 },
          { metalSymbol: 'FE', rawValue: 1.8, rawUnit: 'mg/L', normalizedValueMgL: 1.8 },
          { metalSymbol: 'AS', rawValue: 22.0, rawUnit: 'µg/L', normalizedValueMgL: 0.022 },
        ],
      },
      {
        sampleId: 'SMP-2026-0003',
        location: 'Bellandur Lake - North Discharge Inlet',
        coordinates: { latitude: 12.9372, longitude: 77.6744 },
        collectionDate: new Date('2026-09-25T11:00:00Z'),
        waterSource: 'lake',
        notes: 'DEMO DATA: Urban lake monitoring station adjacent to tech corridor and mixed effluents.',
        measurements: [
          { metalSymbol: 'PB', rawValue: 18.0, rawUnit: 'µg/L', normalizedValueMgL: 0.018 },
          { metalSymbol: 'CD', rawValue: 4.1, rawUnit: 'µg/L', normalizedValueMgL: 0.0041 },
          { metalSymbol: 'CR', rawValue: 65.0, rawUnit: 'µg/L', normalizedValueMgL: 0.065 },
          { metalSymbol: 'CU', rawValue: 0.15, rawUnit: 'mg/L', normalizedValueMgL: 0.15 },
          { metalSymbol: 'ZN', rawValue: 1.2, rawUnit: 'mg/L', normalizedValueMgL: 1.2 },
          { metalSymbol: 'FE', rawValue: 0.85, rawUnit: 'mg/L', normalizedValueMgL: 0.85 },
          { metalSymbol: 'AS', rawValue: 8.5, rawUnit: 'µg/L', normalizedValueMgL: 0.0085 },
        ],
      },
      {
        sampleId: 'SMP-2026-0004',
        location: 'Deep Aquifer Borewell #14 - Malwa Basin',
        coordinates: { latitude: 22.7196, longitude: 75.8577 },
        collectionDate: new Date('2026-10-02T14:20:00Z'),
        waterSource: 'groundwater',
        notes: 'DEMO DATA: Drinking water tube well (depth: 180m). Monitored for geological leaching.',
        measurements: [
          { metalSymbol: 'PB', rawValue: 3.0, rawUnit: 'µg/L', normalizedValueMgL: 0.003 },
          { metalSymbol: 'CD', rawValue: 0.8, rawUnit: 'µg/L', normalizedValueMgL: 0.0008 },
          { metalSymbol: 'CR', rawValue: 12.0, rawUnit: 'µg/L', normalizedValueMgL: 0.012 },
          { metalSymbol: 'CU', rawValue: 0.04, rawUnit: 'mg/L', normalizedValueMgL: 0.04 },
          { metalSymbol: 'ZN', rawValue: 0.45, rawUnit: 'mg/L', normalizedValueMgL: 0.45 },
          { metalSymbol: 'FE', rawValue: 0.28, rawUnit: 'mg/L', normalizedValueMgL: 0.28 },
          { metalSymbol: 'AS', rawValue: 4.2, rawUnit: 'µg/L', normalizedValueMgL: 0.0042 },
        ],
      },
      {
        sampleId: 'SMP-2026-0005',
        location: 'Agricultural Irrigation Pond - Tanjore Delta',
        coordinates: { latitude: 10.787, longitude: 79.1378 },
        collectionDate: new Date('2026-10-05T09:45:00Z'),
        waterSource: 'pond',
        notes: 'DEMO DATA: Surface agricultural pond subjected to seasonal pesticide runoff testing.',
        measurements: [
          { metalSymbol: 'PB', rawValue: 8.0, rawUnit: 'µg/L', normalizedValueMgL: 0.008 },
          { metalSymbol: 'CD', rawValue: 1.5, rawUnit: 'µg/L', normalizedValueMgL: 0.0015 },
          { metalSymbol: 'CR', rawValue: 22.0, rawUnit: 'µg/L', normalizedValueMgL: 0.022 },
          { metalSymbol: 'CU', rawValue: 0.25, rawUnit: 'mg/L', normalizedValueMgL: 0.25 },
          { metalSymbol: 'ZN', rawValue: 0.9, rawUnit: 'mg/L', normalizedValueMgL: 0.9 },
          { metalSymbol: 'FE', rawValue: 0.42, rawUnit: 'mg/L', normalizedValueMgL: 0.42 },
          { metalSymbol: 'AS', rawValue: 6.0, rawUnit: 'µg/L', normalizedValueMgL: 0.006 },
        ],
      },
      {
        sampleId: 'SMP-2026-0006',
        location: 'Hooghly Estuary Water Quality Station #3',
        coordinates: { latitude: 22.2587, longitude: 88.1634 },
        collectionDate: new Date('2026-10-08T16:10:00Z'),
        waterSource: 'other',
        notes: 'DEMO DATA: Estuarine brackish mixing zone with periodic tidal flushing.',
        measurements: [
          { metalSymbol: 'PB', rawValue: 12.0, rawUnit: 'µg/L', normalizedValueMgL: 0.012 },
          { metalSymbol: 'CD', rawValue: 2.2, rawUnit: 'µg/L', normalizedValueMgL: 0.0022 },
          { metalSymbol: 'CR', rawValue: 35.0, rawUnit: 'µg/L', normalizedValueMgL: 0.035 },
          { metalSymbol: 'CU', rawValue: 0.12, rawUnit: 'mg/L', normalizedValueMgL: 0.12 },
          { metalSymbol: 'ZN', rawValue: 0.65, rawUnit: 'mg/L', normalizedValueMgL: 0.65 },
          { metalSymbol: 'FE', rawValue: 0.55, rawUnit: 'mg/L', normalizedValueMgL: 0.55 },
          { metalSymbol: 'AS', rawValue: 11.5, rawUnit: 'µg/L', normalizedValueMgL: 0.0115 },
        ],
      },
    ];

    for (const sampleData of demoSamplesRaw) {
      const createdSample = await WaterSample.create({
        ...sampleData,
        isDemoData: true,
        createdBy: analystUser._id,
      });

      // Calculate official assessment using WHO standards
      const assessmentData = performFullAssessment(createdSample.measurements, whoStandards);

      await PollutionAssessment.create({
        sampleId: createdSample.sampleId,
        sampleRef: createdSample._id,
        indexType: 'BOTH',
        hpiValue: assessmentData.hpi.hpiValue,
        heiValue: assessmentData.hei.heiValue,
        methodologyVersion: assessmentData.methodologyVersion,
        standardReferences: assessmentData.standardSnapshots,
        intermediateResults: {
          hpi: assessmentData.hpi,
          hei: assessmentData.hei,
        },
        classification: {
          hpiCategory: assessmentData.hpi.category,
          heiCategory: assessmentData.hei.category,
          overallReview: assessmentData.overallReview,
          thresholdExplanation: assessmentData.thresholdExplanation,
        },
        calculatedBy: analystUser._id,
        isDemoData: true,
        calculationDate: createdSample.collectionDate,
      });
    }

    console.log(`[Seed] Seeded ${demoSamplesRaw.length} water samples and calculated assessments.`);

    // 4. Create Initial Audit Logs
    await AuditLog.create([
      {
        userId: adminUser._id,
        action: 'SYSTEM_SEED',
        entityType: 'System',
        details: { message: 'Database initialized with demo datasets, standards, and demo accounts.' },
        timestamp: new Date(),
      },
    ]);

    console.log('[Seed] Database seeding completed successfully!');
    console.log('-------------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('1. Admin:   admin@environmental.org   / Admin@12345');
    console.log('2. Analyst: analyst@environmental.org / Analyst@12345');
    console.log('3. Viewer:  viewer@environmental.org  / Viewer@12345');
    console.log('-------------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedData();
