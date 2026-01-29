"use client"

import { usePathname, useRouter } from "next/navigation"
import {
    Home,
    FileText,
    User,
    LayoutDashboard,
    LogOut,
    User2,
    ChevronUp
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
// GANTI INI: Import dari file util yang baru dibuat
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

// Menu items
const items = [
    {
        title: "Layanan Surat",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Riwayat Pengajuan",
        url: "/dashboard/history",
        icon: FileText,
    },
    {
        title: "Profil Saya",
        url: "/dashboard/profile",
        icon: User,
    },
]

export function AppSidebar({ user }: { user?: any }) {
    const pathname = usePathname()
    const router = useRouter()

    // GANTI INI: Panggil fungsi createClient()
    const supabase = createClient()

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            toast.success("Berhasil Keluar")
            router.refresh()
            router.push("/login")
        } catch (error) {
            toast.error("Gagal Logout")
        }
    }

    return (
        <Sidebar>
            <SidebarHeader className="p-4 border-b">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <LayoutDashboard className="w-6 h-6" />
                    <span>SIAKAD Desa</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const isActive = item.url === "/dashboard"
                                    ? pathname === "/dashboard"
                                    : pathname.startsWith(item.url)

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <User2 className="h-8 w-8 rounded-lg" />
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {user?.full_name || "Warga Desa"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "user@mail.com"}
                                        </span>
                                    </div>
                                    <ChevronUp className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Keluar Aplikasi</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}