const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  resetPassword,
  deleteAccount,
  forgotPassword, 
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword); 

// Return user info
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

// Delete user
router.delete("/delete", authMiddleware, deleteAccount);

module.exports = router;
