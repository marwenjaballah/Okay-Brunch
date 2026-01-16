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
        .eq("user_id", user.id)
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
              <Link href="/shop">
                <button className="border-2 border-foreground px-6 py-3 font-bold">START SHOPPING</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="border-2 border-foreground p-6 hover:bg-muted cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-bold text-sm text-muted-foreground">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-lg font-serif font-bold mt-2">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-mono font-bold text-primary">${order.total_amount.toFixed(2)}</p>
                        <p
                          className={`font-mono font-bold mt-2 ${order.status === "delivered"
                              ? "text-green-600"
                              : order.status === "cancelled"
                                ? "text-destructive"
                                : "text-accent"
                            }`}
                        >
                          {order.status.toUpperCase()}
                        </p>
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
