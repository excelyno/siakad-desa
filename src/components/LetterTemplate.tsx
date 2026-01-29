import React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

// Kita pakai forwardRef supaya library print bisa baca komponen ini
export const LetterTemplate = React.forwardRef<HTMLDivElement, { data: any }>((props, ref) => {
    const { data } = props

    // Pastikan data profile aman (handle kalau null)
    // Note: Karena query kita pakai alias 'profiles:', datanya ada di data.profiles
    const user = Array.isArray(data.profiles) ? data.profiles[0] : (data.profiles || {})

    // Cek Status Approval
    const isApproved = data.status === 'approved'

    return (
        <div ref={ref} className="p-10 text-black bg-white font-serif max-w-[210mm] mx-auto min-h-[297mm] relative">
            {/* --- KOP SURAT --- */}
            <div className="border-b-4 border-black pb-4 mb-6 text-center">
                <h2 className="text-xl font-bold uppercase">Pemerintah Kabupaten Desa Konoha</h2>
                <h1 className="text-2xl font-bold uppercase">Kecamatan Api</h1>
                <h1 className="text-3xl font-bold uppercase">Kantor Kepala Desa</h1>
                <p className="text-sm italic">Jl. Ninja No. 1, Konoha Gakure, Kode Pos 12345</p>
            </div>

            {/* --- JUDUL SURAT --- */}
            <div className="text-center mb-8">
                <h2 className="text-xl font-bold underline uppercase">
                    SURAT KETERANGAN {data.letter_types?.name}
                </h2>
                <p>Nomor: {data.letter_number || "..../..../..../...."}</p>
            </div>

            {/* --- ISI SURAT --- */}
            <div className="text-justify leading-relaxed space-y-4">
                <p>
                    Yang bertanda tangan di bawah ini, Kepala Desa Konoha, Kecamatan Api,
                    dengan ini menerangkan bahwa:
                </p>

                <table className="w-full ml-4">
                    <tbody>
                        <tr>
                            <td className="w-40 py-1">Nama Lengkap</td>
                            <td>: <strong>{user.full_name?.toUpperCase() || "..."}</strong></td>
                        </tr>
                        <tr>
                            <td className="py-1">NIK</td>
                            <td>: {user.nik || "..."}</td>
                        </tr>
                        <tr>
                            <td className="py-1">Email</td>
                            <td>: {user.email || "..."}</td>
                        </tr>
                    </tbody>
                </table>

                <p>
                    Orang tersebut di atas adalah benar-benar warga Desa Konoha.
                    Surat keterangan ini dibuat untuk keperluan:
                </p>

                <div className="font-bold ml-4 border p-2 bg-slate-50">
                    "{data.form_data?.keperluan || "-"}"
                </div>

                <p>
                    Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan
                    sebagaimana mestinya.
                </p>
            </div>

            {/* --- TANDA TANGAN (LOGIC BARU) --- */}
            <div className="flex justify-end mt-16">
                <div className="text-center w-64 relative">

                    {/* Tanggal: Gunakan tanggal approved jika ada, atau hari ini */}
                    <p>Konoha, {format(new Date(), "d MMMM yyyy", { locale: id })}</p>

                    <p className="mb-2">Kepala Desa</p>

                    {/* Container Gambar Tanda Tangan */}
                    <div className="h-28 flex items-center justify-center relative my-2">
                        {isApproved ? (
                            // TAMPILKAN GAMBAR JIKA APPROVED
                            <img
                                src="/images/ttd-kades.png"
                                alt="Tanda Tangan"
                                className="absolute w-40 object-contain z-10"
                                // mix-blend-multiply bikin background putih di gambar jadi transparan (menyatu)
                                style={{ mixBlendMode: 'multiply' }}
                            />
                        ) : (
                            // TAMPILKAN PLACEHOLDER JIKA BELUM
                            <div className="border border-dashed border-slate-300 p-2 rounded text-xs text-slate-400 italic">
                                ( Menunggu Tanda Tangan )
                            </div>
                        )}
                    </div>

                    <p className="font-bold underline mt-2">( NARUTO UZUMAKI )</p>
                    <p>NIP. 19450817 202401 1 001</p>
                </div>
            </div>
        </div>
    )
})

LetterTemplate.displayName = "LetterTemplate"