require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes.js");
const documentRoutes = require("./routes/document.routes.js");
const generationRoutes = require("./routes/generation.routes.js");

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "connect-src": ["'self'", "http://localhost:5173", "http://localhost:5000", "http://localhost:5001"],
    },
  },
}));

// Rate Limiting
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 chat requests per minute
  message: { message: "Too many chat requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/generate", generationRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Health check endpoint for Docker and monitoring
app.get("/health", async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStatus = mongoState === 1 ? "connected" : mongoState === 2 ? "connecting" : "disconnected";
  
  let ragStatus = "unknown";
  try {
    const axios = require("axios");
    const ragUrl = process.env.RAG_SERVICE_URL || "http://127.0.0.1:5000";
    const ragRes = await axios.get(`${ragUrl}/health`, { timeout: 5000 });
    ragStatus = ragRes.data?.status || "reachable";
  } catch {
    ragStatus = "unreachable";
  }

  res.json({
    status: "healthy",
    service: "backend",
    mongodb: mongoStatus,
    rag_service: ragStatus,
    rag_service_url: process.env.RAG_SERVICE_URL || "http://127.0.0.1:5000",
    uptime: process.uptime()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
