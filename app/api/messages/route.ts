import { type NextRequest, NextResponse } from "next/server"
import type { MessageDocument } from "@/lib/firestore-types"
import { adminDb } from "@/lib/firebaseAdmin"

// Use Admin SDK in server API routes to avoid initializing the client SDK on the server.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const messageData: MessageDocument = {
      orderId: body.orderId,
      senderId: body.senderId,
      senderName: body.senderName,
      senderRole: body.senderRole,
      message: body.message,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      createdAt: new Date().toISOString(),
      read: false,
    }

    if (!adminDb) {
      console.error("[messages] Admin Firestore not configured")
      return NextResponse.json({ success: false, error: "Server Firestore not configured" }, { status: 500 })
    }

    const docRef = await adminDb.collection("messages").add(messageData)

    return NextResponse.json({
      success: true,
      messageId: docRef.id,
      message: "Message sent successfully",
    })
  } catch (error: any) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    if (!adminDb) {
      console.error("[messages] Admin Firestore not configured")
      return NextResponse.json({ success: false, error: "Server Firestore not configured" }, { status: 500 })
    }

    const querySnapshot = await adminDb
      .collection("messages")
      .where("orderId", "==", orderId)
      .get()

    const messages: Array<Record<string, any>> = []
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() })
    })

    // Sort in-memory to avoid requiring composite Firestore indexes
    messages.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime()
      const timeB = new Date(b.createdAt || 0).getTime()
      return timeA - timeB
    })

    return NextResponse.json({ success: true, messages })
  } catch (error: any) {
    console.error("[v0] Error fetching messages:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
