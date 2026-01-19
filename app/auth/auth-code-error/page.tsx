import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-md mx-auto border-4 border-foreground p-12 text-center">
          <h1 className="text-4xl font-serif font-bold mb-6 text-destructive">AUTH ERROR</h1>
          <p className="text-lg font-mono mb-8">
            There was an error verifying your email code. Please try signing in again or contact support.
          </p>
          <div className="space-y-4">
            <Link href="/auth/login" className="block">
              <Button className="w-full border-2 border-foreground font-bold">BACK TO LOGIN</Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-2 border-foreground font-bold">
                HOME
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
