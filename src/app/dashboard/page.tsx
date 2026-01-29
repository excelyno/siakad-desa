import { supabase } from "@/lib/supabase"
import { LetterType } from "@/types/database"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileCheck } from "lucide-react"
import Link from "next/link"
import PrintButton from "@/components/PrintButton"

// Fungsi ini berjalan di Server (Server Component) - Aman & Cepat
async function getLetterTypes() {
    const { data, error } = await supabase
        .from('letter_types')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (error) {
        console.error("Error fetching letters:", error)
        return []
    }

    return data as LetterType[]
}

export default async function DashboardPage() {
    const letters = await getLetterTypes()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {letters.map((letter) => (
                <Card key={letter.id} className="hover:shadow-lg transition-shadow border-slate-200">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
                                <FileCheck size={24} />
                            </div>
                            <Badge variant="outline" className="text-slate-500 border-slate-300">
                                {letter.code}
                            </Badge>
                        </div>
                        <CardTitle className="text-lg">{letter.name}</CardTitle>
                        <CardDescription>
                            Waktu proses: ±1-2 Hari Kerja
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-slate-700 mb-2">Syarat Dokumen:</p>
                        <ul className="text-sm text-slate-500 list-disc list-inside space-y-1">
                            {/* Parsing JSON array syarat */}
                            {Array.isArray(letter.requirements) && letter.requirements.slice(0, 3).map((req, i) => (
                                <li key={i}>{String(req)}</li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full bg-slate-900 hover:bg-slate-800">
                            <Link href={`/dashboard/request/${letter.id}`}>
                                Buat Surat <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}