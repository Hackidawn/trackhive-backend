const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Route Imports
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes"); // ✅ Comments route

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// ✅ Dynamic CORS config to allow both local & deployed frontend
const allowedOrigins = [
  process.env.CLIENT_URL,          // e.g. https://track-hive-six.vercel.app
  "http://localhost:5173"          // local dev
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);

// Root Health Check
app.get("/", (req, res) => {
  res.send("🚀 TrackHive API is running");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TrackHive backend running on port ${PORT}`);
  console.log("✅ Loaded .env values:");
  console.log("PORT:", process.env.PORT);
  console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ present" : "❌ missing");
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ present" : "❌ missing");
  console.log("CLIENT_URL:", process.env.CLIENT_URL || "⚠️ not set");
});
