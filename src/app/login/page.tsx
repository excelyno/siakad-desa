"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Loader2,
    LogIn,
    UserPlus,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Building2
} from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isRegister) {
                // --- REGISTER ---
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error

                toast.success("Pendaftaran Berhasil!", {
                    description: "Silakan cek email atau login."
                })
                setIsRegister(false)
            } else {
                // --- LOGIN ---
                const { data: { user }, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) {
                    console.error("Error Login:", error.message)
                    toast.error("Gagal Masuk", { description: "Email atau password salah." })
                    setLoading(false)
                    return
                }

                if (user) {
                    toast.success("Login Berhasil", { description: "Mengalihkan ke dashboard..." })

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .maybeSingle()

                    const userRole = profile?.role || 'user'
                    const targetUrl = userRole === 'admin' ? '/admin' : '/dashboard'

                    router.refresh() // Fix Middleware

                    setTimeout(() => {
                        router.push(targetUrl)
                    }, 500)
                }
            }
        } catch (error: any) {
            toast.error("Terjadi Kesalahan", { description: error.message })
        } finally {
            if (isRegister) setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-3xl" />
            </div>

            <Card className="w-full max-w-md shadow-xl border-slate-200/60 bg-white/80 backdrop-blur-sm z-10 transition-all duration-300">
                <CardHeader className="space-y-1 text-center pb-2">
                    <div className="mx-auto bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-2 shadow-lg shadow-blue-600/20">
                        <Building2 className="text-white h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800">
                        {isRegister ? "Buat Akun Warga" : "SIAKAD Desa"}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        {isRegister
                            ? "Isi data berikut untuk mendaftar akun baru"
                            : "Masuk untuk mengakses layanan administrasi"}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleAuth}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-600">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {/* FIX: Sebelumnya 'classname', sekarang 'className' */}
                            <Label htmlFor="password" className="text-slate-600">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-9 pr-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang memproses...</>
                            ) : (
                                isRegister ? (
                                    <><UserPlus className="mr-2 h-4 w-4" /> Daftar Akun</>
                                ) : (
                                    <><LogIn className="mr-2 h-4 w-4" /> Masuk Aplikasi</>
                                )
                            )}
                        </Button>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400">
                                    Atau
                                </span>
                            </div>
                        </div>

                        <div className="text-center text-sm">
                            <span className="text-slate-500">
                                {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegister(!isRegister)
                                    setEmail("")
                                    setPassword("")
                                }}
                                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all"
                            >
                                {isRegister ? "Login disini" : "Daftar sekarang"}
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}