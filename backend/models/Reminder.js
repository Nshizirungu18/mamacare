const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
    },
    dateTime: {
      type: Date,
      required: [true, 'Please add a date and time'],
    },
    reminderType: {
      type: String,
      enum: ['medication', 'appointment', 'custom'],
      default: 'custom',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reminder', reminderSchema);
