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
  payment_status: "paid" | "unpaid" | "refunded"
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
          <button onClick={() => router.back()} className="font-mono font-bold mb-6 hover:text-primary transition-colors flex items-center gap-2">
            <span className="text-xl">←</span> BACK TO ORDERS
          </button>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <h1 className="text-5xl font-serif font-bold mb-12 uppercase tracking-tighter">ORDER #{order.id.slice(0, 8)}</h1>

              <div className="border-4 border-foreground p-8 mb-8 bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-bold font-mono mb-8 uppercase border-b-2 border-foreground pb-4">ORDER SUMMARY</h2>
                <div className="space-y-6 font-mono">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Date Placed</p>
                    <p className="font-bold">{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Order Status</p>
                    <span className={`px-4 py-1 text-xs font-bold border-2 border-foreground uppercase ${order.status === "delivered" ? "bg-green-100 text-green-800" :
                      order.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Payment Status</p>
                    <span className={`px-4 py-1 text-xs font-bold border-2 border-foreground uppercase ${order.payment_status === "paid" ? "bg-green-600 text-white" :
                        order.payment_status === "refunded" ? "bg-orange-600 text-white border-orange-700" :
                          "bg-foreground text-background"
                      }`}
                    >
                      {order.payment_status || 'unpaid'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-foreground/10">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Delivery Address</p>
                    <p className="font-bold">{order.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Contact Phone</p>
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
