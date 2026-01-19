
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// Note: I might need a specific AdminSidebar. For now, reusing AppSidebar or I'll create a local one if AppSidebar is too customer-specific.
// Let's create a custom admin sidebar structure here or inline it.
// To keep it clean and robust, I'll assume AppSidebar is properly modular or I'll just build a simple sidebar here.
// Given the "different ui" request, I'll build a specific simple sidebar for admin.

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Home, Package, Users, Settings, LogOut } from "lucide-react"
import Link from "next/link"

import { getSupabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect("/account")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 w-full">
          <div className="p-4">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <h2 className="text-xl font-bold font-serif">ADMIN PANEL</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/inventory">
                  <Package className="mr-2 h-4 w-4" />
                  <span>Inventory</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="#">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Users (Coming Soon)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Exit Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
