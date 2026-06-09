"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { db, getFirestoreClient } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { NotificationDocument } from "@/lib/firestore-types"

interface Notification extends NotificationDocument {
  id: string
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    let unsubscribe: any = null

    const start = async () => {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) return

      const firestore = await import("firebase/firestore")
      const { collection, query, where, onSnapshot } = firestore

      const q = query(
        collection(dbInstance, "notifications"),
        where("userId", "==", user.uid)
      )

      unsubscribe = onSnapshot(q, (snapshot: any) => {
        const notifs: Notification[] = []
        snapshot.forEach((doc: any) => {
          notifs.push({ id: doc.id, ...doc.data() } as Notification)
        })
        // Sort in-memory by date descending
        notifs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        // Limit to 10 in-memory
        const limitedNotifs = notifs.slice(0, 10)
        setNotifications(limitedNotifs)
        setUnreadCount(notifs.filter((n) => !n.read).length)
      })
    }

    start()

    return () => unsubscribe && unsubscribe()
  }, [user])

  const markAsRead = async (notificationId: string) => {
    try {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) return
      const firestore = await import("firebase/firestore")
      const { updateDoc, doc } = firestore

      await updateDoc(doc(dbInstance, "notifications", notificationId), {
        read: true,
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) return
      const firestore = await import("firebase/firestore")
      const { updateDoc, doc } = firestore

      const unreadNotifs = notifications.filter((n) => !n.read)
      await Promise.all(unreadNotifs.map((n) => updateDoc(doc(dbInstance, "notifications", n.id), { read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Bell size={20} style={{ color: "#FACC15" }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "#EF4444", color: "#FFFFFF" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <Card
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-50"
            style={{ background: "#0E0E0E", borderColor: "rgba(250, 204, 21, 0.2)" }}
          >
            <div className="p-4 border-b sticky top-0 bg-[#0E0E0E]" style={{ borderColor: "rgba(250, 204, 21, 0.2)" }}>
              <div className="flex justify-between items-center">
                <h3 className="font-bold" style={{ color: "#FACC15" }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={markAllAsRead} style={{ color: "#9CA3AF" }}>
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            <div className="divide-y" style={{ borderColor: "rgba(250, 204, 21, 0.1)" }}>
              {notifications.length === 0 ? (
                <div className="p-4 text-center" style={{ color: "#9CA3AF" }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => {
                      markAsRead(notif.id)
                      if (notif.orderId) {
                        window.location.href = `/dashboard/orders/${notif.orderId}`
                      }
                      setShowDropdown(false)
                    }}
                    style={{ background: notif.read ? "transparent" : "rgba(250, 204, 21, 0.05)" }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>
                        {notif.title}
                      </h4>
                      {!notif.read && <span className="w-2 h-2 rounded-full" style={{ background: "#FACC15" }} />}
                    </div>
                    <p className="text-sm" style={{ color: "#9CA3AF" }}>
                      {notif.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                      {getRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
