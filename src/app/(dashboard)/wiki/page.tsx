"use client";

import React, { useState } from "react";
import { Book, Shield, Network, Building, Phone, Mail, FileText, Search, Server, Cpu, Wifi } from "lucide-react";

export default function WikiPage() {
    const [activeTab, setActiveTab] = useState<'docs' | 'mapa' | 'contatos'>('docs');

    return (
        <div className="p-8">
            <div className="flex flex-col justify-between items-start mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                    <Book className="text-indigo-500" />
                    Base de Conhecimento & Infra
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Documentação Téc, Topologia de Rede e Contatos Úteis</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 pb-4 border-b border-slate-200 overflow-x-auto">
                <TabButton icon={<Book size={18} />} label="Documentação Téc." active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} />
                <TabButton icon={<Network size={18} />} label="Mapa da Infraestrutura" active={activeTab === 'mapa'} onClick={() => setActiveTab('mapa')} />
                <TabButton icon={<Phone size={18} />} label="Contatos & Fornecedores" active={activeTab === 'contatos'} onClick={() => setActiveTab('contatos')} />
            </div>

            {/* TABS CONTENT */}
            {activeTab === 'docs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DocCard
                        title="Procedimento de Backup"
                        category="Segurança"
                        icon={<Shield className="text-indigo-500" />}
                        description="Como restaurar imagens de notebooks e acessar os logs do Veeam Backup local."
                    />
                    <DocCard
                        title="Acessos Padronizados"
                        category="Logins Local"
                        icon={<FileText className="text-emerald-500" />}
                        description="Lista de IPs e senhas padrão de switches, roteadores e APs (acesso restrito)."
                    />
                    <DocCard
                        title="Catálogo de Ramais"
                        category="Comunicação"
                        icon={<Phone className="text-amber-500" />}
                        description="Planilha atualizada com todos os ramais da planta industrial."
                    />
                </div>
            )}

            {activeTab === 'mapa' && (
                <div className="flex flex-col gap-6 h-[600px]">
                    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex-1 border border-slate-800">

                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Network size={200} />
                        </div>

                        <div className="relative z-10 flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2"><Building size={20} className="text-indigo-400" /> Planta Industrial (Main)</h2>
                                <p className="text-slate-400 text-sm">Topologia Lógica Simplificada</p>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Online</span>
                                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Offline</span>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 p-4">

                            {/* Core Node */}
                            <div className="col-span-1 md:col-span-3 flex justify-center mb-4">
                                <div className="bg-slate-800 border-2 border-indigo-500 rounded-xl p-4 w-64 text-center shadow-[0_0_15px_rgba(99,102,241,0.3)] relative">
                                    <Server className="mx-auto mb-2 text-indigo-400" size={32} />
                                    <h3 className="font-bold text-slate-100">RACK CORE CENTRAL</h3>
                                    <p className="text-xs text-slate-400">Sala de Servidores (TI)</p>
                                    <div className="mt-3 text-xs bg-slate-900 rounded p-2 flex justify-between border border-slate-700">
                                        <span>10.0.0.1</span>
                                        <span className="text-emerald-400 font-bold">UP</span>
                                    </div>
                                    <div className="absolute -bottom-8 left-1/2 w-0.5 h-8 bg-slate-700"></div>
                                </div>
                            </div>

                            {/* Edge Nodes */}
                            <div className="glass-dark border border-slate-700/50 rounded-2xl p-4 text-center relative top-line hover:border-indigo-500/50 transition-colors">
                                <div className="absolute -top-12 left-1/2 w-full h-0.5 bg-indigo-500/30 hidden md:block" style={{ marginLeft: '0%' }}></div>
                                <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-indigo-500/30"></div>
                                <Server className="mx-auto mb-2 text-slate-300" size={24} />
                                <h3 className="font-bold text-slate-200 text-sm">RACK PRODUÇÃO (SW2)</h3>
                                <p className="text-xs text-slate-400 mb-2">Galpão 3</p>
                                <div className="mt-2 text-xs bg-slate-900 rounded p-1.5 flex justify-between">
                                    <span>192.168.10.1</span>
                                    <span className="text-rose-400 font-bold">DOWN</span>
                                </div>
                            </div>

                            <div className="glass-dark border border-slate-700/50 rounded-2xl p-4 text-center relative top-line hover:border-indigo-500/50 transition-colors">
                                <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-indigo-500/30"></div>
                                <Server className="mx-auto mb-2 text-slate-300" size={24} />
                                <h3 className="font-bold text-slate-200 text-sm">RACK ADM (SW3)</h3>
                                <p className="text-xs text-slate-400 mb-2">Escritório Central</p>
                                <div className="mt-2 text-xs bg-slate-900 rounded p-1.5 flex justify-between">
                                    <span>192.168.20.1</span>
                                    <span className="text-emerald-400 font-bold">UP</span>
                                </div>
                            </div>

                            <div className="glass-dark border border-slate-700/50 rounded-2xl p-4 text-center relative top-line hover:border-indigo-500/50 transition-colors">
                                <div className="absolute -top-12 right-1/2 w-full h-0.5 bg-indigo-500/30 hidden md:block" style={{ marginRight: '0%' }}></div>
                                <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-indigo-500/30"></div>
                                <Server className="mx-auto mb-2 text-slate-300" size={24} />
                                <h3 className="font-bold text-slate-200 text-sm">RACK DOCAS (SW4)</h3>
                                <p className="text-xs text-slate-400 mb-2">Expedição</p>
                                <div className="mt-2 text-xs bg-slate-900 rounded p-1.5 flex justify-between">
                                    <span>192.168.30.1</span>
                                    <span className="text-emerald-400 font-bold">UP</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'contatos' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Buscar fornecedor..." className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-indigo-500" />
                        </div>
                        <button className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                            + Novo Contato
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <ContactRow name="Suporte Claro Empresas (Link Principal)" type="Operadora Link Dedicado" phone="0800 701 1212" email="N/A" extra="SLA: 4 horas" />
                        <ContactRow name="Vivo Fibra (Link Backup)" type="Operadora Banda Larga" phone="103 15" email="N/A" extra="CNPJ na fatura" />
                        <ContactRow name="TecnoService" type="Manutenção de Nobreak" phone="(11) 98888-7777" email="contato@tecnoservice.com.br" extra="Falar com João" />
                        <ContactRow name="Global Print (Zebra/Elgin)" type="Locação Impressoras Térmicas" phone="(11) 3333-4444" email="suporte@globalprint.com" extra="Contrato #9928" />
                    </div>
                </div>
            )}

        </div>
    );
}

// === AUXILIARES ===

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
            {icon} {label}
        </button>
    );
}

function DocCard({ title, category, description, icon }: { title: string, category: string, description: string, icon: React.ReactNode }) {
    return (
        <div className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    {icon}
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{category}</span>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
                </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
}

function ContactRow({ name, type, phone, email, extra }: { name: string, type: string, phone: string, email: string, extra: string }) {
    return (
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50">
            <div>
                <h4 className="font-bold text-slate-800">{name}</h4>
                <p className="text-xs text-slate-500 font-medium">{type}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {phone}</div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {email}</div>
            </div>
            <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded hidden md:block font-medium">
                {extra}
            </div>
        </div>
    );
}
