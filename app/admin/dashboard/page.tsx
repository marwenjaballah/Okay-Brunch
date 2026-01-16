"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  user_id: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0 })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // In production, verify admin role
    const fetchOrders = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

      setOrders(data || [])

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((o) => o.status === "pending").length || 0,
        delivered: data?.filter((o) => o.status === "delivered").length || 0,
      }
      setStats(stats)
      setLoading(false)
    }

    fetchOrders()
  }, [user, supabase, router])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-serif font-bold mb-12">ADMIN DASHBOARD</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { label: "TOTAL ORDERS", value: stats.total },
              { label: "PENDING", value: stats.pending },
              { label: "DELIVERED", value: stats.delivered },
            ].map((stat) => (
              <div key={stat.label} className="border-4 border-foreground p-8 text-center">
                <p className="text-sm font-bold font-mono text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-5xl font-mono font-bold text-primary">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Orders Table */}
          <div className="border-4 border-foreground overflow-hidden">
            <div className="bg-muted border-b-2 border-foreground p-6 grid grid-cols-5 gap-4 font-bold font-mono text-sm">
              <div>ORDER ID</div>
              <div>STATUS</div>
              <div>TOTAL</div>
              <div>DATE</div>
              <div>ACTIONS</div>
            </div>
            {orders.map((order) => (
              <div key={order.id} className="border-b border-foreground p-6 grid grid-cols-5 gap-4 items-center">
                <div className="font-mono text-sm">{order.id.slice(0, 8)}</div>
                <div className="font-mono font-bold">{order.status}</div>
                <div className="font-mono font-bold text-primary">${order.total_amount.toFixed(2)}</div>
                <div className="font-mono text-sm">{new Date(order.created_at).toLocaleDateString()}</div>
                <div className="flex gap-2">
                  {order.status !== "delivered" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "delivered")}
                      className="border border-foreground px-3 py-1 text-xs font-bold hover:bg-primary"
                    >
                      COMPLETE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
