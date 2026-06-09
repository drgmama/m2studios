"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const hiddenRoutes = ["/dashboard", "/admin", "/login", "/signup", "/forgot-password"]
  const shouldHide = hiddenRoutes.some((route) => pathname.startsWith(route))

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleNavClick = () => {
    setIsOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/about", label: "About Us" },
    { href: "/join", label: "Join Us" },
    { href: "/order", label: "Order" },
  ]

  if (shouldHide) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 sm:gap-3" onClick={handleNavClick}>
            <Image
              src="/logo-transparent.png"
              alt="M2 Studio"
              width={280}
              height={140}
              className="h-12 sm:h-16 w-auto"
              priority
            />
            <span
              className="text-lg sm:text-2xl font-bold uppercase inline"
              style={{ textShadow: "0 0 12px rgba(250, 204, 21, 0.35), 0 0 20px rgba(250, 204, 21, 0.2)" }}
            >
              <span style={{ color: "#FACC15" }}>M2</span> <span style={{ color: "#FFFFFF" }}>STUDIO</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  className={`relative py-1 text-sm xl:text-base font-medium transition-all duration-300 ${
                    isActive ? "text-[#FACC15]" : "text-white hover:text-[#FACC15]"
                  } group`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#FACC15] transition-transform duration-300 origin-left ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              )
            })}
            {!loading &&
              (user ? (
                <Link href="/dashboard">
                  <button className="px-4 xl:px-6 py-2 bg-[#FACC15] text-black font-medium rounded-full transition-all duration-300 hover:bg-[#F59E0B] hover:shadow-[0_0_10px_rgba(250,204,21,0.3)] active:shadow-[0_0_15px_rgba(250,204,21,0.4)] text-sm xl:text-base">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="px-4 xl:px-6 py-2 bg-[#FACC15] text-black font-medium rounded-full transition-all duration-300 hover:bg-[#F59E0B] hover:shadow-[0_0_10px_rgba(250,204,21,0.3)] active:shadow-[0_0_15px_rgba(250,204,21,0.4)] text-sm xl:text-base">
                    Login
                  </button>
                </Link>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-foreground p-2 -mr-2 touch-manipulation"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <div
          className={`lg:hidden fixed inset-0 top-16 bg-[#050505]/98 backdrop-blur-lg transition-all duration-300 ${
            isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full px-6 py-8">
            <div className="space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link block text-xl font-medium py-4 border-b border-gray-800 transition-all duration-300 ${
                    pathname === link.href ? "text-yellow-400" : "text-white"
                  }`}
                  onClick={handleNavClick}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isOpen ? "slideIn 0.3s ease forwards" : "none",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile CTA Button */}
            <div className="mt-8">
              {!loading &&
                (user ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block">
                    <button className="w-full px-6 py-4 bg-[#FACC15] text-black font-semibold rounded-xl text-lg transition-all duration-300 hover:bg-[#F59E0B]">
                      Go to Dashboard
                    </button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                    <button className="w-full px-6 py-4 bg-[#FACC15] text-black font-semibold rounded-xl text-lg transition-all duration-300 hover:bg-[#F59E0B]">
                      Login / Sign Up
                    </button>
                  </Link>
                ))}
            </div>

            {/* Mobile Footer Info */}
            <div className="mt-auto pb-8 text-center">
              <p className="text-gray-500 text-sm">Professional Video Editing Studio</p>
              <p className="text-yellow-400 text-sm mt-1">support@m2studio.in</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
