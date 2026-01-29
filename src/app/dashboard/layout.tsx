import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    )

    // Ambil data User & Profile sekaligus
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Ambil detail nama dari tabel profiles (opsional, biar cantik di sidebar)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Gabungkan data auth user + data profile database
    const userData = {
        email: user.email,
        full_name: profile?.full_name || user.email, // Fallback ke email kalau nama belum diset
        ...profile
    }

    return (
        <SidebarProvider>
            {/* PENTING: Oper data user ke sidebar disini! */}
            <AppSidebar user={userData} />

            <main className="w-full">
                <div className="flex items-center gap-2 p-4 border-b bg-white sticky top-0 z-10">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />
                    <h1 className="font-semibold text-sm md:text-base text-slate-700">
                        Sistem Informasi Desa
                    </h1>
                </div>

                <div className="p-4 md:p-6 bg-slate-50 min-h-[calc(100vh-65px)]">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}