"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
// 1. FIX: Gunakan createClient singleton agar tidak error warning/403
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Loader2,
    Save,
    User,
    Phone,
    MapPin,
    CreditCard,
    Type
} from "lucide-react"
import { toast } from "sonner" // 2. FIX: Pakai Sonner

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userEmail, setUserEmail] = useState("")

    // Inisialisasi Supabase Client
    const supabase = createClient()

    // Setup form
    const { register, handleSubmit, setValue, formState: { errors } } = useForm()

    // 1. Ambil Data User Saat Ini
    useEffect(() => {
        async function getProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    router.push("/login")
                    return
                }

                setUserEmail(user.email || "")

                // Ambil data detail dari tabel profiles
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error && error.code !== 'PGRST116') {
                    console.warn("Error fetching profile:", error.message)
                }

                if (data) {
                    // Isi form dengan data yang ada di database
                    setValue("full_name", data.full_name)
                    setValue("nik", data.nik)
                    setValue("phone", data.phone)
                    setValue("address", data.address)
                }
            } catch (error) {
                console.error("Error:", error)
            } finally {
                setLoading(false)
            }
        }

        getProfile()
    }, [router, setValue, supabase]) // Tambahkan dependency supabase

    // 2. Simpan Perubahan
    const onSubmit = async (data: any) => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Sesi Habis", { description: "Silakan login ulang." })
                router.push("/login")
                return
            }

            const updates = {
                id: user.id,
                full_name: data.full_name,
                nik: data.nik,
                phone: data.phone,
                address: data.address,
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(updates)

            if (error) throw error

            toast.success("Profil Berhasil Disimpan", {
                description: "Data Anda telah diperbarui di sistem."
            })

            router.refresh() // Update data di server component (seperti Sidebar)

        } catch (error: any) {
            toast.error("Gagal Menyimpan", {
                description: error.message
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Memuat data profil...</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">Profil Saya</h2>
                <p className="text-slate-500">Kelola informasi identitas dan kontak Anda.</p>
            </div>

            <Card className="shadow-md border-slate-200">
                <CardHeader className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b bg-slate-50/50">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userEmail}`} />
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-center sm:text-left">
                        <CardTitle className="text-xl">{userEmail}</CardTitle>
                        <CardDescription>Akun Warga Desa</CardDescription>
                        <div className="pt-2">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                                Status: Aktif
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Lengkap */}
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nama Lengkap</Label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="full_name"
                                        placeholder="Sesuai KTP"
                                        className="pl-9"
                                        {...register("full_name", { required: true })}
                                    />
                                </div>
                                {errors.full_name && <span className="text-xs text-red-500">Nama wajib diisi</span>}
                            </div>

                            {/* NIK */}
                            <div className="space-y-2">
                                <Label htmlFor="nik">NIK (Nomor Induk Kependudukan)</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="nik"
                                        placeholder="16 digit NIK"
                                        className="pl-9"
                                        {...register("nik")}
                                    />
                                </div>
                            </div>

                            {/* No. HP */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">No. WhatsApp</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        placeholder="08xxxxxxxx"
                                        className="pl-9"
                                        {...register("phone")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Alamat */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat Lengkap</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Textarea
                                    id="address"
                                    placeholder="Nama Jalan, RT/RW, Dusun..."
                                    className="min-h-[100px] pl-9"
                                    {...register("address")}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-slate-50/50 border-t p-6 flex justify-end">
                        <Button type="submit" disabled={saving} className="min-w-[150px]">
                            {saving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}