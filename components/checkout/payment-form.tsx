"use client"

import { useState, useEffect } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useCartStore } from "@/hooks/use-cart-store"
import { useRouter } from "next/navigation"

interface PaymentFormProps {
  user: any
  total: number
}

export function PaymentForm({ user, total }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [savedProfile, setSavedProfile] = useState<any>(null)

  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online")

  const supabase = getSupabaseClient()
  const { cart, clearCart } = useCartStore()
  const router = useRouter()

  useEffect(() => {
    // Fetch profile to pre-fill
    const fetchProfile = async () => {
      if (!user) return
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
      if (data) {
        setSavedProfile(data)
      }
    }
    fetchProfile()
  }, [user, supabase])

  const createOrder = async (status: string, paymentStatus: "paid" | "unpaid") => {
    // 1. Ensure user exists (Upsert)
    const { error: userError } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          phone: phone,
        },
        { onConflict: "id" }
      )

    if (userError) {
      throw new Error("Error saving user: " + userError.message)
    }

    // 2. Create Order in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          status: status,
          payment_status: paymentStatus,
          total_amount: total,
          delivery_address: address,
          notes: phone,
        },
      ])
      .select()
      .single()

    if (orderError) {
      throw new Error("Error creating order: " + orderError.message)
    }

    // 3. Add Order Items
    const orderItems = cart.map((c) => ({
      order_id: order.id,
      menu_item_id: c.item.id,
      quantity: c.quantity,
      price: c.item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      throw new Error("Error creating order items: " + itemsError.message)
    }

    // 4. Notify n8n (Fire and forget)
    fetch("/api/notify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: order.id,
        user: {
          email: user.email,
          id: user.id
        },
        total: total,
        items: cart.map(c => ({ name: c.item.name, quantity: c.quantity, price: c.item.price })),
        date: new Date().toISOString()
      })
    }).catch(err => console.error("Notification trigger failed", err))

    return order
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (paymentMethod === "online") {
        if (!stripe || !elements) {
          setIsLoading(false)
          return
        }

        // Confirm Payment with Stripe
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        })

        if (error) {
          if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.")
          } else {
            setMessage("An unexpected error occurred.")
          }
          setIsLoading(false)
          return
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          const order = await createOrder("pending", "paid")
          clearCart()
          router.push(`/orders/${order.id}`)
        } else {
          setMessage("Payment status: " + paymentIntent?.status)
          setIsLoading(false)
        }
      } else {
        // Cash Payment
        const order = await createOrder("pending", "unpaid")
        clearCart()
        router.push(`/orders/${order.id}`)
      }
    } catch (err: any) {
      setMessage(err.message || "An error occurred while creating order.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border-4 border-foreground p-8">
        <h2 className="text-2xl font-bold font-mono mb-6">DELIVERY INFO</h2>

        {savedProfile && !address && !phone && (
          <div className="mb-6 bg-muted/20 p-4 border border-border">
            <p className="font-mono text-sm mb-2">Saved profile found:</p>
            <p className="font-mono text-sm font-bold">{savedProfile.address}, {savedProfile.phone}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => {
                setAddress(savedProfile.address || "")
                setPhone(savedProfile.phone || "")
              }}
            >
              USE SAVED INFO
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold font-mono mb-2">ADDRESS</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border-2 border-foreground w-full px-4 py-3"
              required
              placeholder="123 Main St"
            />
          </div>
          <div>
            <label className="block text-sm font-bold font-mono mb-2">PHONE</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-2 border-foreground w-full px-4 py-3"
              required
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      </div>

      <div className="border-4 border-foreground p-8">
        <h2 className="text-2xl font-bold font-mono mb-6">PAYMENT METHOD</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            type="button"
            variant={paymentMethod === "online" ? "default" : "outline"}
            className={`border-2 border-foreground font-bold py-6 ${paymentMethod === "online" ? "bg-foreground text-background" : ""}`}
            onClick={() => setPaymentMethod("online")}
          >
            CARD (STRIPE)
          </Button>
          <Button
            type="button"
            variant={paymentMethod === "cash" ? "default" : "outline"}
            className={`border-2 border-foreground font-bold py-6 ${paymentMethod === "cash" ? "bg-foreground text-background" : ""}`}
            onClick={() => setPaymentMethod("cash")}
          >
            PAY IN CASH
          </Button>
        </div>

        {paymentMethod === "online" ? (
          <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
        ) : (
          <div className="bg-muted/10 p-6 border-2 border-dashed border-foreground/30 text-center font-mono">
            <p className="font-bold mb-2">CASH ON DELIVERY</p>
            <p className="text-sm">You will pay for your order when it arrives at your door.</p>
          </div>
        )}
      </div>

      {message && <div className="text-red-500 font-bold font-mono">{message}</div>}

      <Button
        type="submit"
        disabled={isLoading || (paymentMethod === "online" && (!stripe || !elements))}
        className="w-full border-2 border-foreground font-bold py-4 text-lg"
      >
        {isLoading ? "PROCESSING..." : paymentMethod === "online" ? "PAY & ORDER" : "ORDER FOR CASH"}
      </Button>
    </form>
  )
}
