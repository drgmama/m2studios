"use client"

import { AnimatedBackground } from "@/components/animated-background"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrderTimeline } from "@/components/order-timeline"
import { ReviewModal } from "@/components/review-modal"
import { useState, useEffect } from "react"
import { ArrowLeft, MessageSquare, Download, Loader2, Star } from "lucide-react"
import { OrderCountdown } from "@/components/order-countdown"
import Link from "next/link"
import { useParams } from "next/navigation"
import { db, getFirestoreClient } from "@/lib/firebase"
import type { OrderDocument } from "@/lib/firestore-types"

interface Order extends OrderDocument {
  id: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [hasReview, setHasReview] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const dbInstance = db || (await getFirestoreClient())
        if (!dbInstance) {
          setLoading(false)
          return
        }
        const firestore = await import("firebase/firestore")
        const { doc, getDoc, collection, query, where, getDocs } = firestore

        const orderDoc = await getDoc(doc(dbInstance, "orders", orderId))
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order)
          const reviewQuery = query(collection(dbInstance, "reviews"), where("orderId", "==", orderId))
          const reviewSnapshot = await getDocs(reviewQuery)
          setHasReview(!reviewSnapshot.empty)
        }
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching order:", error)
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

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
      <ProtectedRoute>
        <AnimatedBackground />
        <DashboardNav userRole="client" />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050505] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
        </main>
      </ProtectedRoute>
    )
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <AnimatedBackground />
        <DashboardNav userRole="client" />
        <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050505]">
          <div className="container mx-auto max-w-6xl">
            <p className="text-[#9CA3AF]">Order not found</p>
          </div>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AnimatedBackground />
      <DashboardNav userRole="client" />

      <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050505]">
        <div className="container mx-auto max-w-6xl">
          <Link href="/dashboard" className="inline-flex items-center text-[#9CA3AF] hover:text-[#FFFFFF] mb-6">
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
                    <p className="text-sm text-[#9CA3AF] mb-1">Deadline</p>
                    <p className="font-medium text-[#FFFFFF] flex flex-col sm:flex-row sm:items-center gap-2">
                      {order.deadline ? new Date(order.deadline).toLocaleDateString() : "Not specified"}
                      {order.status === "working" && order.deadline && (
                        <OrderCountdown deadline={order.deadline} />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">Budget</p>
                    <p className="font-semibold text-[#FACC15] text-lg">{order.price || order.budget || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">Order Date</p>
                    <p className="font-medium text-[#FFFFFF]">{ (order.createdAt || order.createdAtIso) ? new Date(order.createdAt || order.createdAtIso).toLocaleDateString() : "Not specified" }</p>
                  </div>
                  {order.deliveredAt && (
                    <div>
                      <p className="text-sm text-[#9CA3AF] mb-1">Delivered Date</p>
                      <p className="font-medium text-[#FFFFFF]">{new Date(order.deliveredAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-[#9CA3AF] mb-2">Project Description</p>
                  <p className="text-[#FFFFFF] leading-relaxed">{order.projectDescription || order.description || "No description provided."}</p>
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

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href={`/dashboard/orders/${orderId}/chat`} className="block">
                    <Button className="w-full bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#050505]">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Editor
                    </Button>
                  </Link>

                  {order.status === "delivered" && order.downloadUrls && order.downloadUrls.length > 0 && (
                    <Link href={`/dashboard/orders/${orderId}/download`} className="block">
                      <Button
                        variant="outline"
                        className="w-full border-[#1a1a1a] hover:border-[#FACC15] text-[#FFFFFF] bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Files
                      </Button>
                    </Link>
                  )}

                  {order.status === "delivered" && !hasReview && (
                    <Button
                      onClick={() => setShowReviewModal(true)}
                      variant="outline"
                      className="w-full border-[#FACC15] text-[#FACC15] hover:bg-[#FACC15] hover:text-[#050505] bg-transparent"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Leave a Review
                    </Button>
                  )}

                  {hasReview && (
                    <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-center">
                      <p className="text-sm text-green-400">Thank you for your review!</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Status Info */}
              <Card className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <h2 className="text-xl font-bold text-[#FFFFFF] mb-4">Status Information</h2>
                <div className="space-y-4">
                  {order.status === "pending" && (
                    <div className="p-4 bg-[#FACC15]/10 border border-[#FACC15]/50 rounded-lg">
                      <p className="text-sm text-[#FFFFFF]">
                        Your order is pending. Our team will start working on it soon!
                      </p>
                    </div>
                  )}

                  {order.status === "working" && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                      <p className="text-sm text-[#FFFFFF]">
                        Your project is currently being worked on. You can chat with our editor for updates.
                      </p>
                    </div>
                  )}

                  {order.status === "delivered" && (
                    <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                      <p className="text-sm text-[#FFFFFF]">
                        Your project has been delivered! Download your files from the button above.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {showReviewModal && (
        <ReviewModal
          orderId={orderId}
          serviceType={order.serviceType}
          onClose={() => setShowReviewModal(false)}
          onSubmit={() => setHasReview(true)}
        />
      )}
    </ProtectedRoute>
  )
}
