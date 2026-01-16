import { Header } from "@/components/header"
import { getSupabaseServer } from "@/lib/supabase/server"

export const metadata = {
  title: "Menu - Okay Brunch",
  description: "Browse our premium brunch menu",
}

export default async function MenuPage() {
  const supabase = await getSupabaseServer()

  const { data: items } = await supabase.from("menu_items").select("*").order("category")

  const categories = [...new Set(items?.map((item) => item.category) || [])]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <h1 className="text-6xl font-serif font-bold mb-4">OUR MENU</h1>
          <p className="text-xl font-mono mb-16">Crafted with premium ingredients</p>

          {categories.map((category) => (
            <section key={category} className="mb-16 border-b-4 border-foreground pb-16">
              <h2 className="text-4xl font-serif font-bold mb-8 uppercase">{category}</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {items
                  ?.filter((item) => item.category === category)
                  .map((item) => (
                    <div key={item.id} className="border-2 border-foreground p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold font-mono">{item.name}</h3>
                        <p className="text-2xl font-bold font-mono text-primary">${item.price}</p>
                      </div>
                      <p className="text-lg font-sans text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
