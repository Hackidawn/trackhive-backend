const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🧪 Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No token found in header");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🧪 Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🧪 Decoded Token:", decoded);

    // ✅ Use `decoded.id` (consistent with loginUser)
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("❌ No user found for ID:", decoded.id);
      return res.status(401).json({ error: "User not found" });
    }

    console.log("✅ Authenticated user:", user.email);
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ error: "Invalid token", details: err.message });
  }
//   console.log(`🧪 Decoded Token:`, decoded);
// console.log(`✅ Authenticated user: ${user.email} (${user._id})`);

};



module.exports = auth;
