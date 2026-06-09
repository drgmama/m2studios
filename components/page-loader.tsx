"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageLoader() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(30)

    const timer1 = setTimeout(() => {
      setProgress(70)
    }, 100)

    const timer2 = setTimeout(() => {
      setProgress(100)
    }, 300)

    const timer3 = setTimeout(() => {
      setVisible(false)
    }, 700)

    const timer4 = setTimeout(() => {
      setProgress(0)
    }, 1000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none">
      <div
        className="h-full bg-[#FACC15] shadow-[0_0_8px_rgba(250,204,21,0.6)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
