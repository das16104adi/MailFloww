"use client"

import { useState, useEffect } from "react"
import { Inbox, Star, AlertCircle, Mail, Bot, Zap, Brain, TrendingUp } from "lucide-react"
import axios from "axios"

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api/v1"

export default function EnhancedInboxPage() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [activeTab, setActiveTab] = useState("inbox")
  const [aiReply, setAiReply] = useState("")
  const [generatingReply, setGeneratingReply] = useState(false)
  const [aiInsights, setAiInsights] = useState(null)

  useEffect(() => {
    fetchEmails()
  }, [])

  // Fetch emails from backend
  const fetchEmails = async () => {
    try {
      setLoading(true)
      console.log("📧 Fetching emails from backend...")

      const response = await axios.get(`${API_BASE_URL}/emails`)

      if (response.data.success) {
        const emailsData = response.data.emails || []
        setEmails(emailsData)
        console.log(`✅ Loaded ${response.data.count} emails`)
        console.log("📧 Email IDs:", emailsData.map(e => e.id))
        console.log("📧 First email structure:", emailsData[0])
      } else {
        setEmails([])
      }

      setLoading(false)
    } catch (error) {
      console.error("❌ Error fetching emails:", error)
      setEmails([])
      setError("Failed to load emails. Please check your connection.")
      setLoading(false)
    }
  }

  // Generate AI reply using Enhanced LangGraph 4-node workflow
  const generateAIReply = async (email) => {
    try {
      setGeneratingReply(true)
      console.log("🤖 Generating AI reply using Enhanced LangGraph 4-node workflow...")

      // Enhanced request with more email context
      const enhancedRequest = {
        emailContent: email.bodyText,
        senderEmail: email.from,
        subject: email.subject,
        threadId: email.thread_id || `thread_${email.id}`,
        conversationHistory: [] // Could be enhanced with actual thread history
      }

      console.log("📧 Enhanced request:", {
        content_length: email.bodyText?.length || 0,
        sender: email.from,
        subject: email.subject,
        has_thread: !!enhancedRequest.threadId
      })

      const response = await axios.post(`${API_BASE_URL}/emails/generate-smart-reply`, enhancedRequest)

      if (response.data.success) {
        setAiReply(response.data.reply)

        // Enhanced AI insights with workflow information
        setAiInsights({
          confidence: response.data.confidence,
          similarEmailsFound: response.data.similarEmailsFound,
          contextUsed: response.data.contextUsed,
          processingTime: response.data.processingTime,

          // Enhanced workflow details
          workflow: response.data.workflow || {},
          analysis: response.data.analysis || {},

          // Additional metrics
          iterations: response.data.workflow?.iterations || 1,
          confidenceThreshold: response.data.workflow?.confidence_threshold || "unknown",
          workflowType: response.data.workflow?.type || "unknown",
          nodesExecuted: response.data.workflow?.nodes_executed || [],

          // Fallback indicator
          isFallback: response.data.fallback || false
        })

        console.log(`✅ Enhanced AI reply generated:`, {
          confidence: `${(response.data.confidence * 100).toFixed(1)}%`,
          similar_emails: response.data.similarEmailsFound,
          context_used: response.data.contextUsed,
          processing_time: `${response.data.processingTime?.toFixed(2)}s`,
          workflow_type: response.data.workflow?.type,
          iterations: response.data.workflow?.iterations,
          is_fallback: response.data.fallback
        })
      }

    } catch (error) {
      console.error("❌ Error generating Enhanced AI reply:", error)
      setAiReply("Sorry, I couldn't generate a reply at this time. The Enhanced LangGraph service may be unavailable. Please try again.")
      setAiInsights({
        confidence: 0,
        similarEmailsFound: 0,
        contextUsed: false,
        processingTime: 0,
        workflow: { type: "error" },
        isFallback: false,
        error: error.response?.data?.message || error.message
      })
    } finally {
      setGeneratingReply(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const handleEmailClick = (email) => {
    console.log("🖱️ Email clicked:", email.id, email.subject)
    setSelectedEmail(email)
    setAiReply("") // Clear previous AI reply
    setAiInsights(null)

    // Mark as read if unread
    if (!email.read) {
      setEmails(emails.map((e) => (e.id === email.id ? { ...e, read: true } : e)))
    }
  }

  const toggleStar = (emailId, e) => {
    e.stopPropagation()
    setEmails(emails.map((email) => (email.id === emailId ? { ...email, starred: !email.starred } : email)))
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MailFloww AI
                </h1>
                <p className="text-sm text-gray-600">Customer Email Automation Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">LangGraph AI Active</span>
                <Bot className="text-green-600" size={16} />
              </div>
              <button
                onClick={fetchEmails}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Inbox className="h-4 w-4 mr-2" />
                    Refresh Emails
                  </>
                )}
              </button>
            </div>
          </div>
        </div>


      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex items-center w-full p-4 rounded-xl transition-all duration-200 ${
                  activeTab === "inbox"
                    ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm"
                    : "hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  activeTab === "inbox"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500"
                    : "bg-gray-100"
                }`}>
                  <Inbox size={18} className={activeTab === "inbox" ? "text-white" : "text-gray-600"} />
                </div>
                <span className="font-semibold">Inbox</span>
                <span className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full shadow-sm">
                  {emails.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("starred")}
                className={`flex items-center w-full p-4 rounded-xl transition-all duration-200 ${
                  activeTab === "starred"
                    ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 shadow-sm"
                    : "hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  activeTab === "starred"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gray-100"
                }`}>
                  <Star size={18} className={activeTab === "starred" ? "text-white" : "text-gray-600"} />
                </div>
                <span className="font-semibold">Starred</span>
              </button>
            </div>
          </div>

          {/* Enhanced AI Features Section */}
          <div className="mt-8 px-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
              <Bot size={16} className="mr-2 text-purple-600" />
              AI Features
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 text-sm bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <Brain size={12} className="text-white" />
                </div>
                <span className="font-medium text-blue-700">Vector Similarity</span>
              </div>
              <div className="flex items-center p-3 text-sm bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp size={12} className="text-white" />
                </div>
                <span className="font-medium text-green-700">Context Learning</span>
              </div>
              <div className="flex items-center p-3 text-sm bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-3">
                  <Zap size={12} className="text-white" />
                </div>
                <span className="font-medium text-yellow-700">Smart Replies</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Email List */}
        <div className="w-1/3 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Mail className="mr-2 text-purple-600" size={20} />
              Email Inbox
            </h2>
            <p className="text-sm text-gray-600 mt-1">{emails.length} emails loaded</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-red-500 flex items-center bg-red-50 m-4 rounded-xl border border-red-200">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-purple-600" />
              </div>
              <p className="font-semibold text-gray-700">No emails found</p>
              <p className="text-sm text-gray-500 mt-1">Connect your Gmail account to get started</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {(() => {
                console.log("📧 Rendering emails:", emails.length, "emails");
                console.log("📧 Email data:", emails.map(e => ({ id: e.id, subject: e.subject, fromName: e.fromName })));
                return emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  className={`p-4 cursor-pointer rounded-xl transition-all duration-200 border ${
                    selectedEmail?.id === email.id
                      ? "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-md transform scale-[1.02]"
                      : "bg-white hover:bg-gray-50 hover:shadow-sm border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          !email.read ? "bg-gradient-to-r from-purple-500 to-blue-500" : "bg-gray-200"
                        }`}>
                          <span className={`text-xs font-bold ${!email.read ? "text-white" : "text-gray-600"}`}>
                            {(email.fromName || email.from).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <span className={`font-semibold ${!email.read ? "text-gray-900" : "text-gray-600"}`}>
                            {email.fromName || email.from}
                          </span>
                          {email.aiAnalysisAvailable && (
                            <div className="inline-flex items-center ml-2 px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                              <Bot size={12} className="text-purple-600 mr-1" />
                              <span className="text-xs font-medium text-purple-700">AI Ready</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm ${!email.read ? "font-semibold text-gray-900" : "text-gray-600"} truncate mb-1`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {email.bodyText?.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex items-center ml-3 space-x-2">
                      <button
                        onClick={(e) => toggleStar(email.id, e)}
                        className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                      >
                        <Star
                          size={16}
                          className={email.starred ? "text-yellow-500 fill-current" : "text-gray-400"}
                        />
                      </button>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDate(email.receivedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ));
              })()}
            </div>
          )}
        </div>

        {/* Email Content */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              {/* Email Header */}
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedEmail.subject}
                </h2>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>From: {selectedEmail.fromName} ({selectedEmail.from})</span>
                  <span>{new Date(selectedEmail.receivedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="flex-1 p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.bodyText}
                  </p>
                </div>
              </div>

              {/* AI Reply Section */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bot className="mr-2 text-purple-600" />
                    AI-Generated Reply
                  </h3>
                  <button
                    onClick={() => generateAIReply(selectedEmail)}
                    disabled={generatingReply}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {generatingReply ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="mr-2" />
                        Generate Smart Reply
                      </>
                    )}
                  </button>
                </div>

                {aiInsights && (
                  <div className="mb-6 space-y-4">
                    {/* Main Metrics */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <TrendingUp size={18} className="text-blue-600 mr-2" />
                        <h4 className="text-sm font-semibold text-blue-900">AI Analysis Metrics</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Confidence Score</span>
                            {aiInsights.confidenceThreshold === "met" && (
                              <span className="text-green-600 text-xs">✓ High Quality</span>
                            )}
                          </div>
                          <div className="mt-1">
                            <span className="text-lg font-bold text-blue-600">
                              {(aiInsights.confidence * 100).toFixed(1)}%
                            </span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${aiInsights.confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="text-xs font-medium text-gray-600">Similar Emails Found</div>
                          <div className="mt-1">
                            <span className="text-lg font-bold text-indigo-600">
                              {aiInsights.similarEmailsFound}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">emails</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="text-xs font-medium text-gray-600">Context Usage</div>
                          <div className="mt-1 flex items-center">
                            <span className={`text-sm font-semibold ${aiInsights.contextUsed ? 'text-green-600' : 'text-gray-500'}`}>
                              {aiInsights.contextUsed ? 'Active' : 'None'}
                            </span>
                            {aiInsights.contextUsed && (
                              <Brain size={14} className="ml-2 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="text-xs font-medium text-gray-600">Processing Time</div>
                          <div className="mt-1">
                            {aiInsights.processingTime ? (
                              <span className="text-lg font-bold text-purple-600">
                                {aiInsights.processingTime.toFixed(2)}s
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Workflow Information */}
                    {aiInsights.workflow && aiInsights.workflowType !== "error" && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Brain size={16} className="text-white" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-semibold text-purple-900">LangGraph Workflow</h4>
                              <p className="text-xs text-purple-700">Advanced AI processing pipeline</p>
                            </div>
                          </div>
                          {aiInsights.isFallback && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <AlertCircle size={12} className="mr-1" />
                              Fallback Mode
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-purple-100">
                            <div className="text-xs font-medium text-gray-600">Workflow Type</div>
                            <div className="mt-1 text-sm font-semibold text-purple-700 capitalize">
                              {aiInsights.workflowType.replace('_', ' ')}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-purple-100">
                            <div className="text-xs font-medium text-gray-600">Iterations</div>
                            <div className="mt-1 flex items-center">
                              <span className="text-sm font-semibold text-purple-700">
                                {aiInsights.iterations}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">cycles</span>
                            </div>
                          </div>
                        </div>

                        {aiInsights.nodesExecuted && aiInsights.nodesExecuted.length > 0 && (
                          <div className="bg-white rounded-lg p-3 border border-purple-100">
                            <div className="text-xs font-medium text-gray-600 mb-2">Processing Nodes</div>
                            <div className="flex flex-wrap gap-2">
                              {aiInsights.nodesExecuted.map((node, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200"
                                >
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                  {node.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Information */}
                    {aiInsights.error && (
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <AlertCircle size={16} className="text-white" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-red-900">Processing Error</h4>
                            <p className="text-sm text-red-700 mt-1">{aiInsights.error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {aiReply && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* Reply Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-semibold text-gray-900">AI-Generated Reply</h4>
                            <p className="text-xs text-gray-600">
                              {aiInsights?.confidence && `${(aiInsights.confidence * 100).toFixed(1)}% confidence`}
                              {aiInsights?.similarEmailsFound > 0 && ` • ${aiInsights.similarEmailsFound} similar emails found`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {aiInsights?.contextUsed && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Brain size={12} className="mr-1" />
                              Context Used
                            </span>
                          )}
                          {aiInsights?.iterations > 1 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <TrendingUp size={12} className="mr-1" />
                              {aiInsights.iterations} iterations
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reply Content */}
                    <div className="p-6">
                      <div className="prose max-w-none">
                        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                          {/* Format the reply with better structure */}
                          {aiReply.split('\n\n').map((paragraph, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                              {paragraph.split('\n').map((line, lineIndex) => (
                                <div key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
                                  {line.trim()}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reply Metadata */}
                      {aiInsights && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            {aiInsights.processingTime && (
                              <div className="flex items-center">
                                <Zap size={12} className="mr-1" />
                                Generated in {aiInsights.processingTime.toFixed(2)}s
                              </div>
                            )}
                            {aiInsights.workflowType && (
                              <div className="flex items-center">
                                <Brain size={12} className="mr-1" />
                                {aiInsights.workflowType} workflow
                              </div>
                            )}
                            {aiInsights.similarEmailsFound > 0 && (
                              <div className="flex items-center">
                                <Mail size={12} className="mr-1" />
                                Based on {aiInsights.similarEmailsFound} similar emails
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-3">
                          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                            <Mail size={16} className="mr-2" />
                            Send Reply
                          </button>
                          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            <Bot size={16} className="mr-2" />
                            Edit & Send
                          </button>
                          <button
                            onClick={() => generateAIReply(selectedEmail)}
                            disabled={generatingReply}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Zap size={16} className="mr-2" />
                            Regenerate
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          AI-powered by NEXUS MailFloww
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Mail size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Select an email to view</p>
                <p className="text-sm">Choose an email from the list to see AI-powered features</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
