import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Copilot from "@/components/Copilot";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "ITSM Pro",
    description: "Sistema Avançado de Gestão de TI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className={outfit.variable}>
            <body className="font-sans antialiased text-slate-800 selection:bg-indigo-500/30">
                {children}
                <Copilot />
            </body>
        </html>
    );
}
