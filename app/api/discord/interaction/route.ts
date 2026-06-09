import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import crypto from "crypto"
import { sendClientEmail } from "@/lib/email"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get("orderId")
    const action = url.searchParams.get("action")
    const sig = url.searchParams.get("sig")

    if (!orderId || !action || !sig) {
      return new NextResponse("Missing parameters", { status: 400 })
    }

    const secret = process.env.DISCORD_INTERACTION_SECRET || process.env.SECRET || ""
    const expected = crypto.createHmac("sha256", secret).update(`${orderId}:${action}`).digest()
    const provided = Buffer.from(sig, "hex")

    // timing-safe compare
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return new NextResponse("Invalid signature", { status: 401 })
    }

    // Fetch order and update status
    const docRef = adminDb.collection("orders").doc(orderId)
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return new NextResponse("Order not found", { status: 404 })
    }

    const orderData = snapshot.data() || {}
    const newStatus = action === "approve" ? "approved" : action === "reject" ? "cancelled" : action

    await docRef.update({ status: newStatus, updatedAtIso: new Date().toISOString() })

    // Create notification in Firestore using Admin SDK
    try {
      const clientEmail = orderData.email || orderData.userEmail
      if (clientEmail) {
        const usersSnapshot = await adminDb
          .collection("users")
          .where("email", "==", clientEmail)
          .limit(1)
          .get()

        if (!usersSnapshot.empty) {
          const clientUid = usersSnapshot.docs[0].id
          await adminDb.collection("notifications").add({
            userId: clientUid,
            orderId,
            title: "Order Status Update",
            message: `Your order status has been updated to ${newStatus}.`,
            read: false,
            createdAt: new Date().toISOString()
          })
        }
      }
    } catch (notifErr) {
      console.error("Failed to create webhook status update notification:", notifErr)
    }

    // Send status update email to client (best-effort)
    try {
      await sendClientEmail({
        to: orderData.email,
        subject: `Your order ${orderId} has been ${newStatus}`,
        type: "status-update",
        data: {
          userName: orderData.fullName || orderData.userName || "Customer",
          orderId,
          serviceType: orderData.serviceType || "",
          status: newStatus,
        },
      })
    } catch (emailErr) {
      console.error("Failed to send status email:", emailErr)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || ""
    const redirectTo = `${baseUrl}/dashboard/orders/${orderId}`

    const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="2;url=${redirectTo}" /><title>Order ${newStatus}</title></head><body style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h2>Order ${orderId} ${newStatus}</h2><p>You will be redirected shortly. If not, <a href="${redirectTo}">click here</a>.</p></div></body></html>`

    return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } })
  } catch (error) {
    console.error("Discord interaction error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
