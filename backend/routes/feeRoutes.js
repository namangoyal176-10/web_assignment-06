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

router.get('/', protect, getAllFeeStructures);
router.get('/:id', protect, getFeeStructureById);
router.post('/', protect, authorize('admin'), createFeeStructure);
router.put('/:id', protect, authorize('admin'), updateFeeStructure);
router.delete('/:id', protect, authorize('admin'), deleteFeeStructure);

module.exports = router;
