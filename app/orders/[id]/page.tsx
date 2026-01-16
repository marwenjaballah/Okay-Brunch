"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  delivery_address: string
  notes: string
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  menu_items: { name: string }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchOrder = async () => {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (orderData) {
        setOrder(orderData)

        const { data: itemsData } = await supabase
          .from("order_items")
          .select("id, quantity, price, menu_items(name)")
          .eq("order_id", id)

        setItems(itemsData || [])
      }

      setLoading(false)
    }

    fetchOrder()
  }, [user, id, supabase, router])

  if (loading)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-24">
          <p className="text-xl font-mono text-center">Loading...</p>
        </main>
      </>
    )

  if (!order)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-24">
          <p className="text-xl font-mono text-center">Order not found</p>
        </main>
      </>
    )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => router.back()} className="font-mono font-bold mb-6 hover:text-primary">
            ← BACK
          </button>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <h1 className="text-5xl font-serif font-bold mb-12">ORDER #{order.id.slice(0, 8)}</h1>

              <div className="border-4 border-foreground p-8 mb-8">
                <h2 className="text-2xl font-bold font-mono mb-6">ORDER DETAILS</h2>
                <div className="space-y-4 font-mono">
                  <div>
                    <p className="text-sm text-muted-foreground">ORDERED</p>
                    <p className="font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">STATUS</p>
                    <p className="font-bold uppercase">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">DELIVERY ADDRESS</p>
                    <p className="font-bold">{order.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PHONE</p>
                    <p className="font-bold">{order.notes}</p>
                  </div>
                </div>
              </div>

              <div className="border-4 border-foreground p-8">
                <h2 className="text-2xl font-bold font-mono mb-6">ITEMS</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between border-b border-foreground pb-4">
                      <div>
                        <p className="font-mono font-bold">{item.menu_items.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-4 border-foreground p-8 h-fit">
              <h2 className="text-2xl font-bold font-mono mb-6">TOTAL</h2>
              <p className="text-4xl font-mono font-bold text-primary mb-8">${order.total_amount.toFixed(2)}</p>
              <Button className="w-full border-2 border-foreground font-bold py-3">TRACK ORDER</Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
