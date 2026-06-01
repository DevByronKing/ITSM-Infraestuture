"use client";

import React, { useState } from "react";
import { Book, Shield, Network, Building, Phone, Mail, FileText, Search, Server, Cpu, Wifi, ScanLine, Copy, ExternalLink, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import RFIDDashboard from "@/components/rfid/RFIDDashboard";

export default function WikiPage() {
    const [activeTab, setActiveTab] = useState<'docs' | 'mapa' | 'contatos' | 'rfid'>('docs');
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                            <Book className="text-indigo-600 dark:text-indigo-400" size={28} />
                        </div>
                        Base de Conhecimento
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">Documentação Téc, Topologia de Rede e Contatos Úteis</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Pesquisar na base..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm placeholder-slate-400 dark:text-white" 
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 pb-4 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800">
                <TabButton icon={<Book size={18} />} label="Documentação Téc." active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} />
                <TabButton icon={<Network size={18} />} label="Mapa da Infraestrutura" active={activeTab === 'mapa'} onClick={() => setActiveTab('mapa')} />
                <TabButton icon={<Phone size={18} />} label="Contatos & Fornecedores" active={activeTab === 'contatos'} onClick={() => setActiveTab('contatos')} />
                <TabButton icon={<ScanLine size={18} />} label="Módulo RFID" active={activeTab === 'rfid'} onClick={() => setActiveTab('rfid')} />
            </div>

            {/* TABS CONTENT */}
            <div className="mt-6">
                {activeTab === 'docs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <DocCard
                            title="Procedimento de Backup"
                            category="Segurança"
                            icon={<Shield className="text-indigo-500" />}
                            description="Como restaurar imagens de notebooks e acessar os logs do Veeam Backup local."
                            updatedAt="Atualizado há 2 dias"
                        />
                        <DocCard
                            title="Acessos Padronizados"
                            category="Logins Local"
                            icon={<FileText className="text-emerald-500" />}
                            description="Lista de IPs e senhas padrão de switches, roteadores e APs (acesso restrito)."
                            updatedAt="Atualizado há 1 semana"
                        />
                        <DocCard
                            title="Catálogo de Ramais"
                            category="Comunicação"
                            icon={<Phone className="text-amber-500" />}
                            description="Planilha atualizada com todos os ramais da planta industrial e setores corporativos."
                            updatedAt="Atualizado hoje"
                        />
                         <DocCard
                            title="Políticas de Firewall"
                            category="Redes"
                            icon={<Shield className="text-rose-500" />}
                            description="Regras de NAT, VPNs ativas e políticas de acesso a rede corporativa Fortinet."
                            updatedAt="Atualizado há 1 mês"
                        />
                    </div>
                )}

                {activeTab === 'mapa' && (
                    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
                        <div className="bg-slate-950 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden flex-1 border border-slate-800/60 min-h-[600px]">
                            
                            {/* Decorative Grid Background */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <Network size={300} />
                            </div>

                            <div className="relative z-10 flex justify-between items-start md:items-end mb-12 border-b border-slate-800 pb-6 flex-col md:flex-row gap-4">
                                <div>
                                    <h2 className="text-3xl font-extrabold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                                        <Building size={28} className="text-indigo-400" /> 
                                        Planta Industrial (Main)
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
                                        <Activity size={14} className="text-indigo-500 animate-pulse" /> Topologia Lógica Simplificada - Monitoramento em Tempo Real
                                    </p>
                                </div>
                                <div className="flex gap-4 text-sm bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-slate-800">
                                    <span className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> Operacional</span>
                                    <span className="flex items-center gap-2 font-medium"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"></div> Incidente</span>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center justify-center w-full mt-10">
                                
                                {/* SVG Lines for connections */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '400px' }}>
                                    <path d="M 50% 120 L 20% 250" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                                    <path d="M 50% 120 L 50% 250" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                                    <path d="M 50% 120 L 80% 250" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                                    
                                    <style>{`
                                        @keyframes dash {
                                            to { stroke-dashoffset: -1000; }
                                        }
                                    `}</style>
                                </svg>

                                {/* Core Node */}
                                <div className="relative z-10 mb-20">
                                    <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 w-72 text-center shadow-[0_0_30px_rgba(99,102,241,0.2)] backdrop-blur-xl group hover:border-indigo-400 transition-all cursor-pointer">
                                        <div className="absolute -top-3 -right-3">
                                            <span className="relative flex h-6 w-6">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 items-center justify-center text-white"><CheckCircle2 size={12} /></span>
                                            </span>
                                        </div>
                                        <Server className="mx-auto mb-3 text-indigo-400 group-hover:scale-110 transition-transform duration-300" size={40} />
                                        <h3 className="font-extrabold text-slate-100 text-lg tracking-wide">CORE CENTRAL</h3>
                                        <p className="text-xs text-indigo-300/70 mb-4 font-mono">Sala de Servidores (TI)</p>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 flex flex-col items-center">
                                                <span className="text-slate-500 mb-1">IP Address</span>
                                                <span className="font-mono text-slate-300">10.0.0.1</span>
                                            </div>
                                            <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 flex flex-col items-center">
                                                <span className="text-slate-500 mb-1">Uptime</span>
                                                <span className="text-emerald-400 font-bold">99.9%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Edge Nodes Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 w-full px-4 md:px-12 relative z-10">
                                    
                                    <NetworkNode 
                                        title="RACK PRODUÇÃO (SW2)" 
                                        location="Galpão 3" 
                                        ip="192.168.10.1" 
                                        status="down" 
                                    />
                                    
                                    <NetworkNode 
                                        title="RACK ADM (SW3)" 
                                        location="Escritório Central" 
                                        ip="192.168.20.1" 
                                        status="up" 
                                    />
                                    
                                    <NetworkNode 
                                        title="RACK DOCAS (SW4)" 
                                        location="Expedição" 
                                        ip="192.168.30.1" 
                                        status="up" 
                                        extra="Wi-Fi APs conectados"
                                    />

                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'contatos' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in duration-500">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Diretório de Fornecedores</h3>
                                <p className="text-sm text-slate-500">Contatos de suporte e operadoras</p>
                            </div>
                            <button className="text-sm font-bold text-white bg-indigo-600 px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2">
                                + Novo Contato
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            <ContactRow name="Suporte Claro Empresas" type="Operadora Link Dedicado Principal" phone="0800 701 1212" email="suporte@claro.com.br" extra="SLA: 4 horas" status="active" />
                            <ContactRow name="Vivo Fibra (Backup)" type="Operadora Banda Larga" phone="103 15" email="suporte.fibra@vivo.com.br" extra="CNPJ na fatura" status="active" />
                            <ContactRow name="TecnoService Nobreaks" type="Manutenção Elétrica" phone="(11) 98888-7777" email="contato@tecnoservice.com.br" extra="Falar com João" status="warning" />
                            <ContactRow name="Global Print (Zebra/Elgin)" type="Locação Impressoras Térmicas" phone="(11) 3333-4444" email="suporte@globalprint.com" extra="Contrato #9928" status="active" />
                        </div>
                    </div>
                )}

                {activeTab === 'rfid' && (
                    <div className="animate-in fade-in duration-500">
                        <RFIDDashboard />
                    </div>
                )}

            </div>
        </div>
    );
}

// === AUXILIARES ===

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap 
            ${active 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
        >
            {icon} {label}
        </button>
    );
}

function DocCard({ title, category, description, icon, updatedAt }: { title: string, category: string, description: string, icon: React.ReactNode, updatedAt: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            
            <div className="flex items-start gap-4 mb-4 relative z-10 flex-1">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                    {icon}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">{category}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
                </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-1">{description}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">{updatedAt}</span>
                <ExternalLink size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
        </div>
    );
}

function NetworkNode({ title, location, ip, status, extra }: { title: string, location: string, ip: string, status: 'up' | 'down', extra?: string }) {
    const isUp = status === 'up';
    
    return (
        <div className={`bg-slate-900/80 backdrop-blur-md border ${isUp ? 'border-slate-700 hover:border-emerald-500/50' : 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'} rounded-2xl p-5 text-center relative transition-all duration-300 group`}>
            
            <div className="absolute -top-3 -right-3">
                {isUp ? (
                    <span className="relative flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 items-center justify-center text-white"><CheckCircle2 size={12} /></span>
                    </span>
                ) : (
                    <span className="relative flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-500 items-center justify-center text-white"><AlertTriangle size={12} /></span>
                    </span>
                )}
            </div>

            <Server className={`mx-auto mb-3 ${isUp ? 'text-slate-300 group-hover:text-emerald-400' : 'text-rose-400'} transition-colors duration-300`} size={32} />
            
            <h3 className="font-bold text-slate-200 text-sm mb-1">{title}</h3>
            <p className="text-xs text-slate-400 mb-4">{location}</p>
            
            {extra && (
                <div className="flex justify-center mb-4 text-[10px] text-indigo-300">
                    <Wifi size={12} className="mr-1" /> {extra}
                </div>
            )}
            
            <div className="mt-2 text-xs bg-slate-950 rounded-xl p-2 flex justify-between items-center border border-slate-800 group-hover:border-slate-600 transition-colors">
                <span className="font-mono text-slate-400">{ip}</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {status}
                </span>
            </div>
        </div>
    );
}

function ContactRow({ name, type, phone, email, extra, status }: { name: string, type: string, phone: string, email: string, extra: string, status: 'active' | 'warning' }) {
    return (
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-start gap-4 flex-1">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{type}</p>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 md:hidden">{extra}</div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-slate-700 dark:text-slate-300 flex-1 md:justify-center">
                <div className="flex items-center gap-2 group/btn cursor-pointer">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover/btn:bg-indigo-100 transition-colors">
                        <Phone size={16} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-medium font-mono">{phone}</span>
                    <Copy size={14} className="text-slate-300 opacity-0 group-hover/btn:opacity-100 transition-opacity ml-1" />
                </div>
                <div className="flex items-center gap-2 group/btn cursor-pointer">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover/btn:bg-purple-100 transition-colors">
                        <Mail size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-medium truncate max-w-[150px]">{email}</span>
                    <Copy size={14} className="text-slate-300 opacity-0 group-hover/btn:opacity-100 transition-opacity ml-1" />
                </div>
            </div>
            
            <div className="hidden md:flex justify-end flex-shrink-0 w-32">
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg font-medium border border-slate-200 dark:border-slate-700">
                    {extra}
                </span>
            </div>
        </div>
    );
}
