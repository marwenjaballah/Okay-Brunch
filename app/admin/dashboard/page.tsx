"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// Header is now in the layout or we can keep it if we want distinct header, but Layout usually handles it or Sidebar. 
// Admin layout uses Sidebar, so we might not need the main Header if it replicates the user menu.
// However, the requested design might want a header. I'll keep it minimal or remove if redundant.
// Let's remove the main Header to rely on the Sidebar + minimal page header.
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner" // Assuming sonner is installed/used in project (saw it in package.json)

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  user_id: string
  delivery_address: string
  notes: string
  users?: {
    full_name: string
    email: string 
  }
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, delivered: 0 })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    // Middleware protects the route, but double check here or just fetch.
    if (!user) return

    const fetchOrders = async () => {
      // Join with users table to get name/email if possible.
      // Note: Supabase join requires foreign key setup which we have.
      const { data, error } = await supabase
        .from("orders")
        .select("*, users(full_name, email)")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        toast.error("Failed to fetch orders")
        return
      }

      // @ts-ignore - Supabase types might not auto-infer the join perfectly without generated types
      const typedData = data as Order[]

      setOrders(typedData || [])

      const stats = {
        total: typedData?.length || 0,
        pending: typedData?.filter((o) => o.status === "pending").length || 0,
        paid: typedData?.filter((o) => o.status === "paid").length || 0,
        delivered: typedData?.filter((o) => o.status === "delivered").length || 0,
      }
      setStats(stats)
      setLoading(false)
    }

    fetchOrders()
  }, [user, supabase])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
    
    if (error) {
        toast.error("Failed to update status")
        return
    }
    
    toast.success(`Order updated to ${newStatus}`)
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "secondary" // Gray/Default
      case "paid": return "default" // Black/Primary - indicating money received, ready to process
      case "processing": return "outline" // Outline
      case "delivered": return "secondary" 
      case "cancelled": return "destructive"
      default: return "outline"
    }
  }

  if (loading) {
     return <div className="p-8">Loading dashboard...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif font-bold">DASHBOARD</h1>
        <div className="flex gap-4">
            <div className="p-4 border-2 border-border bg-card">
                <p className="text-xs font-mono text-muted-foreground">REVENUE</p>
                <p className="text-2xl font-bold font-mono">
                    ${orders.filter(o => o.status !== 'cancelled').reduce((acc, curr) => acc + curr.total_amount, 0).toFixed(2)}
                </p>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="border-4 border-foreground p-6 bg-background">
          <p className="text-sm font-bold font-mono text-muted-foreground">TOTAL ORDERS</p>
          <p className="text-4xl font-mono font-bold mt-2">{stats.total}</p>
        </div>
        <div className="border-4 border-foreground p-6 bg-background">
          <p className="text-sm font-bold font-mono text-muted-foreground">PAID / TO PROCESS</p>
          <p className="text-4xl font-mono font-bold mt-2 text-green-600">{stats.paid}</p>
        </div>
        <div className="border-4 border-foreground p-6 bg-background">
           <p className="text-sm font-bold font-mono text-muted-foreground">DELIVERED</p>
           <p className="text-4xl font-mono font-bold mt-2">{stats.delivered}</p>
        </div>
         <div className="border-4 border-foreground p-6 bg-background">
           <p className="text-sm font-bold font-mono text-muted-foreground">PENDING (Unpaid)</p>
           <p className="text-4xl font-mono font-bold mt-2 text-yellow-600">{stats.pending}</p>
        </div>
      </div>

      <div className="border-4 border-foreground rounded-none overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="font-bold font-mono text-foreground">ORDER ID</TableHead>
              <TableHead className="font-bold font-mono text-foreground">CUSTOMER</TableHead>
              <TableHead className="font-bold font-mono text-foreground">STATUS</TableHead>
              <TableHead className="font-bold font-mono text-foreground">TOTAL</TableHead>
              <TableHead className="font-bold font-mono text-foreground">DATE</TableHead>
              <TableHead className="font-bold font-mono text-foreground text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-b-foreground/20">
                <TableCell className="font-mono">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>
                    <div className="font-bold">{order.users?.full_name || "Guest"}</div>
                    <div className="text-xs text-muted-foreground">{order.users?.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(order.status) as any} className="uppercase font-mono rounded-none">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono font-bold">${order.total_amount.toFixed(2)}</TableCell>
                <TableCell className="font-mono text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-2 border-foreground rounded-none">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "processing")}>
                        Mark Processing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")}>
                        Mark Delivered
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "cancelled")} className="text-destructive">
                        Cancel Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

