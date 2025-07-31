import { google } from "googleapis";
import pkg from "google-auth-library";
const { OAuth2Client } = pkg;

import dotenv from "dotenv";
dotenv.config();

// Setup OAuth2 client
const oAuth2Client = new OAuth2Client(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// Function to fetch ALL emails using pagination
export const fetchEmails = async () => {
  try {
    console.log("📧 Starting to fetch ALL emails from Gmail...");

    let allEmails = [];
    let pageToken = null;
    let pageCount = 0;
    const maxResultsPerPage = 100; // Use larger batches for efficiency

    do {
      pageCount++;
      console.log(`📄 Fetching page ${pageCount}...`);

      const requestParams = {
        userId: "me",
        maxResults: maxResultsPerPage,
      };

      // Add pageToken for pagination if available
      if (pageToken) {
        requestParams.pageToken = pageToken;
      }

      const res = await gmail.users.messages.list(requestParams);
      const messages = res.data.messages;

      if (!messages || messages.length === 0) {
        console.log("📭 No more messages found");
        break;
      }

      console.log(`📧 Processing ${messages.length} messages from page ${pageCount}...`);

      // Fetch detailed message data for this batch
      const emailBatch = await Promise.all(
        messages.map(async (message) => {
          const msg = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "full", // Or 'metadata', 'minimal' if you want less
          });
          return msg.data;
        })
      );

      allEmails = [...allEmails, ...emailBatch];
      pageToken = res.data.nextPageToken;

      console.log(`✅ Page ${pageCount} complete. Total emails so far: ${allEmails.length}`);

      // Optional: Add a reasonable limit to prevent infinite loops
      if (pageCount >= 50) { // Max 5000 emails (50 pages × 100 emails)
        console.log("⚠️ Reached maximum page limit (50 pages). Stopping fetch.");
        break;
      }

    } while (pageToken); // Continue while there are more pages

    console.log(`🎉 Finished fetching emails. Total: ${allEmails.length} emails from ${pageCount} pages`);
    return allEmails;

  } catch (error) {
    console.error("❌ Error fetching emails:", error);
    throw new Error("Failed to fetch emails");
  }
};

// Placeholder for sending email — will connect later
export const sendEmail = async (to, subject, body) => {
  // TODO: Implement email sending functionality with Gmail API
  // Currently a placeholder
};
