// Enhanced Email Controller with LangGraph Integration
import Email from "../models/Email.js";
import Conversation from "../models/Conversation.js";
import { fetchEmails, sendEmail } from "../services/gmailService.js";
import { generateAIReply } from "../services/geminiService.js";
import axios from "axios";

// LangGraph service URL
const LANGGRAPH_SERVICE_URL = process.env.LANGGRAPH_SERVICE_URL || "http://localhost:8000";

// Enhanced function to get emails with AI analysis
export const getEmails = async (req, res) => {
  try {
    console.log("📧 Fetching emails from Gmail...");
    const emails = await fetchEmails();

    // Add AI analysis status for each email
    const enhancedEmails = emails.map(email => ({
      ...email,
      aiAnalysisAvailable: true,
      vectorSimilarityEnabled: true
    }));

    res.json({
      success: true,
      count: enhancedEmails.length,
      emails: enhancedEmails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// New function to generate AI reply using LangGraph service
export const generateSmartReply = async (req, res) => {
  try {
    const { emailContent, senderEmail, conversationHistory = [] } = req.body;

    if (!emailContent) {
      return res.status(400).json({
        success: false,
        message: "Email content is required"
      });
    }

    console.log("🤖 Generating smart reply using LangGraph service...");

    // Call LangGraph service for AI reply generation
    const langGraphResponse = await axios.post(`${LANGGRAPH_SERVICE_URL}/process-email`, {
      email_content: emailContent,
      sender_email: senderEmail || "unknown@example.com",
      conversation_history: conversationHistory
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = langGraphResponse.data;

    // Save the conversation for future reference
    try {
      const conversation = new Conversation({
        originalEmail: emailContent,
        aiReply: aiResponse.reply_content,
        senderEmail: senderEmail,
        confidenceScore: aiResponse.confidence_score,
        similarEmailsFound: aiResponse.similar_emails_found,
        contextUsed: aiResponse.context_used,
        timestamp: new Date()
      });

      await conversation.save();
      console.log("💾 Conversation saved to database");
    } catch (saveError) {
      console.warn("⚠️ Failed to save conversation:", saveError.message);
    }

    res.json({
      success: true,
      reply: aiResponse.reply_content,
      confidence: aiResponse.confidence_score,
      similarEmailsFound: aiResponse.similar_emails_found,
      contextUsed: aiResponse.context_used,
      processingTime: aiResponse.processing_time,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error generating smart reply:", error);

    // Fallback to basic Gemini service if LangGraph fails
    try {
      console.log("🔄 Falling back to basic Gemini service...");
      const fallbackReply = await generateAIReply(req.body.emailContent);

      res.json({
        success: true,
        reply: fallbackReply,
        confidence: 0.5,
        similarEmailsFound: 0,
        contextUsed: false,
        fallback: true,
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: "Both LangGraph and fallback services failed",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};

export const replyToEmail = async (req, res) => {
  const { emailId, replyContent } = req.body;

  try {
    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate AI reply
    const aiReply = await generateAIReply(replyContent);

    // Send email
    await sendEmail(email.from, `Re: ${email.subject}`, aiReply);

    // Save reply to database
    email.aiGeneratedReply = aiReply;
    await email.save();

    res.status(200).json({ message: "Reply sent successfully", aiReply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveUserReply = async (req, res) => {
  const { userId, replyContent } = req.body;

  console.log("userId: ",userId);
  try {
    let conversation = await Conversation.findOne({ user: userId });

    if (!conversation) {
      // create if not exists
      conversation = new Conversation({
        user: userId,
        userEditedReplies: [replyContent],
      });
    } else {
      // push to existing
      conversation.userEditedReplies.push(replyContent);
    }

    await conversation.save();
    res.status(200).json({ message: "Reply saved successfully", conversation });
  } catch (error) {
    console.log("not working properly");
    res.status(500).json({ message: error.message });
  }
};
