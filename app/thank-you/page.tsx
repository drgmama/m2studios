"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, ArrowRight, Home, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import confetti from "canvas-confetti"

export default function ThankYouPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Fire confetti on page load
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#FACC15", "#FDE047", "#FEF08A", "#ffffff"],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#FACC15", "#FDE047", "#FEF08A", "#ffffff"],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <Sparkles className="absolute top-0 right-1/3 w-6 h-6 text-primary animate-pulse" />
            <Sparkles className="absolute bottom-0 left-1/3 w-4 h-4 text-primary animate-pulse" />
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Thank You! <span className="text-primary">🎉</span>
          </h1>

          <p className="text-xl text-gray-300 mb-2">Your order has been submitted successfully.</p>

          <p className="text-gray-400 mb-8">
            We've received your project details and our team will review them shortly. You'll receive a confirmation
            email and quote within <span className="text-primary font-semibold">1 hour</span>.
          </p>

          {/* What's Next */}
          <div className="glass border border-border rounded-2xl p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              What happens next?
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Our team will review your project requirements</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>You'll receive a personalized quote via email/WhatsApp</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Once confirmed, we'll start working on your project</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <span>Regular updates and final delivery as per timeline</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold rounded-xl">
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button
                variant="outline"
                className="border-white hover:border-[#FACC15] hover:text-[#FACC15] px-8 py-6 text-lg font-semibold rounded-xl bg-transparent"
              >
                View Our Work
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <p className="mt-8 text-gray-500 text-sm">
            Have questions? Contact us at{" "}
            <a href="mailto:support@m2studio.in" className="text-primary hover:underline">
              support@m2studio.in
            </a>{" "}
            or{" "}
            <a
              href="https://wa.me/918122426212"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:underline"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
