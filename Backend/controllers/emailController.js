// Enhanced Email Controller with LangGraph Integration
import { PrismaClient } from "@prisma/client";
import { fetchEmails, sendEmail } from "../services/gmailService.js";
// import { generateAIReply } from "../services/geminiService.js"; // 🚫 DISABLED - LangGraph only
import axios from "axios";

const prisma = new PrismaClient();

// LangGraph service URL
const LANGGRAPH_SERVICE_URL = process.env.LANGGRAPH_SERVICE_URL || "http://localhost:8000";

// Test emails simulating hackfest7@gmail.com inbox - 5 recent emails
const mockEmails = [
  {
    id: "email_001",
    messageId: "msg_001",
    from: "john.doe@company.com",
    fromName: "John Doe",
    to: "hackfest7@gmail.com",
    subject: "🚀 Project Update: GoFloww-Atom-mail Progress",
    bodyText: `Hi there!

I wanted to give you a quick update on the GoFloww-Atom-mail project. We've made significant progress over the weekend:

✅ Backend API is fully functional
✅ Gmail integration is working
✅ Frontend components are responsive
✅ Email fetching and display logic implemented

Next steps:
- Test email content rendering
- Implement AI reply functionality
- Polish the user interface
- Deploy to production

The deadline is approaching fast, but I'm confident we'll deliver a great product!

Best regards,
John Doe
Senior Developer`,
    receivedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    date: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    starred: false,
    important: true,
    priority: "high"
  },
  {
    id: "email_002",
    messageId: "msg_002",
    from: "sarah.wilson@friends.com",
    fromName: "Sarah Wilson",
    to: "hackfest7@gmail.com",
    subject: "Weekend Plans & Coffee Meetup ☕",
    bodyText: `Hey!

Hope you're having a great weekend! I was thinking we could grab coffee tomorrow morning around 10 AM at that new café downtown - "The Grind".

They have amazing pastries and I heard their cold brew is fantastic. Plus, we can catch up on everything that's been happening lately.

Let me know if you're free! If not, we can always reschedule for next week.

Looking forward to hearing from you!

Cheers,
Sarah 😊`,
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    starred: true,
    important: false,
    priority: "normal"
  },
  {
    id: "email_003",
    messageId: "msg_003",
    from: "security@techservice.com",
    fromName: "TechService Security",
    to: "hackfest7@gmail.com",
    subject: "🔔 Security Alert: New Login Detected",
    bodyText: `SECURITY ALERT

We detected a new login to your TechService account:

Device: Chrome on Windows 10
Location: New York, NY, USA
IP Address: 192.168.1.100
Time: ${new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString()}

If this was you, you can safely ignore this email.

If this wasn't you, please:
1. Change your password immediately
2. Enable two-factor authentication
3. Review your recent account activity

For security questions, contact our support team at security@techservice.com

Best regards,
TechService Security Team`,
    receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    date: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    starred: false,
    important: true,
    priority: "high"
  },
  {
    id: "email_004",
    messageId: "msg_004",
    from: "orders@onlinestore.com",
    fromName: "Online Store",
    to: "hackfest7@gmail.com",
    subject: "📦 Your Order #12345 Has Been Shipped!",
    bodyText: `Great news! Your order has been shipped.

Order Details:
- Order Number: #12345
- Items: Wireless Headphones, Phone Case
- Total: $89.99
- Shipping Method: Express Delivery

Tracking Information:
- Carrier: FastShip Express
- Tracking Number: FS123456789
- Expected Delivery: Tomorrow by 6 PM

You can track your package at: https://fastship.com/track/FS123456789

Thank you for shopping with us!

Customer Service Team
Online Store
support@onlinestore.com`,
    receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    date: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    starred: false,
    important: false,
    priority: "normal"
  },
  {
    id: "email_005",
    messageId: "msg_005",
    from: "hr@newcompany.com",
    fromName: "HR Team - New Company",
    to: "hackfest7@gmail.com",
    subject: "🎉 Welcome to the Team! Your First Day Guide",
    bodyText: `Welcome to New Company!

We're thrilled to have you join our team as a Software Developer. Your first day is scheduled for Monday, and we want to make sure you're fully prepared.

First Day Schedule:
9:00 AM - Welcome & Office Tour
10:00 AM - HR Orientation
11:30 AM - Meet Your Team
12:30 PM - Lunch with Your Manager
2:00 PM - IT Setup & Equipment
3:30 PM - Project Overview
4:30 PM - Q&A Session

What to Bring:
- Government-issued ID
- Signed employment contract
- Bank details for payroll setup
- Emergency contact information

Office Address:
New Company HQ
123 Innovation Drive
Tech City, TC 12345

Parking is available in the building garage (Level B1).

If you have any questions before your first day, don't hesitate to reach out!

Welcome aboard!

Best regards,
Jennifer Martinez
HR Manager
hr@newcompany.com
(555) 123-4567`,
    receivedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    date: new Date(Date.now() - 8 * 60 * 60 * 1000),
    read: false,
    starred: true,
    important: true,
    priority: "normal"
  }
];

// Function to transform Gmail API response to our format
const transformGmailEmail = (gmailEmail) => {
  const headers = gmailEmail.payload?.headers || [];
  const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  // Extract body text with improved logic
  let bodyText = '';

  // Function to decode base64 safely
  const decodeBase64 = (data) => {
    try {
      return Buffer.from(data, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decoding base64:', error);
      return '';
    }
  };

  // Try direct body first
  if (gmailEmail.payload?.body?.data) {
    bodyText = decodeBase64(gmailEmail.payload.body.data);
  }
  // Try parts if no direct body
  else if (gmailEmail.payload?.parts) {
    // First try to find text/plain
    const textPart = gmailEmail.payload.parts.find(part => part.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      bodyText = decodeBase64(textPart.body.data);
    }
    // If no text/plain, try text/html
    else {
      const htmlPart = gmailEmail.payload.parts.find(part => part.mimeType === 'text/html');
      if (htmlPart?.body?.data) {
        bodyText = decodeBase64(htmlPart.body.data);
      }
      // Try nested parts (multipart/alternative, etc.)
      else {
        for (const part of gmailEmail.payload.parts) {
          if (part.parts) {
            const nestedTextPart = part.parts.find(p => p.mimeType === 'text/plain');
            if (nestedTextPart?.body?.data) {
              bodyText = decodeBase64(nestedTextPart.body.data);
              break;
            }
          }
        }
      }
    }
  }

  // Clean up the body text
  bodyText = bodyText.trim();

  // Debug logging
  console.log(`📧 Email ${gmailEmail.id}: Subject="${getHeader('Subject')}", BodyLength=${bodyText.length}`);
  if (bodyText.length === 0) {
    console.log(`⚠️  Empty body for email ${gmailEmail.id}, payload structure:`, JSON.stringify(gmailEmail.payload, null, 2));
  }

  return {
    id: gmailEmail.id,
    messageId: gmailEmail.id,
    from: getHeader('From'),
    fromName: getHeader('From').split('<')[0].trim(),
    to: getHeader('To'),
    subject: getHeader('Subject'),
    bodyText: bodyText, // Full email content without truncation
    receivedAt: new Date(parseInt(gmailEmail.internalDate)).toISOString(),
    read: !gmailEmail.labelIds?.includes('UNREAD'),
    priority: 'normal'
  };
};

// Enhanced function to get emails with AI analysis
export const getEmails = async (req, res) => {
  try {
    console.log("📧 Fetching emails from Gmail API...");

    let emails = [];
    let source = 'mock';

    try {
      const gmailEmails = await fetchEmails();
      if (gmailEmails && gmailEmails.length > 0) {
        emails = gmailEmails.map(transformGmailEmail);
        source = 'gmail';
        console.log(`✅ Loaded ${emails.length} emails from Gmail API`);
      } else {
        console.log("📝 No emails found in Gmail, using mock data");
        emails = mockEmails;
      }
    } catch (gmailError) {
      console.error("⚠️ Gmail API error:", gmailError.message);
      console.log("📝 Falling back to mock emails");
      emails = mockEmails;
    }

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
      source: source,
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

// Enhanced function to generate AI reply using Enhanced LangGraph service
export const generateSmartReply = async (req, res) => {
  try {
    const { emailContent, senderEmail, subject, threadId, conversationHistory = [] } = req.body;

    if (!emailContent) {
      return res.status(400).json({
        success: false,
        message: "Email content is required"
      });
    }

    console.log("🤖 Generating smart reply using Enhanced LangGraph 4-node workflow...");

    // Prepare request for LangGraph generate-reply endpoint
    const enhancedRequest = {
      email_content: emailContent,
      sender_info: senderEmail || "unknown@example.com",  // LangGraph expects 'sender_info'
      subject: subject || "No Subject"
    };

    console.log("📧 Request details:", {
      content_length: emailContent.length,
      sender: senderEmail,
      subject: subject,
      has_thread: !!threadId
    });

    // Call Enhanced LangGraph service for AI reply generation
    const langGraphResponse = await axios.post(`${LANGGRAPH_SERVICE_URL}/generate-reply`, enhancedRequest, {
      timeout: 120000, // 120 second timeout for the 4-node workflow (handles Groq rate limiting)
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = langGraphResponse.data;

    console.log("✅ Enhanced LangGraph response received:", {
      confidence: aiResponse.confidence_score,
      similar_emails: aiResponse.similar_emails_found,
      context_used: aiResponse.context_used,
      processing_time: aiResponse.processing_time
    });

    // Save the conversation for future reference using Prisma
    try {
      // For now, skip database operations until PostgreSQL is set up
      console.log("💾 Enhanced conversation would be saved to database (PostgreSQL not configured)");
    } catch (saveError) {
      console.warn("⚠️ Failed to save conversation:", saveError.message);
    }

    // Enhanced response with 4-node workflow details
    res.json({
      success: true,
      reply: aiResponse.reply_content,
      confidence: aiResponse.confidence_score,
      similarEmailsFound: aiResponse.similar_emails_found,
      contextUsed: aiResponse.context_used,
      processingTime: aiResponse.processing_time,

      // Enhanced workflow information
      workflow: {
        type: "4-node-enhanced",
        nodes_executed: ["initialize_email", "retrieve_thread", "gather_context", "reflection"],
        iterations: Math.ceil((aiResponse.processing_time || 1) / 3), // Estimate iterations
        confidence_threshold: aiResponse.confidence_score >= 0.99 ? "met" : "not_met"
      },

      // Email analysis details
      analysis: {
        tone: "auto-detected", // This would come from the Email object
        importance: "auto-detected", // This would come from the Email object
        intent: "auto-detected" // This would come from the Email object
      },

      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Error generating smart reply with Enhanced LangGraph:", error);

    // Enhanced error handling with more specific error messages
    if (error.code === 'ECONNREFUSED') {
      console.error("🔌 LangGraph service is not running on", LANGGRAPH_SERVICE_URL);
    } else if (error.response?.status === 503) {
      console.error("⚠️ LangGraph service is not initialized");
    }

    // 🚫 NO FALLBACK - LangGraph + RAG ONLY
    console.error("❌ GEMINI FALLBACK DISABLED - LangGraph service MUST be running!");
    console.error("🔧 Fix: Ensure LangGraph service is running on port 8000");
    console.error("🔧 Command: cd langgraph-service && python main.py");

    res.status(503).json({
      success: false,
      message: "LangGraph + RAG service is required but not available",
      error: "LANGGRAPH_SERVICE_UNAVAILABLE",
      details: {
        langgraph_error: error.response?.data || error.message,
        required_service: "LangGraph + RAG on port 8000",
        fix_instructions: [
          "1. Navigate to langgraph-service directory",
          "2. Run: python main.py",
          "3. Wait for 'Application startup complete' message",
          "4. Retry your request"
        ]
      },
      timestamp: new Date().toISOString()
    });
  }
};

export const replyToEmail = async (req, res) => {
  const { emailId, replyContent } = req.body;

  try {
    // For development, simulate email processing
    console.log(`📧 Processing reply for email ${emailId}`);

    // Generate AI reply
    const aiReply = await generateAIReply(replyContent);

    // Send email (if Gmail API is configured)
    try {
      // await sendEmail(email.fromEmail, `Re: ${email.subject}`, aiReply);
      console.log("📤 Email would be sent (Gmail API not configured)");
    } catch (sendError) {
      console.warn("⚠️ Email sending failed (Gmail API not configured):", sendError.message);
    }

    res.status(200).json({
      message: "Reply processed successfully",
      aiReply,
      note: "Development mode - email not actually sent"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveUserReply = async (req, res) => {
  const { userId, replyContent } = req.body;

  console.log("userId: ", userId);
  try {
    // For development, simulate saving user reply
    console.log("💾 User reply would be saved to database (PostgreSQL not configured)");

    res.status(200).json({
      message: "Reply saved successfully",
      note: "Development mode - reply not actually saved to database"
    });
  } catch (error) {
    console.error("Error saving user reply:", error);
    res.status(500).json({ message: error.message });
  }
};
