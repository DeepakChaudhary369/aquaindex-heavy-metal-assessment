const mongoose = require('mongoose');

const measurementSubSchema = new mongoose.Schema(
  {
    metalSymbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    rawValue: {
      type: Number,
      required: [true, 'Concentration measurement value is required'],
      min: [0, 'Concentration cannot be negative'],
    },
    rawUnit: {
      type: String,
      required: true,
      enum: ['mg/L', 'µg/L', 'ppm', 'ppb'],
      default: 'mg/L',
    },
    normalizedValueMgL: {
      type: Number,
      required: true,
      min: [0, 'Normalized concentration cannot be negative'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const waterSampleSchema = new mongoose.Schema(
  {
    sampleId: {
      type: String,
      required: [true, 'Sample ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      index: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
        default: null,
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
        default: null,
      },
    },
    collectionDate: {
      type: Date,
      required: [true, 'Collection date is required'],
      default: Date.now,
      index: true,
    },
    district: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    waterSource: {
      type: String,
      required: [true, 'Water source is required'],
      trim: true,
      index: true,
    },
    pH: {
      type: Number,
      default: null,
    },
    tdsMgL: {
      type: Number,
      default: null,
    },
    turbidityNtu: {
      type: Number,
      default: null,
    },
    dataType: {
      type: String,
      default: 'measured',
      index: true,
    },
    measurements: {
      type: [measurementSubSchema],
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        'At least one heavy metal measurement must be supplied',
      ],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    isDemoData: {
      type: Boolean,
      default: false,
      index: true,
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

// Compound indexes for searching and filtering
waterSampleSchema.index({ location: 'text', notes: 'text' });
waterSampleSchema.index({ waterSource: 1, collectionDate: -1 });

module.exports = mongoose.model('WaterSample', waterSampleSchema);
