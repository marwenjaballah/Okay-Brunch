"use client"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/hooks/use-cart-store"
import { MenuItem } from "@/types"
import { toast } from "sonner"
import Image from "next/image"

export function MenuItemCard({ item }: { item: MenuItem }) {
    const { addToCart } = useCartStore()

    const handleAdd = () => {
        addToCart(item)
        toast.success(`${item.name} added to cart`)
    }

    return (
        <div className="border-4 border-foreground bg-card hover:bg-muted/10 transition-all group overflow-hidden flex flex-col">
            <div className="aspect-[16/9] relative bg-muted border-b-4 border-foreground overflow-hidden">
                <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-2xl font-bold font-mono uppercase group-hover:text-primary transition-colors">{item.name}</h3>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{item.category}</p>
                    </div>
                    <p className="text-2xl font-bold font-mono text-primary">${item.price}</p>
                </div>
                <p className="text-sm font-sans text-muted-foreground mb-8 leading-relaxed flex-1">{item.description}</p>
                <Button
                    onClick={handleAdd}
                    className="w-full border-2 border-foreground font-bold py-6 text-lg tracking-widest uppercase hover:bg-foreground hover:text-background"
                >
                    ADD TO CART
                </Button>
            </div>
        </div>
    )
}

