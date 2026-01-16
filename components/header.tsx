"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"

export function Header() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="border-b-4 border-foreground bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold font-serif">
          OKAY BRUNCH
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/menu" className="text-lg font-mono font-bold hover:text-primary">
            MENU
          </Link>
          <Link href="/shop" className="text-lg font-mono font-bold hover:text-primary">
            SHOP
          </Link>
          {user ? (
            <>
              <Link href="/orders" className="text-lg font-mono font-bold hover:text-primary">
                ORDERS
              </Link>
              <Link href="/account" className="text-lg font-mono font-bold hover:text-primary">
                ACCOUNT
              </Link>
              <Button onClick={handleLogout} variant="default" className="border-2 border-foreground font-bold">
                LOGOUT
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" className="border-2 border-foreground font-bold bg-transparent">
                  LOGIN
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="border-2 border-foreground font-bold">SIGNUP</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
