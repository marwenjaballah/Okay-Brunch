"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useCartStore } from "@/hooks/use-cart-store"
import { MenuItem } from "@/types"



export default function ShopPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  // Use Zustand store for cart management
  const { cart, addToCart, removeFromCart, updateQuantity, getTotal } = useCartStore()
  const total = getTotal()

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from("menu_items").select("*").order("category")
      setItems(data || [])
      setLoading(false)
    }
    fetchItems()
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Menu Items */}
            <div className="md:col-span-2">
              <h1 className="text-6xl font-serif font-bold mb-16">SHOP</h1>
              {loading ? (
                <p className="text-xl font-mono">Loading menu...</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="border-2 border-foreground p-6 flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold font-mono mb-2">{item.name}</h3>
                        <p className="text-lg font-sans mb-2">{item.description}</p>
                        <p className="text-sm font-mono text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <p className="text-2xl font-bold font-mono text-primary">${item.price}</p>
                        <Button onClick={() => addToCart(item)} className="border-2 border-foreground font-bold">
                          ADD TO CART
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            <div className="border-4 border-foreground p-8 h-fit sticky top-4">
              <h2 className="text-3xl font-serif font-bold mb-8">CART</h2>
              <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-lg font-mono text-muted-foreground">Your cart is empty</p>
                ) : (
                  cart.map((c) => (
                    <div key={c.item.id} className="border-b-2 border-foreground pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold font-mono">{c.item.name}</h4>
                        <button onClick={() => removeFromCart(c.item.id)} className="text-destructive font-bold">
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => updateQuantity(c.item.id, c.quantity - 1)}
                          className="border border-foreground px-2 font-bold"
                        >
                          −
                        </button>
                        <span className="font-mono font-bold">{c.quantity}</span>
                        <button
                          onClick={() => updateQuantity(c.item.id, c.quantity + 1)}
                          className="border border-foreground px-2 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-right font-mono font-bold">${(c.item.price * c.quantity).toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <>
                  <div className="border-t-2 border-foreground pt-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-mono font-bold">TOTAL:</p>
                      <p className="text-2xl font-mono font-bold text-primary">${total.toFixed(2)}</p>
                    </div>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full border-2 border-foreground font-bold py-3">CHECKOUT</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
