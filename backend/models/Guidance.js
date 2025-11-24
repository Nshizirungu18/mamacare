// backend/models/Guidance.js
const mongoose = require("mongoose");

const guidanceSchema = new mongoose.Schema({
  week: { type: Number, required: true },         // Pregnancy week
  topic: { type: String, required: true },         // e.g. "Nutrition", "Fatigue", "Exercise"
  content: { type: String, required: true },       // Medically reviewed advice
  media: { type: [String], default: [] },          // Optional: image/video/audio URLs
  tags: { type: [String], default: [] },           // e.g. ["fatigue", "hydration"]
});

module.exports = mongoose.model("Guidance", guidanceSchema);
