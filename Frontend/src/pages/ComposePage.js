"use client";

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Save,
  Paperclip,
  Pen,
  MessageSquare,
  Calendar,
  Send,
} from "lucide-react";

function ComposePage() {
  const { currentUser } = useAuth();
  const [from, setFrom] = useState(currentUser?.email || "");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Integrate backend API to send email
    setTimeout(() => {
      alert("Email sent successfully!");
      setTo("");
      setSubject("");
      setContent("");
      setLoading(false);
    }, 1500);
  };

  const handleScheduleSend = (date) => {
    setShowSchedule(false);
    // TODO: Implement backend scheduling logic
    alert(`Email scheduled for ${date}`);
  };

  const handleAIDraft = () => {
    // TODO: Call AI service to generate email draft
    alert("AI Draft feature coming soon!");
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-800 text-white rounded-t-lg">
        <div className="flex space-x-4">
          <button className="p-2 rounded hover:bg-gray-700">
            <Save size={20} />
          </button>
          <button className="p-2 rounded hover:bg-gray-700">
            <Paperclip size={20} />
          </button>
          <button className="p-2 rounded hover:bg-gray-700">
            <Pen size={20} />
          </button>
          <button className="p-2 rounded hover:bg-gray-700">
            <MessageSquare size={20} />
          </button>
        </div>
        <button
          className="p-2 rounded hover:bg-gray-700"
          onClick={() => setShowSchedule(!showSchedule)}
        >
          <Calendar size={20} />
        </button>
      </div>

      <form onSubmit={handleSend} className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="w-20 text-gray-700 font-medium">From</label>
            <input
              type="email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded mt-1 sm:mt-0"
              readOnly
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="w-20 text-gray-700 font-medium">To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded mt-1 sm:mt-0"
              placeholder="recipient@example.com"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center">
            <label className="w-20 text-gray-700 font-medium">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded mt-1 sm:mt-0"
              placeholder="Email subject"
              required
            />
          </div>
          <div>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="bg-white text-black"
              placeholder="Compose your email here..."
            />
          </div>

          {showSchedule && (
            <div className="absolute right-8 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-10">
              <div className="text-sm font-medium mb-2">Schedule send</div>
              <div className="text-xs text-gray-500 mb-2">
                India Standard Time
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    handleScheduleSend(
                      "Tomorrow morning April 6, 2025, 08:00 AM"
                    )
                  }
                  className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded"
                >
                  Tomorrow morning April 6, 2025, 08:00 AM
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleScheduleSend(
                      "Tomorrow afternoon April 6, 2025, 01:00 PM"
                    )
                  }
                  className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded"
                >
                  Tomorrow afternoon April 6, 2025, 01:00 PM
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleScheduleSend("Monday morning April 7, 2025, 08:00 AM")
                  }
                  className="w-full text-left p-2 text-sm hover:bg-gray-100 rounded"
                >
                  Monday morning April 7, 2025, 08:00 AM
                </button>
                <div className="text-sm text-gray-600 mt-2">
                  Select date and time
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                <Send size={16} className="mr-2" />
                {loading ? "Sending..." : "Send"}
              </button>
              <button
                type="button"
                onClick={handleAIDraft}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                AI draft
              </button>
              <button
                type="button"
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                Schedule Send
              </button>
            </div>
            <button
              type="button"
              className="px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
            >
              Open in new
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ComposePage;
