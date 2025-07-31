"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { Mail, Lock, User, AlertCircle, Building } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

function SignUpPage() {
  const [companyName, setCompanyName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [emailVolume, setEmailVolume] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const { signup, confirmSignUp, resendVerificationCode } = useAuth()
  const navigate = useNavigate()

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form inputs
    if (!companyName.trim()) {
      return setError("Company name is required");
    }

    if (!contactName.trim()) {
      return setError("Contact name is required");
    }

    if (!email.trim()) {
      return setError("Email is required");
    }

    if (!emailVolume) {
      return setError("Please select your daily email volume");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters long");
    }

    // Enhanced password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      await signup(email, password, contactName, companyName, emailVolume);
      setSuccess("Account created! Please check your email for verification code.");
      setShowVerification(true);
    } catch (error) {
      console.error("Signup failed:", error);

      // Handle specific error types
      let errorMessage = "Failed to create an account. Please try again.";

      if (error.name === 'UsernameExistsException') {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage = "Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.";
      } else if (error.name === 'InvalidParameterException') {
        errorMessage = "Please check your email format and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      await confirmSignUp(email, verificationCode);
      setSuccess("Email verified successfully! Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Verification failed:", error);
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setError("");
      setResendLoading(true);

      await resendVerificationCode(email);
      setSuccess("New verification code sent! Please check your email.");
    } catch (error) {
      console.error("Resend failed:", error);
      setError(error.message || "Failed to resend verification code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Start Your Enterprise Trial</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Get started with MailFloww's autonomous email solution for your company
            </p>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✨ 14-day free trial • No credit card required
              </div>
            </div>
            <p className="mt-1 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                Company Login
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {showVerification ? (
            <div>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit verification code to <strong>{email}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please check your email and enter the code below
                </p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleVerification}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="verification-code" className="sr-only">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="verification-code"
                      name="verificationCode"
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      placeholder="Enter verification code from email"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-sm text-purple-600 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Sending..." : "Didn't receive the code? Resend"}
                </button>
              </div>
            </form>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="company-name" className="sr-only">
                  Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="company-name"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    disabled={loading}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-name" className="sr-only">
                  Contact Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="contact-name"
                    name="contactName"
                    type="text"
                    autoComplete="name"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-address" className="sr-only">
                  Business Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Business Email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email-volume" className="sr-only">
                  Daily Email Volume
                </label>
                <select
                  id="email-volume"
                  name="emailVolume"
                  required
                  value={emailVolume}
                  onChange={(e) => setEmailVolume(e.target.value)}
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  <option value="">Select Daily Email Volume</option>
                  <option value="50-100">50-100 emails/day</option>
                  <option value="100-500">100-500 emails/day</option>
                  <option value="500-1000">500-1000 emails/day</option>
                  <option value="1000-5000">1000-5000 emails/day</option>
                  <option value="5000+">5000+ emails/day</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Starting trial..." : "Start Enterprise Trial"}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignUpPage

