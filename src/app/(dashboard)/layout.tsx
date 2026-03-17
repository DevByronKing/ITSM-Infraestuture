"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Server,
    Headset,
    Home,
    FileText,
    Book,
    Handshake,
    ShieldAlert,
    Calendar,
    Archive,
    BrainCircuit,
    Search,
    ChevronRight,
    Settings,
    LogOut
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/", icon: <Home size={18} />, label: "Dashboard Principal", category: "Geral" },
    { href: "/ativos", icon: <Server size={18} />, label: "Inventário & Hardware", category: "Geral" },
    { href: "/chamados", icon: <Headset size={18} />, label: "Helpdesk Central", category: "Geral" },
    { href: "/checkout", icon: <Handshake size={18} />, label: "Gestão de Empréstimos", category: "Geral" },
    { href: "/almoxarifado", icon: <Archive size={18} />, label: "Almoxarifado TI", category: "Geral" },
    { href: "/wiki", icon: <Book size={18} />, label: "Base de Conhecimento", category: "Geral" },
    { href: "/slas", icon: <Calendar size={18} />, label: "Contratos & Lifecycle", category: "Geral" },
    { href: "/automações", icon: <ShieldAlert size={18} />, label: "Centro de Alertas & IA", category: "Geral" },
    { href: "/assistente", icon: <BrainCircuit size={18} />, label: "Assistente IA", category: "IA", highlight: true },
    { href: "/relatorios", icon: <FileText size={18} />, label: "Report Executivo", category: "Relatórios" },
];

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();

    const filteredItems = NAV_ITEMS.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Siderbar - Premium Tech Sidebar */}
            <aside className="w-72 glass-dark flex flex-col text-slate-300 relative z-20 h-full border-r border-white/5">
                {/* Tech Glowing Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-indigo-500/10 blur-[100px] -z-10 pointer-events-none rounded-full"></div>
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[20%] bg-purple-500/10 blur-[80px] -z-10 pointer-events-none rounded-full"></div>

                {/* Logo Area */}
                <div className="p-7 relative z-10">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-500/40 transition-all"></div>
                            <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg border border-white/20 transform group-hover:scale-105 transition-transform">
                                <Server className="text-white" size={24} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tighter flex items-center gap-1">
                                ITSM<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Pro</span>
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Infrastructure</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar - Premium Glass Look */}
                <div className="px-6 py-2 relative z-10">
                    <div className="relative group/search">
                        <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 group-focus-within/search:border-indigo-500/50 group-focus-within/search:bg-white/10 transition-all duration-300"></div>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-indigo-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar no sistema..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none transition-all text-slate-200 placeholder:text-slate-500 relative z-10"
                        />
                    </div>
                </div>

                {/* Navigation - Elegant Scroll */}
                <nav className="flex-1 px-4 py-6 space-y-7 overflow-y-auto relative z-10 custom-scrollbar">
                    {['Geral', 'IA', 'Relatórios'].map(category => {
                        const itemsInCategory = filteredItems.filter(i => i.category === category);
                        if (itemsInCategory.length === 0) return null;

                        return (
                            <div key={category} className="space-y-1.5">
                                <div className="px-3 flex items-center justify-between mb-2">
                                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-600">{category}</p>
                                    <div className="h-px flex-1 ml-4 bg-gradient-to-r from-slate-800 to-transparent"></div>
                                </div>
                                {itemsInCategory.map(item => (
                                    <SidebarLink
                                        key={item.href}
                                        href={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                        highlight={item.highlight}
                                        active={pathname === item.href}
                                    />
                                ))}
                            </div>
                        );
                    })}

                    {filteredItems.length === 0 && (
                        <div className="text-center py-12 px-6">
                            <div className="inline-flex p-3 bg-slate-800/50 rounded-full mb-3 text-slate-600">
                                <Search size={20} />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Ops! Nenhuma ferramenta encontrada para "{searchQuery}"</p>
                        </div>
                    )}
                </nav>

                {/* Bottom Profile Area - Elevated */}
                <div className="p-4 border-t border-white/5 bg-slate-900/40">
                    <div className="group m-2 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-300 cursor-pointer flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                TI
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">Admin Local</p>
                            <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase opacity-70">Sistemas</p>
                        </div>
                        <div className="text-slate-500 group-hover:text-indigo-400 transition-colors">
                            <Settings size={16} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative z-10">
                <div className="max-w-[1700px] mx-auto min-h-full p-0">
                    {children}
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .glass-dark {
                    background: rgba(10, 15, 25, 0.95);
                    backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
}

function SidebarLink({ href, icon, label, highlight = false, active = false }: { href: string; icon: React.ReactNode; label: string; highlight?: boolean; active?: boolean }) {
    const activeStyles = active 
        ? "bg-indigo-500/10 text-white border-white/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]" 
        : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent";

    if (highlight) {
        return (
            <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 border group relative overflow-hidden ${active ? 'bg-indigo-600/20 border-indigo-500/40 text-white' : 'bg-gradient-to-r from-indigo-600/10 to-indigo-600/5 border-indigo-500/20 text-indigo-300 hover:from-indigo-600/20 hover:to-indigo-600/10 hover:text-white'}`}
            >
                <div className={`transition-colors duration-300 ${active ? 'text-white' : 'text-indigo-400'}`}>
                    {icon}
                </div>
                <span className="font-bold text-sm tracking-tight">{label}</span>
                <span className="ml-auto flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-lg border border-indigo-500/20">IA</span>
                    <ChevronRight size={14} className={`transition-transform duration-300 ${active ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                </span>
                
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-full"></div>}
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group border ${activeStyles}`}
        >
            <div className={`transition-all duration-300 ${active ? 'text-indigo-400 scale-110' : 'text-slate-500 group-hover:text-indigo-400'}`}>
                {icon}
            </div>
            <span className={`text-sm tracking-tight transition-all duration-300 ${active ? 'font-bold' : 'font-semibold'}`}>
                {label}
            </span>
            <ChevronRight size={14} className={`ml-auto transition-all duration-300 ${active ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-slate-600'}`} />
            
            {active && (
                <div className="absolute left-2 w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
            )}
        </Link>
    );
}
