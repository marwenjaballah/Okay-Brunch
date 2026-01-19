"use client"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = getSupabaseClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0]
            if (!file) return

            setUploading(true)

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file)

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            onChange(publicUrl)
        } catch (error: any) {
            alert("Error uploading image: " + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative aspect-square w-40 border-4 border-foreground overflow-hidden">
                        <Image
                            fill
                            src={value}
                            alt="Preview"
                            className="object-cover"
                        />
                        <button
                            onClick={() => onChange("")}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-none border-2 border-foreground"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="border-4 border-dashed border-foreground/30 aspect-square w-40 flex flex-col items-center justify-center bg-muted/10">
                        {uploading ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                            <>
                                <Upload className="h-8 w-8 mb-2" />
                                <label className="cursor-pointer">
                                    <span className="text-xs font-mono font-bold uppercase">Upload Image</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        disabled={disabled || uploading}
                                    />
                                </label>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
