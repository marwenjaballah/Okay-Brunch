
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", // Updated to a recent version or use '2023-10-16' as a safe default if unsure, but 'latest' might be safer with the package. Let's stick to a standard recent one or let the SDK handle it if we don't specify, but type safety usually requires it. I'll use a recent 2024 one or the property from the installed package if possible. For now, I'll allow the SDK to default or use a known stable version string if typescript complains. Actually, standard practice is to pin it.
  typescript: true,
})

export async function POST(req: Request) {
  try {
    const { items } = await req.json()

    if (!items || items.length === 0) {
      return new NextResponse("No items in cart", { status: 400 })
    }

    // Calculate total on server (safe way) - assuming items passed are trusted for this demo or we'd re-verify prices from DB.
    // In a real app, you should fetch prices from your DB using item IDs.
    // For this demo, we will calculate based on the passed objects but acknowledging the risk.
    const amount = items.reduce((total: number, item: any) => {
      return total + (item.item.price * item.quantity)
    }, 0)

    // Stripe expects amount in cents for USD, etc. Assuming price is in dollars/base unit.
    const amountInCents = Math.round(amount * 100)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: any) {
    console.error("Internal Error:", error)
    return new NextResponse("Internal Error: " + error.message, { status: 500 })
  }
}
