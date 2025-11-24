// routes/reminderRoutes.js
const express = require('express');
const router = express.Router();

const {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');

const { protect } = require('../middleware/authMiddleware');

// Create a new reminder
router.post('/', protect, createReminder);

// Get all reminders for the logged-in user
router.get('/', protect, getReminders);

// Get a single reminder by ID
router.get('/:id', protect, getReminderById);

// Update a reminder by ID
router.put('/:id', protect, updateReminder);

// Delete a reminder by ID
router.delete('/:id', protect, deleteReminder);

module.exports = router;

