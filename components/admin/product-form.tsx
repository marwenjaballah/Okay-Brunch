"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MenuItem } from "@/types"
import { ImageUpload } from "./image-upload"
import { getSupabaseClient } from "@/lib/supabase/client"
import { getStoragePathFromUrl } from "@/lib/supabase/storage-utils"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.coerce.number().min(0, "Price must be positive"),
    category: z.string().min(1, "Please select a category"),
    image_url: z.string().optional(),
    available: z.boolean().default(true),
})

interface ProductFormProps {
    initialData?: MenuItem | null
    onSuccess: () => void
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
    const [loading, setLoading] = useState(false)
    const supabase = getSupabaseClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            price: 0,
            category: "",
            image_url: "",
            available: true,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true)

            // If updating and image changed, delete OLD image from storage
            if (initialData && initialData.image_url && values.image_url !== initialData.image_url) {
                const oldPath = getStoragePathFromUrl(initialData.image_url)
                if (oldPath) {
                    await supabase.storage.from('product-images').remove([oldPath])
                }
            }

            const { error } = initialData
                ? await supabase
                    .from("menu_items")
                    .update(values)
                    .eq("id", initialData.id)
                : await supabase
                    .from("menu_items")
                    .insert([values])

            if (error) throw error

            toast.success(initialData ? "Product updated" : "Product created")
            onSuccess()
        } catch (error: any) {
            toast.error("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-mono font-bold">PRODUCT IMAGE</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={loading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-mono font-bold">NAME</FormLabel>
                                <FormControl>
                                    <Input {...field} className="border-2 border-foreground" disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-mono font-bold">PRICE ($)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} className="border-2 border-foreground" disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-mono font-bold">CATEGORY</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                                <FormControl>
                                    <SelectTrigger className="border-2 border-foreground uppercase font-mono">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="border-2 border-foreground rounded-none">
                                    {["Toast", "Eggs", "Bagels", "Pancakes", "Omelettes", "Specialties", "Bowls", "Mexican", "Goodies"].map((cat) => (
                                        <SelectItem key={cat} value={cat} className="font-mono uppercase">
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-mono font-bold">DESCRIPTION</FormLabel>
                            <FormControl>
                                <Textarea {...field} className="border-2 border-foreground min-h-[100px]" disabled={loading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border-2 border-foreground bg-muted/10">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={loading}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="font-mono font-bold cursor-pointer">
                                    ITEM IS AVAILABLE FOR ORDER
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full border-2 border-foreground font-bold py-6 text-lg tracking-widest uppercase hover:bg-foreground hover:text-background"
                >
                    {loading ? "SAVING..." : initialData ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                </Button>
            </form>
        </Form>
    )
}
