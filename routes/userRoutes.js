const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  resetPassword,
  deleteAccount,
  updateUser,
  forgotPassword,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User"); // ✅ Import the User model

// ✅ Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);

// ✅ Private routes (requires token)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt, // ✅ Ensure this exists in DB
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

router.patch("/update", authMiddleware, updateUser);
router.delete("/delete", authMiddleware, deleteAccount);

module.exports = router;
