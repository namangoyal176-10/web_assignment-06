const FeeStructure = require('../models/FeeStructure');

// @desc    Get all fee structures
// @route   GET /api/fees
// @access  Private (Student & Admin)
exports.getAllFeeStructures = async (req, res) => {
  try {
    const fees = await FeeStructure.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: fees.length,
      data: fees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee structures' });
  }
};

// @desc    Get single fee structure by ID
// @route   GET /api/fees/:id
// @access  Private
exports.getFeeStructureById = async (req, res) => {
  try {
    const fee = await FeeStructure.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }
    res.json({ success: true, data: fee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch fee structure' });
  }
};

// @desc    Create a new fee structure
// @route   POST /api/fees
// @access  Private (Admin only)
exports.createFeeStructure = async (req, res) => {
  try {
    const { course, academicYear, feeHeads, dueDate, description } = req.body;

    if (!course || !academicYear || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Course, academic year, and due date are required',
      });
    }

    const heads = Array.isArray(feeHeads) ? feeHeads : [];
    // Calculate total from heads or fallback to passed total
    const computedTotal = heads.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const totalAmount =
      req.body.totalAmount !== undefined && req.body.totalAmount !== null
        ? Number(req.body.totalAmount)
        : computedTotal;

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total fee amount must be greater than zero',
      });
    }

    const fee = await FeeStructure.create({
      course,
      academicYear,
      feeHeads: heads,
      totalAmount,
      dueDate,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Fee structure created successfully',
      data: fee,
    });
  } catch (error) {
    console.error('Error creating fee structure:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update a fee structure
// @route   PUT /api/fees/:id
// @access  Private (Admin only)
exports.updateFeeStructure = async (req, res) => {
  try {
    const { course, academicYear, feeHeads, dueDate, description, totalAmount } = req.body;

    let fee = await FeeStructure.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    let updatedTotal = totalAmount;
    if (Array.isArray(feeHeads)) {
      fee.feeHeads = feeHeads;
      if (updatedTotal === undefined || updatedTotal === null) {
        updatedTotal = feeHeads.reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        );
      }
    }

    if (course) fee.course = course;
    if (academicYear) fee.academicYear = academicYear;
    if (dueDate) fee.dueDate = dueDate;
    if (description !== undefined) fee.description = description;
    if (updatedTotal !== undefined) fee.totalAmount = updatedTotal;

    await fee.save();

    res.json({
      success: true,
      message: 'Fee structure updated successfully',
      data: fee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete a fee structure
// @route   DELETE /api/fees/:id
// @access  Private (Admin only)
exports.deleteFeeStructure = async (req, res) => {
  try {
    const fee = await FeeStructure.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    await FeeStructure.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Fee structure deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
