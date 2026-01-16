import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Okay Brunch - Premium Brunch Experience",
  description: "Premium brunch restaurant with online ordering and delivery",
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 border-b-4 border-foreground">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-7xl font-serif font-bold mb-6 leading-tight">BRUNCH REIMAGINED</h1>
              <p className="text-xl font-mono mb-8 leading-relaxed">
                Exceptional ingredients. Bold flavors. Pure brunch energy. Experience the art of morning dining at Okay
                Brunch.
              </p>
              <div className="flex gap-4">
                <Link href="/menu">
                  <Button className="px-8 py-6 text-lg font-bold border-2 border-foreground">EXPLORE MENU</Button>
                </Link>
                <Link href="/shop">
                  <Button
                    variant="outline"
                    className="px-8 py-6 text-lg font-bold border-2 border-foreground bg-transparent"
                  >
                    ORDER NOW
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-secondary border-4 border-foreground p-12 aspect-square flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl font-bold text-foreground font-serif">BRUNCH</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 border-b-4 border-foreground">
          <h2 className="text-5xl font-serif font-bold mb-16">WHY OKAY BRUNCH</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "PREMIUM INGREDIENTS", desc: "Sourced from local, organic producers" },
              { title: "BOLD FLAVORS", desc: "Creative dishes that push boundaries" },
              { title: "FAST DELIVERY", desc: "Hot, fresh food delivered to your door" },
            ].map((item) => (
              <div key={item.title} className="border-4 border-foreground p-8 bg-card">
                <h3 className="text-2xl font-bold font-mono mb-4">{item.title}</h3>
                <p className="text-lg font-sans">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="border-4 border-foreground bg-primary p-16 text-center">
            <h2 className="text-5xl font-serif font-bold mb-6 text-primary-foreground">READY TO BRUNCH?</h2>
            <p className="text-xl font-mono mb-8 text-primary-foreground">Order your next brunch experience</p>
            <Link href="/shop">
              <Button className="px-8 py-6 text-lg font-bold border-2 border-primary-foreground bg-primary-foreground text-foreground hover:bg-secondary">
                ORDER NOW
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-foreground bg-muted py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-mono font-bold">© 2025 Okay Brunch. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
