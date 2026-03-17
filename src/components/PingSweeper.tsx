"use client";

import React, { useState, useEffect } from 'react';
import { Network, Activity, ServerCrash, CheckCircle2 } from 'lucide-react';

export default function PingSweeper() {
    const [nodes, setNodes] = useState([
        { id: '1', name: 'Roteador DEDICADO Claro', ip: '200.10.x.x', status: 'up', ping: 12, lastCheck: 'agora' },
        { id: '2', name: 'Roteador BANDA LARGA Vivo', ip: '177.20.x.x', status: 'up', ping: 45, lastCheck: 'agora' },
        { id: '3', name: 'RACK CORE CENTRAL', ip: '10.0.0.1', status: 'up', ping: 1, lastCheck: 'agora' },
        { id: '4', name: 'RACK PRODUÇÃO (SW2)', ip: '192.168.10.1', status: 'down', ping: 0, lastCheck: 'há 15m' },
        { id: '5', name: 'RACK ADM (SW3)', ip: '192.168.20.1', status: 'up', ping: 3, lastCheck: 'agora' },
    ]);

    const [isScanning, setIsScanning] = useState(false);

    // Efeito Simulando o Ping Sweep a cada poucos segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setIsScanning(true);
            setTimeout(() => {
                setNodes(currentNodes => currentNodes.map(node => {
                    if (node.id === '4') return node; // Always fake down for demo

                    // Random fluctuation in ping for realism
                    const targetPing = node.id === '1' ? 12 : node.id === '2' ? 45 : 2;
                    const jitter = Math.floor(Math.random() * 8) - 4;
                    const newPing = Math.max(1, targetPing + jitter);

                    return { ...node, ping: newPing, lastCheck: 'agora' };
                }));
                setIsScanning(false);
            }, 800);
        }, 8000); // Scans every 8 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col relative overflow-hidden h-full">
            <div className={`absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl -z-10 rounded-full transition-opacity duration-1000 ${isScanning ? 'opacity-100 animate-pulse' : 'opacity-30'}`}></div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Network className="text-indigo-500" size={20} />
                        Network Radar (Ping Sweeper)
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Varredura contínua ICMP dos links vitais
                    </p>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 transition-colors ${isScanning ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-indigo-500 animate-ping' : 'bg-slate-400'}`}></span>
                    {isScanning ? 'SCANNING...' : 'IDLE'}
                </div>
            </div>

            <div className="flex-1 space-y-3">
                {nodes.map(node => (
                    <div key={node.id} className="p-3 bg-white/60 border border-slate-200/60 rounded-xl flex items-center justify-between group hover:border-indigo-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${node.status === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {node.status === 'up' ? <CheckCircle2 size={16} /> : <ServerCrash size={16} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">{node.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{node.ip}</p>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            {node.status === 'up' ? (
                                <div className="flex items-center gap-1.5 text-slate-700">
                                    <span className="text-sm font-bold">{node.ping}</span>
                                    <span className="text-[10px] text-slate-400 font-medium tracking-wide">ms</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-rose-600">
                                    <span className="text-sm font-bold uppercase tracking-wider">Timeout</span>
                                </div>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
                                Atualizado: {node.lastCheck}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
