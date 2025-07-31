// models/Conversation.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userEditedReplies: {
    type: [String], // Array of edited reply texts
    default: [],
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Conversation", conversationSchema);
