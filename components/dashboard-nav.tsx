"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, User, Bell } from "lucide-react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db, getFirestoreClient } from "@/lib/firebase"

interface DashboardNavProps {
  userRole: "client" | "admin"
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { signOut, user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (!user?.uid) return

    let unsubscribe: any = null

    const listenNotifications = async () => {
      try {
        const dbInstance = db || (await getFirestoreClient())
        if (!dbInstance) return

        const firestore = await import("firebase/firestore")
        const { collection, query, where, onSnapshot } = firestore

        const q = query(
          collection(dbInstance, "notifications"),
          where("userId", "==", user.uid)
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
          const notifs: any[] = []
          snapshot.forEach((doc) => {
            notifs.push({ id: doc.id, ...doc.data() })
          })
          // Sort in-memory to prevent missing index errors
          notifs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          setNotifications(notifs)
        }, (err) => {
          console.warn("[Notifications] Listener warning:", err)
        })
      } catch (err) {
        console.error("[Notifications] Listener error:", err)
      }
    }

    listenNotifications()
    return () => unsubscribe && unsubscribe()
  }, [user?.uid])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) return
      const firestore = await import("firebase/firestore")
      const { doc, updateDoc } = firestore
      await updateDoc(doc(dbInstance, "notifications", id), { read: true })
    } catch (e) {
      console.error(e)
    }
  }

  const markAllAsRead = async () => {
    try {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) return
      const firestore = await import("firebase/firestore")
      const { doc, updateDoc } = firestore

      const unreadNotifs = notifications.filter((n) => !n.read)
      for (const notif of unreadNotifs) {
        await updateDoc(doc(dbInstance, "notifications", notif.id), { read: true })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleNavClick = () => {
    setIsOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const navLinks =
    userRole === "admin"
      ? [
          { href: "/", label: "Home" },
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/orders", label: "All Orders" },
        ]
      : [
          { href: "/", label: "Home" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/free-files", label: "Free Files" },
          { href: "/order", label: "New Order" },
        ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom: "1px solid rgba(250,204,21,0.2)" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" onClick={handleNavClick}>
            <Image
              src="/logo-transparent.png"
              alt="M2 Studio"
              width={280}
              height={140}
              className="h-16 w-auto"
              priority
            />
            <span
              className="text-2xl font-bold uppercase"
              style={{ textShadow: "0 0 12px rgba(250, 204, 21, 0.35), 0 0 20px rgba(250, 204, 21, 0.2)" }}
            >
              <span style={{ color: "#FACC15" }}>M2</span> <span style={{ color: "#FFFFFF" }}>STUDIO</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className={`nav-link text-sm xl:text-base font-medium transition-all duration-300 ${
                  pathname === link.href ? "text-[#FACC15]" : "text-white hover:text-[#FACC15]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Live Notifications Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white hover:text-[#FACC15] transition-all duration-300 rounded-full hover:bg-white/5"
                aria-label="Toggle notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-3 w-80 bg-[#0E0E0E] border border-gray-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ border: "1px solid rgba(250,204,21,0.25)" }}
                >
                  <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                    <span className="font-bold text-white text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-[#FACC15] hover:underline bg-transparent border-none cursor-pointer">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-gray-900/50 transition-all ${
                            !notif.read ? "bg-[#FACC15]/5" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-semibold text-xs ${notif.read ? "text-white" : "text-[#FACC15]"}`}>
                              {notif.title}
                            </span>
                            {!notif.read && <span className="w-1.5 h-1.5 bg-[#FACC15] rounded-full mt-1.5 flex-shrink-0" />}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-normal">{notif.message}</p>
                          <span className="text-[9px] text-gray-600 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/dashboard/profile">
              <button className="px-4 py-2 text-[#FACC15] font-medium border border-[#FACC15] rounded-full transition-all duration-300 hover:bg-[#FACC15] hover:text-black hover:shadow-[0_0_10px_rgba(250,204,21,0.3)] active:shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                <User size={18} className="inline mr-2" />
                Profile
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-white font-medium border-2 border-white rounded-full transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] active:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            >
              <LogOut size={18} className="inline mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4" style={{ borderTop: "1px solid rgba(250,204,21,0.2)" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link block text-lg font-medium transition-all duration-300 ${
                  pathname === link.href ? "text-[#FACC15]" : "text-white hover:text-[#FACC15]"
                }`}
                onClick={handleNavClick}
              >
                {link.label}
              </Link>
            ))}
            {unreadCount > 0 && (
              <div className="p-3 bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-xl text-center text-xs text-[#FACC15] font-semibold animate-pulse">
                🔔 You have {unreadCount} unread notification(s)!
              </div>
            )}
            <Link href="/dashboard/profile" onClick={handleNavClick}>
              <button className="w-full px-4 py-2 text-[#FACC15] font-medium border border-[#FACC15] rounded-full transition-all duration-300 hover:bg-[#FACC15] hover:text-black">
                <User size={18} className="inline mr-2" />
                Profile
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-white font-medium border-2 border-white rounded-full transition-all duration-300 hover:bg-white/10"
            >
              <LogOut size={18} className="inline mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
