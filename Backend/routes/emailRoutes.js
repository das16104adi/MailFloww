// Enhanced Email Routes with LangGraph Integration
import express from "express";
import {
  getEmails,
  replyToEmail,
  saveUserReply,
  generateSmartReply
} from "../controllers/emailController.js";
import { listMessages } from "../controllers/fetchMail.js";

const router = express.Router();

// Email management routes
router.get("/", getEmails);
router.get("/fetch", getEmails); // Add the missing /fetch endpoint for LangGraph service
router.get("/fetchmail", listMessages);

// AI-powered reply routes
router.post("/generate-smart-reply", generateSmartReply); // New LangGraph integration
router.post("/reply", replyToEmail);
router.post("/save-reply", saveUserReply);

// Health check for email service
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "email-routes",
    endpoints: {
      "GET /": "Fetch emails",
      "GET /fetchmail": "List messages",
      "POST /generate-smart-reply": "AI-powered reply generation",
      "POST /reply": "Send email reply",
      "POST /save-reply": "Save user reply"
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
