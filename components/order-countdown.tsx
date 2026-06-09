"use client"

import { useEffect, useState } from "react"

interface OrderCountdownProps {
  deadline: string
}

export function OrderCountdown({ deadline }: OrderCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(deadline) - +new Date()
      if (difference <= 0) return null

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      const left = calculateTimeLeft()
      setTimeLeft(left)
      if (!left) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  if (!timeLeft) {
    return <span className="text-xs text-red-400 font-semibold">Deadline passed</span>
  }

  return (
    <span className="font-mono text-xs text-[#FACC15] bg-[#FACC15]/10 px-2 py-1 rounded-md border border-[#FACC15]/20 animate-pulse inline-flex items-center gap-1">
      ⏳ {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s left
    </span>
  )
}
