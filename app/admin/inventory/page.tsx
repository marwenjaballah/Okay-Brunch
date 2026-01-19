"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { MenuItem } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ProductForm } from "@/components/admin/product-form"
import { toast } from "sonner"
import Image from "next/image"
import { getStoragePathFromUrl } from "@/lib/supabase/storage-utils"

export default function InventoryPage() {
    const [items, setItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const supabase = getSupabaseClient()

    const fetchItems = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("items")
            .select("*")
            .order("category")

        if (error) {
            toast.error("Failed to fetch inventory")
        } else {
            setItems(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchItems()
    }, [])

    const deleteItem = async (item: MenuItem) => {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return

        try {
            // 1. Delete image from storage first if it exists
            if (item.image_url) {
                const path = getStoragePathFromUrl(item.image_url)
                if (path) {
                    await supabase.storage.from('product-images').remove([path])
                }
            }

            // 2. Delete the database record
            const { error } = await supabase
                .from("items")
                .delete()
                .eq("id", item.id)

            if (error) throw error

            toast.success("Item and associated image deleted")
            fetchItems()
        } catch (error: any) {
            toast.error("Error deleting item: " + error.message)
        }
    }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold tracking-tighter uppercase">INVENTORY</h1>
                    <p className="font-mono text-muted-foreground uppercase text-xs mt-1">Manage food and goodies</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={() => setEditingItem(null)}
                            className="border-2 border-foreground font-bold h-12 px-6 tracking-widest uppercase hover:bg-foreground hover:text-background"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl border-4 border-foreground rounded-none bg-background p-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-serif font-bold uppercase tracking-tight mb-8">
                                {editingItem ? "Edit Product" : "New Product"}
                            </DialogTitle>
                        </DialogHeader>
                        <ProductForm
                            initialData={editingItem}
                            onSuccess={() => {
                                setIsDialogOpen(false)
                                fetchItems()
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search items or categories..."
                        className="pl-10 border-2 border-foreground h-12 uppercase font-mono text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border-4 border-foreground bg-background overflow-hidden relative">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-2 border-foreground">
                        <TableRow>
                            <TableHead className="font-bold font-mono text-foreground uppercase text-xs w-[80px]">IMAGE</TableHead>
                            <TableHead className="font-bold font-mono text-foreground uppercase text-xs">PRODUCT</TableHead>
                            <TableHead className="font-bold font-mono text-foreground uppercase text-xs">CATEGORY</TableHead>
                            <TableHead className="font-bold font-mono text-foreground uppercase text-xs">PRICE</TableHead>
                            <TableHead className="font-bold font-mono text-foreground uppercase text-xs w-[120px]">STATUS</TableHead>
                            <TableHead className="font-bold font-mono text-foreground uppercase text-xs text-right">ACTIONS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center font-mono uppercase font-bold animate-pulse">
                                    syncing inventory...
                                </TableCell>
                            </TableRow>
                        ) : filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center font-mono uppercase font-bold">
                                    no items found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => (
                                <TableRow key={item.id} className="border-b-2 border-foreground/10 hover:bg-muted/5 transition-colors group">
                                    <TableCell>
                                        <div className="relative h-12 w-12 border-2 border-foreground overflow-hidden bg-muted">
                                            <Image
                                                src={item.image_url || "/placeholder.svg"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold font-mono uppercase text-sm tracking-tight">{item.name}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-1 italic">{item.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono rounded-none uppercase text-[10px] border-foreground">
                                            {item.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono font-bold text-sm">${item.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {item.available ? (
                                            <Badge className="bg-green-600 text-white hover:bg-green-700 font-mono rounded-none uppercase text-[10px]">In Stock</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="font-mono rounded-none uppercase text-[10px]">Out of Stock</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground border-2 border-transparent hover:border-foreground transition-all"
                                                onClick={() => {
                                                    setEditingItem(item)
                                                    setIsDialogOpen(true)
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 hover:bg-destructive hover:text-destructive-foreground border-2 border-transparent hover:border-foreground transition-all"
                                                onClick={() => deleteItem(item)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
