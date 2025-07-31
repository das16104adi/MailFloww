import { google } from "googleapis";
import dotenv from "dotenv";
import Email from "../models/Email.js";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

function decodeBase64(body) {
  return Buffer.from(body, "base64").toString("utf-8");
}

function extractBody(payload) {
  if (!payload) return "";

  if (payload.body?.data) return decodeBase64(payload.body.data);

  if (payload.parts?.length) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
  }

  return "";
}

function getHeaderValue(headers, name) {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

export const listMessages = async (req, res) => {
  try {
    // First, get list of message IDs
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20, // Limit to 20 for faster loading
    });

    const messages = response.data.messages;
    if (!messages || messages.length === 0) {
      return res.status(200).json({ message: "No messages found." });
    }

    const result = [];

    for (const msg of messages) {
      // Avoid duplicates using Gmail message ID
      const alreadyExists = await Email.findOne({ gmailId: msg.id });
      if (alreadyExists) continue;

      const message = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
      });

      const headers = message.data.payload.headers;
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from =
        headers.find((h) => h.name === "From")?.value || "(Unknown Sender)";
      const to =
        headers.find((h) => h.name === "To")?.value || "(Unknown Recipient)";
      const body = extractBody(message.data.payload);

      const emailDoc = new Email({
        user: req.user?._id || "6637f8be7fbf1f26d1e1a111", // fallback user ID for testing
        from,
        to,
        subject,
        body,
        gmailId: msg.id,
      });

      await emailDoc.save();
      result.push(emailDoc);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching emails:", err.message);
    res.status(500).json({ error: err.message });
  }
};
