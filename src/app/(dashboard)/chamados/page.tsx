"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, HelpCircle, CheckCircle2, Clock, PlayCircle, X, MessageSquare, Paperclip, Send, Loader2 } from "lucide-react";
import { supabase } from '@/lib/supabase';

export default function ChamadosPage() {
    const [activeTab, setActiveTab] = useState<'abertos' | 'resolvidos'>('abertos');
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

    // Supabase States
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // New Ticket Form State
    const [newTicket, setNewTicket] = useState({
        title: '', requester: '', department: 'Produção', priority: 'Baixa Instabilidade', description: ''
    });

    // Resolution Form State
    const [resolutionNote, setResolutionNote] = useState('');

    const fetchTickets = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('chamados')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            // formata o timeAgo simples baseado na data
            const mapped = data.map(t => {
                const date = new Date(t.created_at);
                const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                return { ...t, timeAgo: formatter.format(date) };
            });
            setTickets(mapped);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCreateTicket = async () => {
        if (!newTicket.title || !newTicket.requester) return;
        setIsSaving(true);
        const { error } = await supabase.from('chamados').insert([{
            title: newTicket.title,
            description: newTicket.description,
            requester: newTicket.requester,
            department: newTicket.department,
            priority: newTicket.priority,
            status: 'Aberto'
        }]);

        if (!error) {
            setNewTicket({ title: '', requester: '', department: 'Produção', priority: 'Baixa Instabilidade', description: '' });
            setIsNewTicketOpen(false);
            fetchTickets();
        }
        setIsSaving(false);
    };

    const handleResolveTicket = async () => {
        if (!selectedTicket || !resolutionNote) return;
        setIsSaving(true);

        const { error } = await supabase
            .from('chamados')
            .update({
                status: 'Resolvido',
                solution_notes: resolutionNote,
                solved_at: new Date().toISOString()
            })
            .eq('id', selectedTicket.id);

        if (!error) {
            setResolutionNote('');
            setSelectedTicket(null);
            fetchTickets();
        }
        setIsSaving(false);
    };

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <HelpCircle className="text-indigo-500" />
                        Helpdesk Central
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Gestão de Chamados e Ocorrências Locais</p>
                </div>
                <button
                    onClick={() => setIsNewTicketOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Novo Chamado
                </button>
            </div>

            <div className="glass-panel rounded-2xl shadow-xl overflow-hidden flex flex-col relative z-0">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-3xl -z-10 rounded-full pointer-events-none"></div>

                {/* Header Tabs */}
                <div className="flex items-center border-b border-slate-200 bg-slate-50/50">
                    <button
                        className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'abertos' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        onClick={() => setActiveTab('abertos')}
                    >
                        <Clock size={16} />
                        Pendentes / Em Andamento
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'resolvidos' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        onClick={() => setActiveTab('resolvidos')}
                    >
                        <CheckCircle2 size={16} />
                        Concluídos Recentes
                    </button>
                </div>

                {/* Content List */}
                <div className="p-0 max-h-[600px] overflow-y-auto w-full relative">
                    <div className="divide-y divide-slate-100">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-500 w-full flex flex-col items-center justify-center">
                                <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
                                Carregando chamados...
                            </div>
                        ) : tickets.filter(t => activeTab === 'abertos' ? t.status !== 'Resolvido' : t.status === 'Resolvido').length === 0 ? (
                            <div className="p-12 text-center text-slate-500 w-full">
                                Nenhum chamado encontrado.
                            </div>
                        ) : tickets
                            .filter(t => activeTab === 'abertos' ? t.status !== 'Resolvido' : t.status === 'Resolvido')
                            .map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="p-5 hover:bg-slate-50/50 transition-colors group flex gap-5 items-start cursor-pointer"
                                    onClick={() => setSelectedTicket(ticket)}
                                >

                                    {/* Status Indicator */}
                                    <div className="pt-1">
                                        {ticket.status === 'Aberto' && <HelpCircle className="text-rose-500" size={24} />}
                                        {ticket.status === 'Em Andamento' && <PlayCircle className="text-indigo-500" size={24} />}
                                        {ticket.status === 'Resolvido' && <CheckCircle2 className="text-emerald-500" size={24} />}
                                    </div>

                                    {/* Info principal */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-sm font-mono font-medium text-slate-400">#{ticket.id}</span>
                                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                                                {ticket.title}
                                            </h3>
                                            {(ticket.priority === 'Crítica' || ticket.priority.includes('Crítica')) && (
                                                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded uppercase tracking-wider">Prioridade Máxima</span>
                                            )}
                                        </div>

                                        <p className="text-slate-600 text-sm leading-relaxed mb-3 max-w-3xl line-clamp-2">
                                            {ticket.description}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                                <span className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700">
                                                    {ticket.requester.substring(0, 2).toUpperCase()}
                                                </span>
                                                {ticket.requester}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                                Setor: {ticket.department}
                                            </span>
                                            <span className="text-xs text-slate-400">Aberto em {ticket.timeAgo}</span>
                                        </div>
                                    </div>

                                    {/* Ação Rapida */}
                                    {activeTab === 'abertos' && (
                                        <button className="text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 md:opacity-100 border border-indigo-100">
                                            Atender
                                        </button>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* MODAL DETALHES DO TICKET E SOLUÇÃO */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">#{selectedTicket.id}</span>
                                <h2 className="text-lg font-bold text-slate-800">Tratativa de Chamado</h2>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-slate-50/30">
                            {/* Resumo do Chamado */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-xl text-slate-900">{selectedTicket.title}</h3>
                                    {(selectedTicket.priority === 'Crítica' || selectedTicket.priority.includes('Crítica')) && (
                                        <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded uppercase tracking-wider whitespace-nowrap">Crítica</span>
                                    )}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-line">{selectedTicket.description}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Solicitante</p>
                                        <p className="font-medium text-slate-800">{selectedTicket.requester}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Setor</p>
                                        <p className="font-medium text-slate-800">{selectedTicket.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Status Atual</p>
                                        <p className="font-medium text-slate-800">{selectedTicket.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Abertura</p>
                                        <p className="font-medium text-slate-800">{selectedTicket.timeAgo}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Histórico/Log de Ações (Mocado) */}
                            <div className="px-2">
                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><MessageSquare size={16} /> Histórico da Trativa</h4>

                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-xs">TI</div>
                                        <div className="bg-white border border-slate-200 p-3 rounded-lg rounded-tl-none shadow-sm text-sm">
                                            <p className="text-slate-700 mb-1">{selectedTicket.solution_notes || 'Chamado aguardando tratativa ou sem notas resolutivas registradas.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input para Documentar Resolução */}
                        <div className="p-4 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            {selectedTicket.status !== 'Resolvido' ? (
                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-semibold text-slate-700">Adicionar Interação ou Fechar Chamado</label>
                                    <textarea
                                        value={resolutionNote}
                                        onChange={e => setResolutionNote(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                        placeholder="Ex: Troquei o cabo de rede porta 4. Testado o ping (OK). Equipamento operando normalmente..."
                                    ></textarea>
                                    <div className="flex items-center justify-between mt-2">
                                        <button className="text-slate-400 hover:text-slate-600 p-2"><Paperclip size={20} /></button>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition">Atualizar Info</button>
                                            <button
                                                onClick={handleResolveTicket}
                                                disabled={isSaving || !resolutionNote}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                Finalizar Chamado
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
                                    <h3 className="font-bold text-emerald-800 flex justify-center items-center gap-2"><CheckCircle2 size={18} /> Chamado Resolvido</h3>
                                    <p className="text-sm text-emerald-600 mt-1">Nenhuma ação necessária.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CRIAR NOVO CHAMADO AVULSO */}
            {isNewTicketOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Abertura de Chamado (TI)</h2>
                            <button onClick={() => setIsNewTicketOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Resumo do Problema (Título)</label>
                                <input value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Ex: Impressora Doca 2 não liga" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Solicitante</label>
                                    <input value={newTicket.requester} onChange={e => setNewTicket({ ...newTicket, requester: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Responsável local" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Setor/Área</label>
                                    <select value={newTicket.department} onChange={e => setNewTicket({ ...newTicket, department: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                        <option value="Produção">Produção</option>
                                        <option value="Expedição">Expedição</option>
                                        <option value="Recebimento">Recebimento</option>
                                        <option value="Administrativo">Administrativo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Gravidade da Ocorrência</label>
                                <select value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm">
                                    <option value="Baixa Instabilidade">Baixa Instabilidade (Não afeta operação)</option>
                                    <option value="Média">Média (Afeta um ou mais usuários locais)</option>
                                    <option value="Alta">Alta (Parada de setor isolado)</option>
                                    <option value="Crítica" className="font-bold text-rose-600">Crítica (PARADA GERAL DE PRODUÇÃO)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Descrição Técnica / Observações</label>
                                <textarea value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"></textarea>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsNewTicketOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">Cancelar</button>
                            <button
                                onClick={handleCreateTicket}
                                disabled={isSaving || !newTicket.title || !newTicket.requester}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition flex gap-2 items-center disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Abrir Ocorrência
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

