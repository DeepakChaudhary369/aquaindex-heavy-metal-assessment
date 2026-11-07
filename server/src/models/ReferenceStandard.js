const mongoose = require('mongoose');

const referenceStandardSchema = new mongoose.Schema(
  {
    metalSymbol: {
      type: String,
      required: [true, 'Metal chemical symbol is required'],
      trim: true,
      uppercase: true,
    },
    metalName: {
      type: String,
      required: [true, 'Metal name is required'],
      trim: true,
    },
    limitValue: {
      type: Number,
      required: [true, 'Standard permissible limit value is required'],
      min: [0.000001, 'Limit value must be positive'],
    },
    unit: {
      type: String,
      required: true,
      default: 'mg/L',
      enum: ['mg/L', 'µg/L', 'ppm', 'ppb'],
    },
    authority: {
      type: String,
      required: [true, 'Standard organization/authority is required'],
      trim: true,
      enum: ['WHO', 'BIS', 'USEPA', 'EU', 'CUSTOM'],
      default: 'WHO',
    },
    documentTitle: {
      type: String,
      required: [true, 'Document title or publication reference is required'],
      trim: true,
    },
    version: {
      type: String,
      required: [true, 'Version or edition identifier is required'],
      default: '1.0',
      trim: true,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of standard per metal, authority, and version
referenceStandardSchema.index({ metalSymbol: 1, authority: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('ReferenceStandard', referenceStandardSchema);
