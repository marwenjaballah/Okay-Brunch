"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (user) {
      // Check user role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData?.role === 'admin') {
        router.push("/admin/dashboard")
      } else {
        router.push("/account")
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-md mx-auto border-4 border-foreground p-12">
          <h1 className="text-4xl font-serif font-bold mb-8">LOGIN</h1>

          {error && (
            <div className="border-2 border-destructive bg-background p-4 mb-6">
              <p className="text-destructive font-mono font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold font-mono mb-2">EMAIL</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-foreground w-full px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold font-mono mb-2">PASSWORD</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-foreground w-full px-4 py-2"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full border-2 border-foreground font-bold py-3">
              {loading ? "LOGGING IN..." : "LOGIN"}
            </Button>
          </form>

          <p className="text-center mt-6 font-mono">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-bold text-primary hover:underline">
              SIGNUP
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
