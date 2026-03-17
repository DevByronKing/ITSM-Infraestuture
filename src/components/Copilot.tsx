"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    Bot, X, Send, ServerCrash, Wrench, BarChart3,
    Calendar, Package, Loader2, ExternalLink, Sparkles, ChevronRight
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
// Chips de Sugestão Inicial
// ─────────────────────────────────────────────
const INITIAL_CHIPS: ActionChip[] = [
    { label: '📊 Briefing do dia', prompt: 'Me dê um resumo geral da operação' },
    { label: '🚨 Chamados urgentes', prompt: 'Quais chamados estão urgentes?' },
    { label: '📅 Planejar semana', prompt: 'Crie um plano de atividades para a semana' },
    { label: '⚠️ Estoque crítico', prompt: 'Qual o status do almoxarifado?' },
];

// ─────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────
export default function Copilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            text: '👋 **Olá, Admin!** Sou seu Assistente de Infraestrutura com IA.\n\nPosso ajudar com chamados, estoque, planejamento, diagnóstico de rede e muito mais. Como posso ajudar hoje?',
            actions: INITIAL_CHIPS,
            category: 'Boas-vindas',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

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
            const aiMsg: Message = {
                role: 'ai',
                text: data.reply || 'Desculpe, não consegui processar sua mensagem.',
                actions: data.actions,
                category: data.category,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'ai',
                text: '⚠️ Erro de conexão. Verifique sua rede e tente novamente.',
                category: 'Erro',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">

            {/* Botão de Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Assistente IA"
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-105
                    ${isOpen
                        ? 'bg-slate-700 rotate-0'
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-[0_0_24px_rgba(99,102,241,0.55)]'
                    }`}
            >
                {isOpen
                    ? <X size={22} />
                    : (
                        <div className="relative">
                            <Bot size={26} />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                        </div>
                    )
                }
            </button>

            {/* Painel do Chat */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[22rem] sm:w-[26rem] flex flex-col rounded-2xl overflow-hidden shadow-2xl mb-4 border border-slate-200/80 bg-white animate-in slide-in-from-bottom-4 duration-300"
                    style={{ maxHeight: '80vh' }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                            <Sparkles size={17} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm tracking-wide leading-tight">Assistente IA</h3>
                            <p className="text-[10px] text-indigo-100 flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                Online · Infraestrutura & Suporte
                            </p>
                        </div>
                        <Link
                            href="/assistente"
                            onClick={() => setIsOpen(false)}
                            title="Abrir tela cheia"
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ExternalLink size={14} />
                        </Link>
                    </div>

                    {/* Área de Mensagens */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60" style={{ minHeight: '260px', maxHeight: '380px' }}>
                        {messages.map((msg, idx) => (
                            <MessageBubble key={idx} msg={msg} onActionClick={handleSend} />
                        ))}

                        {/* Indicador de Digitando */}
                        {isLoading && (
                            <div className="flex items-start gap-2">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                                    <Bot size={13} className="text-white" />
                                </div>
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1 items-center h-4">
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
                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center shrink-0">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Pergunte ao Assistente IA..."
                            disabled={isLoading}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow disabled:opacity-60"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} className="ml-0.5" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────

function MessageBubble({ msg, onActionClick }: { msg: Message; onActionClick: (text: string) => void }) {
    const isAi = msg.role === 'ai';

    // Renderiza markdown simples (negrito e quebra de linha)
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
        <div className={`flex items-end gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}>
            {isAi && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mb-auto mt-0.5">
                    <Bot size={13} className="text-white" />
                </div>
            )}
            <div className={`max-w-[88%] flex flex-col gap-2 ${isAi ? 'items-start' : 'items-end'}`}>
                {isAi && msg.category && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 px-1">{msg.category}</span>
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isAi
                        ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                    }`}
                >
                    {renderText(msg.text)}
                </div>

                {/* Action Chips */}
                {isAi && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.actions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => onActionClick(action.prompt)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 hover:border-indigo-200 transition-all whitespace-nowrap"
                            >
                                {action.label}
                                <ChevronRight size={10} />
                            </button>
                        ))}
                    </div>
                )}

                <span className="text-[9px] text-slate-400 px-1">
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
