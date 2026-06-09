"use client"

import type React from "react"

import { AnimatedBackground } from "@/components/animated-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import Link from "next/link"
import { Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      const { getAuthClient } = await import("@/lib/firebase")
      const authClient = await getAuthClient()
      if (!authClient) throw new Error("Authentication service is unavailable. Please try again later.")
      const { sendPasswordResetEmail } = await import("firebase/auth")
      await sendPasswordResetEmail(authClient, email)
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatedBackground />

      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex justify-center mb-8">
            <div className="text-3xl font-bold">
              <span className="text-primary text-glow-blue">M2</span>
              <span className="text-foreground"> Studio</span>
            </div>
          </Link>

          <Card className="glass border-border p-8">
            {!isSuccess ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2 text-foreground">Forgot Password?</h1>
                  <p className="text-muted-foreground">
                    No worries! Enter your email and we'll send you reset instructions
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="bg-muted/50 border-border text-foreground"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-blue py-6"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                    <ArrowLeft size={16} />
                    Back to Sign In
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6 glow-blue" />
                <h2 className="text-3xl font-bold mb-4 text-foreground">Check Your Email</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We've sent password reset instructions to your email address. Please check your inbox and follow the
                  link to reset your password.
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button onClick={() => setIsSuccess(false)} className="text-primary hover:underline">
                    try again
                  </button>
                </p>
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Back to Sign In</Button>
                </Link>
              </div>
            )}
          </Card>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
