"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { LetterTemplate } from "./LetterTemplate"

export default function PrintButton({ data }: { data: any }) {
    const componentRef = useRef<HTMLDivElement>(null)

    // Hook untuk print
    const handlePrint = useReactToPrint({
        contentRef: componentRef, // Target komponen yang mau di-print
        documentTitle: `Surat-${data.profiles?.full_name}-${data.letter_types?.name}`,
    })

    // Kalau status belum approved, tombol gak muncul
    if (data.status !== 'approved') return null

    return (
        <>
            {/* Tombol yang Muncul di UI */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrint()}
                className="gap-2 border-slate-400 hover:bg-slate-100"
            >
                <Printer className="h-4 w-4" />
                Cetak PDF
            </Button>

            {/* Template Surat Tersembunyi (Akan dirender tapi hidden) */}
            <div className="hidden">
                <LetterTemplate ref={componentRef} data={data} />
            </div>
        </>
    )
}