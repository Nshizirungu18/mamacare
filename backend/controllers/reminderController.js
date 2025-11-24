const asyncHandler = require('express-async-handler');
const Reminder = require('../models/Reminder');

// @desc Create a reminder
// @route POST /api/reminders
// @access Private
const createReminder = asyncHandler(async (req, res) => {
  const { title, dateTime, reminderType, description } = req.body;

  if (!title || !dateTime) {
    res.status(400);
    throw new Error('Title and dateTime are required');
  }

  const rem = await Reminder.create({
    userId: req.user._id,
    title,
    dateTime,
    reminderType: reminderType || 'custom',
    description,
  });

  res.status(201).json(rem);
});

// @desc Get all reminders for user
// @route GET /api/reminders
// @access Private
const getReminders = asyncHandler(async (req, res) => {
  const reminders = await Reminder.find({ userId: req.user._id }).sort({ dateTime: 1 });
  res.json(reminders);
});

// @desc Get single reminder by ID
// @route GET /api/reminders/:id
// @access Private
const getReminderById = asyncHandler(async (req, res) => {
  const rem = await Reminder.findById(req.params.id);
  if (!rem) {
    res.status(404);
    throw new Error('Reminder not found');
  }
  if (rem.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }
  res.json(rem);
});

// @desc Update reminder
// @route PUT /api/reminders/:id
// @access Private
const updateReminder = asyncHandler(async (req, res) => {
  const rem = await Reminder.findById(req.params.id);

  if (!rem) {
    res.status(404);
    throw new Error('Reminder not found');
  }
  if (rem.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }

  Object.assign(rem, req.body);
  const updated = await rem.save();
  res.json(updated);
});

// @desc Delete reminder
// @route DELETE /api/reminders/:id
// @access Private
const deleteReminder = asyncHandler(async (req, res) => {
  const rem = await Reminder.findById(req.params.id);

  if (!rem) {
    res.status(404);
    throw new Error('Reminder not found');
  }
  if (rem.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }

  await rem.deleteOne();
  res.json({ message: 'Reminder deleted' });
});

module.exports = { createReminder, getReminders, getReminderById, updateReminder, deleteReminder };
