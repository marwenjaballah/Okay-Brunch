"use client"

import { useCartStore } from "@/hooks/use-cart-store"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export function CartDropdown() {
    const { cart, removeFromCart, updateQuantity, getTotal } = useCartStore()
    const total = getTotal()
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground h-12 w-12 rounded-none">
                    <ShoppingBag className="h-6 w-6" />
                    {itemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground font-mono font-bold border-2 border-foreground rounded-none text-[10px]">
                            {itemCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 border-4 border-foreground rounded-none bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[100]" align="end" sideOffset={8}>
                <div className="p-6 border-b-4 border-foreground bg-muted/30">
                    <h3 className="text-2xl font-serif font-bold uppercase tracking-tight">YOUR BAG</h3>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="py-12 text-center">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <p className="font-mono text-muted-foreground uppercase text-sm">Your bag is empty</p>
                        </div>
                    ) : (
                        cart.map((c) => (
                            <div key={c.item.id} className="flex gap-4 group">
                                <div className="relative h-20 w-20 border-2 border-foreground overflow-hidden bg-muted flex-shrink-0">
                                    <Image
                                        src={c.item.image_url || "/placeholder.svg"}
                                        alt={c.item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold font-mono uppercase text-sm truncate">{c.item.name}</h4>
                                        <button
                                            onClick={() => removeFromCart(c.item.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs font-mono text-muted-foreground mb-3">${c.item.price.toFixed(2)}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border-2 border-foreground">
                                            <button
                                                onClick={() => updateQuantity(c.item.id, c.quantity - 1)}
                                                className="p-1 hover:bg-muted transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center font-mono font-bold text-xs">{c.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(c.item.id, c.quantity + 1)}
                                                className="p-1 hover:bg-muted transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t-4 border-foreground bg-muted/10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-mono font-bold uppercase text-sm">Total</span>
                            <span className="text-2xl font-bold font-mono text-primary">${total.toFixed(2)}</span>
                        </div>
                        <Link href="/checkout" className="block">
                            <Button className="w-full border-2 border-foreground font-bold py-6 text-lg tracking-widest uppercase hover:bg-foreground hover:text-background transition-all rounded-none">
                                PROCEED TO CHECKOUT
                            </Button>
                        </Link>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
