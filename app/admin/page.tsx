"use client"

import { AnimatedBackground } from "@/components/animated-background"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Clock, CheckCircle, DollarSign, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { db, getFirestoreClient } from "@/lib/firebase"
import type { OrderDocument } from "@/lib/firestore-types"

interface Order extends OrderDocument {
  id: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    let unsubscribe: any = null

    const start = async () => {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) {
        setLoading(false)
        return
      }

      const firestore = await import("firebase/firestore")
      const { collection, query, onSnapshot } = firestore

      const ordersRef = collection(dbInstance, "orders")
      const q = query(ordersRef)

      unsubscribe = onSnapshot(
        q,
        (snapshot: any) => {
          const ordersData: Order[] = []
          snapshot.forEach((doc: any) => {
            ordersData.push({ id: doc.id, ...doc.data() } as Order)
          })
          
          // Sort in-memory descending by date to support both createdAtIso and createdAt schemas
          ordersData.sort((a, b) => {
            const dateA = new Date(a.createdAtIso || a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAtIso || b.createdAt || 0).getTime()
            return dateB - dateA
          })

          setOrders(ordersData)
          setLoading(false)
        },
        (error: any) => {
          console.error("[v0] Error fetching orders:", error)
          setLoading(false)
        },
      )
    }

    start()

    return () => unsubscribe && unsubscribe()
  }, [])

  const filteredOrders = selectedStatus === "all" ? orders : orders.filter((order) => order.status === selectedStatus)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Delivered</Badge>
      case "working":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Working</Badge>
      case "pending":
        return <Badge className="bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/50">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const stats = [
    { label: "Total Orders", value: orders.length, icon: Package, color: "text-[#FACC15]" },
    {
      label: "In Progress",
      value: orders.filter((o) => o.status === "working").length,
      icon: Clock,
      color: "text-blue-400",
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      label: "Revenue",
      value: `$${orders.reduce((sum, o) => {
        const p = o.price || o.budget || "0"
        const cleanPrice = Number.parseFloat(p.replace(/[^0-9.]/g, "")) || 0
        return sum + cleanPrice
      }, 0).toFixed(0)}`,
      icon: DollarSign,
      color: "text-[#FACC15]",
    },
  ]

  return (
    <ProtectedRoute requireAdmin>
      <AnimatedBackground />
      <DashboardNav userRole="admin" />

      <main className="min-h-screen pt-24 pb-20 px-4 bg-[#050505]">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-[#FFFFFF]">Admin Dashboard</h1>
            <p className="text-[#9CA3AF]">Manage all client orders and projects</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-[#0E0E0E] border-[#1a1a1a] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-[#FFFFFF]">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#FACC15]/10 rounded-lg flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
              className={
                selectedStatus === "all"
                  ? "bg-[#FACC15] text-[#050505] hover:bg-[#FACC15]/90"
                  : "border-[#1a1a1a] text-[#FFFFFF] hover:bg-[#1a1a1a]"
              }
            >
              All Orders
            </Button>
            <Button
              variant={selectedStatus === "pending" ? "default" : "outline"}
              onClick={() => setSelectedStatus("pending")}
              className={
                selectedStatus === "pending"
                  ? "bg-[#FACC15] text-[#050505] hover:bg-[#FACC15]/90"
                  : "border-[#1a1a1a] text-[#FFFFFF] hover:bg-[#1a1a1a]"
              }
            >
              Pending
            </Button>
            <Button
              variant={selectedStatus === "working" ? "default" : "outline"}
              onClick={() => setSelectedStatus("working")}
              className={
                selectedStatus === "working"
                  ? "bg-[#FACC15] text-[#050505] hover:bg-[#FACC15]/90"
                  : "border-[#1a1a1a] text-[#FFFFFF] hover:bg-[#1a1a1a]"
              }
            >
              In Progress
            </Button>
            <Button
              variant={selectedStatus === "delivered" ? "default" : "outline"}
              onClick={() => setSelectedStatus("delivered")}
              className={
                selectedStatus === "delivered"
                  ? "bg-[#FACC15] text-[#050505] hover:bg-[#FACC15]/90"
                  : "border-[#1a1a1a] text-[#FFFFFF] hover:bg-[#1a1a1a]"
              }
            >
              Delivered
            </Button>
          </div>

          {/* Orders Table */}
          <Card className="bg-[#0E0E0E] border-[#1a1a1a] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-[#9CA3AF]">No orders found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a1a] border-b border-[#1a1a1a]">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-[#FFFFFF]">Order ID</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#FFFFFF]">Client</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#FFFFFF]">Service</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#FFFFFF]">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#FFFFFF]">Deadline</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#FFFFFF]">Price</th>
                      <th className="text-left p-4 text-sm font-semibold text-[#FFFFFF]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50 transition-colors">
                        <td className="p-4 text-sm font-medium text-[#FFFFFF]">{order.id.substring(0, 8)}</td>
                        <td className="p-4">
                          <div>
                            <div className="text-sm font-medium text-[#FFFFFF]">{order.fullName || order.userName || "Guest"}</div>
                            <div className="text-xs text-[#9CA3AF]">{order.email || order.userEmail || "No Email"}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[#FFFFFF]">{order.serviceType}</td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                        <td className="p-4 text-sm text-[#9CA3AF]">{order.deadline ? new Date(order.deadline).toLocaleDateString() : "Not specified"}</td>
                        <td className="p-4 text-sm font-semibold text-[#FACC15]">{order.price || order.budget || "Not specified"}</td>
                        <td className="p-4">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="ghost" className="hover:bg-[#FACC15]/10 text-[#FACC15]">
                              <Eye size={16} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}
