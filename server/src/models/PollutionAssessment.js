const mongoose = require('mongoose');

const pollutionAssessmentSchema = new mongoose.Schema(
  {
    sampleId: {
      type: String,
      required: true,
      index: true,
    },
    sampleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WaterSample',
      required: true,
      index: true,
    },
    indexType: {
      type: String,
      required: true,
      enum: ['HPI', 'HEI', 'BOTH'],
      default: 'BOTH',
    },
    hpiValue: {
      type: Number,
      default: null,
    },
    heiValue: {
      type: Number,
      default: null,
    },
    methodologyVersion: {
      type: String,
      required: true,
      default: 'HPI: Prasad & Bose (2001) / HEI: Edet & Offiong (2002) v1.0',
    },
    standardReferences: [
      {
        metalSymbol: String,
        metalName: String,
        limitValue: Number,
        unit: String,
        authority: String,
        version: String,
      },
    ],
    intermediateResults: {
      hpi: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      hei: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    classification: {
      hpiCategory: {
        type: String,
        default: 'Not Calculated',
      },
      heiCategory: {
        type: String,
        default: 'Not Calculated',
      },
      overallReview: {
        type: String,
        enum: ['Within selected threshold', 'Requires review', 'Exceeds selected threshold', 'Unclassified'],
        default: 'Requires review',
      },
      thresholdExplanation: {
        type: String,
        default: '',
      },
    },
    calculationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    calculatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    isDemoData: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

pollutionAssessmentSchema.index({ sampleRef: 1, createdAt: -1 });

module.exports = mongoose.model('PollutionAssessment', pollutionAssessmentSchema);
