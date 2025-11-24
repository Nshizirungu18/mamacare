// controllers/wellnessController.js
const asyncHandler = require('express-async-handler');
const WellnessLog = require('../models/WellnessLog');

// @desc Create a wellness log
// @route POST /api/wellness
// @access Private
const createLog = asyncHandler(async (req, res) => {
  const { date, mood, symptoms, sleepHours, hydrationLiters, nutritionNotes } = req.body;
  const log = await WellnessLog.create({
    userId: req.user._id,
    date: date || Date.now(),
    mood,
    symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
    sleepHours,
    hydrationLiters,
    nutritionNotes
  });
  res.status(201).json(log);
});

// @desc Get all wellness logs for the user
// @route GET /api/wellness
// @access Private
const getLogs = asyncHandler(async (req, res) => {
  const logs = await WellnessLog.find({ userId: req.user._id }).sort({ date: -1 });
  res.json(logs);
});

// @desc Get single log
// @route GET /api/wellness/:id
// @access Private
const getLogById = asyncHandler(async (req, res) => {
  const log = await WellnessLog.findById(req.params.id);
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }
  if (log.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }
  res.json(log);
});

// @desc Update a log
// @route PUT /api/wellness/:id
// @access Private
const updateLog = asyncHandler(async (req, res) => {
  const log = await WellnessLog.findById(req.params.id);
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }
  if (log.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }

  Object.assign(log, req.body);
  const updated = await log.save();
  res.json(updated);
});

// @desc Delete a log
// @route DELETE /api/wellness/:id
// @access Private
const deleteLog = asyncHandler(async (req, res) => {
  const log = await WellnessLog.findById(req.params.id);
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }
  if (log.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Forbidden');
  }
  await log.deleteOne();
  res.json({ message: 'Log deleted' });
});

module.exports = {
  createWellnessLog: createLog,
  getWellnessLogs: getLogs,
  getWellnessLogById: getLogById,
  updateWellnessLog: updateLog,
  deleteWellnessLog: deleteLog
};

