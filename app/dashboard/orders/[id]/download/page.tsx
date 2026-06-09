"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Download, FileVideo, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db, getFirestoreClient } from "@/lib/firebase"

export default function DownloadFilesPage() {
  const params = useParams()
  const orderId = params?.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        const dbInstance = db || (await getFirestoreClient())
        if (!dbInstance) throw new Error("Firestore is not configured.")

        const firestoreMod = await import("firebase/firestore")
        const { doc, getDoc } = firestoreMod

        const orderDoc = await getDoc(doc(dbInstance, "orders", orderId))
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() })
        } else {
          setError("Order not found.")
        }
      } catch (err: any) {
        console.error("[Download] Error fetching order:", err)
        setError(err?.message || "Failed to load files details.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const getFileNameFromUrl = (url: string) => {
    try {
      const decoded = decodeURIComponent(url)
      const parts = decoded.split("/")
      const filenameWithParams = parts[parts.length - 1]
      return filenameWithParams.split("?")[0]
    } catch (e) {
      return "Delivered_File.mp4"
    }
  }

  const handleDownload = (url: string) => {
    window.open(url, "_blank")
  }

  const handleDownloadAll = () => {
    if (order?.downloadUrls) {
      order.downloadUrls.forEach((url: string) => handleDownload(url))
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <>
          <AnimatedBackground />
          <DashboardNav userRole="client" />
          <main className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" />
          </main>
        </>
      </ProtectedRoute>
    )
  }

  const deliveredUrls = order?.downloadUrls || []

  return (
    <ProtectedRoute>
      <>
        <AnimatedBackground />
        <DashboardNav userRole="client" />

        <main className="min-h-screen pt-24 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">Download Files</h1>
                {deliveredUrls.length > 0 && <CheckCircle className="w-8 h-8 text-green-400" />}
              </div>
              <p className="text-muted-foreground">
                Order #{orderId?.slice(0, 8)}... - {order?.serviceType || order?.service || "Video Editing"}
              </p>
            </div>

            {error && (
              <Card className="glass border-destructive p-8 mb-6 text-center">
                <p className="text-destructive font-medium">{error}</p>
              </Card>
            )}

            {!error && deliveredUrls.length === 0 ? (
              <Card className="glass border-border p-12 text-center">
                <FileVideo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Files are not ready yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Our editors are currently working on your video. Once completed and uploaded, your download links will appear here.
                </p>
                <div className="mt-6">
                  <Link href={`/dashboard/orders/${orderId}/chat`}>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Chat with Editor for updates
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : !error && (
              <Card className="glass border-border p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Your files are ready!</h3>
                    <p className="text-muted-foreground">Download your completed video assets below</p>
                  </div>
                  {deliveredUrls.length > 1 && (
                    <Button
                      onClick={handleDownloadAll}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
                    >
                      <Download size={18} className="mr-2" />
                      Download All
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {deliveredUrls.map((url: string, index: number) => {
                    const fileName = getFileNameFromUrl(url)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileVideo className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{fileName}</p>
                            <p className="text-sm text-muted-foreground">Ready for download</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownload(url)}
                          variant="outline"
                          className="border-border hover:border-primary ml-4"
                        >
                          <Download size={18} className="mr-2" />
                          Download
                        </Button>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-border mt-6 pt-6">
                  <p className="text-sm text-muted-foreground">
                    Files will be available for download on this dashboard. Please save them to your local device.
                  </p>
                </div>
              </Card>
            )}

            {/* Feedback Card */}
            {!error && deliveredUrls.length > 0 && (
              <Card className="glass border-border p-8 mt-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">How was your experience?</h3>
                <p className="text-muted-foreground mb-6">We'd love to hear your feedback on this project</p>
                <Link href={`/dashboard/orders/${orderId}`}>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    Leave a Review
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </main>
      </>
    </ProtectedRoute>
  )
}
