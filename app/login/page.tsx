"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { isConfigValid, isGoogleProviderAvailable } from "@/lib/firebase"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, signInWithGoogle, user, loading: authLoading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [logoutSuccess, setLogoutSuccess] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(false)

  useEffect(() => {
    setGoogleAvailable(isGoogleProviderAvailable())
    const interval = setInterval(() => {
      if (isGoogleProviderAvailable()) {
        setGoogleAvailable(true)
        clearInterval(interval)
      }
    }, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isConfigValid) {
      setError(
        "Firebase is not properly configured. Please ensure all Firebase environment variables (NEXT_PUBLIC_FIREBASE_*) are set.",
      )
    }
  }, [])

  useEffect(() => {
    if (searchParams.get("logout") === "success") {
      setLogoutSuccess(true)
      const timer = setTimeout(() => {
        router.replace("/login", { scroll: false })
      }, 100)
      const hideTimer = setTimeout(() => {
        setLogoutSuccess(false)
      }, 5000)
      return () => {
        clearTimeout(timer)
        clearTimeout(hideTimer)
      }
    }
  }, [searchParams, router])

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, authLoading, router])

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isConfigValid) {
      setError("Cannot sign in: Firebase is not configured properly.")
      return
    }

    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      setError("Please enter both email and password.")
      setIsLoading(false)
      return
    }

    try {
      await signIn(email, password)
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Please try again.")
      } else if (err.code === "auth/no-auth-instance") {
        setError("Authentication service unavailable. Check Firebase configuration.")
      } else {
        setError(err.message || "Failed to sign in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isConfigValid) {
      setError("Cannot create account: Firebase is not configured properly.")
      return
    }

    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      setError("Please fill in all fields.")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      setIsLoading(false)
      return
    }

    try {
      await signUp(email, password, name)
    } catch (err: any) {
      console.error("[v0] Sign up error:", err)
      setError(err.message || "Sign up failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!isConfigValid) {
      setError("Cannot sign in: Firebase is not configured properly.")
      return
    }

    if (!googleAvailable) {
      setError("Google sign-in is currently unavailable. Please use email/password to sign in instead.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#050505" }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: "#050505" }}>
      <Link
        href="/"
        className="absolute top-6 left-6 text-sm flex items-center gap-2 z-50"
        style={{ color: "#FACC15" }}
      >
        <span>←</span> Back to Home
      </Link>

      {logoutSuccess && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 z-50"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.5)" }}
        >
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-500 font-medium text-sm">You have been successfully logged out.</span>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="desktop-auth w-full max-w-4xl" style={{ display: "none" }}>
        <div
          className={`auth-container relative rounded-xl overflow-hidden w-full min-h-[480px] transition-all duration-700 ${
            isSignUp ? "right-panel-active" : ""
          }`}
          style={{
            backgroundColor: "#0E0E0E",
            boxShadow: "0 14px 28px rgba(250,204,21,0.15), 0 10px 10px rgba(250,204,21,0.1)",
          }}
        >
          {/* Sign In Form - Desktop */}
          <div className="form-container sign-in-container absolute top-0 left-0 w-1/2 h-full transition-all duration-700 z-[2]">
            <form
              onSubmit={handleSignIn}
              className="flex flex-col items-center justify-center h-full px-12 text-center"
              style={{ backgroundColor: "#0B1020" }}
            >
              <h1 className="text-3xl font-bold mb-4 text-white">Sign in</h1>

              <div className="flex gap-3 mb-5">
                <button
                  type="button"
                  onClick={() =>
                    setError("Facebook sign-in will be available soon. Please use email/password for now.")
                  }
                  disabled={isLoading}
                  className="border rounded-full w-10 h-10 flex items-center justify-center text-white hover:text-yellow-400 transition-all duration-300"
                  style={{ borderColor: "#FACC15" }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="border rounded-full w-10 h-10 flex items-center justify-center text-white hover:text-yellow-400 transition-all duration-300"
                  style={{ borderColor: "#FACC15" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
              </div>

              <span className="text-xs text-[#ccc] mb-5">or use your account</span>

              {error && !isSignUp && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg w-full">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] border-none text-white placeholder:text-[#888] mb-3 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />

              <div className="relative w-full mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  className="w-full bg-[#1a1a1a] border-none text-white placeholder:text-[#888] mb-3 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Link href="/forgot-password" className="text-[#FACC15] text-sm mb-4 hover:brightness-110 transition-all">
                Forgot your password?
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full text-black font-bold text-sm uppercase tracking-wider px-8 py-3 hover:brightness-110 transition-all"
                style={{
                  backgroundColor: "#FACC15",
                  boxShadow: "rgba(250, 204, 21, 0.4) 0px 20px 10px -15px",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Sign Up Form - Desktop */}
          <div className="form-container sign-up-container absolute top-0 left-0 w-1/2 h-full opacity-0 z-[1] transition-all duration-700">
            <form
              onSubmit={handleSignUp}
              className="flex flex-col items-center justify-center h-full px-12 text-center"
              style={{ backgroundColor: "#0B1020" }}
            >
              <h1 className="text-3xl font-bold mb-4 text-white">Create Account</h1>

              <div className="flex gap-3 mb-5">
                <button
                  type="button"
                  onClick={() =>
                    setError("Facebook sign-in will be available soon. Please use email/password for now.")
                  }
                  disabled={isLoading}
                  className="border rounded-full w-10 h-10 flex items-center justify-center text-white hover:text-yellow-400 transition-all duration-300"
                  style={{ borderColor: "#FACC15" }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="border rounded-full w-10 h-10 flex items-center justify-center text-white hover:text-yellow-400 transition-all duration-300"
                  style={{ borderColor: "#FACC15" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
              </div>

              <span className="text-xs text-[#ccc] mb-5">or use your email for registration</span>

              {error && isSignUp && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg w-full">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] border-none text-white placeholder:text-[#888] mb-3 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] border-none text-white placeholder:text-[#888] mb-3 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              />

              <div className="relative w-full mb-5">
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  className="w-full bg-[#1a1a1a] border-none text-white placeholder:text-[#888] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-white"
                >
                  {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full text-black font-bold text-sm uppercase tracking-wider px-8 py-3 hover:brightness-110 transition-all"
                style={{
                  backgroundColor: "#FACC15",
                  boxShadow: "rgba(250, 204, 21, 0.4) 0px 20px 10px -15px",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>

          {/* Overlay Panel - Desktop */}
          <div className={`overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 z-[100] ${isSignUp ? "translate-x-[-100%]" : "translate-x-0"}`}>
            <div
              className={`overlay absolute left-[-100%] h-full w-[200%] transition-transform duration-700 ${isSignUp ? "translate-x-[50%]" : "translate-x-0"}`}
              style={{ backgroundColor: "#FACC15" }}
            >
              <div className={`overlay-panel overlay-left absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 transition-transform duration-700 ${isSignUp ? "translate-x-0" : "translate-x-[-20%]"}`}>
                <h1 className="text-4xl font-bold mb-3 text-black">Welcome Back!</h1>
                <p className="text-sm text-black/80 mb-8 leading-relaxed max-w-[280px]">
                  Keep connected with us please login with your personal info
                </p>
                <button
                  onClick={() => setIsSignUp(false)}
                  className="rounded-full border-2 border-black bg-transparent text-black font-bold text-xs uppercase tracking-wider px-11 py-3 hover:bg-black/10 transition-all"
                >
                  Sign In
                </button>
              </div>

              <div className={`overlay-panel overlay-right absolute right-0 flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 transition-transform duration-700 ${isSignUp ? "translate-x-[20%]" : "translate-x-0"}`}>
                <h1 className="text-4xl font-bold mb-3 text-black">Hello, Friend!</h1>
                <p className="text-sm text-black/80 mb-8 leading-relaxed max-w-[280px]">
                  Enter your personal details and start journey with us
                </p>
                <button
                  onClick={() => setIsSignUp(true)}
                  className="rounded-full border-2 border-black bg-transparent text-black font-bold text-xs uppercase tracking-wider px-11 py-3 hover:bg-black/10 transition-all"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Clean Rounded Card Style */}
      <div className="mobile-auth w-full max-w-[350px] mx-auto" style={{ display: "flex", flexDirection: "column" }}>
        <div
          className="rounded-[40px] p-8 border-4"
          style={{
            backgroundColor: "#0E0E0E",
            borderColor: "#1a1a1a",
            boxShadow: "rgba(250, 204, 21, 0.3) 0px 30px 30px -20px",
          }}
        >
          <h1 className="text-center font-black text-3xl mb-6" style={{ color: "#FACC15" }}>
            {isSignUp ? "Create Account" : "Sign In"}
          </h1>

          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                !isSignUp ? "bg-[#FACC15] text-black" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                isSignUp ? "bg-[#FACC15] text-black" : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form - Mobile */}
          {!isSignUp && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-2xl">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] border-2 border-transparent text-white placeholder:text-[#666] px-5 py-4 rounded-2xl focus:outline-none focus:border-[#FACC15] transition-all"
                style={{ boxShadow: "rgba(250, 204, 21, 0.1) 0px 10px 10px -5px" }}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  className="w-full bg-[#1a1a1a] border-2 border-transparent text-white placeholder:text-[#666] px-5 py-4 rounded-2xl focus:outline-none focus:border-[#FACC15] transition-all pr-12"
                  style={{ boxShadow: "rgba(250, 204, 21, 0.1) 0px 10px 10px -5px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-left pl-2">
                <Link href="/forgot-password" className="text-[#FACC15] text-xs hover:brightness-110 transition-all">
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold py-4 rounded-2xl text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: "#FACC15",
                  boxShadow: "rgba(250, 204, 21, 0.5) 0px 20px 10px -15px",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "SIGN IN"
                )}
              </button>

              {/* Social Login */}
              <div className="pt-4">
                <p className="text-center text-[#666] text-xs mb-4">or sign in with</p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setError("Facebook sign-in will be available soon. Please use email/password for now.")
                    }
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95"
                    style={{
                      borderColor: "#FACC15",
                      backgroundColor: "#1a1a1a",
                      boxShadow: "rgba(250, 204, 21, 0.3) 0px 12px 10px -8px",
                    }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95"
                    style={{
                      borderColor: "#FACC15",
                      backgroundColor: "#1a1a1a",
                      boxShadow: "rgba(250, 204, 21, 0.3) 0px 12px 10px -8px",
                    }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sign Up Form - Mobile */}
          {isSignUp && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-2xl">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] border-2 border-transparent text-white placeholder:text-[#666] px-5 py-4 rounded-2xl focus:outline-none focus:border-[#FACC15] transition-all"
                style={{ boxShadow: "rgba(250, 204, 21, 0.1) 0px 10px 10px -5px" }}
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] border-2 border-transparent text-white placeholder:text-[#666] px-5 py-4 rounded-2xl focus:outline-none focus:border-[#FACC15] transition-all"
                style={{ boxShadow: "rgba(250, 204, 21, 0.1) 0px 10px 10px -5px" }}
              />

              <div className="relative">
                <input
                  type={showSignUpPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  className="w-full bg-[#1a1a1a] border-2 border-transparent text-white placeholder:text-[#666] px-5 py-4 rounded-2xl focus:outline-none focus:border-[#FACC15] transition-all pr-12"
                  style={{ boxShadow: "rgba(250, 204, 21, 0.1) 0px 10px 10px -5px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                >
                  {showSignUpPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold py-4 rounded-2xl text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: "#FACC15",
                  boxShadow: "rgba(250, 204, 21, 0.5) 0px 20px 10px -15px",
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "SIGN UP"
                )}
              </button>

              {/* Social Login */}
              <div className="pt-4">
                <p className="text-center text-[#666] text-xs mb-4">or sign up with</p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setError("Facebook sign-in will be available soon. Please use email/password for now.")
                    }
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95"
                    style={{
                      borderColor: "#FACC15",
                      backgroundColor: "#1a1a1a",
                      boxShadow: "rgba(250, 204, 21, 0.3) 0px 12px 10px -8px",
                    }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95"
                    style={{
                      borderColor: "#FACC15",
                      backgroundColor: "#1a1a1a",
                      boxShadow: "rgba(250, 204, 21, 0.3) 0px 12px 10px -8px",
                    }}
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Desktop CSS Animations */}
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-auth {
            display: block !important;
          }
          .mobile-auth {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .desktop-auth {
            display: none !important;
          }
          .mobile-auth {
            display: flex !important;
          }
        }

        .auth-container.right-panel-active .sign-in-container {
          transform: translateX(100%);
        }

        .auth-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.6s;
        }

        @keyframes show {
          0%, 49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%, 100% {
            opacity: 1;
            z-index: 5;
          }
        }

      `}</style>
    </div>
  )
}
