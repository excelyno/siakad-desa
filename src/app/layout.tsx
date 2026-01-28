import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- IMPORT CSS DI SINI SAJA (Satu kali untuk semua)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SIAKAD Desa",
    description: "Sistem Administrasi Desa",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}