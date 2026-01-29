import { supabase } from "@/lib/supabase"
import RequestForm from "@/components/request-form"
import { notFound } from "next/navigation"

// Pastikan tipe ini sesuai
interface PageProps {
    params: Promise<{ id: string }> // Update untuk Next.js 15: params harus Promise
}

export default async function RequestPage({ params }: PageProps) {
    // Await params di Next.js 15
    const { id } = await params

    // Fetch data jenis surat berdasarkan ID
    const { data: letterType, error } = await supabase
        .from('letter_types')
        .select('*')
        .eq('id', id)
        .single()

    // Kalau ID ngawur atau error, tampilkan 404
    if (error || !letterType) {
        notFound()
    }

    return (
        <div className="container mx-auto py-6">
            <RequestForm
                letterTypeId={letterType.id}
                letterName={letterType.name}
                schema={letterType.form_schema}
            />
        </div>
    )
}