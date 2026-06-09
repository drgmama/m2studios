"use client"

import type React from "react"

import { AnimatedBackground } from "@/components/animated-background"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { OrderTimeline } from "@/components/order-timeline"
import { useState, useEffect } from "react"
import { ArrowLeft, Upload, FileVideo, X, Send, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { db, storage, getFirestoreClient } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import type { OrderDocument, MessageDocument, StatusHistoryEntry } from "@/lib/firestore-types"

interface Order extends OrderDocument {
  id: string
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const { user } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [orderStatus, setOrderStatus] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const dbInstance = db || (await getFirestoreClient())
        if (!dbInstance) {
          setLoading(false)
          return
        }
        const firestore = await import("firebase/firestore")
        const { doc, getDoc } = firestore

        const orderDoc = await getDoc(doc(dbInstance, "orders", orderId))
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order
          setOrder(orderData)
          setOrderStatus(orderData.status)
        }
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching order:", error)
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadFiles = async () => {
    if (!order) return

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      const storageMod = await import("firebase/storage")
      const { ref, uploadBytesResumable, getDownloadURL } = storageMod

      for (const file of files) {
        const storageRef = ref(storage, `delivered-files/${orderId}/${Date.now()}_${file.name}`)
        const uploadTask = uploadBytesResumable(storageRef, file)

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setUploadProgress(progress)
            },
            (error) => {
              console.error("[v0] Upload error:", error)
              reject(error)
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              uploadedUrls.push(downloadURL)
              resolve()
            },
          )
        })
      }

      // Update order with delivered files
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) throw new Error("Firestore is not initialized")
      const firestore = await import("firebase/firestore")
      const { doc, updateDoc, arrayUnion, collection, query, where, getDocs, addDoc } = firestore

      const orderRef = doc(dbInstance, "orders", orderId)
      await updateDoc(orderRef, {
        downloadUrls: [...(order.downloadUrls || []), ...uploadedUrls],
        updatedAt: new Date().toISOString(),
      })

      // Create notification for the client
      try {
        const clientEmail = order?.email || order?.userEmail
        if (clientEmail) {
          const usersQuery = query(collection(dbInstance, "users"), where("email", "==", clientEmail))
          const usersSnapshot = await getDocs(usersQuery)
          if (!usersSnapshot.empty) {
            const clientUid = usersSnapshot.docs[0].id
            await addDoc(collection(dbInstance, "notifications"), {
              userId: clientUid,
              orderId,
              title: "New Delivery Available",
              message: "Your editor has uploaded new completed files to your order.",
              read: false,
              createdAt: new Date().toISOString()
            })
          }
        }
      } catch (notifErr) {
        console.error("Failed to create file delivery notification:", notifErr)
      }

      setIsUploading(false)
      setUploadSuccess(true)
      setFiles([])
      setUploadProgress(0)

      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      console.error("[v0] Error uploading files:", error)
      alert("Failed to upload files. Please try again.")
      setIsUploading(false)
    }
  }

  const handleStatusUpdate = async () => {
    setStatusUpdating(true)
    try {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) throw new Error("Firestore is not initialized")
      const firestore = await import("firebase/firestore")
      const { doc, updateDoc, arrayUnion, collection, query, where, getDocs, addDoc } = firestore

      const orderRef = doc(dbInstance, "orders", orderId)

      const statusEntry: StatusHistoryEntry = {
        status: orderStatus as any,
        timestamp: new Date().toISOString(),
        updatedBy: user?.uid,
        updatedByName: user?.displayName || "Admin",
      }

      const updateData: any = {
        status: orderStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: arrayUnion(statusEntry),
      }

      if (orderStatus === "delivered") {
        updateData.deliveredAt = new Date().toISOString()
      }

      await updateDoc(orderRef, updateData)

      // Create notification for the client
      try {
        const clientEmail = order?.email || order?.userEmail
        if (clientEmail) {
          const usersQuery = query(collection(dbInstance, "users"), where("email", "==", clientEmail))
          const usersSnapshot = await getDocs(usersQuery)
          if (!usersSnapshot.empty) {
            const clientUid = usersSnapshot.docs[0].id
            await addDoc(collection(dbInstance, "notifications"), {
              userId: clientUid,
              orderId,
              title: "Order Status Update",
              message: `Your order status has been updated to ${orderStatus}.`,
              read: false,
              createdAt: new Date().toISOString()
            })
          }
        }
      } catch (notifErr) {
        console.error("Failed to create status update notification:", notifErr)
      }

      if (order) {
        setOrder({
          ...order,
          ...updateData,
          statusHistory: [...(order.statusHistory || []), statusEntry],
        })
      }

      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: order.email || order.userEmail,
            subject: `Order Status Update - ${orderStatus.toUpperCase()}`,
            type: orderStatus === "delivered" ? "delivery" : "status-update",
            data: {
              orderId: orderId.substring(0, 8),
              userName: order.userName,
              serviceType: order.serviceType,
              status: orderStatus,
              message:
                orderStatus === "delivered" ? "Your project has been completed! Download your files now." : undefined,
            },
          }),
        })
      } catch (emailError) {
        console.error("[v0] Error sending email:", emailError)
      }

      alert("Status updated successfully!")
    } catch (error) {
      console.error("[v0] Error updating status:", error)
      alert("Failed to update status. Please try again.")
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !order) return

    try {
      const firestore = await import("firebase/firestore")
      const { addDoc, collection, Timestamp } = firestore

      const messageData: Omit<MessageDocument, "createdAt"> & { createdAt: typeof Timestamp } = {
        orderId,
        senderId: user.uid,
        senderName: user.displayName || "Admin",
        senderRole: "admin",
        message: message.trim(),
        read: false,
        createdAt: Timestamp.now(),
      }
      const dbInstance2 = db || (await getFirestoreClient())
      if (!dbInstance2) throw new Error("Firestore is not initialized")
      await addDoc(collection(dbInstance2, "messages"), messageData)
      setMessage("")
      alert("Message sent successfully!")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Delivered</Badge>
      case "working":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Working</Badge>
      case "pending":
        return <Badge className="bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/50">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <>
        <AnimatedBackground />
        <DashboardNav userRole="admin" />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050505] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
        </main>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <AnimatedBackground />
        <DashboardNav userRole="admin" />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050505]">
          <div className="container mx-auto max-w-7xl">
            <p className="text-[#9CA3AF]">Order not found</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AnimatedBackground />
      <DashboardNav userRole="admin" />

      <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050505]">
        <div className="container mx-auto max-w-7xl">
          <Link href="/admin" className="inline-flex items-center text-[#9CA3AF] hover:text-[#FFFFFF] mb-6">
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <Card className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2">{order.serviceType}</h1>
                    <p className="text-[#9CA3AF]">Order ID: {order.id.substring(0, 8)}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">Client Name</p>
                    <p className="font-medium text-[#FFFFFF]">{order.fullName || order.userName || "Guest"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">Email</p>
                    <p className="font-medium text-[#FFFFFF]">{order.email || order.userEmail || "No Email"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">WhatsApp</p>
                    <p className="font-medium text-[#FFFFFF]">{order.whatsapp || order.userWhatsapp || "No WhatsApp"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">Deadline</p>
                    <p className="font-medium text-[#FFFFFF]">{order.deadline ? new Date(order.deadline).toLocaleDateString() : "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">Budget</p>
                    <p className="font-semibold text-[#FACC15] text-lg">{order.price || order.budget || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">Created</p>
                    <p className="font-medium text-[#FFFFFF]">{ (order.createdAt || order.createdAtIso) ? new Date(order.createdAt || order.createdAtIso).toLocaleDateString() : "Not specified" }</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#9CA3AF] mb-2">Project Description</p>
                  <p className="text-[#FFFFFF] leading-relaxed">{order.projectDescription || order.description || "No description provided."}</p>
                </div>
              </Card>

              {/* Upload Files */}
              <Card className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Upload Delivered Files</h2>

                <div className="mb-4">
                  <input
                    type="file"
                    id="admin-file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="video/*,image/*,.zip,.rar"
                  />
                  <label
                    htmlFor="admin-file-upload"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#1a1a1a] rounded-lg cursor-pointer hover:border-[#FACC15] transition-colors bg-[#1a1a1a]/30"
                  >
                    <Upload className="w-12 h-12 text-[#FACC15] mb-3" />
                    <p className="text-sm font-semibold text-[#FFFFFF] mb-1">Click to upload files</p>
                    <p className="text-xs text-[#9CA3AF]">or drag and drop</p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileVideo className="w-4 h-4 text-[#FACC15] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#FFFFFF] truncate">{file.name}</p>
                            <p className="text-xs text-[#9CA3AF]">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-[#9CA3AF] hover:text-red-400 transition-colors ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isUploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#9CA3AF]">Uploading...</span>
                      <span className="text-sm text-[#FACC15]">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FACC15] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg mb-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-green-400">Files uploaded successfully!</p>
                  </div>
                )}

                <Button
                  onClick={handleUploadFiles}
                  disabled={files.length === 0 || isUploading}
                  className="w-full bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#050505]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Files
                    </>
                  )}
                </Button>
              </Card>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Status Update */}
              <Card className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Update Status</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#FFFFFF]">Order Status</Label>
                    <Select value={orderStatus} onValueChange={setOrderStatus}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#1a1a1a] text-[#FFFFFF]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleStatusUpdate}
                    disabled={statusUpdating}
                    className="w-full bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#050505]"
                  >
                    {statusUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Status"
                    )}
                  </Button>
                </div>
              </Card>

              {/* Quick Message */}
              <Card className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Send Message</h2>

                <div className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message to the client..."
                    rows={4}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg text-[#FFFFFF] placeholder:text-[#9CA3AF] resize-none"
                  />

                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="w-full bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#050505]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </Card>

              {/* Client Actions */}
              <Card className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Quick Actions</h2>

                <div className="space-y-2">
                  <Link href={`/dashboard/orders/${orderId}/chat`} className="block">
                    <Button
                      variant="outline"
                      className="w-full border-[#1a1a1a] hover:border-[#FACC15] justify-start bg-transparent text-[#FFFFFF]"
                    >
                      View Full Chat
                    </Button>
                  </Link>
                  {order.fileUrls && order.fileUrls.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(order.fileUrls![0], "_blank")}
                      className="w-full border-[#1a1a1a] hover:border-[#FACC15] justify-start bg-transparent text-[#FFFFFF]"
                    >
                      View Uploaded Files
                    </Button>
                  )}
                </div>
              </Card>

              {/* Order Timeline */}
              <Card className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <h2 className="text-xl font-bold text-[#FFFFFF] mb-6">Order Timeline</h2>
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  <OrderTimeline statusHistory={order.statusHistory} currentStatus={order.status} />
                ) : (
                  <div className="text-center py-8 text-[#9CA3AF]">No timeline available</div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
