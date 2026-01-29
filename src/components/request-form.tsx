"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Nanti kita pastikan komponen ini ada
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label" // Nanti kita pastikan komponen ini ada
import { Loader2, Send, ArrowLeft } from "lucide-react"

// Tipe data untuk props
interface RequestFormProps {
    letterTypeId: number
    letterName: string
    schema: {
        fields: Array<{
            name: string
            label: string
            type: string
            required: boolean
        }>
    }
}

export default function RequestForm({ letterTypeId, letterName, schema }: RequestFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // React Hook Form initialization
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = async (data: any) => {
        setIsSubmitting(true)
        try {
            // 1. Ambil User ID (Di real app ini dari Session)
            // Karena belum ada Auth, kita pakai hardcode ID user dummy dulu atau handle error
            // Nanti kita akan pasang Auth beneran. Untuk sekarang kita bypass dulu biar form jalan.
            // Kita anggap user guest dulu atau ambil user pertama yg ditemukan (temporary hack)
            const { data: { user } } = await supabase.auth.getUser()

            // Jika user belum login (null), kita lempar error (atau redirect ke login nanti)
            // Untuk testing sekarang, pastikan kamu sudah Login via Supabase atau kita skip user_id check sementara

            const payload = {
                letter_type_id: letterTypeId,
                user_id: user?.id, // Ini akan error kalau belum login. Nanti kita fix di sesi Auth.
                form_data: data,
                status: 'pending'
            }

            // Simpan ke Supabase
            const { error } = await supabase
                .from('letter_requests')
                .insert(payload)

            if (error) throw error

            alert("Surat berhasil diajukan!")
            router.push("/dashboard/history") // Redirect ke halaman riwayat

        } catch (error: any) {
            console.error(error)
            alert("Gagal mengajukan surat: " + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <Button variant="ghost" className="w-fit pl-0 mb-2" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>
                <CardTitle>Formulir {letterName}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {/* Looping Field sesuai Schema Database */}
                    {schema.fields.map((field, index) => (
                        <div key={index} className="space-y-2">
                            <Label htmlFor={field.name}>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>

                            {field.type === 'textarea' ? (
                                <Textarea
                                    id={field.name}
                                    placeholder={`Isi ${field.label}...`}
                                    {...register(field.name, { required: field.required })}
                                />
                            ) : (
                                <Input
                                    type={field.type}
                                    id={field.name}
                                    placeholder={`Isi ${field.label}...`}
                                    {...register(field.name, { required: field.required })}
                                />
                            )}
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full bg-slate-900" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" /> Ajukan Permohonan
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}