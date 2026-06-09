"use client"

import { useEffect, useState } from "react"

export function CursorTrail() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Disable on touch/mobile devices
    if (typeof window === "undefined") return
    const isTouch = window.matchMedia("(pointer: coarse)").matches
    if (isTouch) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let animationFrameId: number

    const updateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x
        const dy = position.y - prev.y
        // Linear interpolation for smooth trailing lag (15% approach per frame)
        const speed = 0.15
        return {
          x: prev.x + dx * speed,
          y: prev.y + dy * speed,
        }
      })
      animationFrameId = requestAnimationFrame(updateTrail)
    }

    animationFrameId = requestAnimationFrame(updateTrail)

    return () => cancelAnimationFrame(animationFrameId)
  }, [position, isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* Inner Dot */}
      <div
        className="pointer-events-none fixed z-[99999] w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen bg-[#FACC15] pointer-events-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      {/* Outer Lagging Glow Ring */}
      <div
        className="pointer-events-none fixed z-[99998] w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FACC15]/40 bg-[#FACC15]/5 mix-blend-screen shadow-[0_0_15px_rgba(250,204,21,0.2)] pointer-events-none transition-transform duration-100 ease-out"
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
        }}
      />
    </>
  )
}
