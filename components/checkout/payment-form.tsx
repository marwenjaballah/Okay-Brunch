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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    // 1. Confirm Payment with Stripe FIRST
    // We use redirect: "if_required" so we can handle success via JS and create the order.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", 
    })

    if (error) {
       // Payment failed - do NOT create order
       if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred.")
      } else {
        setMessage("An unexpected error occurred.")
      }
      setIsLoading(false)
      return
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment succeeded! NOW create the order.
      
      // 2. Ensure user exists (Upsert)
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
        setMessage("Payment succeeded, but error saving user: " + userError.message)
        setIsLoading(false)
        return
      }

      // 3. Create Order in Supabase
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            // Status is now paid because we confirmed payment
            status: "paid", 
            total_amount: total,
            delivery_address: address,
            notes: phone,
            // Store payment intent ID for reference if needed
            // stripe_payment_id: paymentIntent.id 
          },
        ])
        .select()
        .single()

      if (orderError) {
        setMessage("Payment succeeded, but error creating order: " + orderError.message)
        setIsLoading(false)
        return
      }

      // 4. Add Order Items
      const orderItems = cart.map((c) => ({
        order_id: order.id,
        menu_item_id: c.item.id,
        quantity: c.quantity,
        price: c.item.price,
      }))
      
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      
      if (itemsError) {
         setMessage("Error creating order items: " + itemsError.message)
         setIsLoading(false)
         return
      }

      // 5. Notify n8n (Fire and forget)
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

      // 6. Success
      clearCart()
      router.push(`/orders/${order.id}`)
    } else {
      // Logic for processing or requires_action if "if_required" didn't cover it (automagic usually covers)
      // If we are here, it might be processing.
      setMessage("Payment status: " + paymentIntent?.status)
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
        <h2 className="text-2xl font-bold font-mono mb-6">PAYMENT DETAILS</h2>
        <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      </div>

      {message && <div className="text-red-500 font-bold font-mono">{message}</div>}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full border-2 border-foreground font-bold py-4 text-lg"
      >
        {isLoading ? "PROCESSING..." : "PAY & ORDER"}
      </Button>
    </form>
  )
}
