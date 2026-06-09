"use client"

import type React from "react"

import { AnimatedBackground } from "@/components/animated-background"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { Send, ArrowLeft, Paperclip, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { db, storage, getFirestoreClient } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import type { MessageDocument } from "@/lib/firestore-types"

interface Message extends MessageDocument {
  id: string
}

export default function ChatPage() {
  const params = useParams()
  const orderId = params.id as string
  const { user } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const dbInstance = db || (await getFirestoreClient())
        if (!dbInstance) return
        const firestore = await import("firebase/firestore")
        const { doc, getDoc } = firestore
        const orderDoc = await getDoc(doc(dbInstance, "orders", orderId))
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() })
        }
      } catch (e) {
        console.error("Error fetching order in chat:", e)
      }
    }
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchMessages = async () => {
    if (!orderId) {
      setLoading(false)
      return
    }

    try {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) throw new Error("Firestore is not initialized")

      const firestore = await import("firebase/firestore")
      const { collection, query, where, getDocs } = firestore

      const messagesRef = collection(dbInstance, "messages")
      const q = query(messagesRef, where("orderId", "==", orderId))

      const snapshot = await getDocs(q)
      const messagesData: Message[] = []
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() } as Message)
      })

      // Sort in-memory to avoid requiring composite Firestore indexes
      messagesData.sort((a, b) => {
        const getMs = (val: any) => {
          if (!val) return 0
          if (val.toMillis) return val.toMillis()
          if (val.seconds) return val.seconds * 1000 + (val.nanoseconds || 0) / 1000000
          return new Date(val).getTime()
        }
        return getMs(a.createdAt) - getMs(b.createdAt)
      })

      setMessages(messagesData)
      setError(null)
      setTimeout(() => scrollToBottom(), 100)
    } catch (err: any) {
      console.error("[Chat] Error fetching messages:", err)
      if (err?.code === "failed-precondition") {
        setError("Database index is being created. Please wait a few minutes and refresh the page.")
      } else {
        setError("Failed to load messages. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [orderId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return

    const notifMsg = newMessage.trim()
    setSending(true)
    try {
      const firestore = await import("firebase/firestore")
      const { Timestamp, addDoc, collection, query, where, getDocs } = firestore

      const messageData: Omit<MessageDocument, "createdAt"> & { createdAt: typeof Timestamp } = {
        orderId,
        senderId: user.uid,
        senderName: user.displayName || "You",
        senderRole: user.role || "client",
        message: notifMsg,
        read: false,
        createdAt: Timestamp.now(),
      }
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) throw new Error("Firestore is not initialized")
      await addDoc(collection(dbInstance, "messages"), messageData)
      setNewMessage("")

      // Send notification to the other party
      try {
        if (user.role === "admin") {
          // Notify client
          const clientEmail = order?.email || order?.userEmail
          if (clientEmail) {
            const usersQuery = query(collection(dbInstance, "users"), where("email", "==", clientEmail))
            const usersSnapshot = await getDocs(usersQuery)
            if (!usersSnapshot.empty) {
              const clientUid = usersSnapshot.docs[0].id
              await addDoc(collection(dbInstance, "notifications"), {
                userId: clientUid,
                orderId,
                title: "New Message from Editor",
                message: notifMsg.substring(0, 100) + (notifMsg.length > 100 ? "..." : ""),
                read: false,
                createdAt: new Date().toISOString()
              })
            }
          }
        } else {
          // Notify admin
          const adminsQuery = query(collection(dbInstance, "users"), where("role", "==", "admin"))
          const adminsSnapshot = await getDocs(adminsQuery)
          adminsSnapshot.forEach(async (adminDoc) => {
            await addDoc(collection(dbInstance, "notifications"), {
              userId: adminDoc.id,
              orderId,
              title: "New Client Message",
              message: `${user.displayName || "Client"} sent a message: ${notifMsg.substring(0, 100) + (notifMsg.length > 100 ? "..." : "")}`,
              read: false,
              createdAt: new Date().toISOString()
            })
          })
        }
      } catch (notifErr) {
        console.error("Failed to create message notification:", notifErr)
      }

      await fetchMessages()
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const storageMod = await import("firebase/storage")
      const { ref, uploadBytesResumable, getDownloadURL } = storageMod

      const storageRef = ref(storage, `chat-files/${orderId}/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error("[v0] Upload error:", error)
          alert("Failed to upload file. Please try again.")
          setUploading(false)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          const firestore = await import("firebase/firestore")
          const { Timestamp, addDoc, collection, query, where, getDocs } = firestore

          const messageData: Omit<MessageDocument, "createdAt"> & { createdAt: typeof Timestamp } = {
            orderId,
            senderId: user.uid,
            senderName: user.displayName || "You",
            senderRole: user.role || "client",
            message: `Uploaded file: ${file.name}`,
            fileUrl: downloadURL,
            fileName: file.name,
            read: false,
            createdAt: Timestamp.now(),
          }
          const dbInstance = db || (await getFirestoreClient())
          if (!dbInstance) throw new Error("Firestore is not initialized")
          await addDoc(collection(dbInstance, "messages"), messageData)

          // Send notification for file upload
          try {
            if (user.role === "admin") {
              const clientEmail = order?.email || order?.userEmail
              if (clientEmail) {
                const usersQuery = query(collection(dbInstance, "users"), where("email", "==", clientEmail))
                const usersSnapshot = await getDocs(usersQuery)
                if (!usersSnapshot.empty) {
                  const clientUid = usersSnapshot.docs[0].id
                  await addDoc(collection(dbInstance, "notifications"), {
                    userId: clientUid,
                    orderId,
                    title: "File Uploaded by Editor",
                    message: `Uploaded file: ${file.name}`,
                    read: false,
                    createdAt: new Date().toISOString()
                  })
                }
              }
            } else {
              const adminsQuery = query(collection(dbInstance, "users"), where("role", "==", "admin"))
              const adminsSnapshot = await getDocs(adminsQuery)
              adminsSnapshot.forEach(async (adminDoc) => {
                await addDoc(collection(dbInstance, "notifications"), {
                  userId: adminDoc.id,
                  orderId,
                  title: "File Uploaded by Client",
                  message: `${user.displayName || "Client"} uploaded file: ${file.name}`,
                  read: false,
                  createdAt: new Date().toISOString()
                })
              })
            }
          } catch (notifErr) {
            console.error("Failed to create file upload notification:", notifErr)
          }

          setUploading(false)
          setUploadProgress(0)
          await fetchMessages()
        },
      )
    } catch (error) {
      console.error("[v0] Error uploading file:", error)
      alert("Failed to upload file. Please try again.")
      setUploading(false)
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    let date: Date
    if (timestamp.toDate) {
      date = timestamp.toDate()
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    } else {
      date = new Date(timestamp)
    }
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <ProtectedRoute>
      <AnimatedBackground />
      <DashboardNav userRole={user?.role || "client"} />

      <main className="min-h-screen pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href={user?.role === "admin" ? "/admin" : "/dashboard"} className="inline-flex items-center text-[#9CA3AF] hover:text-[#FFFFFF] mb-6">
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-[#FFFFFF]">Chat with Editor</h1>
              <p className="text-[#9CA3AF]">Order #{orderId}</p>
            </div>
            <Button
              onClick={fetchMessages}
              variant="outline"
              className="bg-transparent border-[#FACC15]/30 text-[#FACC15] hover:bg-[#FACC15]/10"
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>

          {error && (
            <Card
              className="rounded-2xl p-6 mb-6"
              style={{ backgroundColor: "#1a0505", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <p className="text-red-400">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                style={{ backgroundColor: "#FACC15", color: "#000" }}
              >
                Refresh Page
              </Button>
            </Card>
          )}

          <Card className="bg-[#0E0E0E] border-[#1a1a1a] flex flex-col h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[#9CA3AF]">
                  No messages yet. Start the conversation!
                </div>
              ) : (
              messages.map((message) => {
                const isCurrentUser = message.senderId === user?.uid
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        isCurrentUser ? "bg-[#FACC15] text-[#050505]" : "bg-[#1a1a1a] text-[#FFFFFF]"
                      } rounded-lg p-4`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-80">{message.senderName}</p>
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      {message.fileUrl && (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline mt-2 block"
                        >
                          Download: {message.fileName}
                        </a>
                      )}
                      <p className="text-xs opacity-70 mt-2">{formatTime(message.createdAt)}</p>
                    </div>
                  </div>
                )
              })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="px-6 py-2 border-t border-[#1a1a1a]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FACC15]" />
                  <div className="flex-1">
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FACC15] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[#9CA3AF]">{Math.round(uploadProgress)}%</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-[#1a1a1a] p-4">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.zip,.rar"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-3 hover:bg-[#1a1a1a] rounded-lg transition-colors disabled:opacity-50"
                >
                  <Paperclip size={20} className="text-[#9CA3AF]" />
                </button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !sending && handleSend()}
                  placeholder="Type your message..."
                  disabled={sending || uploading}
                  className="flex-1 bg-[#1a1a1a] border-[#1a1a1a] text-[#FFFFFF] placeholder:text-[#9CA3AF]"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending || uploading}
                  className="bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#050505]"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}
