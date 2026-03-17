"use client";

import React, { useState } from "react";
import { Download, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import jsPDF from "jspdf";

export default function RelatoriosPage() {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = () => {
        setIsGenerating(true);

        setTimeout(() => {
            // Usando jsPDF basico para gerar o relatório executivo
            const doc = new jsPDF();

            // Header
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Relatório Executivo TI - Local", 15, 20);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Planta Principal - Semana 42", 15, 30);

            // Resumo Executivo
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("1. Resumo da Semana", 15, 60);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            const text = "A operação local manteve a estabilidade durante a semana, com foco na resolução rápida de chamados de produção. Efetuada manutenção preventiva em 3 ativos críticos. O tempo médio de resposta para chamados de parada de linha reduziu de 15 min para 8 min.";
            const lines = doc.splitTextToSize(text, 180);
            doc.text(lines, 15, 70);

            // Metricas
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("2. Indicadores Chave (KPIs)", 15, 110);

            doc.rect(15, 120, 85, 30);
            doc.setFontSize(14);
            doc.text("Chamados Resolvidos: 48", 20, 132);
            doc.setFontSize(10);
            doc.text("+15% comparado a semana anterior", 20, 142);

            doc.rect(110, 120, 85, 30);
            doc.setFontSize(14);
            doc.text("Disponibilidade (Uptime): 99.9%", 115, 132);
            doc.setFontSize(10);
            doc.text("0 paradas não programadas", 115, 142);

            // Fechamento
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Gerado via ITSM Local em: ${new Date().toLocaleDateString()}`, 15, 280);

            doc.save("Relatorio_Executivo_TISemanal.pdf");
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-10 text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    <FileText size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gerador de Relatórios Executivos</h1>
                <p className="text-slate-500 text-lg">Consolide os dados da semana em PDF limpo para a Coordenação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Painel de Ações */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Próximo Fechamento</h2>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">Período Avaliado</span>
                            <span className="text-sm font-medium text-slate-800">14/Out até 20/Out</span>
                        </div>

                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-slate-700 font-medium">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                48 Chamados resolvidos detectados
                            </li>
                            <li className="flex gap-3 text-sm text-slate-700 font-medium">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                2 Paradas de manutenção registradas
                            </li>
                            <li className="flex gap-3 text-sm text-slate-700 font-medium">
                                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                                1 Incidente Crítico aguardando fechamento (Aviso)
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20 disabled:opacity-70"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Gerando PDF...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Gerar Relatório Semanal (.PDF)
                            </>
                        )}
                    </button>
                </div>

                {/* Preview do Relatório */}
                <div className="bg-slate-100 p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-slate-200/60 relative overflow-hidden">
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

                    <div className="w-48 h-64 bg-white shadow-xl shadow-slate-200/50 rounded flex flex-col items-center justify-start pt-8 pb-4 px-4 rotate-3 mb-6 transition-transform hover:rotate-0">
                        <div className="w-full h-8 bg-slate-900 mb-4 rounded-sm"></div>
                        <div className="w-3/4 h-2 bg-slate-200 rounded-full mb-8 self-start"></div>
                        <div className="w-full h-12 bg-slate-100 rounded mb-4"></div>
                        <div className="w-full h-12 bg-slate-100 rounded"></div>
                    </div>

                    <h3 className="font-semibold text-slate-800 text-lg">Layout Corporativo</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-xs">
                        O documento gerado segue um padrão executivo focado em resultados, perfeito para envio rápido via WhatsApp ou Email.
                    </p>
                </div>

            </div>
        </div>
    );
}
