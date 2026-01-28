import Link from "next/link"
import { LayoutDashboard, FileText, User, LogOut } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar Sederhana */}
            <aside className="w-64 bg-white border-r hidden md:block">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-slate-800">SIAKAD Desa</h1>
                    <p className="text-sm text-slate-500">Portal Warga</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-700 bg-slate-100 rounded-lg">
                        <LayoutDashboard size={20} />
                        <span>Layanan</span>
                    </Link>
                    <Link href="/dashboard/history" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg">
                        <FileText size={20} />
                        <span>Riwayat Surat</span>
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg">
                        <User size={20} />
                        <span>Profil Saya</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Selamat Datang, Warga</h2>
                        <p className="text-slate-500">Silakan pilih layanan surat yang Anda butuhkan.</p>
                    </div>
                    <button className="text-sm text-red-600 font-medium flex items-center gap-2">
                        <LogOut size={16} /> Logout
                    </button>
                </header>
                {children}
            </main>
        </div>
    )
}