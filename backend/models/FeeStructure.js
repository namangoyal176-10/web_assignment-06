const mongoose = require('mongoose');

const feeHeadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});

const feeStructureSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: [true, 'Please provide course name'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Please provide academic year (e.g., 2026-2027)'],
      trim: true,
    },
    feeHeads: {
      type: [feeHeadSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please specify fee due date'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
