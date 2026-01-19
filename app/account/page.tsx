"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"

import { toast } from "sonner"

export default function AccountPage() {
  const [profile, setProfile] = useState({ full_name: "", phone: "", address: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const supabase = getSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", JSON.stringify(error, null, 2))
          toast.error("Failed to load profile settings")
        }

        if (data) {
          setProfile(data)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        toast.error("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, authLoading, supabase, router])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from("users").upsert({
      id: user?.id,
      email: user?.email,
      ...profile,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving profile:", JSON.stringify(error, null, 2))
      toast.error("Failed to update profile")
    } else {
      toast.success("Profile updated successfully")
    }
    setSaving(false)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-5xl font-serif font-bold mb-12">MY ACCOUNT</h1>

          {loading ? (
            <p className="text-xl font-mono">Loading...</p>
          ) : (
            <div className="border-4 border-foreground p-12">
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-bold font-mono text-muted-foreground mb-2">EMAIL</p>
                  <p className="text-lg font-mono">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold font-mono mb-2">FULL NAME</label>
                  <Input
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="border-2 border-foreground w-full px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold font-mono mb-2">PHONE</label>
                  <Input
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="border-2 border-foreground w-full px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold font-mono mb-2">ADDRESS</label>
                  <Input
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="border-2 border-foreground w-full px-4 py-3"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full border-2 border-foreground font-bold py-3"
                >
                  {saving ? "SAVING..." : "SAVE PROFILE"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
