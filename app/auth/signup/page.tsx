"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // User profile creation is now handled by the database trigger: 
    // scripts/12-add-user-trigger.sql
    // This avoids RLS issues before email confirmation.

    router.push("/auth/confirmation")
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-md mx-auto border-4 border-foreground p-12">
          <h1 className="text-4xl font-serif font-bold mb-8">SIGNUP</h1>

          {error && (
            <div className="border-2 border-destructive bg-background p-4 mb-6">
              <p className="text-destructive font-mono font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
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
            <div>
              <label className="block text-sm font-bold font-mono mb-2">CONFIRM PASSWORD</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-2 border-foreground w-full px-4 py-2"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full border-2 border-foreground font-bold py-3">
              {loading ? "SIGNING UP..." : "SIGNUP"}
            </Button>
          </form>

          <p className="text-center mt-6 font-mono">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">
              LOGIN
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
