const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Project = require("../models/Project"); 
exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send("User registered");
  } catch (err) {
    res.status(400).json({ error: "User registration failed", details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Login error", details: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Remove the user from all project team members
    await Project.updateMany(
      {},
      { $pull: { teamMembers: { user: userId } } }
    );

    // Optionally: you could also delete all projects where the user is the sole owner

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
};
