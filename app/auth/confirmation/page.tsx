import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"

export default function ConfirmationPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-24">
        <div className="max-w-md mx-auto border-4 border-foreground p-12 text-center">
          <h1 className="text-4xl font-serif font-bold mb-6">VERIFY YOUR EMAIL</h1>
          <p className="text-lg font-mono mb-8">
            Check your email for a confirmation link. Click it to complete signup.
          </p>
          <Link href="/">
            <Button className="border-2 border-foreground font-bold">BACK HOME</Button>
          </Link>
        </div>
      </main>
    </>
  )
}
