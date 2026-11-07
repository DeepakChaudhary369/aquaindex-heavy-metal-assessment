const WaterSample = require('../models/WaterSample');
const PollutionAssessment = require('../models/PollutionAssessment');
const { Parser } = require('json2csv');

// @desc    Export water samples as CSV
// @route   GET /api/reports/samples.csv
// @access  Public / Private
const exportSamplesCSV = async (req, res, next) => {
  try {
    const samples = await WaterSample.find().sort({ collectionDate: -1 }).lean();

    const flattened = samples.map((s) => {
      const row = {
        sampleId: s.sampleId,
        location: s.location,
        district: s.district || '',
        state: s.state || '',
        waterSource: s.waterSource,
        collectionDate: s.collectionDate ? s.collectionDate.toISOString() : '',
        latitude: s.coordinates?.latitude ?? '',
        longitude: s.coordinates?.longitude ?? '',
        pH: s.pH ?? '',
        TDS_mg_L: s.tdsMgL ?? '',
        turbidity_NTU: s.turbidityNtu ?? '',
        isDemoData: s.isDemoData ? 'DEMO' : 'RECORDED',
        notes: s.notes || '',
      };

      // Add each metal concentration as a column
      if (Array.isArray(s.measurements)) {
        s.measurements.forEach((m) => {
          row[`${m.metalSymbol}_rawValue`] = m.rawValue;
          row[`${m.metalSymbol}_unit`] = m.rawUnit;
          row[`${m.metalSymbol}_mgL`] = m.normalizedValueMgL;
        });
      }

      return row;
    });

    const parser = new Parser();
    const csv = parser.parse(flattened);

    res.header('Content-Type', 'text/csv');
    res.attachment(`water_samples_report_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export pollution assessments as CSV
// @route   GET /api/reports/assessments.csv
// @access  Public / Private
const exportAssessmentsCSV = async (req, res, next) => {
  try {
    const assessments = await PollutionAssessment.find()
      .populate('sampleRef', 'location waterSource collectionDate coordinates')
      .sort({ calculationDate: -1 })
      .lean();

    const flattened = assessments.map((a) => ({
      assessmentId: a._id.toString(),
      sampleId: a.sampleId,
      location: a.sampleRef?.location || '',
      waterSource: a.sampleRef?.waterSource || '',
      latitude: a.sampleRef?.coordinates?.latitude ?? '',
      longitude: a.sampleRef?.coordinates?.longitude ?? '',
      hpiValue: a.hpiValue,
      hpiCategory: a.classification?.hpiCategory || '',
      heiValue: a.heiValue,
      heiCategory: a.classification?.heiCategory || '',
      overallReview: a.classification?.overallReview || '',
      methodologyVersion: a.methodologyVersion,
      calculationDate: a.calculationDate ? a.calculationDate.toISOString() : '',
      isDemoData: a.isDemoData ? 'DEMO' : 'RECORDED',
      notes: a.notes || '',
      disclaimer: 'HPI & HEI are screening and assessment tools, not substitutes for laboratory validation.',
    }));

    const parser = new Parser();
    const csv = parser.parse(flattened);

    res.header('Content-Type', 'text/csv');
    res.attachment(`pollution_assessments_report_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportSamplesCSV,
  exportAssessmentsCSV,
};
