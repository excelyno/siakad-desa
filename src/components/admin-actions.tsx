"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Check, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminActionsProps {
    id: number
    status: string
    onUpdate: () => void
}

export function AdminActions({ id, status, onUpdate }: AdminActionsProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
    const [nomorSurat, setNomorSurat] = useState("")

    const handleProcess = async () => {
        if (actionType === 'approve' && !nomorSurat) {
            alert("Harap isi Nomor Surat terlebih dahulu!")
            return
        }

        setLoading(true)
        try {
            // Cek user saat ini (Debugging)
            const { data: { user } } = await supabase.auth.getUser()
            console.log("Processing Request ID:", id, "by User:", user?.id)

            const updates: any = {
                status: actionType === 'approve' ? 'approved' : 'rejected',
            }

            if (actionType === 'approve') {
                updates.letter_number = nomorSurat
            }

            // UPDATE DATA
            const { data, error } = await supabase
                .from('letter_requests')
                .update(updates)
                .eq('id', id)
                .select() // <--- PENTING: Minta data balikan untuk cek sukses/gagal

            if (error) {
                console.error("Supabase Error:", error)
                throw new Error(error.message)
            }

            // PENTING: Cek apakah ada data yang berubah
            if (!data || data.length === 0) {
                throw new Error("Update gagal! Kemungkinan akun Anda tidak dianggap sebagai ADMIN oleh database.")
            }

            setOpen(false)
            onUpdate()
            alert(actionType === 'approve' ? "Surat disetujui!" : "Surat ditolak.")

        } catch (error: any) {
            console.error(error)
            alert("Gagal memproses: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    // Jika sudah tidak pending, jangan tampilkan tombol
    if (status !== 'pending') return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex gap-2">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { setActionType('reject'); setOpen(true); }}
                >
                    <X className="w-4 h-4 mr-1" /> Tolak
                </Button>

                <Button
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                    onClick={() => { setActionType('approve'); setOpen(true); }}
                >
                    <Check className="w-4 h-4 mr-1" /> Proses
                </Button>
            </div>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {actionType === 'approve' ? "Setujui Permohonan" : "Tolak Permohonan"}
                    </DialogTitle>
                    <DialogDescription>
                        {actionType === 'approve'
                            ? "Masukkan Nomor Surat resmi untuk menyelesaikan permohonan ini."
                            : "Apakah Anda yakin ingin menolak permohonan ini? Warga harus mengajukan ulang."}
                    </DialogDescription>
                </DialogHeader>

                {actionType === 'approve' && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nomor" className="text-right">
                                No. Surat
                            </Label>
                            <Input
                                id="nomor"
                                placeholder="Contoh: 470/001/DS/2024"
                                className="col-span-3"
                                value={nomorSurat}
                                onChange={(e) => setNomorSurat(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button
                        className={actionType === 'approve' ? "bg-green-600" : "bg-red-600"}
                        onClick={handleProcess}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Konfirmasi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}