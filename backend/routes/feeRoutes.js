const express = require('express');
const router = express.Router();
const {
  getAllFeeStructures,
  getFeeStructureById,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

// All authenticated users can view fee structures
router.get('/', protect, getAllFeeStructures);
router.get('/:id', protect, getFeeStructureById);

// Only admin can create, update, or delete fee structures
router.post('/', protect, authorize('admin'), createFeeStructure);
router.put('/:id', protect, authorize('admin'), updateFeeStructure);
router.delete('/:id', protect, authorize('admin'), deleteFeeStructure);

module.exports = router;
