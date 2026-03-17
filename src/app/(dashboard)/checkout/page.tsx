"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, UserCheck, Clock, CheckCircle2, AlertTriangle, FileText, ArrowRight, X, Send, Loader2, HardDrive, Save, Eye, Download, Sparkles, Type, AlignLeft, RotateCcw } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// ── Template Padrão Inicial ────────────────────────────────────────
const DEFAULT_TERM_TITLE = "TERMO DE RESPONSABILIDADE — EQUIPAMENTO DE TI";
const DEFAULT_TERM_BODY = `Eu, [NOME], portador(a) do cargo/função exercida no setor [SETOR], declaro ter recebido em [DATA] o equipamento descrito abaixo, sob minha total responsabilidade:

Equipamento: [EQUIPAMENTO]

Comprometo-me a:
1. Zelar pela guarda, conservação e integridade do equipamento acima descrito;
2. Utilizar o equipamento exclusivamente para fins profissionais relacionados à empresa;
3. Comunicar imediatamente ao setor de TI qualquer avaria, defeito ou extravio;
4. Devolver o equipamento nas mesmas condições em que o recebi, salvo desgaste normal de uso.

O descumprimento das condições acima poderá acarretar as medidas administrativas cabíveis, incluindo o ressarcimento do valor do bem.

______________________________
Assinatura do Responsável

______________________________
Setor de TI — Responsável pela Entrega`;

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-8"><Loader2 className="animate-spin" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutContent() {
    const [activeTab, setActiveTab] = useState<'ativos' | 'historico'>('ativos');
    const [isNewOpen, setIsNewOpen] = useState(false);

    // Supabase States
    const [checkouts, setCheckouts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        asset_name: '', borrower_name: '', department: 'Administrativo', notes: '', asset_id: ''
    });

    // Assets to select from
    const [availableAssets, setAvailableAssets] = useState<any[]>([]);
    const searchParams = useSearchParams();

    // ── Termo Padrão States ────────────────────────────────────────
    const [isTermModalOpen, setIsTermModalOpen] = useState(false);
    const [termTitle, setTermTitle] = useState(DEFAULT_TERM_TITLE);
    const [termBody, setTermBody] = useState(DEFAULT_TERM_BODY);
    const [isTermLoading, setIsTermLoading] = useState(false);
    const [isTermSaving, setIsTermSaving] = useState(false);
    const [termSaveSuccess, setTermSaveSuccess] = useState(false);
    const [termPreviewMode, setTermPreviewMode] = useState(false);

    useEffect(() => {
        const assetId = searchParams.get('asset_id');
        const assetName = searchParams.get('asset_name');
        
        if (assetId && assetName) {
            setFormData(prev => ({ ...prev, asset_id: assetId, asset_name: assetName }));
            setIsNewOpen(true);
        }
    }, [searchParams]);

    const fetchAvailableAssets = async () => {
        const { data } = await supabase
            .from('ativos')
            .select('id, name, brand, model, status')
            .eq('status', 'Ativo')
            .order('name');
        
        if (data) setAvailableAssets(data);
    };

    useEffect(() => {
        fetchAvailableAssets();
    }, []);

    const fetchCheckouts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('checkout_loans')
            .select('*')
            .order('loan_date', { ascending: false });

        if (!error && data) {
            const mapped = data.map(c => {
                const dateIn = new Date(c.loan_date);
                const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                const dateOut = c.return_date ? formatter.format(new Date(c.return_date)) : null;
                return {
                    ...c,
                    formattedLoanDate: formatter.format(dateIn),
                    formattedReturnDate: dateOut
                };
            });
            setCheckouts(mapped);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCheckouts();
    }, []);

    // ── Termo Padrão: Load / Save ──────────────────────────────────
    const fetchTermTemplate = useCallback(async () => {
        setIsTermLoading(true);
        try {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'default_term_template')
                .single();

            if (data?.value) {
                const parsed = JSON.parse(data.value);
                setTermTitle(parsed.title || DEFAULT_TERM_TITLE);
                setTermBody(parsed.body || DEFAULT_TERM_BODY);
            }
        } catch {
            // Use defaults if not found
        }
        setIsTermLoading(false);
    }, []);

    const saveTermTemplate = async () => {
        setIsTermSaving(true);
        const payload = JSON.stringify({ title: termTitle, body: termBody });

        const { data: existing } = await supabase
            .from('settings')
            .select('id')
            .eq('key', 'default_term_template')
            .single();

        if (existing) {
            await supabase
                .from('settings')
                .update({ value: payload, updated_at: new Date().toISOString() })
                .eq('key', 'default_term_template');
        } else {
            await supabase.from('settings').insert([{
                key: 'default_term_template',
                value: payload
            }]);
        }

        setIsTermSaving(false);
        setTermSaveSuccess(true);
        setTimeout(() => setTermSaveSuccess(false), 2500);
    };

    const handleOpenTermModal = () => {
        fetchTermTemplate();
        setIsTermModalOpen(true);
        setTermPreviewMode(false);
    };

    const handleResetTemplate = () => {
        setTermTitle(DEFAULT_TERM_TITLE);
        setTermBody(DEFAULT_TERM_BODY);
    };

    // ── Gerar Termo PDF para um empréstimo ─────────────────────────
    const generateTermPDF = async (checkout: any) => {
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Fetch latest template
        let title = termTitle;
        let body = termBody;
        try {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'default_term_template')
                .single();
            if (data?.value) {
                const parsed = JSON.parse(data.value);
                title = parsed.title || title;
                body = parsed.body || body;
            }
        } catch { /* use current state */ }

        const loanDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(checkout.loan_date));

        // Replace placeholders
        const filledBody = body
            .replace(/\[NOME\]/g, checkout.borrower_name)
            .replace(/\[EQUIPAMENTO\]/g, checkout.asset_name)
            .replace(/\[DATA\]/g, loanDate)
            .replace(/\[SETOR\]/g, checkout.department || 'N/A');

        // ── PDF Rendering ─────────────────────────────────────────
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        let y = 25;

        // Header line
        doc.setDrawColor(79, 70, 229); // Indigo
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(30, 41, 59);
        const titleLines = doc.splitTextToSize(title, contentWidth);
        doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
        y += titleLines.length * 7 + 8;

        // Subtitle
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(`Gerado em: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}`, pageWidth / 2, y, { align: 'center' });
        y += 12;

        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // Body
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        const bodyLines = doc.splitTextToSize(filledBody, contentWidth);

        for (const line of bodyLines) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, margin, y);
            y += 6;
        }

        // Footer
        y = 285;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('ITSMPro — Gerado automaticamente pelo sistema de gestão de TI', pageWidth / 2, y, { align: 'center' });

        doc.save(`Termo_${checkout.borrower_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // ── CRUD ────────────────────────────────────────────────────────
    const handleCreateCheckout = async () => {
        if (!formData.asset_name || !formData.borrower_name) return;
        setIsSaving(true);
        const { error } = await supabase.from('checkout_loans').insert([{
            asset_name: formData.asset_name,
            borrower_name: formData.borrower_name,
            department: formData.department,
            notes: formData.notes,
            status: 'Ativo'
        }]);

        if (!error) {
            setFormData({ asset_name: '', borrower_name: '', department: 'Administrativo', notes: '', asset_id: '' });
            setIsNewOpen(false);
            fetchCheckouts();
        }
        setIsSaving(false);
    };

    const handleReturn = async (id: string) => {
        if (!confirm('Confirmar devolução deste equipamento?')) return;
        setIsSaving(true);
        const { error } = await supabase
            .from('checkout_loans')
            .update({ status: 'Devolvido', return_date: new Date().toISOString() })
            .eq('id', id);

        if (!error) {
            fetchCheckouts();
        }
        setIsSaving(false);
    };

    // ── Preview: substitui placeholders com dados de exemplo ───────
    const previewText = termBody
        .replace(/\[NOME\]/g, 'João da Silva')
        .replace(/\[EQUIPAMENTO\]/g, 'Notebook Dell Latitude 5520')
        .replace(/\[DATA\]/g, new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date()))
        .replace(/\[SETOR\]/g, 'Produção');

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><CheckCircle2 size={24} /></div>
                        Checkout de Equipamentos
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Controle de empréstimos, notebooks reserva e coletores</p>
                </div>
                <button
                    onClick={() => setIsNewOpen(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Novo Empréstimo
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Painel Principal */}
                <div className="lg:col-span-2 glass-panel rounded-2xl flex flex-col relative overflow-hidden z-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-3xl -z-10 rounded-full pointer-events-none"></div>

                    <div className="flex items-center border-b border-slate-200 bg-slate-50/50">
                        <button
                            className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'ativos' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                            onClick={() => setActiveTab('ativos')}
                        >
                            <Clock size={16} />
                            Empréstimos Ativos
                        </button>
                        <button
                            className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'historico' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                            onClick={() => setActiveTab('historico')}
                        >
                            <CheckCircle2 size={16} />
                            Devoluções Recentes
                        </button>
                    </div>

                    <div className="p-0 overflow-y-auto max-h-[600px]">
                        <div className="divide-y divide-slate-100">
                            {isLoading ? (
                                <div className="p-12 text-center text-slate-500 w-full flex flex-col items-center justify-center">
                                    <Loader2 size={32} className="animate-spin text-emerald-500 mb-4" />
                                    Carregando empréstimos...
                                </div>
                            ) : checkouts.filter(c => activeTab === 'ativos' ? c.status === 'Ativo' : c.status === 'Devolvido').length === 0 ? (
                                <div className="p-12 text-center text-slate-500 w-full">
                                    Nenhum registro encontrado nesta aba.
                                </div>
                            ) : checkouts.filter(c => activeTab === 'ativos' ? c.status === 'Ativo' : c.status === 'Devolvido').map((checkout) => (
                                <div key={checkout.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
                                            <UserCheck size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{checkout.asset_name}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
                                                <span><strong className="font-medium text-slate-700">Para:</strong> {checkout.borrower_name} ({checkout.department})</span>
                                                <span className="flex items-center gap-1.5"><Clock size={14} /> Saída: {checkout.formattedLoanDate}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2">Motivo: {checkout.notes}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        {checkout.status === 'Ativo' ? (
                                            <>
                                                <button
                                                    onClick={() => generateTermPDF(checkout)}
                                                    className="flex-1 md:flex-none px-3 py-2 bg-white border border-indigo-200 text-indigo-600 text-sm font-medium rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1.5"
                                                    title="Gerar Termo de Responsabilidade em PDF"
                                                >
                                                    <Download size={15} />
                                                    Termo
                                                </button>
                                                <button
                                                    onClick={() => handleReturn(checkout.id)}
                                                    disabled={isSaving}
                                                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-50"
                                                >
                                                    Registrar Devolução
                                                </button>
                                            </>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-full md:w-auto">
                                                <CheckCircle2 size={14} /> Devolvido em {checkout.formattedReturnDate}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gerador de Termo */}
                <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-xl shadow-lg flex flex-col h-fit">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-indigo-400" />
                        Termo de Responsabilidade
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Gere um termo digital instantâneo para coleta de assinatura via WhatsApp ou impressão quando emprestar um hardware de alto valor (ex: Notebooks e Coletores RT).
                    </p>

                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-4 font-mono text-xs text-slate-300 leading-relaxed">
                        &ldquo;{termBody.substring(0, 120).replace(/\n/g, ' ')}...&rdquo;
                    </div>

                    {/* Placeholders Guide */}
                    <div className="mb-6 space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Placeholders disponíveis</p>
                        {[
                            { tag: '[NOME]', desc: 'Nome do solicitante' },
                            { tag: '[EQUIPAMENTO]', desc: 'Nome do equipamento' },
                            { tag: '[DATA]', desc: 'Data do empréstimo' },
                            { tag: '[SETOR]', desc: 'Setor/departamento' },
                        ].map(p => (
                            <div key={p.tag} className="flex items-center gap-2 text-xs">
                                <code className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[10px]">{p.tag}</code>
                                <span className="text-slate-500">{p.desc}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleOpenTermModal}
                        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-all flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] transform hover:-translate-y-0.5"
                    >
                        <Sparkles size={16} />
                        Configurar Termo Padrão <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                MODAL: CONFIGURAR TERMO PADRÃO
               ══════════════════════════════════════════════════════════ */}
            {isTermModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsTermModalOpen(false)}>
                    <div
                        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-700/60 flex justify-between items-center bg-slate-800/40">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <FileText size={20} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Configurar Termo Padrão</h2>
                                    <p className="text-xs text-slate-500">Edite o modelo do termo de responsabilidade</p>
                                </div>
                            </div>
                            <button onClick={() => setIsTermModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tab Toggle: Editor / Preview */}
                        <div className="flex border-b border-slate-700/60">
                            <button
                                onClick={() => setTermPreviewMode(false)}
                                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${!termPreviewMode ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/30' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Type size={14} />
                                Editor
                            </button>
                            <button
                                onClick={() => setTermPreviewMode(true)}
                                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${termPreviewMode ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/30' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Eye size={14} />
                                Preview
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isTermLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                                    <Loader2 size={28} className="animate-spin text-indigo-400 mb-3" />
                                    <span className="text-sm">Carregando template...</span>
                                </div>
                            ) : termPreviewMode ? (
                                /* ── Preview Mode ──────────────────────────── */
                                <div className="bg-white rounded-xl p-8 text-slate-800 shadow-inner max-w-2xl mx-auto">
                                    <div className="border-b-2 border-indigo-500 pb-3 mb-6">
                                        <h3 className="text-base font-bold text-center text-slate-800 uppercase tracking-wider">{termTitle}</h3>
                                    </div>
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 font-serif">
                                        {previewText}
                                    </div>
                                    <div className="mt-8 border-t border-slate-200 pt-4">
                                        <p className="text-[10px] text-slate-400 text-center italic">Preview — dados de exemplo serão substituídos automaticamente ao gerar o termo</p>
                                    </div>
                                </div>
                            ) : (
                                /* ── Editor Mode ───────────────────────────── */
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                            <AlignLeft size={12} />
                                            Título do Termo
                                        </label>
                                        <input
                                            value={termTitle}
                                            onChange={e => setTermTitle(e.target.value)}
                                            className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
                                            placeholder="Título do termo de responsabilidade..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                            <FileText size={12} />
                                            Corpo do Termo
                                        </label>
                                        <textarea
                                            value={termBody}
                                            onChange={e => setTermBody(e.target.value)}
                                            className="w-full p-4 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 text-sm leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 font-mono min-h-[320px] resize-y"
                                            placeholder="Digite o corpo do termo... Use [NOME], [EQUIPAMENTO], [DATA] e [SETOR] como placeholders."
                                        />
                                    </div>

                                    {/* Placeholder Help Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {['[NOME]', '[EQUIPAMENTO]', '[DATA]', '[SETOR]'].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    setTermBody(prev => prev + ' ' + tag);
                                                }}
                                                className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-mono hover:bg-indigo-500/20 transition-colors cursor-pointer"
                                                title={`Inserir ${tag} no final`}
                                            >
                                                + {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-slate-700/60 bg-slate-800/30 flex justify-between items-center gap-3">
                            <button
                                onClick={handleResetTemplate}
                                className="px-4 py-2.5 text-slate-500 font-medium hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-all text-sm flex items-center gap-2"
                                title="Restaurar template padrão"
                            >
                                <RotateCcw size={14} />
                                Restaurar Padrão
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsTermModalOpen(false)}
                                    className="px-5 py-2.5 text-slate-400 font-medium hover:text-white hover:bg-slate-700 rounded-lg transition-all text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveTermTemplate}
                                    disabled={isTermSaving}
                                    className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none ${
                                        termSaveSuccess
                                            ? 'bg-emerald-500 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.4)]'
                                            : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)]'
                                    }`}
                                >
                                    {isTermSaving ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : termSaveSuccess ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {termSaveSuccess ? 'Salvo com Sucesso!' : 'Salvar Modelo'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                MODAL: NOVO EMPRÉSTIMO
               ══════════════════════════════════════════════════════════ */}
            {isNewOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Registrar Empréstimo</h2>
                            <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Equipamento (Ativo a emprestar)</label>
                                <div className="flex flex-col gap-2">
                                    <select 
                                        value={formData.asset_id} 
                                        onChange={e => {
                                            const selected = availableAssets.find(a => a.id === e.target.value);
                                            setFormData({ ...formData, asset_id: e.target.value, asset_name: selected?.name || '' });
                                        }}
                                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                                    >
                                        <option value="">-- Selecione um Ativo do Inventário --</option>
                                        {availableAssets.map(asset => (
                                            <option key={asset.id} value={asset.id}>{asset.name} ({asset.brand} {asset.model})</option>
                                        ))}
                                        <option value="custom">Outro (Digitar manualmente...)</option>
                                    </select>

                                    {(formData.asset_id === 'custom' || !formData.asset_id) && (
                                        <input 
                                            value={formData.asset_name} 
                                            onChange={e => setFormData({ ...formData, asset_name: e.target.value })} 
                                            type="text" 
                                            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none animate-in fade-in slide-in-from-top-1" 
                                            placeholder="Digite o nome do equipamento..." 
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome do Solicitante</label>
                                    <input value={formData.borrower_name} onChange={e => setFormData({ ...formData, borrower_name: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Responsável local" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Setor/Área</label>
                                    <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                                        <option value="Administrativo">Administrativo</option>
                                        <option value="Produção">Produção</option>
                                        <option value="Expedição">Expedição</option>
                                        <option value="Recebimento">Recebimento</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Motivo / Observações</label>
                                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[100px] text-sm" placeholder="Ex: Equipamento de backup emprestado enquanto máquina principal da linha 2 gela no TI..."></textarea>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsNewOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">Cancelar</button>
                            <button
                                onClick={handleCreateCheckout}
                                disabled={isSaving || !formData.asset_name || !formData.borrower_name}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition flex gap-2 items-center disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Efetivar Empréstimo
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
