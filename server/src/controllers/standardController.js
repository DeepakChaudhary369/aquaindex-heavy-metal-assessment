const ReferenceStandard = require('../models/ReferenceStandard');
const { logAudit } = require('../middleware/audit');

// Default authoritative datasets for seeding / restoring
const OFFICIAL_STANDARDS = [
  // WHO Guidelines for Drinking-water Quality (4th ed. incorporating 1st addendum)
  {
    metalSymbol: 'PB',
    metalName: 'Lead',
    limitValue: 0.01,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Provisional guideline value based on neurotoxicity and nephrotoxicity.',
  },
  {
    metalSymbol: 'CD',
    metalName: 'Cadmium',
    limitValue: 0.003,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Based on kidney damage and accumulation over lifetime.',
  },
  {
    metalSymbol: 'CR',
    metalName: 'Chromium',
    limitValue: 0.05,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Provisional total chromium guideline value.',
  },
  {
    metalSymbol: 'CU',
    metalName: 'Copper',
    limitValue: 2.0,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Derived to protect against acute gastrointestinal effects.',
  },
  {
    metalSymbol: 'ZN',
    metalName: 'Zinc',
    limitValue: 3.0,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Aesthetic and acceptability threshold.',
  },
  {
    metalSymbol: 'NI',
    metalName: 'Nickel',
    limitValue: 0.07,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Based on allergic contact dermatitis and reproductive toxicity.',
  },
  {
    metalSymbol: 'FE',
    metalName: 'Iron',
    limitValue: 0.3,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Taste and appearance threshold in water distribution.',
  },
  {
    metalSymbol: 'AS',
    metalName: 'Arsenic',
    limitValue: 0.01,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Provisional guideline value based on carcinogenicity.',
  },
  {
    metalSymbol: 'HG',
    metalName: 'Mercury',
    limitValue: 0.006,
    unit: 'mg/L',
    authority: 'WHO',
    documentTitle: 'WHO Guidelines for Drinking-water Quality (4th Edition)',
    version: '4th Edition',
    effectiveDate: new Date('2017-01-01'),
    sourceUrl: 'https://www.who.int/publications/i/item/9789241549950',
    isDefault: true,
    notes: 'Guideline value for total inorganic mercury in drinking-water.',
  },

  // Bureau of Indian Standards (BIS) IS 10500:2012 Drinking Water Specification
  {
    metalSymbol: 'PB',
    metalName: 'Lead',
    limitValue: 0.01,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Acceptable limit with no relaxation.',
  },
  {
    metalSymbol: 'CD',
    metalName: 'Cadmium',
    limitValue: 0.003,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Acceptable limit with no relaxation.',
  },
  {
    metalSymbol: 'CR',
    metalName: 'Chromium',
    limitValue: 0.05,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Total chromium acceptable limit.',
  },
  {
    metalSymbol: 'CU',
    metalName: 'Copper',
    limitValue: 0.05,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Acceptable limit (permissible limit in absence of alternate source is 1.5 mg/L).',
  },
  {
    metalSymbol: 'ZN',
    metalName: 'Zinc',
    limitValue: 5.0,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Acceptable limit (permissible limit 15 mg/L).',
  },
  {
    metalSymbol: 'NI',
    metalName: 'Nickel',
    limitValue: 0.02,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Acceptable limit with no relaxation.',
  },
  {
    metalSymbol: 'FE',
    metalName: 'Iron',
    limitValue: 0.3,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Acceptable limit with no relaxation.',
  },
  {
    metalSymbol: 'AS',
    metalName: 'Arsenic',
    limitValue: 0.01,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Acceptable limit (permissible limit 0.05 mg/L in absence of alternate source).',
  },
  {
    metalSymbol: 'HG',
    metalName: 'Mercury',
    limitValue: 0.001,
    unit: 'mg/L',
    authority: 'BIS',
    documentTitle: 'Indian Standard Drinking Water - Specification (IS 10500:2012)',
    version: 'IS 10500:2012',
    effectiveDate: new Date('2012-05-01'),
    sourceUrl: 'https://bis.gov.in',
    isDefault: false,
    notes: 'Total mercury acceptable limit with no relaxation.',
  },
];

// @desc    Get all reference standards
// @route   GET /api/standards
// @access  Public / Private
const getStandards = async (req, res, next) => {
  try {
    const { authority, version } = req.query;
    const query = {};
    if (authority && authority !== 'all') {
      query.authority = authority.toUpperCase();
    }
    if (version) {
      query.version = version;
    }

    const standards = await ReferenceStandard.find(query).sort({ authority: 1, metalSymbol: 1 });
    res.status(200).json({
      success: true,
      count: standards.length,
      data: standards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new reference standard
// @route   POST /api/standards
// @access  Private (Admin only)
const createStandard = async (req, res, next) => {
  try {
    const {
      metalSymbol,
      metalName,
      limitValue,
      unit = 'mg/L',
      authority,
      documentTitle,
      version,
      effectiveDate,
      sourceUrl,
      notes,
    } = req.body;

    const symbolUpper = metalSymbol.trim().toUpperCase();
    const authUpper = authority.trim().toUpperCase();

    const existing = await ReferenceStandard.findOne({
      metalSymbol: symbolUpper,
      authority: authUpper,
      version: version.trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A standard for ${symbolUpper} under ${authUpper} version '${version}' already exists. To update, please specify a new version identifier to preserve historical integrity.`,
      });
    }

    const standard = await ReferenceStandard.create({
      metalSymbol: symbolUpper,
      metalName: metalName.trim(),
      limitValue: Number(limitValue),
      unit,
      authority: authUpper,
      documentTitle: documentTitle.trim(),
      version: version.trim(),
      effectiveDate: effectiveDate || new Date(),
      sourceUrl: sourceUrl || '',
      notes: notes || '',
      createdBy: req.user ? req.user._id : null,
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_STANDARD',
      entityType: 'ReferenceStandard',
      entityId: standard._id,
      details: { metalSymbol: standard.metalSymbol, authority: standard.authority, version: standard.version },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Reference standard created successfully',
      data: standard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a reference standard
// @route   PUT /api/standards/:id
// @access  Private (Admin only)
const updateStandard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limitValue, unit, documentTitle, version, effectiveDate, sourceUrl, notes } = req.body;

    const standard = await ReferenceStandard.findById(id);
    if (!standard) {
      return res.status(404).json({
        success: false,
        message: 'Reference standard not found',
      });
    }

    if (limitValue !== undefined) standard.limitValue = Number(limitValue);
    if (unit) standard.unit = unit;
    if (documentTitle) standard.documentTitle = documentTitle.trim();
    if (version) standard.version = version.trim();
    if (effectiveDate) standard.effectiveDate = effectiveDate;
    if (sourceUrl !== undefined) standard.sourceUrl = sourceUrl;
    if (notes !== undefined) standard.notes = notes;

    await standard.save();

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_STANDARD',
      entityType: 'ReferenceStandard',
      entityId: standard._id,
      details: { metalSymbol: standard.metalSymbol, authority: standard.authority, version: standard.version },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Reference standard updated successfully',
      data: standard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reference standard
// @route   DELETE /api/standards/:id
// @access  Private (Admin only)
const deleteStandard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const standard = await ReferenceStandard.findById(id);

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: 'Reference standard not found',
      });
    }

    await ReferenceStandard.findByIdAndDelete(id);

    await logAudit({
      userId: req.user?._id,
      action: 'DELETE_STANDARD',
      entityType: 'ReferenceStandard',
      entityId: id,
      details: { metalSymbol: standard.metalSymbol, authority: standard.authority },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Standard for ${standard.metalSymbol} (${standard.authority}) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset / Seed default WHO and BIS standards
// @route   POST /api/standards/reset-defaults
// @access  Private (Admin only)
const resetDefaultStandards = async (req, res, next) => {
  try {
    for (const std of OFFICIAL_STANDARDS) {
      await ReferenceStandard.findOneAndUpdate(
        { metalSymbol: std.metalSymbol, authority: std.authority, version: std.version },
        std,
        { upsert: true, new: true }
      );
    }

    await logAudit({
      userId: req.user?._id,
      action: 'RESET_STANDARDS_DEFAULT',
      entityType: 'ReferenceStandard',
      details: { count: OFFICIAL_STANDARDS.length },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Official WHO and BIS reference standards restored successfully.',
      count: OFFICIAL_STANDARDS.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  OFFICIAL_STANDARDS,
  getStandards,
  createStandard,
  updateStandard,
  deleteStandard,
  resetDefaultStandards,
};
