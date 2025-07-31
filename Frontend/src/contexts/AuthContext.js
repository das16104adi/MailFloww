"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { getCurrentUser } from 'aws-amplify/auth'
import cognitoService from '../services/cognitoService'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for authenticated user on mount
  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      // Check localStorage for existing user session
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("token")

      if (storedUser && token) {
        setCurrentUser(JSON.parse(storedUser))
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      console.log('No authenticated user')
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }

  // AWS Cognito login with proper SECRET_HASH
  const login = async (email, password) => {
    try {
      const result = await cognitoService.signIn(email, password)

      // Store user info if login successful
      if (result.AuthenticationResult) {
        const user = {
          email: email,
          name: email.split("@")[0],
          accessToken: result.AuthenticationResult.AccessToken,
          idToken: result.AuthenticationResult.IdToken,
          refreshToken: result.AuthenticationResult.RefreshToken
        }
        setCurrentUser(user)
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("token", result.AuthenticationResult.AccessToken)
        return user
      }

      throw new Error('Login failed - no authentication result')
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed')
    }
  }

  // AWS Cognito signup with proper SECRET_HASH
  const signup = async (email, password, name, companyName, emailVolume) => {
    try {
      const attributes = {
        email: email,
        name: name || email.split("@")[0],
        'custom:company_name': companyName || 'Company',
        'custom:email_volume': emailVolume || 'Standard'
      }

      const signUpResult = await cognitoService.signUp(email, password, attributes)
      return signUpResult
    } catch (error) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'Signup failed')
    }
  }

  // Confirm signup with verification code and proper SECRET_HASH
  const confirmSignUpFunc = async (email, code) => {
    try {
      await cognitoService.confirmSignUp(email, code)
      return true
    } catch (error) {
      console.error('Confirmation error:', error)
      throw new Error(error.message || 'Confirmation failed')
    }
  }

  // Resend verification code with proper SECRET_HASH
  const resendVerificationCode = async (email) => {
    try {
      await cognitoService.resendConfirmationCode(email)
      return true
    } catch (error) {
      console.error('Resend error:', error)
      throw new Error(error.message || 'Failed to resend verification code')
    }
  }

  // Simple logout
  const logout = async () => {
    try {
      setCurrentUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      localStorage.removeItem("pendingSignup")
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = {
    currentUser,
    login,
    signup,
    confirmSignUp: confirmSignUpFunc,
    resendVerificationCode,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

