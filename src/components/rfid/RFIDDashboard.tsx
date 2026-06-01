/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Radio, Server, Smartphone, ScanLine, Wifi, Cpu, FileText, CheckCircle2, ChevronRight, MessageSquare, Plus, CheckCircle, BrainCircuit, Download, UserCircle, QrCode } from "lucide-react";
import { GUIDES_DB, TROUBLESHOOTING_DB, CHAT_KB, HARDWARE_DB } from "@/lib/rfidData";

export default function RFIDDashboard() {
    const [view, setView] = useState<'dashboard' | 'guides' | 'hardware' | 'troubleshooting' | 'guideViewer' | 'ai'>('dashboard');
    const [currentGuide, setCurrentGuide] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Gestão de Sessão (Switch User)
    const [currentUser, setCurrentUser] = useState({ name: 'Modo Sênior (Autor)', canCreate: true });

    const toggleUser = () => {
        if (currentUser.canCreate) {
            setCurrentUser({ name: 'Modo Técnico de Campo', canCreate: false });
        } else {
            setCurrentUser({ name: 'Modo Sênior (Autor)', canCreate: true });
        }
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <RFIDHome setView={setView} setCurrentGuide={setCurrentGuide} currentUser={currentUser} />;
            case 'guides':
                return <RFIDGuides searchQuery={searchQuery} setSearchQuery={setSearchQuery} setView={setView} setCurrentGuide={setCurrentGuide} currentUser={currentUser} />;
            case 'hardware':
                return <RFIDHardware />;
            case 'troubleshooting':
                return <RFIDTroubleshooting />;
            case 'guideViewer':
                return <GuideViewer guideId={currentGuide} setView={setView} />;
            case 'ai':
                return <RFIDAssistant setView={setView} setCurrentGuide={setCurrentGuide} />;
            default:
                return <RFIDHome setView={setView} setCurrentGuide={setCurrentGuide} currentUser={currentUser} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 min-h-[600px]">
            {/* Sidebar for RFID */}
            <div className="w-full md:w-64 bg-slate-900 rounded-xl p-4 text-white shadow-lg border border-slate-800 flex flex-col gap-2 rfid-sidebar">
                <div className="mb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2"><ScanLine className="text-indigo-400" /> Sistema RFID</h2>
                        <p className="text-slate-400 text-xs mt-1">Conhecimento e Implantação</p>
                    </div>
                </div>

                <div className="mb-4 p-3 bg-slate-800 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-700 transition border border-slate-700" onClick={toggleUser}>
                    <div className="flex items-center gap-2 text-xs">
                        <UserCircle className={currentUser.canCreate ? "text-indigo-400" : "text-emerald-400"} size={18} />
                        <span className="font-bold tracking-tight">{currentUser.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                </div>

                <SidebarBtn icon={<Radio size={18} />} label="Painel Principal" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
                <SidebarBtn icon={<FileText size={18} />} label="Manuais e Guias" active={view === 'guides' || view === 'guideViewer'} onClick={() => setView('guides')} />
                <SidebarBtn icon={<Cpu size={18} />} label="Hardware Homologado" active={view === 'hardware'} onClick={() => setView('hardware')} />
                <SidebarBtn icon={<Server size={18} />} label="Troubleshooting" active={view === 'troubleshooting'} onClick={() => setView('troubleshooting')} />
                <SidebarBtn icon={<BrainCircuit size={18} />} label="Assistente Inteligente" active={view === 'ai'} onClick={() => setView('ai')} />
            </div>

            {/* Content Area */}
            <div id="content-area" className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto max-h-[800px]">
                {renderView()}
            </div>
        </div>
    );
}

function SidebarBtn({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            {icon} {label}
        </button>
    );
}

function RFIDHome({ setView, setCurrentGuide, currentUser }: any) {
    const [diagnosticRunning, setDiagnosticRunning] = useState(false);
    const [diagnosticSteps, setDiagnosticSteps] = useState<string[]>([]);
    
    const [barcodeStatus, setBarcodeStatus] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);

    // B. Simulação de Vínculo Patrimonial no CMDB (simulateBarcodeScan)
    const simulateBarcodeScan = () => {
        setIsScanning(true);
        setBarcodeStatus('Ativando câmera e escaneando...');
        
        setTimeout(() => {
            setBarcodeStatus('Patrimônio vinculado: MAC 00:1A:2B:3C:4D:5E | NS: FX9600-A21');
            setIsScanning(false);
        }, 2500);
    };

    // C. Sequenciador Assíncrono de Auto-Diagnóstico (runDiagnostics)
    const runDiagnostic = () => {
        setDiagnosticRunning(true);
        setDiagnosticSteps([]);
        
        const sequence = [
            { time: 1200, text: 'Conexão SSH ao Middleware (10.40.50.1)... OK' },
            { time: 2400, text: 'Varredura e Identificação do Leitor FX9600 via rede local... ENCONTRADO' },
            { time: 4800, text: 'Teste de Potência de Retorno de RF na Antena 1... 31.5 dBm ✓' },
            { time: 6000, text: 'Teste de Potência de Retorno de RF na Antena 2... 31.0 dBm ✓' },
            { time: 8000, text: 'Execução de inventário em lote piloto com 20 tags de referência... 20/20 LIDAS' },
            { time: 10500, text: 'PASSED — Emissão de Log de aprovação: Portal operando dentro do padrão Zero-Defects Elis.' },
        ];

        sequence.forEach((step, idx) => {
            setTimeout(() => {
                setDiagnosticSteps(prev => [...prev, step.text]);
            }, step.time);
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-800">Visão Geral RFID</h3>
                {currentUser.canCreate && (
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition shadow">
                        <Plus size={16} /> Criar Procedimento
                    </button>
                )}
            </div>
            
            {/* Gêmeo Digital Cobertura RF */}
            <div className="bg-slate-900 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 border border-slate-800">
                <div className="relative z-10 flex-1">
                    <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                        <Wifi className="text-indigo-400" /> Digital Twin: Portal Expedição
                    </h4>
                    <p className="text-slate-400 text-sm mb-4">Simulação mecânica de inclinação de antenas UHF (902-928 MHz) com sobreposição de feixe convergente.</p>
                    
                    <div className="flex justify-between items-center mt-8 px-8 h-40 relative border-b-2 border-slate-700">
                        {/* Antena Esquerda (-10deg) */}
                        <div className="relative" style={{ transform: 'rotate(-10deg)' }}>
                            <div className="w-4 h-16 bg-slate-300 rounded-sm z-20 relative border-2 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            <div className="rf-cone absolute top-8 left-4 w-40 h-32 origin-top-left opacity-60 z-10 pointer-events-none" style={{ transform: 'rotate(70deg)' }}></div>
                        </div>
                        
                        {/* Antena Direita (10deg) */}
                        <div className="relative" style={{ transform: 'rotate(10deg)' }}>
                            <div className="w-4 h-16 bg-slate-300 rounded-sm z-20 relative border-2 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            <div className="rf-cone rf-cone-alt absolute top-8 right-4 w-40 h-32 origin-top-right opacity-60 z-10 pointer-events-none" style={{ transform: 'rotate(-70deg)' }}></div>
                        </div>

                        {/* Gaiola / Objeto central */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-24 border-2 border-slate-600 rounded flex items-center justify-center bg-slate-800/50 backdrop-blur z-20">
                            <span className="text-slate-400 text-xs text-center font-mono">GAIOLA<br/>19/20</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition bg-slate-50">
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><QrCode size={18} className="text-indigo-500"/> CMDB / Hardware</h4>
                    <p className="text-xs text-slate-500 mb-4">Vincular leitor ao inventário através de código de barras.</p>
                    
                    <button 
                        onClick={simulateBarcodeScan} 
                        disabled={isScanning}
                        className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium w-full shadow-sm hover:bg-slate-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <ScanLine size={16} /> {isScanning ? 'Escaneando...' : 'Escanear Código de Barras'}
                    </button>
                    {barcodeStatus && (
                        <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 text-xs font-mono rounded border border-emerald-100 font-medium">
                            {barcodeStatus}
                        </div>
                    )}
                </div>

                <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition bg-slate-50">
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Radio size={18} className="text-indigo-500"/> Auto-Diagnóstico</h4>
                    <p className="text-xs text-slate-500 mb-4">Certificação Zero-Defects em esteira de testes.</p>
                    
                    {!diagnosticRunning ? (
                        <button onClick={runDiagnostic} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium w-full shadow-sm hover:bg-indigo-700 transition">
                            Executar Diagnóstico
                        </button>
                    ) : (
                        <div className="bg-slate-900 rounded p-4 text-xs text-green-400 font-mono h-40 overflow-y-auto flex flex-col gap-2">
                            {diagnosticSteps.map((s, i) => (
                                <span key={i} className={s.includes('PASSED') ? 'text-green-300 font-bold text-sm mt-2' : ''}>{'>'} {s}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function RFIDGuides({ searchQuery, setSearchQuery, setView, setCurrentGuide, currentUser }: any) {
    const filteredGuides = GUIDES_DB.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Manuais e SOPs</h3>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar manuais..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition" 
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredGuides.map(guide => (
                    <div key={guide.id} onClick={() => { setCurrentGuide(guide.id); setView('guideViewer'); }} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm cursor-pointer transition group">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{guide.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{guide.category}</span>
                                    <span>• {guide.readTime}</span>
                                    <span>• Dificuldade: {guide.difficulty}</span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function GuideViewer({ guideId, setView }: any) {
    const guide = GUIDES_DB.find(g => g.id === guideId);
    
    // A. Progresso de Conformidade Técnica (updateProgress)
    const [progress, setProgress] = useState(0);
    const checkboxesRef = useRef<HTMLInputElement[]>([]);

    useEffect(() => {
        if (guide) {
            checkboxesRef.current = [];
            setProgress(0);
        }
    }, [guide]);

    const updateProgress = () => {
        const total = checkboxesRef.current.length;
        if (total === 0) return;
        const checked = checkboxesRef.current.filter(chk => chk && chk.checked).length;
        const percent = Math.floor((checked / total) * 100);
        setProgress(percent);
    };

    // Mecanismo de Exportação Inteligente (@media print)
    const exportToPDF = () => {
        const now = new Date();
        const docId = `SOP-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const prevTitle = document.title;
        document.title = docId;
        window.print();
        document.title = prevTitle;
    };

    if (!guide) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 relative print-avoid-break">
            <div className="flex justify-between items-center mb-4 no-print">
                <button onClick={() => setView('guides')} className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline">
                    <ChevronRight className="rotate-180" size={16} /> Voltar para Manuais
                </button>
                <button onClick={exportToPDF} className="text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-200 transition border border-slate-200">
                    <Download size={16} /> Exportar PDF
                </button>
            </div>
            
            <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{guide.category}</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800">{guide.title}</h2>
                <p className="text-slate-600 mt-3 text-lg">{guide.content.intro}</p>
                
                <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-500 bg-slate-50 p-4 rounded-lg print-avoid-break">
                    <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-500"/> Autor: {guide.author}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-500"/> Tempo: {guide.readTime}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-emerald-500"/> Atualizado: {guide.updated}</span>
                </div>
            </div>

            <div className="space-y-8">
                {guide.content.phases.map((phase, pIdx) => (
                    <div key={pIdx} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm print-avoid-break">
                        <h4 className="text-xl font-bold text-slate-800 mb-4">{phase.title}</h4>
                        <div className="space-y-3">
                            {phase.checks.map((check, cIdx) => (
                                <label key={cIdx} className="flex items-start gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="track-chk mt-1.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer no-print flex-shrink-0" 
                                        ref={el => { if (el && !checkboxesRef.current.includes(el)) checkboxesRef.current.push(el); }}
                                        onChange={updateProgress}
                                    />
                                    {/* Print only checkbox box */}
                                    <div className="w-4 h-4 border border-black mt-1.5 hidden print-only flex-shrink-0"></div>
                                    <span className="text-slate-700 group-hover:text-slate-900 leading-relaxed">{check}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 flex items-center justify-between no-print bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4 flex-1 mr-4">
                    <div className="w-48 bg-slate-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-[#00A859]' : 'bg-slate-400'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className={`font-bold transition-colors ${progress === 100 ? 'text-[#00A859]' : 'text-slate-500'}`}>
                        {progress === 100 ? '100% — Homologado! ✓' : `${progress}% Concluído`}
                    </span>
                </div>
                <button 
                    disabled={progress < 100} 
                    className={`px-6 py-3 rounded-xl font-bold shadow transition whitespace-nowrap ${progress === 100 ? 'bg-[#00A859] text-white hover:bg-green-600' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                    Finalizar Ordem de Serviço
                </button>
            </div>

            {/* Bloco de Validação Física - Visível apenas na impressão */}
            <div className="print-only mt-16 pt-8 border-t border-black print-avoid-break">
                <h4 className="font-bold text-lg mb-8 text-center uppercase tracking-wider">Aprovação Física de Campo</h4>
                <div className="grid grid-cols-3 gap-8 text-center mt-12">
                    <div>
                        <div className="border-b border-black w-full mb-2"></div>
                        <p className="font-bold text-sm">Técnico Responsável</p>
                        <p className="text-xs">Execução</p>
                    </div>
                    <div>
                        <div className="border-b border-black w-full mb-2"></div>
                        <p className="font-bold text-sm">Supervisor Elis</p>
                        <p className="text-xs">Validador Técnico</p>
                    </div>
                    <div>
                        <div className="border-b border-black w-full mb-2"></div>
                        <p className="font-bold text-sm">Representante Cliente</p>
                        <p className="text-xs">Aprovação Final</p>
                    </div>
                </div>
                <div className="text-center mt-16 text-xs text-gray-500">
                    <p>Documento gerado automaticamente pelo Sistema de Governança RFID (Zero-Defects)</p>
                </div>
            </div>
        </div>
    );
}

function RFIDHardware() {
    return (
        <div className="animate-in fade-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Hardware Homologado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {HARDWARE_DB.map((hw, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:shadow-lg transition group bg-white">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition group-hover:bg-indigo-600 group-hover:text-white">
                            <Cpu size={24} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg mb-2">{hw.name}</h4>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{hw.desc}</p>
                        
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                            {hw.specs.map((spec, sIdx) => (
                                <div key={sIdx} className="flex justify-between text-xs">
                                    <span className="text-slate-500">{spec.label}</span>
                                    <span className="font-bold text-slate-700">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RFIDTroubleshooting() {
    const [openId, setOpenId] = useState<string | null>(null);

    // Painel expansível com cálculo dinâmico de altura baseada na propriedade scrollHeight provendo transição
    return (
        <div className="animate-in fade-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Resolução de Problemas (Troubleshooting)</h3>
            <div className="space-y-3">
                {TROUBLESHOOTING_DB.map(item => {
                    const isOpen = openId === item.id;
                    return (
                        <div key={item.id} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-indigo-300 shadow-md bg-indigo-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                            <button 
                                className="w-full flex items-center justify-between p-4 focus:outline-none"
                                onClick={() => setOpenId(isOpen ? null : item.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-[10px] font-black tracking-wider px-2 py-1 rounded uppercase min-w-[70px] text-center ${item.severity === 'CRÍTICO' ? 'bg-rose-100 text-rose-700' : item.severity === 'MÉDIO' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {item.severity}
                                    </span>
                                    <h4 className="font-bold text-slate-800 text-left">{item.title}</h4>
                                </div>
                                <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="p-4 pt-0 border-t border-slate-100/50">
                                        <p className="text-slate-600 text-sm leading-relaxed mt-4">{item.solution}</p>
                                        <div className="flex gap-2 mt-4">
                                            {item.tags.map(t => (
                                                <span key={t} className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-medium">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function RFIDAssistant({ setView, setCurrentGuide }: any) {
    const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string, link?: number}[]>([
        { role: 'ai', text: 'Olá! Sou o Assistente de Conhecimento RFID. Pergunte-me sobre instalações, troubleshooting, hardware e configurações.' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Motor de RAG Local (Algoritmo do Chatbot)
    const generateChatResponse = (userText: string) => {
        // Normalização
        const lower = userText.toLowerCase();
        let response = '';
        let guideLink: number | undefined;

        // Varredura Estatística Direct-Match
        for (const [keyword, answer] of Object.entries(CHAT_KB)) {
            if (lower.includes(keyword)) {
                response = answer;
                break;
            }
        }

        // Varredura por Proximidade nos Manuais
        if (!response) {
            const userWords = lower.split(/\s+/).filter(w => w.length > 3);
            
            for (const guide of GUIDES_DB) {
                const guideText = guide.title.toLowerCase() + " " + (guide.category?.toLowerCase() || "");
                const matched = userWords.some(word => guideText.includes(word));
                if (matched) {
                    response = `Encontrei uma referência em nossos manuais. O guia **"${guide.title}"** aborda esse tema. Gostaria de abri-lo?`;
                    guideLink = guide.id;
                    break;
                }
            }
        }

        // Tratamento de Exceção (Fallback Dinâmico)
        if (!response) {
            const fallbacks = [
                'Não encontrei resultados exatos na base local. Tente palavras-chave como: **expurgo**, **fx9600**, **potencia** ou abra um chamado no SharePoint.',
                'Sua requisição não retornou correspondências no dicionário RAG. Por favor, tente simplificar os termos (ex: **antena**, **tc26**).',
                'Hmm, não tenho certeza. Para incidentes não documentados, recomendamos a abertura de um ticket corporativo nível 2 no Jira Elis.'
            ];
            response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }

        return { response, guideLink };
    };

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userText = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const { response, guideLink } = generateChatResponse(userText);
            setMessages(prev => [...prev, { role: 'ai', text: response, link: guideLink }]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <div className="flex flex-col h-[500px] animate-in fade-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2"><BrainCircuit className="text-indigo-500"/> Assistente Inteligente</h3>
            <p className="text-slate-500 text-sm mb-6">Consulte o acervo técnico conversando com a IA via RAG simulado.</p>
            
            <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-slate-50">
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                                {/* Simple markdown bold parse for UI */}
                                {msg.text.split('**').map((part, index) => index % 2 === 1 ? <strong key={index} className={msg.role === 'user' ? 'text-white' : 'text-indigo-700'}>{part}</strong> : part)}
                                
                                {msg.link && (
                                    <div className="mt-3">
                                        <button 
                                            onClick={() => { setCurrentGuide(msg.link!); setView('guideViewer'); }}
                                            className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition flex items-center gap-1"
                                        >
                                            <FileText size={14}/> Abrir Manual
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-sm text-xs flex items-center gap-1 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Digite sua dúvida técnica..." 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                    <button onClick={handleSend} className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm">
                        <MessageSquare size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
