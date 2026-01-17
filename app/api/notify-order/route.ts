import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      console.warn("N8N_WEBHOOK_URL is not defined")
      return NextResponse.json({ success: false, message: "Configuration error" }, { status: 500 })
    }

    // Forward data to n8n
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error("n8n webhook failed", response.statusText)
       // We don't want to fail the generic order flow if notifications fail, 
       // but we log it.
      return NextResponse.json({ success: false, message: "Notification failed upstream" }, { status: 200 }) 
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error notifying n8n:", error)
    return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 })
  }
}
