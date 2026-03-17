"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles, Send, Loader2, Bot, RefreshCw,
    AlertTriangle, CheckCircle2, Package, Wrench,
    Calendar, BarChart3, ChevronRight, Clock, Zap
} from 'lucide-react';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────
interface ActionChip {
    label: string;
    prompt: string;
}

interface Message {
    role: 'ai' | 'user';
    text: string;
    actions?: ActionChip[];
    category?: string;
    timestamp: Date;
}

// ─────────────────────────────────────────────
// Ações Sugeridas Proativas (painel lateral)
// ─────────────────────────────────────────────
const QUICK_ACTIONS = [
    { icon: <BarChart3 size={16} className="text-indigo-500" />, label: 'Briefing do dia', prompt: 'Me dê um resumo geral da operação', color: 'indigo' },
    { icon: <AlertTriangle size={16} className="text-rose-500" />, label: 'Chamados urgentes', prompt: 'Quais chamados estão urgentes?', color: 'rose' },
    { icon: <Package size={16} className="text-amber-500" />, label: 'Estoque crítico', prompt: 'Qual o status do almoxarifado?', color: 'amber' },
    { icon: <Wrench size={16} className="text-slate-500" />, label: 'Ativos em manutenção', prompt: 'Quais equipamentos estão em manutenção?', color: 'slate' },
    { icon: <Calendar size={16} className="text-purple-500" />, label: 'Planejar semana', prompt: 'Crie um plano de atividades para a semana', color: 'purple' },
    { icon: <Clock size={16} className="text-emerald-500" />, label: 'Empréstimos ativos', prompt: 'Quais empréstimos estão ativos?', color: 'emerald' },
];

// ─────────────────────────────────────────────
// Página Principal
// ─────────────────────────────────────────────
export default function AssistantePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isBriefingLoading, setIsBriefingLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Carrega o briefing automático ao entrar na página
    useEffect(() => {
        const loadBriefing = async () => {
            setIsBriefingLoading(true);
            try {
                const res = await fetch('/api/copilot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'Me dê um resumo geral da operação' }),
                });
                const data = await res.json();
                setMessages([{
                    role: 'ai',
                    text: data.reply || 'Olá! Estou pronto para ajudar.',
                    actions: data.actions,
                    category: data.category,
                    timestamp: new Date(),
                }]);
            } catch {
                setMessages([{
                    role: 'ai',
                    text: '👋 **Olá, Admin!** Sou seu Assistente de Infraestrutura com IA.\n\nUse os atalhos à direita ou escreva sua dúvida abaixo para começar.',
                    actions: [],
                    category: 'Boas-vindas',
                    timestamp: new Date(),
                }]);
            } finally {
                setIsBriefingLoading(false);
            }
        };
        loadBriefing();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        const userMsg: Message = { role: 'user', text: messageText, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'ai',
                text: data.reply || 'Desculpe, não consegui processar.',
                actions: data.actions,
                category: data.category,
                timestamp: new Date(),
            }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: '⚠️ Erro ao conectar. Tente novamente.',
                category: 'Erro',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshBriefing = () => {
        setMessages([]);
        setIsBriefingLoading(true);
        fetch('/api/copilot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Me dê um resumo geral da operação' }),
        })
            .then(r => r.json())
            .then(data => {
                setMessages([{
                    role: 'ai',
                    text: data.reply,
                    actions: data.actions,
                    category: data.category,
                    timestamp: new Date(),
                }]);
            })
            .catch(() => { })
            .finally(() => setIsBriefingLoading(false));
    };

    return (
        <div className="p-8 h-full flex flex-col gap-6">

            {/* Cabeçalho */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                            <Sparkles size={22} className="text-white" />
                        </div>
                        Assistente IA
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Copiloto inteligente para profissionais de infraestrutura</p>
                </div>
                <button
                    onClick={handleRefreshBriefing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm"
                >
                    <RefreshCw size={15} className={isBriefingLoading ? 'animate-spin text-indigo-500' : ''} />
                    Atualizar briefing
                </button>
            </div>

            {/* Grid: Chat + Painel Lateral */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

                {/* Chat Principal */}
                <div className="lg:col-span-2 glass-panel rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: '500px' }}>

                    {/* Header do chat */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                            <Bot size={17} />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm">ITSM Copilot</h2>
                            <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Analisando dados em tempo real
                            </p>
                        </div>
                    </div>

                    {/* Mensagens */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
                        {isBriefingLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <p className="text-sm font-medium">Carregando briefing operacional...</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <FullPageMessageBubble key={idx} msg={msg} onActionClick={handleSend} />
                            ))
                        )}

                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                                    <Bot size={15} className="text-white" />
                                </div>
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                                    <div className="flex gap-1.5 items-center">
                                        <span className="text-xs text-slate-400 mr-1">Analisando</span>
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center shrink-0">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Pergunte sobre chamados, estoque, planejamento, rede..."
                            disabled={isLoading}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow disabled:opacity-60"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="h-11 px-5 rounded-xl bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-md"
                        >
                            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                            Enviar
                        </button>
                    </div>
                </div>

                {/* Painel Lateral */}
                <div className="space-y-5">

                    {/* Ações Rápidas */}
                    <div className="glass-panel rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                            <Zap size={15} className="text-indigo-500" />
                            Ações Rápidas
                        </h3>
                        <div className="space-y-2">
                            {QUICK_ACTIONS.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(action.prompt)}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white text-left hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group disabled:opacity-50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                        {action.icon}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 flex-1">{action.label}</span>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dicas de Uso */}
                    <div className="glass-panel rounded-2xl p-5">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                            <Sparkles size={15} className="text-purple-500" />
                            O que posso fazer?
                        </h3>
                        <ul className="space-y-2.5 text-sm text-slate-600">
                            {[
                                '🚨 Triagem e priorização de chamados',
                                '📦 Alertas de estoque mínimo',
                                '🔧 Status de ativos e manutenções',
                                '📅 Plano semanal de atividades',
                                '📊 Briefing executivo da operação',
                                '📡 Diagnóstico de rede e links',
                                '🔋 Gestão de nobreaks e energia',
                                '🖨️ Suporte a impressoras e coletores',
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-1.5 leading-snug">{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Componente de Bolha (versão full-page)
// ─────────────────────────────────────────────
function FullPageMessageBubble({ msg, onActionClick }: { msg: Message; onActionClick: (text: string) => void }) {
    const isAi = msg.role === 'ai';

    const renderText = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part.split('\n').map((line, j) => (
                <React.Fragment key={`${i}-${j}`}>
                    {j > 0 && <br />}
                    {line}
                </React.Fragment>
            ));
        });
    };

    return (
        <div className={`flex items-end gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
            {isAi && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mb-auto shadow-md">
                    <Bot size={15} className="text-white" />
                </div>
            )}
            <div className={`max-w-[85%] flex flex-col gap-2 ${isAi ? 'items-start' : 'items-end'}`}>
                {isAi && msg.category && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">{msg.category}</span>
                )}
                <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isAi
                        ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                    }`}
                >
                    {renderText(msg.text)}
                </div>

                {isAi && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {msg.actions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => onActionClick(action.prompt)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 hover:border-indigo-200 transition-all"
                            >
                                {action.label}
                                <ChevronRight size={10} />
                            </button>
                        ))}
                    </div>
                )}

                <span className="text-[9px] text-slate-400">
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
