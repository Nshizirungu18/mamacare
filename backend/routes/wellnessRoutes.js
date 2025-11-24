const express = require('express');
const router = express.Router();

const {
  createWellnessLog,
  getWellnessLogs,
  getWellnessLogById,
  updateWellnessLog,
  deleteWellnessLog
} = require('../controllers/wellnessController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createWellnessLog);
router.get('/', protect, getWellnessLogs);
router.get('/:id', protect, getWellnessLogById);
router.put('/:id', protect, updateWellnessLog);
router.delete('/:id', protect, deleteWellnessLog);

module.exports = router;
