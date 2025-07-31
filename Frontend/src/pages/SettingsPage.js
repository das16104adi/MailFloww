"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { User, Lock, Bell, Palette, Save } from "lucide-react"

function SettingsPage() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [name, setName] = useState(currentUser?.name || "")
  const [email, setEmail] = useState(currentUser?.email || "")
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    weeklyDigest: false,
    marketingEmails: false,
  })
  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("en")
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)

    // Simulate saving settings
    setTimeout(() => {
      setSaving(false)
      alert("Settings saved successfully!")
    }, 1000)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xl font-semibold">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <button className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Change
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>
        )

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Account Management</h3>
              <div className="space-y-4">
                <button className="text-red-600 hover:text-red-800 font-medium">Deactivate Account</button>
              </div>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="email-notifications"
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email-notifications" className="font-medium text-gray-700">
                      Email Notifications
                    </label>
                    <p className="text-gray-500">Receive email notifications for new messages and updates.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="desktop-notifications"
                      type="checkbox"
                      checked={notifications.desktopNotifications}
                      onChange={(e) => setNotifications({ ...notifications, desktopNotifications: e.target.checked })}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="desktop-notifications" className="font-medium text-gray-700">
                      Desktop Notifications
                    </label>
                    <p className="text-gray-500">Receive desktop notifications when you're online.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="weekly-digest"
                      type="checkbox"
                      checked={notifications.weeklyDigest}
                      onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="weekly-digest" className="font-medium text-gray-700">
                      Weekly Digest
                    </label>
                    <p className="text-gray-500">Receive a weekly summary of your activity.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="marketing-emails"
                      type="checkbox"
                      checked={notifications.marketingEmails}
                      onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="marketing-emails" className="font-medium text-gray-700">
                      Marketing Emails
                    </label>
                    <p className="text-gray-500">Receive emails about new features and special offers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`border rounded-md p-4 cursor-pointer ${theme === "light" ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
                  onClick={() => setTheme("light")}
                >
                  <div className="h-20 bg-white border border-gray-200 rounded-md mb-2"></div>
                  <div className="text-center font-medium">Light</div>
                </div>

                <div
                  className={`border rounded-md p-4 cursor-pointer ${theme === "dark" ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="h-20 bg-gray-800 border border-gray-700 rounded-md mb-2"></div>
                  <div className="text-center font-medium">Dark</div>
                </div>

                <div
                  className={`border rounded-md p-4 cursor-pointer ${theme === "system" ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
                  onClick={() => setTheme("system")}
                >
                  <div className="h-20 bg-gradient-to-r from-white to-gray-800 border border-gray-200 rounded-md mb-2"></div>
                  <div className="text-center font-medium">System</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Language</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Settings</h3>
            <p className="mt-1 text-sm text-gray-600">Manage your account settings and preferences.</p>

            <div className="mt-6 space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "profile" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <User size={18} className="mr-2" />
                Profile
              </button>

              <button
                onClick={() => setActiveTab("account")}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "account" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Lock size={18} className="mr-2" />
                Account
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "notifications" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Bell size={18} className="mr-2" />
                Notifications
              </button>

              <button
                onClick={() => setActiveTab("appearance")}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === "appearance" ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Palette size={18} className="mr-2" />
                Appearance
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">{renderTabContent()}</div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

