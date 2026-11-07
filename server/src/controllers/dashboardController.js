const WaterSample = require('../models/WaterSample');
const PollutionAssessment = require('../models/PollutionAssessment');
const { getDbStatus } = require('../config/db');
const datasetService = require('../services/datasetService');

// @desc    Get dashboard summary metrics
// @route   GET /api/dashboard/summary
// @access  Public / Private
const getSummary = async (req, res, next) => {
  try {
    const dbStatus = getDbStatus();

    // If database is not connected, serve dataset summary directly
    if (!dbStatus.isConnected) {
      const ds = datasetService.getDatasetSummary();
      return res.status(200).json({
        success: true,
        data: {
          totalSamples: ds.totalSamples,
          locationsMonitored: ds.districtCount,
          samplesRequiringAttention: ds.samplesRequiringAttention,
          latestSampleDate: ds.latestSampleDate,
          totalAssessments: ds.totalSamples,
          averageHpi: ds.averageHpi,
          averageHei: ds.averageHei,
          hasDemoData: true,
          demoSamplesCount: ds.totalSamples,
          classificationCounts: ds.classificationCounts,
          districts: ds.districts,
          states: ds.states,
          availableMetals: ds.availableMetals,
          sourceDistribution: Object.entries(ds.waterSourceBreakdown).map(([source, count]) => ({ source, count })),
        },
      });
    }

    const totalSamples = await WaterSample.countDocuments();

    // If database is connected but has 0 records, fallback to dataset summary
    if (totalSamples === 0) {
      const ds = datasetService.getDatasetSummary();
      return res.status(200).json({
        success: true,
        data: {
          totalSamples: ds.totalSamples,
          locationsMonitored: ds.districtCount,
          samplesRequiringAttention: ds.samplesRequiringAttention,
          latestSampleDate: ds.latestSampleDate,
          totalAssessments: ds.totalSamples,
          averageHpi: ds.averageHpi,
          averageHei: ds.averageHei,
          hasDemoData: true,
          demoSamplesCount: ds.totalSamples,
          classificationCounts: ds.classificationCounts,
          districts: ds.districts,
          states: ds.states,
          availableMetals: ds.availableMetals,
          sourceDistribution: Object.entries(ds.waterSourceBreakdown).map(([source, count]) => ({ source, count })),
        },
      });
    }

    const demoSamplesCount = await WaterSample.countDocuments({ isDemoData: true });
    const hasDemoData = demoSamplesCount > 0;

    // Distinct locations monitored
    const distinctLocations = await WaterSample.distinct('location');
    const locationsMonitored = distinctLocations.length;

    // Latest recorded sample date
    const latestSample = await WaterSample.findOne().sort({ collectionDate: -1 }).select('collectionDate');
    const latestSampleDate = latestSample ? latestSample.collectionDate : null;

    // Assessments aggregate metrics
    const assessments = await PollutionAssessment.find().lean();
    const totalAssessments = assessments.length;

    let totalHpi = 0;
    let validHpiCount = 0;
    let totalHei = 0;
    let validHeiCount = 0;
    let requiringAttention = 0;

    const classificationCounts = {
      withinThreshold: 0,
      requiresReview: 0,
      exceedsThreshold: 0,
    };

    const hpiCategoryCounts = {
      low: 0,
      medium: 0,
      high: 0,
    };

    assessments.forEach((a) => {
      if (a.hpiValue !== null && a.hpiValue !== undefined && !isNaN(a.hpiValue)) {
        totalHpi += a.hpiValue;
        validHpiCount += 1;

        if (a.hpiValue > 100) hpiCategoryCounts.high += 1;
        else if (a.hpiValue >= 50) hpiCategoryCounts.medium += 1;
        else hpiCategoryCounts.low += 1;
      }

      if (a.heiValue !== null && a.heiValue !== undefined && !isNaN(a.heiValue)) {
        totalHei += a.heiValue;
        validHeiCount += 1;
      }

      const review = a.classification?.overallReview;
      if (review === 'Exceeds selected threshold') {
        requiringAttention += 1;
        classificationCounts.exceedsThreshold += 1;
      } else if (review === 'Requires review') {
        requiringAttention += 1;
        classificationCounts.requiresReview += 1;
      } else if (review === 'Within selected threshold') {
        classificationCounts.withinThreshold += 1;
      }
    });

    const averageHpi = validHpiCount > 0 ? Number((totalHpi / validHpiCount).toFixed(2)) : null;
    const averageHei = validHeiCount > 0 ? Number((totalHei / validHeiCount).toFixed(2)) : null;

    // Water source distribution
    const sourceDistribution = await WaterSample.aggregate([
      { $group: { _id: '$waterSource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSamples,
        locationsMonitored,
        samplesRequiringAttention: requiringAttention,
        latestSampleDate,
        totalAssessments,
        averageHpi,
        averageHei,
        hasDemoData,
        demoSamplesCount,
        classificationCounts,
        hpiCategoryCounts,
        sourceDistribution: sourceDistribution.map((s) => ({ source: s._id, count: s.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard trends, metal averages, and timeline charts
// @route   GET /api/dashboard/trends
// @access  Public / Private
const getTrends = async (req, res, next) => {
  try {
    const dbStatus = getDbStatus();

    // If DB is offline or empty, synthesize trends from CSV dataset
    if (!dbStatus.isConnected || (await WaterSample.countDocuments()) === 0) {
      const records = datasetService.loadDataset();
      const ds = datasetService.getDatasetSummary();

      // Timeline data from first 30 chronologically sorted samples
      const sortedByDate = [...records]
        .filter((r) => r.collectionDate)
        .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate))
        .slice(0, 30);

      const timelineData = sortedByDate.map((r) => ({
        id: r.sampleId,
        sampleId: r.sampleId,
        location: r.district,
        date: r.sampleDate,
        hpi: r.hpi,
        hei: r.hei,
        reviewState: r.overallReview,
      }));

      // Metal Averages
      const metalAverages = ds.availableMetals.map((m) => ({
        symbol: m.symbol,
        averageMgL: m.meanConcentrationMgL,
        sampleCount: m.samplesAnalyzed,
        whoLimit: m.whoLimitMgL,
      }));

      // Location / District Rankings
      const locationMap = {};
      records.forEach((r) => {
        const loc = r.district;
        if (!locationMap[loc]) {
          locationMap[loc] = { location: loc, hpiSum: 0, heiSum: 0, count: 0 };
        }
        locationMap[loc].hpiSum += r.hpi || 0;
        locationMap[loc].heiSum += r.hei || 0;
        locationMap[loc].count += 1;
      });

      const locationRankings = Object.values(locationMap).map((l) => ({
        location: l.location,
        sampleCount: l.count,
        avgHpi: Number((l.hpiSum / l.count).toFixed(2)),
        avgHei: Number((l.heiSum / l.count).toFixed(2)),
      }));

      return res.status(200).json({
        success: true,
        data: {
          timelineData,
          metalAverages,
          locationRankings,
        },
      });
    }

    // 1. Time-series assessment trend
    const assessments = await PollutionAssessment.find()
      .populate('sampleRef', 'location waterSource collectionDate')
      .sort({ calculationDate: 1 })
      .limit(30)
      .lean();

    const timelineData = assessments.map((a) => ({
      id: a._id,
      sampleId: a.sampleId,
      location: a.sampleRef?.location || 'Unknown',
      date: a.calculationDate ? a.calculationDate.toISOString().split('T')[0] : '',
      hpi: a.hpiValue,
      hei: a.heiValue,
      reviewState: a.classification?.overallReview,
    }));

    // 2. Average concentration per metal across all samples
    const samples = await WaterSample.find().select('measurements location waterSource collectionDate').lean();

    const metalSums = {};
    const metalCounts = {};

    samples.forEach((sample) => {
      if (Array.isArray(sample.measurements)) {
        sample.measurements.forEach((m) => {
          const sym = m.metalSymbol.toUpperCase();
          if (!metalSums[sym]) {
            metalSums[sym] = 0;
            metalCounts[sym] = 0;
          }
          metalSums[sym] += m.normalizedValueMgL;
          metalCounts[sym] += 1;
        });
      }
    });

    const metalAverages = Object.keys(metalSums).map((sym) => ({
      symbol: sym,
      averageMgL: Number((metalSums[sym] / metalCounts[sym]).toFixed(5)),
      sampleCount: metalCounts[sym],
    }));

    // 3. Location comparisons
    const locationAggregates = {};
    assessments.forEach((a) => {
      const loc = a.sampleRef?.location || 'Other';
      if (!locationAggregates[loc]) {
        locationAggregates[loc] = { location: loc, hpiSum: 0, heiSum: 0, count: 0 };
      }
      locationAggregates[loc].hpiSum += a.hpiValue || 0;
      locationAggregates[loc].heiSum += a.heiValue || 0;
      locationAggregates[loc].count += 1;
    });

    const locationRankings = Object.values(locationAggregates).map((l) => ({
      location: l.location,
      sampleCount: l.count,
      avgHpi: Number((l.hpiSum / l.count).toFixed(2)),
      avgHei: Number((l.heiSum / l.count).toFixed(2)),
    }));

    res.status(200).json({
      success: true,
      data: {
        timelineData,
        metalAverages,
        locationRankings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getTrends,
};
