import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import crypto from "crypto"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const formData = await request.json()

    // Validate required fields
    const requiredFields = ["fullName", "email", "whatsapp", "serviceType", "projectDescription"]
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate email format
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    let orderId = null
    const orderData = {
      fullName: formData.fullName,
      userName: formData.fullName,
      email: formData.email,
      userEmail: formData.email,
      whatsapp: formData.whatsapp,
      userWhatsapp: formData.whatsapp,
      serviceType: formData.serviceType,
      projectDescription: formData.projectDescription,
      description: formData.projectDescription,
      deadline: formData.deadline || null,
      rawFileLink: formData.rawFileLink || null,
      budget: formData.budget || "Not specified",
      price: formData.budget || "Not specified",
      status: "pending",
      createdAtIso: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasFiles: false,
      unreadMessages: 0,
    }

    try {
      if (adminDb) {
        // Prevent rapid duplicate submissions: check most recent order from this email
        try {
          const recentQuery = await adminDb
            .collection("orders")
            .where("email", "==", formData.email)
            .limit(5)
            .get()

          if (!recentQuery.empty) {
            // Find the most recent order manually
            let mostRecent = null
            let mostRecentTime = 0
            
            recentQuery.docs.forEach(doc => {
              const createdIso = doc.data().createdAtIso
              const created = createdIso ? new Date(createdIso).getTime() : 0
              if (created > mostRecentTime) {
                mostRecentTime = created
                mostRecent = { id: doc.id, created }
              }
            })

            if (mostRecent) {
              const timeDiff = Date.now() - mostRecent.created
              if (timeDiff < 5 * 60 * 1000) {
                // Treat as duplicate if submitted within 5 minutes
                return NextResponse.json({
                  success: true,
                  message: "Duplicate order detected; recently submitted.",
                  orderId: mostRecent.id,
                })
              }
            }
          }
        } catch (queryErr) {
          // If duplicate detection fails, continue to attempt save
          console.warn("Duplicate detection error:", queryErr)
        }

        const docRef = await adminDb.collection("orders").add(orderData)
        orderId = docRef.id
      } else {
        console.warn("[v0] Firestore Admin SDK not initialized. Mocking database save locally.")
        console.info("[v0] Mocked Order Data:", orderData)
        orderId = "mock-order-" + Math.random().toString(36).substring(2, 9)
      }
    } catch (firebaseError) {
      // Continue with Discord/Sheets even if Firebase fails
      console.error("Firestore save error:", firebaseError)
    }

    const discordWebhook = process.env.DISCORD_ORDER_WEBHOOK_URL
    const googleSheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL

    // Send to Discord webhook
    if (discordWebhook) {
      try {
        // create HMAC signatures for approve/reject links
        const secret = process.env.DISCORD_INTERACTION_SECRET || process.env.SECRET || ""
        const makeSig = (id: string | null, action: string) =>
          crypto.createHmac("sha256", secret).update(`${id || ""}:${action}`).digest("hex")

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || ""

        const approveSig = makeSig(orderId, "approve")
        const rejectSig = makeSig(orderId, "reject")

        const approveUrl = `${baseUrl}/api/discord/interaction?orderId=${encodeURIComponent(
          orderId || ""
        )}&action=approve&sig=${encodeURIComponent(approveSig)}`
        const rejectUrl = `${baseUrl}/api/discord/interaction?orderId=${encodeURIComponent(
          orderId || ""
        )}&action=reject&sig=${encodeURIComponent(rejectSig)}`

        await fetch(discordWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: "🎬 New order received! <@&1449513575918997584> <@&1449513702419075092> <@&1449513679128236115>",
            embeds: [
              {
                title: "📦 New M2 Studio Order",
                color: 0xfacc15,
                fields: [
                  { name: "🆔 Order ID", value: orderId || "Not saved", inline: true },
                  { name: "👤 Name", value: formData.fullName, inline: true },
                  { name: "📧 Email", value: formData.email, inline: true },
                  { name: "📱 WhatsApp", value: formData.whatsapp, inline: true },
                  { name: "🎯 Service", value: formData.serviceType, inline: true },
                  { name: "💰 Budget", value: formData.budget || "Not specified", inline: true },
                  { name: "📅 Deadline", value: formData.deadline || "Not specified", inline: true },
                  { name: "📝 Description", value: formData.projectDescription.substring(0, 1024), inline: false },
                  { name: "🔗 Raw Files", value: formData.rawFileLink || "Not provided", inline: false },
                ],
                timestamp: new Date().toISOString(),
                footer: { text: "M2 Studio Orders" },
              },
            ],
            // Add URL buttons that open your interaction endpoint to approve/reject the order
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 5,
                    label: "Approve",
                    url: approveUrl,
                  },
                  {
                    type: 2,
                    style: 5,
                    label: "Reject",
                    url: rejectUrl,
                  },
                ],
              },
            ],
          }),
        })
      } catch (error) {
        // Discord webhook error - silent fail
      }
    }

    if (googleSheetsWebhook) {
      try {
        await fetch(googleSheetsWebhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId || "N/A",
          fullName: formData.fullName,
          email: formData.email,
          whatsapp: formData.whatsapp,
          serviceType: formData.serviceType,
          projectDescription: formData.projectDescription,
          deadline: formData.deadline || "Not specified",
          rawFileLink: formData.rawFileLink || "Not provided",
          budget: formData.budget || "Not specified",
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      // Google Sheets error - silent fail
    }
    }

    return NextResponse.json({
      success: true,
      message: "Order submitted successfully!",
      orderId: orderId,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit order" }, { status: 500 })
  }
}
