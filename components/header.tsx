"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"
import { CartDropdown } from "@/components/checkout/cart-dropdown"

export function Header() {
  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: "/menu", label: "MENU" },
    { href: "/goodies", label: "GOODIES" },
  ]

  const userLinks = [
    { href: "/orders", label: "ORDERS" },
    { href: "/account", label: "ACCOUNT" },
  ]

  return (
    <header className="border-b-4 border-foreground bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold font-serif hover:text-primary transition-colors">
          OKAY BRUNCH
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-mono font-bold transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : ""
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {user && userLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-mono font-bold transition-colors hover:text-primary ${isActive(link.href) ? "text-primary" : ""
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 border-l-4 border-foreground pl-8">
            <CartDropdown />

            {user ? (
              <Button onClick={handleLogout} variant="default" className="border-2 border-foreground font-bold hover:bg-primary hover:text-primary-foreground transition-all rounded-none hidden sm:flex h-12 px-6">
                LOGOUT
              </Button>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="border-2 border-foreground font-bold bg-transparent hover:bg-foreground hover:text-background transition-all rounded-none h-12 px-6">
                    LOGIN
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="border-2 border-foreground font-bold hover:bg-primary hover:text-primary-foreground transition-all rounded-none h-12 px-6">SIGNUP</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
