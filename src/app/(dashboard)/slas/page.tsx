"use client";

import React, { useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, Server, Monitor, ShieldCheck, BatteryWarning } from 'lucide-react';

export default function SLA_Calendar_Page() {
    const [events, setEvents] = useState<any[]>([]);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Calendar className="text-indigo-500" />
                        Lifecycle & SLAs
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Cronograma de Contratos, Garantias e Manutenções Críticas</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Resumo/Métricas */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full transform group-hover:scale-150 transition-transform duration-700"></div>
                        <h3 className="text-indigo-100 font-medium text-sm">Vencimentos Próximos (30 dias)</h3>
                        <div className="mt-4 flex items-end gap-3">
                            <span className="text-5xl font-black tracking-tighter">3</span>
                            <span className="text-indigo-200 font-medium mb-1">Avisos na Fila</span>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-rose-200/60 bg-rose-50/30">
                        <h3 className="text-rose-800 font-bold flex items-center gap-2 mb-4">
                            <AlertCircle size={18} /> Atenção Imediata
                        </h3>
                        {events.filter(e => e.status === 'urgent').map(urgent => (
                            <div key={urgent.id} className="p-4 bg-white rounded-xl shadow-sm border border-rose-100">
                                <p className="text-sm font-bold text-slate-800">{urgent.title}</p>
                                <p className="text-xs font-semibold text-rose-600 mt-2 uppercase flex items-center gap-1">
                                    <Clock size={12} /> Prazo: {urgent.date}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline / Calendário Lista */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl relative">
                    <div className="absolute top-0 left-8 bottom-0 w-0.5 bg-slate-200"></div>

                    <h2 className="text-lg font-bold text-slate-800 mb-8 pl-12">Cronograma do Semestre</h2>

                    <div className="space-y-6 pr-4">
                        {events.map((event) => (
                            <div key={event.id} className="relative pl-12 group">
                                {/* Timeline Dot */}
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${event.status === 'urgent' ? 'bg-rose-500' :
                                    event.status === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                                    }`}></div>

                                {/* Event Card */}
                                <div className={`p-5 rounded-2xl border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden ${event.status === 'urgent' ? 'border-rose-200 hover:border-rose-300' :
                                    event.status === 'warning' ? 'border-amber-200 hover:border-amber-300' : 'border-slate-100 hover:border-indigo-200'
                                    }`}>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`p-3 rounded-xl ${event.status === 'urgent' ? 'bg-rose-100 text-rose-600' :
                                            event.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {event.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{event.title}</p>
                                            <div className="flex gap-2 items-center mt-1">
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{event.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 sm:text-right border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                                        <p className="text-sm font-bold text-slate-700">Data Limite</p>
                                        <p className={`text-lg font-black ${event.status === 'urgent' ? 'text-rose-600' :
                                            event.status === 'warning' ? 'text-amber-500' : 'text-indigo-600'
                                            }`}>{event.date}</p>
                                    </div>

                                    {event.status === 'urgent' && <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-rose-50 to-transparent"></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
