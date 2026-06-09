"use client"

import type React from "react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Upload, X, FileVideo, CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db, storage, getFirestoreClient } from "@/lib/firebase"

export default function UploadFilesPage() {
  const params = useParams()
  const orderId = params?.id as string
  const router = useRouter()

  const [files, setFiles] = useState<File[]>([])
  const [shareLink, setShareLink] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0 && !shareLink.trim()) {
      setError("Please select at least one file or paste a link to upload.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const dbInstance = db || (await getFirestoreClient())
      if (!dbInstance) throw new Error("Firestore database is not initialized.")

      const firestoreMod = await import("firebase/firestore")
      const { doc, updateDoc, arrayUnion } = firestoreMod

      let uploadedUrls: string[] = []

      // If they have selected local files, upload to Firebase Storage
      if (files.length > 0) {
        if (!storage) throw new Error("Storage service is not configured.")
        const storageMod = await import("firebase/storage")
        const { ref, uploadBytes, getDownloadURL } = storageMod

        for (const file of files) {
          const storageRef = ref(storage, `orders/${orderId}/${file.name}`)
          await uploadBytes(storageRef, file)
          const downloadUrl = await getDownloadURL(storageRef)
          uploadedUrls.push(downloadUrl)
        }
      }

      // Update order document in Firestore
      const orderRef = doc(dbInstance, "orders", orderId)
      const updateData: any = {
        hasFiles: true,
        updatedAtIso: new Date().toISOString()
      }

      if (uploadedUrls.length > 0) {
        updateData.fileUrls = arrayUnion(...uploadedUrls)
      }

      if (shareLink.trim()) {
        updateData.rawFileLink = shareLink.trim()
      }

      await updateDoc(orderRef, updateData)

      setUploadSuccess(true)
    } catch (err: any) {
      console.error("[Upload] Error uploading files:", err)
      setError(err?.message || "Failed to upload files. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <ProtectedRoute>
      <>
        <AnimatedBackground />
        <DashboardNav userRole="client" />

        {uploadSuccess ? (
          <main className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center">
            <Card className="glass border-primary p-12 text-center max-w-2xl mx-auto">
              <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6 glow-blue" />
              <h2 className="text-4xl font-bold mb-4 text-foreground">Files Uploaded!</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your files have been successfully linked to your order. Our team will start working on your project shortly.
              </p>
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Back to Dashboard</Button>
              </Link>
            </Card>
          </main>
        ) : (
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
                <h1 className="text-4xl font-bold mb-2 text-foreground">Upload Files</h1>
                <p className="text-muted-foreground">
                  Upload your video files, footage, or any assets for Order #{orderId?.slice(0, 8)}...
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <Card className="glass border-border p-8">
                 {/* Upload Area */}
                <div 
                  className="mb-6"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="video/*,image/*,.zip,.rar"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
                      isDragging 
                        ? "border-[#FACC15] bg-[#FACC15]/10 scale-[1.01] shadow-[0_0_20px_rgba(250,204,21,0.2)]" 
                        : "border-border hover:border-[#FACC15]/50 hover:bg-muted/10 bg-muted/30"
                    }`}
                  >
                    <Upload className={`w-16 h-16 mb-4 transition-transform duration-300 ${isDragging ? "scale-110 text-[#FACC15] animate-bounce" : "text-primary"}`} />
                    <p className="text-lg font-semibold text-foreground mb-2">
                      {isDragging ? "Drop your files here!" : "Click to upload files"}
                    </p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports: MP4, MOV, AVI, ZIP, RAR (Max 5GB per file)
                    </p>
                  </label>
                </div>

                {/* Files List */}
                {files.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-foreground">Selected Files ({files.length})</h3>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileVideo className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-4"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Alternative Upload Methods */}
                <div className="border-t border-border pt-6 mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Or share via link</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You can also share files via Google Drive, Dropbox, or WeTransfer
                  </p>
                  <input
                    type="text"
                    value={shareLink}
                    onChange={(e) => setShareLink(e.target.value)}
                    placeholder="Paste your Google Drive or WeTransfer link here"
                    className="w-full p-3 bg-muted/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={(files.length === 0 && !shareLink.trim()) || isUploading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-blue py-6"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading files and updating order...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Submit {files.length > 0 ? `${files.length} File(s)` : ""} {shareLink.trim() && files.length > 0 ? "& " : ""} {shareLink.trim() ? "Link" : ""}
                    </>
                  )}
                </Button>
              </Card>
            </div>
          </main>
        )}
      </>
    </ProtectedRoute>
  )
}
