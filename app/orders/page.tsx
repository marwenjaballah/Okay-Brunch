"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Order {
  id: string
  total_amount: number
  status: string
  payment_status: "paid" | "unpaid" | "refunded"
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }

    fetchOrders()
  }, [user, supabase, router])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-serif font-bold mb-12">MY ORDERS</h1>

          {loading ? (
            <p className="text-xl font-mono">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="border-4 border-foreground p-12 text-center">
              <p className="text-xl font-mono mb-6">No orders yet</p>
              <Link href="/menu">
                <button className="border-2 border-foreground px-6 py-3 font-bold">START SHOPPING</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="border-4 border-foreground p-8 bg-card hover:bg-muted transition-colors cursor-pointer group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-bold text-xs text-muted-foreground uppercase mb-1">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-2xl font-serif font-bold group-hover:text-primary transition-colors">
                          {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-mono font-bold text-primary">${order.total_amount.toFixed(2)}</p>
                        <div className="flex gap-2 justify-end mt-4">
                          <span className={`px-3 py-1 text-xs font-mono font-bold border-2 border-foreground uppercase ${order.status === "delivered" ? "bg-green-100 text-green-800" :
                            order.status === "cancelled" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                            {order.status}
                          </span>
                          <span className={`px-3 py-1 text-xs font-mono font-bold border-2 border-foreground uppercase ${order.payment_status === "paid" ? "bg-green-600 text-white" :
                              order.payment_status === "refunded" ? "bg-orange-600 text-white border-orange-700" :
                                "bg-foreground text-background"
                            }`}>
                            {order.payment_status || 'unpaid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
