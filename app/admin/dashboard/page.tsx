"use client"

import { useEffect, useState, useMemo } from "react"
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
import { MoreHorizontal, AlertCircle, RotateCcw, Search } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Order {
  id: string
  total_amount: number
  status: string
  payment_status: "paid" | "unpaid" | "refunded"
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
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmingAction, setConfirmingAction] = useState<{
    orderId: string;
    type: 'reject' | 'restore';
    targetStatus?: string;
  } | null>(null)
  const { user } = useAuth()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, users(full_name, email)")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        toast.error("Failed to fetch orders")
        return
      }

      setOrders((data as Order[]) || [])
      setLoading(false)
    }

    fetchOrders()
  }, [user, supabase])

  const stats = useMemo(() => {
    return {
      total: orders.length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      unpaid: orders.filter((o) => o.payment_status === "unpaid").length,
      shipped: orders.filter((o) => o.status === "out_for_delivery").length,
    }
  }, [orders])

  const revenue = useMemo(() => {
    return orders
      .filter((o) => o.payment_status === "paid" && o.status !== "cancelled")
      .reduce((acc, curr) => acc + curr.total_amount, 0)
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders
    const query = searchQuery.toLowerCase()
    return orders.filter((o) =>
      o.id.toLowerCase().includes(query) ||
      o.users?.full_name?.toLowerCase().includes(query) ||
      o.users?.email?.toLowerCase().includes(query)
    )
  }, [orders, searchQuery])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
    if (error) {
      toast.error("Failed to update status")
      return
    }
    toast.success(`Order updated to ${newStatus}`)
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
  }

  const markAsPaid = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: 'paid' }).eq("id", orderId)
    if (error) {
      toast.error("Failed to update payment status")
      return
    }
    toast.success("Order marked as paid")
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, payment_status: 'paid' } : o)))
  }

  const markAsUnpaid = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: 'unpaid' }).eq("id", orderId)
    if (error) {
      toast.error("Failed to update payment status")
      return
    }
    toast.success("Order marked as unpaid")
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, payment_status: 'unpaid' } : o)))
  }

  const markAsRefunded = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: 'refunded' }).eq("id", orderId)
    if (error) {
      toast.error("Failed to update payment status")
      return
    }
    toast.success("Order marked as refunded")
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, payment_status: 'refunded' } : o)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-zinc-100 text-zinc-800 border-zinc-200"
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200"
      case "preparing": return "bg-orange-100 text-orange-800 border-orange-200"
      case "ready": return "bg-purple-100 text-purple-800 border-purple-200"
      case "out_for_delivery": return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "delivered": return "bg-green-100 text-green-800 border-green-200"
      case "cancelled": return "bg-red-100 text-red-800 border-red-200"
      default: return "outline"
    }
  }

  const getFriendlyStatus = (status: string) => {
    switch (status) {
      case "pending": return "Waiting Confirmation"
      case "confirmed": return "Accepted"
      case "preparing": return "Cooking"
      case "ready": return "Ready to Ship"
      case "out_for_delivery": return "On the Way"
      case "delivered": return "Completed"
      case "cancelled": return "Rejected"
      default: return status
    }
  }

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif font-bold tracking-tight">DASHBOARD</h1>
        <div className="flex gap-4">
          <div className="px-6 py-4 border-4 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-mono font-bold text-muted-foreground uppercase">Revenue (Paid)</p>
            <p className="text-2xl font-bold font-mono">
              ${revenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="border-4 border-foreground p-6 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-bold font-mono text-muted-foreground uppercase">Total Orders</p>
          <p className="text-4xl font-mono font-bold mt-2">{stats.total}</p>
        </div>
        <div className="border-4 border-foreground p-6 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-bold font-mono text-muted-foreground uppercase">In Kitchen</p>
          <p className="text-4xl font-mono font-bold mt-2 text-orange-600">{stats.preparing}</p>
        </div>
        <div className="border-4 border-foreground p-6 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-bold font-mono text-muted-foreground uppercase">Unpaid</p>
          <p className="text-4xl font-mono font-bold mt-2 text-red-600">{stats.unpaid}</p>
        </div>
        <div className="border-4 border-foreground p-6 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-bold font-mono text-muted-foreground uppercase">Shipped</p>
          <p className="text-4xl font-mono font-bold mt-2 text-indigo-600">{stats.shipped}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="SEARCH BY ORDER ID OR CUSTOMER..."
          className="h-14 pl-12 border-4 border-foreground rounded-none font-mono font-bold focus-visible:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border-4 border-foreground rounded-none overflow-hidden bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <Table>
          <TableHeader className="bg-muted/50 border-b-4 border-foreground">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold font-mono text-foreground h-14">ORDER ID</TableHead>
              <TableHead className="font-bold font-mono text-foreground h-14">CUSTOMER</TableHead>
              <TableHead className="font-bold font-mono text-foreground h-14">STAGE</TableHead>
              <TableHead className="font-bold font-mono text-foreground h-14">PAYMENT</TableHead>
              <TableHead className="font-bold font-mono text-foreground h-14">TOTAL</TableHead>
              <TableHead className="font-bold font-mono text-foreground h-14 text-right pr-8">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="border-b-2 border-foreground/10 hover:bg-muted/5 whitespace-nowrap">
                <TableCell className="font-mono font-bold">#{order.id.slice(0, 8)}</TableCell>
                <TableCell>
                  <div className="font-bold uppercase text-sm leading-tight">{order.users?.full_name || "Guest"}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{order.users?.email}</div>
                </TableCell>
                <TableCell>
                  <Badge className={`uppercase font-mono rounded-none border-2 ${getStatusColor(order.status)}`}>
                    {getFriendlyStatus(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`uppercase font-mono rounded-none border-2 ${order.payment_status === "paid" ? "bg-green-600 text-white border-green-700" :
                      order.payment_status === "refunded" ? "bg-orange-600 text-white border-orange-700" :
                        "bg-red-600 text-white border-red-700"
                      }`}
                  >
                    {order.payment_status || 'unpaid'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono font-bold text-lg">${order.total_amount.toFixed(2)}</TableCell>
                <TableCell className="text-right pr-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 p-0 border-2 border-transparent hover:border-foreground rounded-none transition-all">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-4 border-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 min-w-[200px]">
                      <DropdownMenuLabel className="font-mono uppercase font-bold text-xs mb-2 text-muted-foreground px-2">Update Stage</DropdownMenuLabel>

                      {order.status === "pending" && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "confirmed")} className="font-mono cursor-pointer font-bold focus:bg-blue-600 focus:text-white">
                          CONFIRM ORDER
                        </DropdownMenuItem>
                      )}

                      {order.status === "confirmed" && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "preparing")} className="font-mono cursor-pointer font-bold focus:bg-orange-600 focus:text-white">
                          START COOKING
                        </DropdownMenuItem>
                      )}

                      {order.status === "preparing" && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "ready")} className="font-mono cursor-pointer font-bold focus:bg-purple-600 focus:text-white">
                          READY FOR SHIP
                        </DropdownMenuItem>
                      )}

                      {order.status === "ready" && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "out_for_delivery")} className="font-mono cursor-pointer font-bold focus:bg-indigo-600 focus:text-white">
                          SHIP ORDER
                        </DropdownMenuItem>
                      )}

                      {order.status === "out_for_delivery" && order.payment_status === 'paid' && (
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")} className="font-mono cursor-pointer font-bold focus:bg-green-600 focus:text-white">
                          DELIVERED
                        </DropdownMenuItem>
                      )}

                      {order.status === "out_for_delivery" && order.payment_status !== 'paid' && (
                        <DropdownMenuItem disabled className="font-mono opacity-50 cursor-not-allowed">
                          WAITING FOR PAYMENT
                        </DropdownMenuItem>
                      )}

                      <div className="h-px bg-foreground/10 my-2" />

                      {order.status !== 'cancelled' && order.payment_status === 'unpaid' && (
                        <DropdownMenuItem onClick={() => markAsPaid(order.id)} className="font-mono cursor-pointer text-green-600 font-bold focus:bg-green-600 focus:text-white">
                          COLLECT PAYMENT
                        </DropdownMenuItem>
                      )}

                      {order.status === 'cancelled' && order.payment_status === 'paid' && (
                        <DropdownMenuItem onClick={() => markAsRefunded(order.id)} className="font-mono cursor-pointer text-orange-600 font-bold focus:bg-orange-600 focus:text-white">
                          REFUND (MARK AS REFUNDED)
                        </DropdownMenuItem>
                      )}

                      {order.status === 'cancelled' && order.payment_status === 'unpaid' && (
                        <DropdownMenuItem disabled className="font-mono opacity-50 cursor-not-allowed">
                          CANNOT PAY REJECTED ORDER
                        </DropdownMenuItem>
                      )}

                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <DropdownMenuItem
                          onClick={() => setConfirmingAction({ orderId: order.id, type: 'reject' })}
                          className="font-mono cursor-pointer text-red-600 font-bold focus:bg-red-600 focus:text-white"
                        >
                          REJECT ORDER
                        </DropdownMenuItem>
                      )}

                      {order.status === "cancelled" && (
                        <DropdownMenuItem
                          onClick={() => setConfirmingAction({ orderId: order.id, type: 'restore' })}
                          className="font-mono cursor-pointer font-bold focus:bg-zinc-600 focus:text-white"
                        >
                          RESTORE ORDER
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!confirmingAction} onOpenChange={(open) => !open && setConfirmingAction(null)}>
        <AlertDialogContent className="border-4 border-foreground rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              {confirmingAction?.type === 'reject' ? (
                <>
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  Confirm Rejection
                </>
              ) : (
                <>
                  <RotateCcw className="h-6 w-6 text-zinc-600" />
                  Restore Order
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-sm">
              {confirmingAction?.type === 'reject'
                ? "Are you absolutely sure you want to reject this order? This will stop the workflow and notify the customer."
                : "This will move the order back to 'Waiting Confirmation'. Are you sure you want to restore it?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-foreground rounded-none font-bold font-mono">CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmingAction) return
                if (confirmingAction.type === 'reject') {
                  updateOrderStatus(confirmingAction.orderId, "cancelled")
                } else {
                  updateOrderStatus(confirmingAction.orderId, "pending")
                }
                setConfirmingAction(null)
              }}
              className={`border-2 border-foreground rounded-none font-bold font-mono ${confirmingAction?.type === 'reject'
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-foreground text-background hover:bg-zinc-800"
                }`}
            >
              CONFIRM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

