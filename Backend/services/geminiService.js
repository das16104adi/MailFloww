// services/geminiService.js
import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export const generateAIReply = async (emailContent) => {
  // 🚫 GEMINI DISABLED - Force LangGraph + RAG usage only
  console.error("❌ GEMINI FALLBACK DISABLED - LangGraph service must be running on port 8000");
  throw new Error("GEMINI_DISABLED: Use LangGraph + RAG system only. Check if LangGraph service is running on port 8000.");
};
