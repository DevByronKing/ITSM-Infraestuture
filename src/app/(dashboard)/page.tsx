"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertTriangle,
    Server,
    Archive,
    Activity,
    Wrench,
    FileText,
    Loader2,
    Cpu,
    Wifi,
    Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ============================================================
// 🚀 WIDGET SCI-FI: Matrix Rain + Radar Holográfico
// ============================================================
function SciFiWidget() {
    const matrixRef = useRef<HTMLCanvasElement>(null);
    const radarRef = useRef<HTMLCanvasElement>(null);
    const animFrameMatrix = useRef<number>(0);
    const animFrameRadar = useRef<number>(0);

    // --- Matrix Digital Rain ---
    useEffect(() => {
        const canvas = matrixRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>{}[]|アイウエオカキクケコ';
        const fontSize = 11;
        const cols = Math.floor(canvas.width / fontSize);
        const drops: number[] = Array(cols).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 15, 25, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const isHead = drops[i] * fontSize > canvas.height * Math.random() * 1.5;

                ctx.font = `${fontSize}px 'Courier New', monospace`;
                ctx.fillStyle = isHead ? '#a5f3fc' : `rgba(99,102,241,${Math.random() * 0.7 + 0.3})`;
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            animFrameMatrix.current = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animFrameMatrix.current);
    }, []);

    // --- Radar Holográfico ---
    useEffect(() => {
        const canvas = radarRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const maxR = Math.min(cx, cy) - 8;
        let angle = 0;

        // Blips estáticos simulando dispositivos detectados
        const blips = [
            { r: 0.35, a: 0.8, label: 'SW-CORE', color: '#6ee7b7' },
            { r: 0.65, a: 2.1, label: 'SRV-01', color: '#818cf8' },
            { r: 0.5,  a: 3.9, label: 'AP-02', color: '#6ee7b7' },
            { r: 0.8,  a: 5.1, label: 'FW-GW', color: '#fbbf24' },
            { r: 0.25, a: 4.5, label: 'NAS', color: '#818cf8' },
            { r: 0.7,  a: 1.2, label: 'CAM-03', color: '#6ee7b7' },
        ];

        const drawRadar = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Grid circles
            for (let i = 1; i <= 4; i++) {
                ctx.beginPath();
                ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(99,102,241,${0.08 + i * 0.04})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Cross-hair lines
            ctx.strokeStyle = 'rgba(99,102,241,0.15)';
            ctx.lineWidth = 1;
            [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].forEach(a => {
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
                ctx.lineTo(cx - Math.cos(a) * maxR, cy - Math.sin(a) * maxR);
                ctx.stroke();
            });

            // Sweep gradient
            // (unused, removed to fix TypeScript error)

            const sweepEnd = angle;
            const sweepStart = sweepEnd - Math.PI * 0.55;

            for (let step = 0; step < 60; step++) {
                const alpha = (step / 60) * 0.35;
                const a = sweepStart + ((sweepEnd - sweepStart) * step) / 60;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, maxR, a, a + 0.035);
                ctx.closePath();
                ctx.fillStyle = `rgba(99,102,241,${alpha})`;
                ctx.fill();
            }

            // Sweep head line
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
            ctx.strokeStyle = 'rgba(165,243,252,0.9)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Blips
            blips.forEach(b => {
                const bx = cx + Math.cos(b.a) * b.r * maxR;
                const by = cy + Math.sin(b.a) * b.r * maxR;

                // Glow
                const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 10);
                grad.addColorStop(0, b.color + 'cc');
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(bx, by, 10, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(bx, by, 3, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.fill();

                // Label
                ctx.font = 'bold 8px monospace';
                ctx.fillStyle = b.color + 'cc';
                ctx.fillText(b.label, bx + 6, by - 5);
            });

            // Center dot
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#a5f3fc';
            ctx.fill();

            angle += 0.018;
            animFrameRadar.current = requestAnimationFrame(drawRadar);
        };
        drawRadar();
        return () => cancelAnimationFrame(animFrameRadar.current);
    }, []);

    // Typing text effect
    const lines = [
        '> SISTEMA ITSM v3.1 INICIADO',
        '> CONEXÃO SUPABASE: OK',
        '> ESCANEANDO REDE LOCAL...',
        '> 6 HOSTS DETECTADOS',
        '> FIREWALL: ATIVO',
        '> LATÊNCIA AVG: 12ms',
        '> BACKUP: CONCLUÍDO 03:00',
        '> UPTIME: 99.98%',
        '> ALERTA: NENHUM',
        '> MODO: OPERAÇÃO NOMINAL_',
    ];
    const [visibleLines, setVisibleLines] = useState<string[]>([]);
    const [lineIdx, setLineIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);

    useEffect(() => {
        if (lineIdx >= lines.length) return;
        const current = lines[lineIdx];
        if (charIdx < current.length) {
            const t = setTimeout(() => {
                setVisibleLines(prev => {
                    const next = [...prev];
                    next[lineIdx] = (next[lineIdx] || '') + current[charIdx];
                    return next;
                });
                setCharIdx(c => c + 1);
            }, 28);
            return () => clearTimeout(t);
        } else {
            const t = setTimeout(() => {
                setLineIdx(l => l + 1);
                setCharIdx(0);
            }, 120);
            return () => clearTimeout(t);
        }
    }, [lineIdx, charIdx]);

    return (
        <div className="rounded-2xl overflow-hidden border border-indigo-900/40 shadow-[0_0_40px_rgba(99,102,241,0.15)] bg-[#050a14] relative"
            style={{ height: 340 }}>

            {/* Título HUD */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 border-b border-indigo-900/40 bg-[#050a14]/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400"></span>
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-400">
                        SYS_MONITOR — LIVE
                    </span>
                </div>
                <div className="flex gap-4 text-[9px] font-bold tracking-widest text-indigo-500 uppercase">
                    <span className="text-emerald-500">● REDE OK</span>
                    <span>● CPU 23%</span>
                    <span>● RAM 61%</span>
                </div>
            </div>

            {/* Layout interno: Matrix | Radar | Terminal */}
            <div className="flex h-full pt-10">

                {/* Matrix Rain */}
                <div className="relative flex-1 overflow-hidden border-r border-indigo-900/30">
                    <canvas ref={matrixRef} className="w-full h-full opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 text-[9px] font-bold tracking-[0.3em] text-indigo-500 uppercase opacity-60">
                        ENC//STREAM
                    </div>
                </div>

                {/* Radar */}
                <div className="relative flex flex-col items-center justify-center border-r border-indigo-900/30"
                    style={{ width: 230 }}>
                    <canvas ref={radarRef} className="w-full" style={{ height: 210 }} />
                    <div className="text-[9px] font-bold tracking-[0.25em] text-indigo-500 uppercase opacity-60 pb-3">
                        NET//SWEEP
                    </div>
                    {/* Corner decorations */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 rounded-tl" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 rounded-tr" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 rounded-bl" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 rounded-br" />
                </div>

                {/* Terminal */}
                <div className="flex-1 overflow-hidden p-4 font-mono text-[11px] leading-5">
                    <div className="space-y-0.5">
                        {visibleLines.map((line, i) => (
                            <div key={i} className={`${
                                line.includes('OK') || line.includes('NOMINAL') || line.includes('NENHUM')
                                    ? 'text-emerald-400'
                                    : line.includes('ALERTA') || line.includes('ERRO')
                                    ? 'text-rose-400'
                                    : line.includes('ESCANEANDO') || line.includes('DETECTADOS')
                                    ? 'text-cyan-300'
                                    : 'text-indigo-300'
                            }`}>
                                {line}
                                {i === lineIdx && lineIdx < lines.length && (
                                    <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-pulse align-middle" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-4 right-4 text-[9px] font-bold tracking-[0.25em] text-indigo-500 uppercase opacity-60">
                        CMD//LOG
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// DASHBOARD PRINCIPAL
// ============================================================
export default function WarRoomDashboard() {
    const [stats, setStats] = useState({
        activeAssets: 0,
        maintenanceAssets: 0,
        lowStockItems: 0
    });
    const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [networkHealth, setNetworkHealth] = useState({
        health: 99.9,
        status: 'Analisando...',
        latency: 0,
        isUp: true
    });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchNetworkHealth = async () => {
            try {
                const res = await fetch('/api/network');
                const data = await res.json();
                setNetworkHealth(data);
            } catch (error) {
                console.error("Erro ao checar rede", error);
            }
        };
        fetchNetworkHealth();
        const interval = setInterval(fetchNetworkHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            const { count: activeCount } = await supabase
                .from('ativos')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Ativo');

            const { data: maintenanceData, count: maintenanceCount } = await supabase
                .from('ativos')
                .select('*', { count: 'exact' })
                .eq('status', 'Manutenção');

            const { data: lowStockData, count: lowStockCount } = await supabase
                .from('almoxarifado')
                .select('*', { count: 'exact' })
                .lte('qty', 5);

            setStats({
                activeAssets: activeCount || 0,
                maintenanceAssets: maintenanceCount || 0,
                lowStockItems: lowStockCount || 0
            });

            const alerts: any[] = [];
            if (maintenanceData) {
                maintenanceData.forEach(item => {
                    alerts.push({
                        id: `m_${item.id}`,
                        title: `Equipamento em Manutenção: ${item.name}`,
                        desc: `Categoria: ${item.category} | Obs: ${item.condition}`,
                        priority: 'Crítica',
                        link: '/ativos'
                    });
                });
            }
            if (lowStockData) {
                lowStockData.filter(i => i.qty <= i.min_qty).forEach(item => {
                    alerts.push({
                        id: `s_${item.id}`,
                        title: `Estoque Baixo ou Zerado: ${item.name}`,
                        desc: `Apenas ${item.qty} ${item.unit} em estoque (Mínimo: ${item.min_qty}).`,
                        priority: 'Normal',
                        link: '/almoxarifado'
                    });
                });
            }

            setRecentAlerts(alerts);
            setIsLoading(false);
        };
        fetchDashboardData();
    }, []);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        // Adiciona um pequeno delay intencional para exibir a animação premium
        await new Promise(resolve => setTimeout(resolve, 800));

        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        // Cores
        const primaryColor = [79, 70, 229]; // Indigo 600
        const secondaryColor = [241, 245, 249]; // Slate 100
        const textColor = [30, 41, 59]; // Slate 800
        const lightText = [100, 116, 139]; // Slate 500
        
        // --- HEADER ---
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F'); // Banner do topo (A4 width is 210mm)
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text("REPORT EXECUTIVO - ITSM", 15, 22);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Data de Geração: ${new Date().toLocaleString('pt-BR')}`, 15, 30);
        
        // Status Geral Badge no cabeçalho
        const isHealthy = networkHealth.isUp && stats.maintenanceAssets === 0;
        doc.setFillColor(isHealthy ? 16 : 225, isHealthy ? 185 : 29, isHealthy ? 129 : 72); // Emerald or Rose
        doc.roundedRect(150, 15, 45, 12, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(isHealthy ? "STATUS: ESTÁVEL" : "STATUS: ALERTA", 155, 23);

        // --- KPIs CARDS ---
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("Visão Geral da Operação", 15, 55);
        
        const drawCard = (x: number, y: number, title: string, value: string, isAlert: boolean = false) => {
            doc.setFillColor(248, 250, 252); // Slate 50
            doc.setDrawColor(226, 232, 240); // Slate 200
            if (isAlert) {
                doc.setDrawColor(254, 205, 211); // Rose 200
                doc.setFillColor(255, 241, 242); // Rose 50
            }
            doc.roundedRect(x, y, 85, 25, 3, 3, 'FD');
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(lightText[0], lightText[1], lightText[2]);
            doc.text(title.toUpperCase(), x + 5, y + 8);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(isAlert ? 225 : textColor[0], isAlert ? 29 : textColor[1], isAlert ? 72 : textColor[2]);
            doc.text(value, x + 5, y + 18);
        };

        drawCard(15, 62, "Ativos em Operação", stats.activeAssets.toString());
        drawCard(110, 62, "Ativos em Manutenção", stats.maintenanceAssets.toString(), stats.maintenanceAssets > 0);
        drawCard(15, 92, "Estoque Baixo/Crítico", stats.lowStockItems.toString(), stats.lowStockItems > 0);
        drawCard(110, 92, "Saúde da Rede", `${networkHealth.health.toFixed(1)}% (${networkHealth.isUp ? 'UP' : 'DOWN'})`, !networkHealth.isUp);

        // --- FILA DE ATENÇÃO ---
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text("Fila de Atenção (Pendências Críticas)", 15, 135);
        
        let y = 145;
        if (recentAlerts.length === 0) {
            doc.setFillColor(240, 253, 244); // Emerald 50
            doc.setDrawColor(187, 247, 208); // Emerald 200
            doc.roundedRect(15, y, 180, 15, 2, 2, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(21, 128, 61); // Emerald 700
            doc.text("✓ Nenhuma pendência crítica. Operação nominal.", 20, y + 10);
        } else {
            recentAlerts.forEach(alert => {
                if (y > 260) { 
                    doc.addPage(); 
                    y = 20; 
                }
                
                const isCritical = alert.priority === 'Crítica';
                
                // Background Box
                doc.setFillColor(isCritical ? 255 : 255, isCritical ? 241 : 251, isCritical ? 242 : 235); // Rose 50 or Amber 50
                doc.setDrawColor(isCritical ? 254 : 253, isCritical ? 205 : 230, isCritical ? 211 : 138); // Rose 200 or Amber 200
                doc.roundedRect(15, y, 180, 22, 2, 2, 'FD');
                
                // Priority Tag
                doc.setFillColor(isCritical ? 225 : 217, isCritical ? 29 : 119, isCritical ? 72 : 6); // Rose 600 or Amber 600
                doc.roundedRect(20, y + 4, 20, 5, 1, 1, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.text(alert.priority.toUpperCase(), 22, y + 7.5);
                
                // Title
                doc.setTextColor(isCritical ? 159 : 180, isCritical ? 18 : 83, isCritical ? 57 : 9); // Rose 800 or Amber 800
                doc.setFontSize(10);
                doc.text(alert.title, 45, y + 8);
                
                // Description
                doc.setTextColor(lightText[0], lightText[1], lightText[2]);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                const lines = doc.splitTextToSize(alert.desc, 170);
                doc.text(lines, 20, y + 16);
                
                y += 28;
            });
        }
        
        // --- FOOTER ---
        const pageCount = (doc as any).internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Sistema ITSM v3.1 | Página ${i} de ${pageCount}`, 15, 290);
            doc.text(`Gerado por Sistema de Telemetria Automática`, 140, 290);
        }

        doc.save(`Report_Executivo_ITSM_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsGenerating(false);
    };

    return (
        <div className="p-8 space-y-8">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Activity className="text-indigo-500" />
                        Dashboard de Operações
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Visão geral em tempo real da Planta Industrial Principal</p>
                </div>
                <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="relative overflow-hidden group bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[100%_center] transition-all duration-500 text-white px-7 py-3 rounded-xl font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] hover:-translate-y-1 disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:cursor-not-allowed"
                >
                    {/* Efeito de brilho cruzando o botão */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite] transition-all z-0 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center gap-2">
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} className="animate-spin text-cyan-200" />
                                <span className="tracking-wide">Processando...</span>
                            </>
                        ) : (
                            <>
                                <FileText size={20} className="text-indigo-200 group-hover:text-white transition-colors" />
                                <span className="tracking-wide">Gerar Report Executivo</span>
                            </>
                        )}
                    </div>
                </button>
            </div>

            {/* 🚀 Widget Sci-Fi */}
            <SciFiWidget />

            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Ativos em Operação"
                    value={isLoading ? "..." : stats.activeAssets.toString()}
                    icon={<Server className="text-emerald-500" size={24} />}
                    trend="Estáveis e ativos"
                    trendColor="text-emerald-600"
                />
                <KPICard
                    title="Estoque Baixo/Crítico"
                    value={isLoading ? "..." : stats.lowStockItems.toString()}
                    icon={<Archive className="text-amber-500" size={24} />}
                    trend="Itens do almoxarifado"
                    trendColor="text-amber-600"
                    alert={stats.lowStockItems > 0}
                />
                <KPICard
                    title="Ativos em Manutenção"
                    value={isLoading ? "..." : stats.maintenanceAssets.toString()}
                    icon={<Wrench className="text-rose-600" size={24} />}
                    trend="Impacto operacional"
                    trendColor="text-rose-600"
                    alert={stats.maintenanceAssets > 0}
                />
                <KPICard
                    title="Saúde da Rede"
                    value={networkHealth.health.toFixed(1) + "%"}
                    icon={
                        <div className="relative">
                            <Activity className={networkHealth.isUp ? "text-indigo-500" : "text-rose-500"} size={24} />
                            {networkHealth.isUp && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                            )}
                        </div>
                    }
                    trend={networkHealth.status + (networkHealth.latency ? ` (${networkHealth.latency}ms)` : '')}
                    trendColor={networkHealth.isUp ? (networkHealth.health < 99 ? "text-amber-600" : "text-indigo-600") : "text-rose-600"}
                    alert={!networkHealth.isUp}
                />
            </div>

            {/* Fila de Atenção */}
            <div className="grid grid-cols-1 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex flex-col relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/5 blur-2xl -z-10 rounded-full pointer-events-none"></div>
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-5">
                        <AlertTriangle className="text-rose-500" size={20} />
                        Fila de Atenção
                    </h2>

                    <div className="space-y-3 flex-1">
                        {isLoading ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : recentAlerts.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-sm font-medium">Nenhum alerta de infraestrutura no momento! Operação nominal.</div>
                        ) : recentAlerts.map(alert => (
                            <AlertItem
                                key={alert.id}
                                icon={<AlertTriangle className={alert.priority === 'Crítica' ? "text-rose-500" : "text-amber-500"} size={18} />}
                                title={alert.title}
                                desc={alert.desc}
                                urgent={alert.priority === 'Crítica'}
                                warning={alert.priority === 'Normal'}
                                link={alert.link}
                            />
                        ))}
                    </div>

                    <button className="w-full mt-6 py-2.5 text-sm text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
                        Ver todas as pendências
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Componentes Auxiliares
// ============================================================
function KPICard({ title, value, icon, trend, trendColor, alert = false }: any) {
    return (
        <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${alert ? 'ring-1 ring-rose-400/50 shadow-[0_0_20px_rgba(225,29,72,0.15)]' : 'hover:shadow-lg'}`}>
            {alert && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>}
            {!alert && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100"></div>}

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
                    <h3 className="text-4xl font-black text-slate-800 mt-2 tracking-tight">{value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl shadow-sm ${alert ? 'bg-gradient-to-br from-rose-100 to-rose-200' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${trendColor}`}>{trend}</span>
            </div>
        </div>
    );
}

function AlertItem({ icon, title, desc, urgent = false, warning = false, link }: any) {
    const router = useRouter();
    let bgColors = "bg-slate-50 border-slate-100 hover:border-slate-200";
    let titleColor = "text-slate-700";

    if (urgent) {
        bgColors = "bg-rose-50/50 border-rose-200 hover:border-rose-300";
        titleColor = "text-rose-800";
    } else if (warning) {
        bgColors = "bg-amber-50/50 border-amber-200 hover:border-amber-300";
        titleColor = "text-amber-800";
    }

    const handleClick = () => {
        if (link) {
            router.push(link);
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${bgColors} flex gap-4 items-start group hover:shadow-md hover:-translate-y-0.5`}
        >
            <div className={`mt-0.5 p-2 rounded-xl shadow-sm border ${urgent ? 'border-rose-200 bg-white' : warning ? 'border-amber-200 bg-white' : 'border-slate-200 bg-white'}`}>
                {icon}
            </div>
            <div>
                <p className={`text-sm font-bold ${titleColor}`}>{title}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
