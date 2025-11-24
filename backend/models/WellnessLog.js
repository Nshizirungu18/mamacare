const mongoose = require('mongoose');

const wellnessLogSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    },
    mood: String,
    symptoms: [String],
    sleepHours: Number,
    hydrationLiters: Number,
    nutritionNotes: String
  },
  { timestamps: true }
);

const WellnessLog = mongoose.model('WellnessLog', wellnessLogSchema);
module.exports = WellnessLog;
