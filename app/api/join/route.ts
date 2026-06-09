import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const formData = await request.json()

    // Validate required fields
    const requiredFields = ["fullName", "email", "phone", "device", "software", "position", "durability"]
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Validate email format
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    let applicationId = null
    const applicationData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      device: formData.device,
      software: formData.software,
      position: formData.position,
      portfolio: formData.portfolio || "N/A",
      whyJoin: formData.whyJoin || "Not provided",
      durability: formData.durability,
      status: "pending",
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    }

    try {
      if (adminDb) {
        const docRef = await adminDb.collection("applications").add(applicationData)
        applicationId = docRef.id
      } else {
        console.warn("[v0] Firestore Admin SDK not initialized. Mocking application save locally.")
        console.info("[v0] Mocked Application Data:", applicationData)
        applicationId = "mock-app-" + Math.random().toString(36).substring(2, 9)
      }
    } catch (firebaseError) {
      console.error("Firestore applications save error:", firebaseError)
    }

    const googleSheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL
    const discordWebhook = process.env.DISCORD_APPLICATION_WEBHOOK_URL

    if (!googleSheetsWebhook && !discordWebhook) {
      console.warn("[v0] Webhooks not configured for Join Us. Logged submission locally:")
      console.info("[v0] Mocked Join Application (Unconfigured Webhooks):", applicationData)
    }

    if (googleSheetsWebhook) {
      try {
        await fetch(googleSheetsWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            Device: formData.device, // Capital D to match Apps Script
            software: formData.software,
            position: formData.position,
            portfolio: formData.portfolio || "N/A",
            whyJoin: formData.whyJoin || "Not provided",
            durability: formData.durability,
          }),
        })
      } catch (error) {
        console.error("Google Sheets error:", error)
      }
    }

    if (discordWebhook) {
      try {
        await fetch(discordWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content:
              "<@&1449513575918997584> <@&1449513702419075092> <@&1449513679128236115> New application received!",
            embeds: [
              {
                title: "🎬 New M2 Studio Application",
                color: 0xfacc15, // Yellow color
                fields: [
                  {
                    name: "🆔 Application ID",
                    value: applicationId || "Not saved",
                    inline: true,
                  },
                  {
                    name: "👤 Name",
                    value: formData.fullName,
                    inline: true,
                  },
                  {
                    name: "📧 Email",
                    value: formData.email,
                    inline: true,
                  },
                  {
                    name: "📱 Phone",
                    value: formData.phone,
                    inline: true,
                  },
                  {
                    name: "💻 Device",
                    value: formData.device,
                    inline: true,
                  },
                  {
                    name: "🛠️ Software",
                    value: formData.software,
                    inline: true,
                  },
                  {
                    name: "🎯 Position",
                    value: formData.position,
                    inline: true,
                  },
                  {
                    name: "🔗 Portfolio",
                    value: formData.portfolio || "Not provided",
                    inline: false,
                  },
                  {
                    name: "💭 Why Join",
                    value: (formData.whyJoin || "Not provided").substring(0, 1024),
                    inline: false,
                  },
                  {
                    name: "⏱️ Durability",
                    value: formData.durability,
                    inline: true,
                  },
                ],
                timestamp: new Date().toISOString(),
                footer: {
                  text: "M2 Studio Applications",
                },
              },
            ],
          }),
        })
      } catch (error) {
        console.error("Discord webhook error:", error)
      }
    }

    return NextResponse.json({ success: true, message: "Application submitted successfully!", applicationId })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
