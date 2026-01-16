"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useCartStore } from "@/lib/cart-store"



export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [mounted, setMounted] = useState(false)
  const [savedProfile, setSavedProfile] = useState<any>(null)
  const { user, loading: authLoading } = useAuth()
  const supabase = getSupabaseClient()
  const router = useRouter()

  // Use Zustand store for cart management
  const { cart, clearCart, getTotal } = useCartStore()
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

    // Fetch profile
    const fetchProfile = async () => {
      const { data } = await supabase.from("users").select("*").eq("id", user.id).single()
      if (data) {
        setSavedProfile(data)
      }
    }

    fetchProfile()
  }, [user, authLoading, router, supabase])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!user) return

    // Ensure user exists in users table (upsert)
    const { error: userError } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          phone: phone,
        },
        {
          onConflict: "id",
        }
      )

    if (userError) {
      alert("Error setting up user: " + userError.message)
      setLoading(false)
      return
    }

    // Create order
    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          status: "pending",
          total_amount: total,
          delivery_address: address,
          notes: phone,
        },
      ])
      .select()
      .single()

    if (error) {
      alert("Error creating order: " + error.message)
      setLoading(false)
      return
    }

    // Add order items
    const orderItems = cart.map((c) => ({
      order_id: order.id,
      menu_item_id: c.item.id,
      quantity: c.quantity,
      price: c.item.price,
    }))

    await supabase.from("order_items").insert(orderItems)

    // Clear cart using Zustand store
    clearCart()
    router.push(`/orders/${order.id}`)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-serif font-bold mb-12">CHECKOUT</h1>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <form onSubmit={handleCheckout} className="space-y-8">
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold font-mono mb-2">PHONE</label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="border-2 border-foreground w-full px-4 py-3"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full border-2 border-foreground font-bold py-4 text-lg"
                >
                  {loading ? "PROCESSING..." : "PLACE ORDER"}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="border-4 border-foreground p-8 h-fit">
              <h2 className="text-2xl font-bold font-mono mb-6">ORDER SUMMARY</h2>
              <div className="space-y-4 mb-8">
                {!mounted || cart.length === 0 ? (
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
