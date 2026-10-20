const Payment = require('../models/Payment');
const FeeStructure = require('../models/FeeStructure');
const User = require('../models/User');

// Helper to generate sequential receipt number like RCP-2026-0001
const generateReceiptNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `RCP-${currentYear}-`;
  
  // Find latest payment created this year
  const latestPayment = await Payment.findOne({
    receiptNo: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let nextSequence = 1;
  if (latestPayment && latestPayment.receiptNo) {
    const parts = latestPayment.receiptNo.split('-');
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) {
      nextSequence = lastNum + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, '0')}`;
};

// @desc    Record a new payment for a student
// @route   POST /api/payments
// @access  Private (Admin only)
exports.recordPayment = async (req, res) => {
  try {
    const {
      studentId,
      feeStructureId,
      amountPaid,
      paymentMode,
      transactionReference,
      remarks,
      paymentDate,
    } = req.body;

    const amount = Number(amountPaid);

    // Rule: Reject zero or negative payments
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero',
      });
    }

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Valid student not found with provided ID',
      });
    }

    // Verify fee structure exists
    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: 'Fee structure not found',
      });
    }

    // Calculate existing payments for this student & fee structure
    const previousPayments = await Payment.find({
      student: studentId,
      feeStructure: feeStructureId,
    });

    const alreadyPaid = previousPayments.reduce(
      (sum, p) => sum + (Number(p.amountPaid) || 0),
      0
    );

    const pendingAmount = feeStructure.totalAmount - alreadyPaid;

    // Rule: Reject payment greater than pending amount
    if (amount > pendingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${amount}) exceeds pending balance (₹${pendingAmount}). Maximum acceptable payment is ₹${pendingAmount}.`,
      });
    }

    // Generate unique receipt number
    const receiptNo = await generateReceiptNumber();

    const payment = await Payment.create({
      receiptNo,
      student: studentId,
      feeStructure: feeStructureId,
      amountPaid: amount,
      paymentMode: paymentMode || 'UPI',
      paymentDate: paymentDate || new Date(),
      transactionReference: transactionReference || '',
      remarks: remarks || '',
      recordedBy: req.user._id,
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('student', 'name email rollNumber course batch phone')
      .populate('feeStructure', 'course academicYear feeHeads totalAmount dueDate')
      .populate('recordedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      receiptNo: payment.receiptNo,
      data: populatedPayment,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while recording payment',
    });
  }
};

// @desc    Get single receipt by receipt number
// @route   GET /api/payments/receipt/:receiptNo
// @access  Private (Student sees own, Admin sees any)
exports.getReceiptByNumber = async (req, res) => {
  try {
    const { receiptNo } = req.params;

    const payment = await Payment.findOne({ receiptNo })
      .populate('student', 'name email rollNumber course batch phone')
      .populate('feeStructure', 'course academicYear feeHeads totalAmount dueDate description')
      .populate('recordedBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `Receipt with number '${receiptNo}' not found`,
      });
    }

    // Authorization rule: student can only view their own receipt
    if (
      req.user.role === 'student' &&
      payment.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view receipts belonging to another student',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve receipt',
    });
  }
};

// @desc    Get fee summary and history for a student
// @route   GET /api/payments/my-fees (for logged-in student) OR /api/payments/student/:studentId (for admin)
// @access  Private
exports.getStudentFees = async (req, res) => {
  try {
    let studentId;

    if (req.params.studentId) {
      // Admin looking up specific student
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      studentId = req.params.studentId;
    } else {
      // Student viewing their own fees
      studentId = req.user._id;
    }

    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Find all fee structures (matching student course or all available)
    const feeStructures = await FeeStructure.find().sort({ dueDate: 1 });

    // Find all payments made by this student
    const studentPayments = await Payment.find({ student: studentId })
      .populate('feeStructure', 'course academicYear totalAmount')
      .sort({ paymentDate: -1 });

    // Build breakdown for each fee structure
    const breakdown = feeStructures.map((structure) => {
      const paymentsForThisFee = studentPayments.filter(
        (p) => p.feeStructure && p.feeStructure._id.toString() === structure._id.toString()
      );

      const paidAmount = paymentsForThisFee.reduce(
        (sum, p) => sum + (Number(p.amountPaid) || 0),
        0
      );

      const balance = Math.max(0, structure.totalAmount - paidAmount);
      const isOverdue = balance > 0 && new Date() > new Date(structure.dueDate);

      let status = 'Pending';
      if (paidAmount >= structure.totalAmount) {
        status = 'Paid';
      } else if (paidAmount > 0) {
        status = 'Partial';
      }

      return {
        feeStructure: structure,
        totalPayable: structure.totalAmount,
        amountPaid: paidAmount,
        balance,
        status,
        isOverdue,
        payments: paymentsForThisFee,
      };
    });

    const totalPayable = breakdown.reduce((acc, curr) => acc + curr.totalPayable, 0);
    const totalPaid = breakdown.reduce((acc, curr) => acc + curr.amountPaid, 0);
    const totalBalance = Math.max(0, totalPayable - totalPaid);

    res.json({
      success: true,
      student,
      summary: {
        totalPayable,
        totalPaid,
        totalBalance,
      },
      breakdown,
      paymentHistory: studentPayments,
    });
  } catch (error) {
    console.error('Error in getStudentFees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student fee details' });
  }
};

// @desc    Admin dashboard analytics
// @route   GET /api/payments/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const allPayments = await Payment.find()
      .populate('student', 'name email rollNumber course')
      .populate('feeStructure', 'course academicYear totalAmount')
      .sort({ createdAt: -1 });

    const allStudents = await User.find({ role: 'student' }).select('-password');
    const allFeeStructures = await FeeStructure.find();

    // 1. Total fees collected
    const totalCollected = allPayments.reduce(
      (sum, p) => sum + (Number(p.amountPaid) || 0),
      0
    );

    // 2. Collection grouped by payment mode
    const modeBreakdown = {
      UPI: 0,
      Cash: 0,
      Card: 0,
      'Net Banking': 0,
    };

    allPayments.forEach((p) => {
      const mode = p.paymentMode || 'UPI';
      modeBreakdown[mode] = (modeBreakdown[mode] || 0) + (Number(p.amountPaid) || 0);
    });

    // 3. Expected fees & overdue defaulters calculation
    // Calculate fee balance for each student
    let totalExpectedAll = 0;
    const defaultersList = [];

    const totalFeePerStudent = allFeeStructures.reduce(
      (sum, f) => sum + (Number(f.totalAmount) || 0),
      0
    );

    allStudents.forEach((stud) => {
      totalExpectedAll += totalFeePerStudent;

      const studPayments = allPayments.filter(
        (p) => p.student && p.student._id.toString() === stud._id.toString()
      );

      const studPaid = studPayments.reduce(
        (sum, p) => sum + (Number(p.amountPaid) || 0),
        0
      );

      // Check each fee structure for overdue status
      allFeeStructures.forEach((fee) => {
        const paidThisFee = studPayments
          .filter((p) => p.feeStructure && p.feeStructure._id.toString() === fee._id.toString())
          .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

        const feeBalance = fee.totalAmount - paidThisFee;
        const isPastDue = new Date() > new Date(fee.dueDate);

        if (feeBalance > 0 && isPastDue) {
          defaultersList.push({
            studentId: stud._id,
            name: stud.name,
            rollNumber: stud.rollNumber,
            email: stud.email,
            course: stud.course,
            feeTitle: fee.course + ' (' + fee.academicYear + ')',
            dueDate: fee.dueDate,
            totalFee: fee.totalAmount,
            amountPaid: paidThisFee,
            pendingAmount: feeBalance,
          });
        }
      });
    });

    const totalPending = Math.max(0, totalExpectedAll - totalCollected);

    res.json({
      success: true,
      stats: {
        totalCollected,
        totalPending,
        totalExpected: totalExpectedAll,
        totalStudents: allStudents.length,
        totalFeeStructures: allFeeStructures.length,
        totalTransactions: allPayments.length,
      },
      paymentModeBreakdown: modeBreakdown,
      overdueDefaulters: defaultersList,
      recentPayments: allPayments.slice(0, 10),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
};
