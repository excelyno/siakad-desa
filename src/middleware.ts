import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Buat Response Awal
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 2. Setup Supabase
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Update cookie di request & response agar sinkron
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // 3. Cek User
    const { data: { user } } = await supabase.auth.getUser()

    // --- DEBUGGING LOG (Cek Terminal VS Code saat login) ---
    console.log(`[Middleware] URL: ${request.nextUrl.pathname}`)
    console.log(`[Middleware] User Found? ${user ? '✅ YES' : '❌ NO'}`)
    if (user) console.log(`[Middleware] Email: ${user.email}`)
    // -------------------------------------------------------

    // 4. Proteksi Halaman Dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!user) {
            console.log("⛔ [Middleware] Akses Dashboard Ditolak -> Redirect Login")
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // 5. Redirect User Login ke Dashboard
    if (request.nextUrl.pathname === '/login') {
        if (user) {
            console.log("🚀 [Middleware] User Login Masuk Lagi -> Lempar Dashboard")
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}