"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/components/auth/auth-provider"
import { useCartStore } from "@/hooks/use-cart-store"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { PaymentForm } from "@/components/checkout/payment-form"

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("")
  const [mounted, setMounted] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Use Zustand store for cart management
  const { cart, getTotal } = useCartStore()
  const total = mounted ? getTotal() : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/auth/login")
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (mounted && cart.length > 0) {
      // Create PaymentIntent as soon as the page loads
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We pass items to calculate total on backend. 
        // Note: In a real app we might pass IDs and fetch prices from DB.
        body: JSON.stringify({ items: cart }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
    }
  }, [mounted, cart])

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#000000',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (!mounted || authLoading) return null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-serif font-bold mb-12">CHECKOUT</h1>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              {clientSecret && user ? (
                <Elements options={options} stripe={stripePromise}>
                  <PaymentForm user={user} total={total} />
                </Elements>
              ) : (
                <div className="border-4 border-foreground p-8 text-center font-mono">
                  {cart.length === 0 ? "Your cart is empty." : "Loading payment details..."}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-4 border-foreground p-8 h-fit">
              <h2 className="text-2xl font-bold font-mono mb-6">ORDER SUMMARY</h2>
              <div className="space-y-4 mb-8">
                {cart.length === 0 ? (
                  <p className="font-mono text-muted-foreground">No items in cart</p>
                ) : (
                  cart.map((c) => (
                    <div key={c.item.id} className="flex justify-between border-b border-foreground pb-2">
                      <span className="font-mono">
                        {c.item.name} x{c.quantity}
                      </span>
                      <span className="font-mono font-bold">${(c.item.price * c.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t-2 border-foreground pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-mono font-bold">TOTAL:</p>
                  <p className="text-2xl font-mono font-bold text-primary">${total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
