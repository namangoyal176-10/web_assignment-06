const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getReceiptByNumber,
  getStudentFees,
  getDashboardStats,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.post('/', protect, authorize('admin'), recordPayment);
router.get('/my-fees', protect, getStudentFees);
router.get('/student/:studentId', protect, authorize('admin'), getStudentFees);
router.get('/receipt/:receiptNo', protect, getReceiptByNumber);

module.exports = router;
