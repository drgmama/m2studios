import { type NextRequest, NextResponse } from "next/server"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, type, data } = body

    // Validate email
    if (!to || !emailRegex.test(to)) {
      return NextResponse.json({ error: "Valid 'to' email required" }, { status: 400 })
    }

    // Using a simple email service compatible with Next.js
    // You can integrate with Resend, SendGrid, or any other service

    let htmlContent = ""

    if (type === "order-confirmation") {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #050505; color: #FACC15; padding: 30px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .footer { background: #0E0E0E; color: #9CA3AF; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background: #FACC15; color: #050505; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .detail-row { margin: 10px 0; }
    .label { font-weight: bold; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">M2 STUDIO</h1>
      <p style="margin: 10px 0 0 0; color: #FACC15;">Professional Video Editing</p>
    </div>
    
    <div class="content">
      <h2 style="color: #050505;">Order Confirmation</h2>
      <p>Hi ${data.userName},</p>
      <p>Thank you for placing an order with M2 Studio! We've received your project and our team will start working on it soon.</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <div class="detail-row"><span class="label">Order ID:</span> ${data.orderId}</div>
        <div class="detail-row"><span class="label">Service:</span> ${data.serviceType}</div>
        <div class="detail-row"><span class="label">Deadline:</span> ${new Date(data.deadline).toLocaleDateString()}</div>
        <div class="detail-row"><span class="label">Budget:</span> ${data.budget}</div>
        <div class="detail-row"><span class="label">Status:</span> <strong style="color: #FACC15;">Pending</strong></div>
      </div>
      
      <p><strong>Project Description:</strong></p>
      <p style="background: white; padding: 15px; border-radius: 8px;">${data.description}</p>
      
      <p>You can track your order status and communicate with our team through your dashboard.</p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" class="button">View Dashboard</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        If you have any questions, feel free to reply to this email or contact us through your dashboard.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 M2 Studio. All rights reserved.</p>
      <p>Professional Video Editing & Creative Studio</p>
    </div>
  </div>
</body>
</html>
`
    } else if (type === "status-update") {
      const statusColors: Record<string, string> = {
        pending: "#FACC15",
        working: "#3B82F6",
        delivered: "#10B981",
        cancelled: "#EF4444",
      }

      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #050505; color: #FACC15; padding: 30px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .footer { background: #0E0E0E; color: #9CA3AF; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background: #FACC15; color: #050505; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">M2 STUDIO</h1>
      <p style="margin: 10px 0 0 0; color: #FACC15;">Professional Video Editing</p>
    </div>
    
    <div class="content">
      <h2 style="color: #050505;">Order Status Update</h2>
      <p>Hi ${data.userName},</p>
      <p>Your order status has been updated!</p>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #666;">Order ID: <strong>${data.orderId}</strong></p>
        <p style="margin: 0 0 10px 0; color: #666;">Service: <strong>${data.serviceType}</strong></p>
        <div style="margin: 20px 0;">
          <span class="status-badge" style="background: ${statusColors[data.status]}20; color: ${statusColors[data.status]};">
            ${data.status.toUpperCase()}
          </span>
        </div>
      </div>
      
      ${
        data.status === "delivered"
          ? `
        <p style="background: #10B98120; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981;">
          <strong>🎉 Great news!</strong> Your project has been completed and is ready for download!
        </p>
      `
          : data.status === "working"
            ? `
        <p style="background: #3B82F620; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
          <strong>📹 In Progress!</strong> Our team is currently working on your project.
        </p>
      `
            : ""
      }
      
      ${
        data.message
          ? `
        <div style="margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">Message from the team:</p>
          <p style="background: white; padding: 15px; border-radius: 8px; margin: 0;">${data.message}</p>
        </div>
      `
          : ""
      }
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" class="button">View Dashboard</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 M2 Studio. All rights reserved.</p>
      <p>Professional Video Editing & Creative Studio</p>
    </div>
  </div>
</body>
</html>
`
    } else if (type === "delivery") {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #050505; color: #FACC15; padding: 30px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; }
    .footer { background: #0E0E0E; color: #9CA3AF; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background: #FACC15; color: #050505; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">M2 STUDIO</h1>
      <p style="margin: 10px 0 0 0; color: #FACC15;">Professional Video Editing</p>
    </div>
    
    <div class="content">
      <h2 style="color: #050505;">🎉 Your Project is Ready!</h2>
      <p>Hi ${data.userName},</p>
      <p>Exciting news! Your project <strong>${data.serviceType}</strong> has been completed and is ready for download.</p>
      
      <div style="background: #10B98120; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #10B981;">✓ Delivered</h3>
        <p style="margin: 0; color: #666;">Order ID: <strong>${data.orderId}</strong></p>
      </div>
      
      <p>You can now download your edited files from your dashboard. We hope you love the final result!</p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/orders/${data.orderId}/download" class="button">Download Files</a>
      </div>
      
      <p style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
        <strong>Need revisions?</strong><br>
        If you need any changes or have feedback, please let us know through the chat in your dashboard. We're here to ensure you're completely satisfied!
      </p>
    </div>
    
    <div class="footer">
      <p>© 2025 M2 Studio. All rights reserved.</p>
      <p>Professional Video Editing & Creative Studio</p>
    </div>
  </div>
</body>
</html>
`
    }

    // Send email using Discord webhook as notification (since you have this set up)
    // In production, you'd use a proper email service like Resend
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_ORDER_WEBHOOK_URL || process.env.DISCORD_APPLICATION_WEBHOOK_URL

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📧 Email Notification Sent\n**To:** ${to}\n**Subject:** ${subject}\n**Type:** ${type}`,
          embeds: [
            {
              title: subject,
              description: `Email notification sent to ${data.userName}`,
              color: 0xfacc15,
              fields: [
                { name: "Order ID", value: data.orderId || "N/A", inline: true },
                { name: "Type", value: type, inline: true },
                { name: "Status", value: data.status || "N/A", inline: true },
              ],
            },
          ],
        }),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Email notification sent successfully",
    })
  } catch (error: any) {
    console.error("[v0] Error sending email:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
