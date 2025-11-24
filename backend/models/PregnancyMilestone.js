const mongoose = require("mongoose");

const pregnancyMilestoneSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  title: { type: String, required: true },       // e.g. "Baby is the size of a mango"
  description: { type: String, required: true }, // fetal development notes
  tips: { type: [String], default: [] },         // health guidance for this week
});

module.exports = mongoose.model("PregnancyMilestone", pregnancyMilestoneSchema);
