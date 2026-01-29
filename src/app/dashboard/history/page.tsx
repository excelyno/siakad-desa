"use client"

import { useEffect, useState } from "react"
// 1. GANTI INI: Pakai createClient dari utils (Singleton)
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import PrintButton from "@/components/PrintButton"

export default function HistoryPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // 2. Inisialisasi Client di sini
    const supabase = createClient()

    useEffect(() => {
        async function fetchRequests() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            // Query Data History
            const { data, error } = await supabase
                .from('letter_requests')
                .select(`
                    *,
                    letter_types ( name ),
                    profiles:profiles!letter_requests_user_id_fkey ( full_name, email, nik )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setRequests(data)
            }
            setLoading(false)
        }

        fetchRequests()
    }, [supabase]) // Tambahkan supabase ke dependency array

    // Helper: Warna Badge Status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>
            case 'approved': return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Selesai</Badge>
            case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6 container mx-auto py-6 max-w-4xl">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Riwayat Pengajuan</h2>
                    <p className="text-sm text-slate-500">Pantau status surat yang Anda ajukan di sini.</p>
                </div>
            </div>

            {loading ? (
                // Tampilan Loading Skeleton Sederhana
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                // Tampilan Kosong
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                            <FileText className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-slate-900">Belum ada riwayat</p>
                        <p className="text-slate-500 text-sm">Ajukan surat baru melalui menu Dashboard.</p>
                    </CardContent>
                </Card>
            ) : (
                // List Surat
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <Card
                            key={req.id}
                            className={`hover:shadow-md transition-all border-l-4 ${req.status === 'approved' ? 'border-l-green-500 bg-green-50/10' :
                                req.status === 'rejected' ? 'border-l-red-500' : 'border-l-slate-300'
                                }`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex flex-col">
                                    <CardTitle className="text-base font-bold text-slate-800">
                                        {req.letter_types?.name || "Jenis Surat Tidak Dikenal"}
                                    </CardTitle>
                                    {/* Tampilkan No Surat jika sudah terbit */}
                                    {req.letter_number && (
                                        <span className="text-xs font-mono text-slate-500 mt-1">
                                            No: {req.letter_number}
                                        </span>
                                    )}
                                </div>
                                {getStatusBadge(req.status)}
                            </CardHeader>

                            <CardContent>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-2">

                                    {/* INFO KIRI */}
                                    <div className="space-y-1 w-full text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400 w-20">Diajukan</span>
                                            <span>: {format(new Date(req.created_at), "d MMMM yyyy, HH:mm", { locale: idLocale })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400 w-20">Keperluan</span>
                                            <span className="font-medium text-slate-800 line-clamp-1">
                                                : "{req.form_data?.keperluan || "-"}"
                                            </span>
                                        </div>
                                    </div>

                                    {/* TOMBOL KANAN */}
                                    <div className="w-full md:w-auto flex justify-end">
                                        <PrintButton data={req} />
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}