// backend/routes/forumRoutes.js
const express = require("express");
const ForumPost = require("../models/ForumPost");
const Comment = require("../models/Comment");
const { protect } = require("../middleware/authMiddleware");
const { getBirthClub } = require("../utils/birthClub");

const router = express.Router();

// Create a post
router.post("/", protect, async (req, res) => {
  try {
    const { content, anonymous } = req.body;
    if (!content || content.trim().length < 3)
      return res.status(400).json({ message: "Content too short" });

    const birthClub = getBirthClub(req.user?.dueDate);
    const post = await ForumPost.create({
      user: req.user._id,
      content,
      anonymous: !!anonymous,
      birthClub,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Error creating post", error: err.message });
  }
});

// Get posts (optionally filter by birth club)
router.get("/", protect, async (req, res) => {
  try {
    const { birthClub } = req.query;
    const query = birthClub ? { birthClub } : {};
    const posts = await ForumPost.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err.message });
  }
});

// Add comment
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length < 1)
      return res.status(400).json({ message: "Comment required" });

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      content,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err.message });
  }
});

// Get comments for a post
router.get("/:id/comments", protect, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate("user", "name");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments", error: err.message });
  }
});

// Flag post/comment for moderation
router.post("/:id/flag", protect, async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { flagged: true },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Error flagging post", error: err.message });
  }
});

module.exports = router;
