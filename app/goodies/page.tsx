"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useCartStore } from "@/hooks/use-cart-store"
import { MenuItem } from "@/types"

export default function GoodiesPage() {
    const [items, setItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = getSupabaseClient()

    const { addToCart } = useCartStore()

    useEffect(() => {
        const fetchItems = async () => {
            const { data } = await supabase
                .from("items")
                .select("*")
                .eq("category", "Goodies")
                .order("name")
            setItems(data || [])
            setLoading(false)
        }
        fetchItems()
    }, [supabase])

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 py-24">
                    <h1 className="text-7xl font-serif font-bold mb-4 uppercase tracking-tighter">THE GOODIES</h1>
                    <p className="text-xl font-mono mb-20 text-muted-foreground uppercase tracking-widest">Premium merch for brunch lovers</p>

                    {loading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 animate-pulse">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-[500px] border-4 border-foreground bg-muted/20" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
                            {items.map((item) => (
                                <div key={item.id} className="border-4 border-foreground overflow-hidden bg-card flex flex-col group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                                    <div className="aspect-square relative bg-muted border-b-4 border-foreground overflow-hidden">
                                        <Image
                                            src={item.image_url || "/placeholder.svg"}
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <h3 className="text-2xl font-bold font-mono uppercase group-hover:text-primary transition-colors">{item.name}</h3>
                                            <p className="text-2xl font-bold font-mono text-primary">${item.price}</p>
                                        </div>
                                        <p className="text-base font-sans mb-8 text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-none">{item.description}</p>
                                        <Button
                                            onClick={() => addToCart(item)}
                                            className="mt-auto border-2 border-foreground font-bold py-6 text-lg tracking-widest uppercase hover:bg-foreground hover:text-background transition-all rounded-none"
                                        >
                                            ADD TO BAG
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
