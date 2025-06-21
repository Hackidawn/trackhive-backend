const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Rename for consistency
const User = require("../models/User");

// GET all comments for a ticket
router.get("/:ticketId", authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ ticketId: req.params.ticketId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load comments." });
  }
});

// POST a new comment
router.post("/:ticketId", authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Comment text is required." });

  try {
    const user = await User.findById(req.user.id);
    const newComment = new Comment({
      ticketId: req.params.ticketId,
      userId: req.user.id,
      userName: user.name,
      text,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "Error posting comment." });
  }
});

module.exports = router;
