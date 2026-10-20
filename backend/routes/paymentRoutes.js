const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getReceiptByNumber,
  getStudentFees,
  getDashboardStats,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Admin dashboard analytics
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

// Record payment (admin only)
router.post('/', protect, authorize('admin'), recordPayment);

// Student looks up their own fee summary & history
router.get('/my-fees', protect, getStudentFees);

// Admin looks up specific student's fees
router.get('/student/:studentId', protect, authorize('admin'), getStudentFees);

// View receipt by receipt number (e.g., RCP-2026-0001)
router.get('/receipt/:receiptNo', protect, getReceiptByNumber);

module.exports = router;
