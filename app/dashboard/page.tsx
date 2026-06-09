"use client"

import { AnimatedBackground } from "@/components/animated-background"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Package,
  Clock,
  CheckCircle,
  Download,
  MessageSquare,
  Upload,
  Plus,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
  Eye,
  RefreshCw,
  User,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { db, getFirestoreClient } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge" // Import Badge component
import { OrderCountdown } from "@/components/order-countdown"

interface Order {
  id: string
  service: string
  status: string
  createdAt: string
  deliveredAt: string | null
  deadline?: string
  budget: string
  hasFiles: boolean
  unreadMessages: number
}

function OrderProgressStepper({ status }: { status: string }) {
  const steps = ["pending", "working", "delivered"]
  const stepLabels = ["Order Placed", "In Progress", "Delivered"]
  const currentIndex = steps.indexOf(status)

  return (
    <div className="mt-6 mb-4 flex items-center w-full max-w-md gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isActive = index === currentIndex
        const label = stepLabels[index]

        return (
          <div key={step} className="flex-1 flex items-center relative">
            {/* Step Indicator Node */}
            <div className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-xs sm:text-sm transition-all duration-500 ${
                  isCompleted
                    ? "bg-[#FACC15] border-[#FACC15] text-[#000000] shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                    : isActive
                      ? "bg-[#0E0E0E] border-[#FACC15] text-[#FACC15] shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse font-bold"
                      : "bg-[#0E0E0E] border-gray-800 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] mt-1 font-semibold text-center transition-all duration-300 ${
                  isActive ? "text-[#FACC15] font-bold" : isCompleted ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connecting Bar */}
            {index < steps.length - 1 && (
              <div className="absolute top-3.5 sm:top-4 left-[55%] right-[-55%] h-0.5 bg-gray-800 z-0">
                <div
                  className="h-full bg-[#FACC15] transition-all duration-1000 ease-out"
                  style={{ width: isCompleted ? "100%" : isActive ? "50%" : "0%" }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ClientDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let ordersData: Order[] = []

      try {
        const dbInstance = db || (await getFirestoreClient())
        if (!dbInstance) throw new Error("Firestore is not initialized")

        // Dynamically import Firestore helpers so they come from the same
        // module instance as `dbInstance` to avoid cross-instance type errors.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const firestore = await import("firebase/firestore")
        const { collection, query, where, getDocs } = firestore

        const simpleQuery = query(collection(dbInstance, "orders"), where("email", "==", user.email))
        const snapshot = await getDocs(simpleQuery)

        ordersData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            service: data.serviceType || data.service || "Order",
            status: data.status || "pending",
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            deliveredAt: data.deliveredAt?.toDate?.()?.toISOString() || null,
            deadline: data.deadline || null,
            budget: data.budget || "$0",
            hasFiles: data.hasFiles || false,
            unreadMessages: data.unreadMessages || 0,
          }
        })

        // Sort manually by createdAt descending
        ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } catch (queryError: any) {
        console.error("[v0] Query error:", queryError)
        throw queryError
      }

      setOrders(ordersData)
      setError(null)
    } catch (err: any) {
      console.error("[v0] Error fetching orders:", err)
      setError("Failed to load orders: " + (err.message || "Unknown error"))
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = selectedStatus === "all" ? orders : orders.filter((order) => order.status === selectedStatus)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle size={12} className="mr-1" />
            Delivered
          </Badge>
        )
      case "working":
        return (
          <Badge className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock size={12} className="mr-1" />
            In Progress
          </Badge>
        )
      case "pending":
        return (
          <Badge className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <Clock size={12} className="mr-1" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            {status}
          </Badge>
        )
    }
  }

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: Package,
      color: "#FACC15",
      bgColor: "rgba(250,204,21,0.1)",
    },
    {
      label: "In Progress",
      value: orders.filter((o) => o.status === "working").length,
      icon: Clock,
      color: "#F59E0B",
      bgColor: "rgba(245,158,11,0.1)",
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: CheckCircle,
      color: "#10B981",
      bgColor: "rgba(16,185,129,0.1)",
    },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "pending").length,
      icon: TrendingUp,
      color: "#6B7280",
      bgColor: "rgba(107,114,128,0.1)",
    },
  ]

  const filterButtons = [
    { key: "all", label: "All Orders", count: orders.length },
    { key: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
    { key: "working", label: "In Progress", count: orders.filter((o) => o.status === "working").length },
    { key: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
  ]

  const quickActions = [
    {
      title: "Place New Order",
      description: "Start a new project with M2 Studio",
      icon: Plus,
      href: "/order",
      color: "#FACC15",
      primary: true,
    },
    {
      title: "Free Files",
      description: "Download free resources and templates",
      icon: Download,
      href: "/dashboard/free-files",
      color: "#10B981",
    },
    {
      title: "My Profile",
      description: "Update your account settings",
      icon: User,
      href: "/dashboard/profile",
      color: "#3B82F6",
    },
    {
      title: "View Services",
      description: "Explore our design services",
      icon: FileText,
      href: "/services",
      color: "#8B5CF6",
    },
  ]

  return (
    <ProtectedRoute>
      <AnimatedBackground />
      <DashboardNav userRole="client" />

      <main className="min-h-screen pt-24 pb-20 px-4" style={{ backgroundColor: "#050505" }}>
        <div className="container mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-8 h-8" style={{ color: "#FACC15" }} />
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{ backgroundColor: "rgba(250,204,21,0.1)", color: "#FACC15" }}
                  >
                    Welcome back{user?.displayName ? `, ${user.displayName}` : ""}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: "#FFFFFF" }}>
                  My Dashboard
                </h1>
                <p className="text-lg" style={{ color: "#9CA3AF" }}>
                  Track your projects and manage orders in one place
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={fetchOrders}
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-6 rounded-2xl transition-all duration-300 bg-transparent"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(250,204,21,0.3)",
                    color: "#FACC15",
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Link href="/order">
                  <Button
                    className="group flex items-center gap-2 px-6 py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: "#FACC15",
                      color: "#000000",
                      boxShadow: "0 0 30px rgba(250,204,21,0.3)",
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    New Order
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {error && (
              <Card
                className="rounded-2xl p-6 mb-6"
                style={{ backgroundColor: "#1a0505", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <p className="text-red-400">{error}</p>
                <Button onClick={fetchOrders} className="mt-4" style={{ backgroundColor: "#FACC15", color: "#000" }}>
                  Try Again
                </Button>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    backgroundColor: "#0E0E0E",
                    border: "1px solid rgba(250,204,21,0.15)",
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "#9CA3AF" }}>
                        {stat.label}
                      </p>
                      <p className="text-3xl md:text-4xl font-bold" style={{ color: "#FFFFFF" }}>
                        {loading ? "-" : stat.value}
                      </p>
                    </div>
                  </div>
                  <div
                    className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl"
                    style={{ backgroundColor: stat.color }}
                  />
                </Card>
              ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {filterButtons.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedStatus(filter.key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedStatus === filter.key ? "scale-105" : "hover:bg-white/5"
                  }`}
                  style={
                    selectedStatus === filter.key
                      ? {
                          backgroundColor: "#FACC15",
                          color: "#000000",
                          boxShadow: "0 0 20px rgba(250,204,21,0.3)",
                        }
                      : {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          color: "#9CA3AF",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                  }
                >
                  {filter.label}
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={
                      selectedStatus === filter.key
                        ? { backgroundColor: "rgba(0,0,0,0.2)", color: "#000000" }
                        : { backgroundColor: "rgba(250,204,21,0.2)", color: "#FACC15" }
                    }
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card
                    className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer ${
                      action.primary ? "md:col-span-2" : ""
                    }`}
                    style={{
                      backgroundColor: "#0E0E0E",
                      border: action.primary ? "2px solid rgba(250,204,21,0.3)" : "1px solid rgba(250,204,21,0.15)",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${action.color}15` }}
                      >
                        <action.icon className="w-7 h-7" style={{ color: action.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1 flex items-center gap-2" style={{ color: "#FFFFFF" }}>
                          {action.title}
                          <ArrowRight
                            className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                            style={{ color: action.color }}
                          />
                        </h3>
                        <p style={{ color: "#9CA3AF" }}>{action.description}</p>
                      </div>
                    </div>
                    {action.primary && (
                      <div
                        className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl"
                        style={{ backgroundColor: action.color }}
                      />
                    )}
                  </Card>
                </Link>
              ))}
            </div>

            {/* Info Card */}
            <Card
              className="rounded-3xl p-8 text-center"
              style={{ backgroundColor: "#0E0E0E", border: "1px solid rgba(250,204,21,0.15)" }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: "rgba(250,204,21,0.1)" }}
              >
                <Package className="w-10 h-10" style={{ color: "#FACC15" }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#FFFFFF" }}>
                Ready to Start a Project?
              </h3>
              <p className="mb-8 max-w-md mx-auto" style={{ color: "#9CA3AF" }}>
                Place an order and our team will get back to you within 24 hours to discuss your project requirements.
              </p>
              <Link href="/order">
                <Button
                  className="px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "#FACC15",
                    color: "#000000",
                    boxShadow: "0 0 30px rgba(250,204,21,0.3)",
                  }}
                >
                  <Plus className="mr-2" />
                  Place Your Order
                </Button>
              </Link>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      className="rounded-2xl p-6 animate-pulse"
                      style={{ backgroundColor: "#0E0E0E", border: "1px solid rgba(250,204,21,0.1)" }}
                    >
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="h-6 w-48 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                          <div className="h-4 w-72 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-10 w-24 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                          <div className="h-10 w-24 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <Card
                  className="rounded-3xl p-12 text-center"
                  style={{ backgroundColor: "#0E0E0E", border: "1px solid rgba(250,204,21,0.15)" }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: "rgba(250,204,21,0.1)" }}
                  >
                    <Package className="w-10 h-10" style={{ color: "#FACC15" }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: "#FFFFFF" }}>
                    No orders found
                  </h3>
                  <p className="mb-8 max-w-md mx-auto" style={{ color: "#9CA3AF" }}>
                    Start your creative journey by placing your first order with M2 Studio
                  </p>
                  <Link href="/order">
                    <Button
                      className="px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: "#FACC15",
                        color: "#000000",
                        boxShadow: "0 0 30px rgba(250,204,21,0.3)",
                      }}
                    >
                      <Plus className="mr-2" />
                      Place Your First Order
                    </Button>
                  </Link>
                </Card>
              ) : (
                filteredOrders.map((order, index) => (
                  <Card
                    key={order.id}
                    className="group rounded-2xl p-6 transition-all duration-300 hover:shadow-xl"
                    style={{
                      backgroundColor: "#0E0E0E",
                      border: "1px solid rgba(250,204,21,0.15)",
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold" style={{ color: "#FFFFFF" }}>
                            {order.service}
                          </h3>
                          {getStatusBadge(order.status)}
                          {order.status === "working" && order.deadline && (
                            <OrderCountdown deadline={order.deadline} />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "#9CA3AF" }}>
                          <span className="flex items-center gap-1.5">
                            <span className="font-medium" style={{ color: "#6B7280" }}>
                              ID:
                            </span>
                            {order.id.slice(0, 8)}...
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {order.deliveredAt && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-gray-600" />
                              <span className="flex items-center gap-1.5 text-green-400">
                                <CheckCircle size={14} />
                                Delivered{" "}
                                {new Date(order.deliveredAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </>
                          )}
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className="font-bold" style={{ color: "#FACC15" }}>
                            {order.budget}
                          </span>
                        </div>
                        <OrderProgressStepper status={order.status} />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            className="rounded-xl px-4 py-2.5 font-medium transition-all duration-300 hover:scale-105 bg-transparent"
                            style={{
                              backgroundColor: "transparent",
                              border: "1px solid rgba(250,204,21,0.3)",
                              color: "#FACC15",
                            }}
                          >
                            <Eye size={18} className="mr-2" />
                            View
                          </Button>
                        </Link>

                        <Link href={`/dashboard/orders/${order.id}/chat`}>
                          <Button
                            variant="outline"
                            className="relative rounded-xl px-4 py-2.5 font-medium transition-all duration-300 hover:scale-105 bg-transparent"
                            style={{
                              backgroundColor: "transparent",
                              border: "1px solid rgba(250,204,21,0.3)",
                              color: "#FACC15",
                            }}
                          >
                            <MessageSquare size={18} className="mr-2" />
                            Chat
                            {order.unreadMessages > 0 && (
                              <span
                                className="absolute -top-2 -right-2 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center"
                                style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
                              >
                                {order.unreadMessages}
                              </span>
                            )}
                          </Button>
                        </Link>

                        {order.status === "pending" && (
                          <Link href={`/dashboard/orders/${order.id}/upload`}>
                            <Button
                              variant="outline"
                              className="rounded-xl px-4 py-2.5 font-medium transition-all duration-300 hover:scale-105 bg-transparent"
                              style={{
                                backgroundColor: "transparent",
                                border: "1px solid rgba(250,204,21,0.3)",
                                color: "#FACC15",
                              }}
                            >
                              <Upload size={18} className="mr-2" />
                              Upload
                            </Button>
                          </Link>
                        )}

                        {order.hasFiles && (
                          <Link href={`/dashboard/orders/${order.id}/download`}>
                            <Button
                              className="rounded-xl px-4 py-2.5 font-medium transition-all duration-300 hover:scale-105"
                              style={{
                                backgroundColor: "#FACC15",
                                color: "#000000",
                                boxShadow: "0 0 20px rgba(250,204,21,0.2)",
                              }}
                            >
                              <Download size={18} className="mr-2" />
                              Download
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
