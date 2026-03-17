"use client";

import React, { useState } from 'react';
import { Zap, Send, BellRing, Smartphone, ShieldAlert, CheckCircle2, MoreVertical, Plus } from 'lucide-react';

export default function AutomationsPage() {
    const [rules, setRules] = useState<any[]>([]);

    return (
        <div className="p-8 space-y-8">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Zap className="text-indigo-500" />
                        Automações & Webhooks
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Configure gatilhos de alerta via WhatsApp e Telegram</p>
                </div>
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] flex items-center gap-2 transform hover:-translate-y-0.5">
                    <Plus size={18} />
                    Nova Regra
                </button>
            </div>

            {/* Content Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Simulator Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl -z-10 rounded-full"></div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Send size={18} className="text-emerald-500" />
                            Simulador de Disparo
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Mensagem de Teste</label>
                                <textarea
                                    className="w-full mt-1 p-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    rows={3}
                                    defaultValue={"[ALERTA CRÍTICO ITSM]\nO Switch DOCAS-01 parou de responder."}
                                />
                            </div>
                            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors shadow-md flex items-center justify-center gap-2">
                                <Smartphone size={16} /> Enviar Teste WhatsApp
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-sm font-bold text-slate-800 mb-4">Status das Integrações</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 size={16} /></div>
                                    <span className="font-semibold text-sm text-slate-700">API WhatsApp</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">ONLINE</span>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 size={16} /></div>
                                    <span className="font-semibold text-sm text-slate-700">Bot Telegram</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-600">ONLINE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rules List */}
                <div className="lg:col-span-2 glass-panel p-0 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100/50 bg-white/50 backdrop-blur-md">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ShieldAlert size={18} className="text-indigo-500" />
                            Regras Ativas
                        </h2>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-4">
                            {rules.map((rule) => (
                                <div key={rule.id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow group">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 w-2 h-2 rounded-full ${rule.status === 'Ativo' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{rule.name}</h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Quando <span className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">{rule.trigger}</span>
                                                então enviar para <span className="font-semibold">{rule.channel}</span> ({rule.target})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end md:self-auto">
                                        <button className="px-4 py-1.5 text-xs font-bold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition">
                                            {rule.status === 'Ativo' ? 'Pausar' : 'Ativar'}
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
