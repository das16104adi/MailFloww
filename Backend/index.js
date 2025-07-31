// Enhanced Backend Server for MailFloww
import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import emailRoutes from "./routes/emailRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

// Enhanced CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8000"], // Frontend and LangGraph service
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  })
);

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for email content
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/emails", emailRoutes);

// Health check endpoint
app.get("/health", async (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "not configured (development mode)",
      server: "running"
    }
  });
});

// Start the server directly (skip database connection for development)
const startServer = () => {
  console.log(`Running in development mode (PostgreSQL not configured)`);

  app.listen(PORT, () => {
    console.log(`MailFloww Backend Server running on port ${PORT}`);
    console.log(`Gmail API integration ready (mock data)`);
    console.log(`LangGraph service integration ready`);
    console.log(`Frontend URL: http://localhost:3000`);
    console.log(`Backend URL: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
  });
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
