// backend/models/ForumPost.js
const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    anonymous: { type: Boolean, default: false },
    birthClub: { type: String }, // e.g., "March 2026"
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ForumPost", forumPostSchema);
