"use client"

import { useEffect, useState } from "react"
// 1. FIX: Gunakan Singleton Client agar tidak error warning
import { createClient } from "@/utils/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" // Tambah Button
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Loader2, LogOut } from "lucide-react" // Tambah Icon LogOut
import { useRouter } from "next/navigation"
import { AdminActions } from "@/components/admin-actions"
import PrintButton from "@/components/PrintButton"
import { toast } from "sonner" // Tambah Toast

export default function AdminDashboard() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // Inisialisasi Supabase
    const supabase = createClient()

    // --- FITUR LOGOUT ---
    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            toast.success("Berhasil Keluar", { description: "Sesi admin telah berakhir." })
            router.refresh() // Wajib refresh biar middleware sadar
            router.push("/login")
        } catch (error) {
            toast.error("Gagal Logout")
        }
    }

    const fetchRequests = async () => {
        // Jangan set loading true di sini agar saat update status tidak flickering parah
        // setLoading(true) 

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push("/login")
            return
        }

        // --- Cek Admin ---
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            toast.error("Akses Ditolak", { description: "Anda bukan admin." })
            router.push("/dashboard")
            return
        }

        // --- AMBIL DATA REQUEST & PROFILE ---
        const { data, error } = await supabase
            .from('letter_requests')
            .select(`
                *,
                letter_types ( name ),
                profiles:profiles!letter_requests_user_id_fkey ( full_name, email, nik ) 
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error Fetching:", error)
            toast.error("Gagal mengambil data")
        } else {
            setRequests(data || [])
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    return (
        <div className="container mx-auto py-10 px-4 md:px-0">
            {/* HEADER DENGAN TOMBOL LOGOUT */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin Desa</h1>
                    <p className="text-slate-500">Kelola pengajuan surat warga.</p>
                </div>

                <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="shadow-sm"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar Admin
                </Button>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="text-slate-500">Memuat data...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center p-10 border-2 border-dashed rounded-lg bg-slate-50">
                        <p className="text-slate-500 font-medium">Belum ada pengajuan surat masuk.</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <Card key={req.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">

                            {/* --- KIRI: Info Surat --- */}
                            <div className="space-y-1 flex-1 w-full">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge variant="outline" className="border-slate-400 text-slate-700">
                                        {req.letter_types?.name}
                                    </Badge>
                                    {req.status === 'pending' && <Badge className="bg-yellow-500 hover:bg-yellow-600">Menunggu Verifikasi</Badge>}
                                    {req.status === 'approved' && <Badge className="bg-green-600 hover:bg-green-700">Disetujui</Badge>}
                                    {req.status === 'rejected' && <Badge className="bg-red-600 hover:bg-red-700">Ditolak</Badge>}
                                </div>

                                <h3 className="font-bold text-lg text-slate-800">
                                    {req.profiles?.full_name || "Nama Belum Diisi"}
                                    <span className="text-slate-400 font-normal text-sm ml-2 font-mono">
                                        ({req.profiles?.nik || "NIK Kosong"})
                                    </span>
                                </h3>

                                <p className="text-xs text-slate-400 mb-1">
                                    {req.profiles?.email}
                                </p>

                                <div className="text-sm text-slate-500 flex gap-2">
                                    <span>Diajukan:</span>
                                    <span className="font-medium text-slate-700">
                                        {format(new Date(req.created_at), "d MMMM yyyy, HH:mm", { locale: idLocale })}
                                    </span>
                                </div>

                                {req.letter_number && (
                                    <div className="mt-2 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-md inline-block font-mono border border-green-200">
                                        No. Surat: <strong>{req.letter_number}</strong>
                                    </div>
                                )}

                                <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                    <strong className="text-slate-900">Keperluan:</strong> {req.form_data?.keperluan || "-"}
                                </div>
                            </div>

                            {/* --- KANAN: Tombol Aksi --- */}
                            <div className="flex flex-row md:flex-col gap-2 items-end w-full md:w-auto mt-4 md:mt-0">
                                {/* 1. Tombol Proses (Approve/Reject) */}
                                <AdminActions
                                    id={req.id}
                                    status={req.status}
                                    onUpdate={fetchRequests}
                                />

                                {/* 2. Tombol Print (Hanya muncul kalau approved) */}
                                <PrintButton data={req} />
                            </div>

                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}