import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

// Variabel penampung (awalnya kosong)
let client: SupabaseClient | undefined

export function createClient() {
    // Cek: Apakah client sudah pernah dibuat sebelumnya?
    if (client) {
        // Jika SUDAH ADA, pakai yang lama. Jangan buat baru.
        return client
    }

    // Jika BELUM ADA, baru kita buat.
    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    return client
}