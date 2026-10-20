const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllStudents,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/students', protect, authorize('admin'), getAllStudents);

module.exports = router;
