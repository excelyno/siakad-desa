export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface LetterType {
    id: number
    code: string
    name: string
    requirements: string[] // Kita simplifikasi dari Jsonb
    form_schema: {
        fields: Array<{
            name: string
            label: string
            type: 'text' | 'number' | 'textarea' | 'date'
            required: boolean
        }>
    }
    is_active: boolean
}