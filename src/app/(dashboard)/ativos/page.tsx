"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Monitor, Server, Wifi, Printer, MoreVertical, X, HardDrive, Cpu, Activity, History, QrCode, Loader2, Download, User, Ticket, FileText, Trash2, ExternalLink } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

export default function AtivosPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedAssetsIds, setSelectedAssetsIds] = useState<Set<string>>(new Set());
    const [filterHasLabel, setFilterHasLabel] = useState<string>("all");

    // Supabase States
    const [assets, setAssets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '', category: 'Computador', brand: '', model: '',
        mac_address: '', ip_address: '', condition: 'Novo', location: '', responsible_user: '', has_label: false, quantity: 1
    });
    const [customCategory, setCustomCategory] = useState("");
    
    // Categorias dinâmicas para o filtro
    const dynamicCategories = Array.from(new Set(assets.map(a => a.category))).filter(Boolean).sort();

    // Fetch Assets
    const fetchAssets = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('ativos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar ativos:', error);
        } else {
            setAssets(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    // Handle Save
    const handleSaveAsset = async () => {
        const finalCategory = formData.category === 'Outra (Digitar)' ? customCategory : formData.category;

        if (!formData.name || !finalCategory) return;
        setIsSaving(true);

        const basePayload: any = {
            name: formData.name,
            category: finalCategory,
            brand: formData.brand,
            model: formData.model,
            mac_address: formData.mac_address,
            ip_address: formData.ip_address,
            condition: formData.condition,
            location: formData.location,
            responsible_user: formData.responsible_user,
            has_label: formData.has_label
        };

        let queryError = null;

        if (editingId) {
            const { error } = await supabase
                .from('ativos')
                .update(basePayload)
                .eq('id', editingId);
            queryError = error;
        } else {
            const qty = Math.max(1, Math.min(100, Math.floor(formData.quantity) || 1));
            const payloadsToInsert = [];

            for (let i = 0; i < qty; i++) {
                let currentName = formData.name;
                // If bulk creating and name doesn't already have numbers trailing, add suffix
                // Or simply append -X if qty > 1
                if (qty > 1) {
                    currentName = `${formData.name}-${String(i + 1).padStart(2, '0')}`;
                }

                payloadsToInsert.push({ ...basePayload, name: currentName, status: 'Ativo' });
            }

            const { error } = await supabase
                .from('ativos')
                .insert(payloadsToInsert);
            queryError = error;
        }

        if (queryError) {
            console.error('Erro ao salvar:', queryError);
            alert('Falha ao salvar ativo.');
        } else {
            setFormData({ name: '', category: 'Computador', brand: '', model: '', mac_address: '', ip_address: '', condition: 'Novo', location: '', responsible_user: '', has_label: false, quantity: 1 });
            setCustomCategory('');
            setEditingId(null);
            setIsAddModalOpen(false);
            if (editingId && selectedAsset) {
                setSelectedAsset({ ...selectedAsset, ...basePayload });
            }
            fetchAssets(); // Refresh list
        }
        setIsSaving(false);
    };

    const handleDeleteAsset = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este ativo permanentemente?')) return;

        setIsSaving(true);
        const { error } = await supabase.from('ativos').delete().eq('id', id);
        setIsSaving(false);

        if (error) {
            console.error('Erro ao excluir:', error);
            alert('Falha ao excluir o ativo.');
        } else {
            setSelectedAsset(null);
            fetchAssets();
        }
    };

    const handleExportReport = () => {
        if (filteredAssets.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const dateStr = new Date().toLocaleDateString('pt-BR');
        const techResponsible = "L. Barbosa"; // Nome do responsável configurado

        const rowsHTML = filteredAssets.map(asset => `
            <tr>
                <td><strong>${asset.name}</strong></td>
                <td>${asset.category}</td>
                <td>${asset.brand} <br/> <small>${asset.model}</small></td>
                <td>${asset.responsible_user || '-'}</td>
                <td>${asset.location || '-'}</td>
                <td>${asset.ip_address || '-'} <br/> <small>${asset.mac_address || '-'}</small></td>
                <td><span class="status ${asset.status?.toLowerCase() || 'ativo'}">${asset.status || 'Ativo'}</span></td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Relatório Detalhado de Ativos - Elis</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; margin: 0; background-color: #fff; }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #005a9c; padding-bottom: 20px; }
                        .logo-area { display: flex; flex-direction: column; }
                        .logo-text { color: #005a9c; font-size: 28px; font-weight: 800; letter-spacing: -1px; }
                        .logo-subtext { color: #5cb85c; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-top: -4px; }
                        .report-info { text-align: right; }
                        .report-info h1 { margin: 0; color: #1e293b; font-size: 20px; text-transform: uppercase; }
                        .report-info p { margin: 5px 0 0; color: #64748b; font-size: 12px; }
                        
                        .meta-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                        .meta-item { font-size: 13px; }
                        .meta-item strong { color: #475569; }

                        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                        th { background-color: #005a9c; font-weight: 600; color: #fff; text-transform: uppercase; font-size: 10px; }
                        tr:nth-child(even) { background-color: #f8fafc; }
                        small { color: #64748b; font-family: monospace; }
                        
                        .status { padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
                        .status.ativo { background-color: #d1fae5; color: #065f46; }
                        .status.manutenção, .status.manutencao { background-color: #fef3c7; color: #92400e; }
                        .status.inativo { background-color: #fee2e2; color: #991b1b; }
                        
                        .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
                        .signature { border-top: 1px solid #94a3b8; width: 250px; padding-top: 8px; text-align: center; font-size: 12px; color: #1e293b; font-weight: 600; }
                        .system-tag { font-size: 10px; color: #94a3b8; }
                        
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
                            .header { border-bottom-color: #005a9c !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo-area">
                            <div class="logo-text">Elis</div>
                            <div class="logo-subtext">Circular Services At Work</div>
                        </div>
                        <div class="report-info">
                            <h1>Relatório de Inventário TI</h1>
                            <p>Documento Interno de Controle de Ativos</p>
                        </div>
                    </div>

                    <div class="meta-info">
                        <div class="meta-item"><strong>Responsável TI:</strong> ${techResponsible}</div>
                        <div class="meta-item"><strong>Data de Emissão:</strong> ${dateStr}</div>
                        <div class="meta-item"><strong>Total de Registros:</strong> ${filteredAssets.length} unidades</div>
                        <div class="meta-item"><strong>Unidade:</strong> Planta Principal (Brasil)</div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Hostname / Nome</th>
                                <th>Categoria</th>
                                <th>Equipamento</th>
                                <th>Responsável</th>
                                <th>Localização</th>
                                <th>Rede (IP/MAC)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHTML}
                        </tbody>
                    </table>

                    <div class="footer">
                        <div class="system-tag">Gerado via ITSM-Pro Infrastructure Suite</div>
                        <div class="signature">
                            ${techResponsible}<br/>
                            <small style="font-style: normal; font-weight: 400; font-family: sans-serif;">Responsável de TI</small>
                        </div>
                    </div>

                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handlePrintBulkLabels = async (assetsToPrint: any[]) => {
        if (!assetsToPrint || assetsToPrint.length === 0) return;

        // Generate QR codes as inline SVGs before opening print window
        const qrSVGs: Record<string, string> = {};
        
        for (const asset of assetsToPrint) {
            const qrValue = `itsm://asset/${asset.id}`;
            // Create a temporary container, render QRCodeSVG, extract the SVG markup
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);

            // Use ReactDOM to render synchronously
            const { flushSync } = await import('react-dom');
            const { createRoot } = await import('react-dom/client');
            const root = createRoot(tempDiv);
            flushSync(() => {
                root.render(React.createElement(QRCodeSVG, { value: qrValue, size: 100, level: 'M', bgColor: '#ffffff', fgColor: '#0f172a' }));
            });

            const svgEl = tempDiv.querySelector('svg');
            if (svgEl) {
                qrSVGs[asset.id] = svgEl.outerHTML;
            }

            root.unmount();
            document.body.removeChild(tempDiv);
        }

        const printWindow = window.open('', '_blank', 'width=800,height=800');
        if (!printWindow) return;

        const labelsHTML = assetsToPrint.map(asset => `
            <div class="label">
                <div class="qr-container">${qrSVGs[asset.id] || ''}</div>
                <div class="asset-name">${asset.name}</div>
                <div class="asset-desc">${asset.brand} ${asset.model}</div>
                <div class="asset-desc">${asset.mac_address || asset.ip_address || asset.category}</div>
                <div class="company">TI Elis PA &bull; Patrimônio</div>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>ITSM Print - Geração em Lote</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #fff; }
                        .print-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 10px;
                            padding: 15px;
                        }
                        .label { 
                            border: 2px dashed #cbd5e1; 
                            padding: 16px; 
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            width: 60mm; 
                            height: 40mm; 
                            border-radius: 8px;
                            box-sizing: border-box;
                            page-break-inside: avoid;
                        }
                        .qr-container { display: flex; align-items: center; justify-content: center; }
                        .qr-container svg { width: 100px; height: 100px; }
                        .asset-name { font-weight: bold; font-size: 14px; margin: 8px 0 2px 0; color: #0f172a; text-align: center; }
                        .asset-desc { font-size: 10px; font-family: monospace; color: #475569; margin-bottom: 2px; text-align: center; }
                        .company { font-size: 8px; font-weight: bold; color: #94a3b8; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; text-align: center; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            .label { border: 1px solid #000; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-grid">
                        ${labelsHTML}
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 500);
                        };
                    <\/script>
                </body>
            </html>
        `);
        printWindow.document.close();

        // Update 'has_label' status in DB after printing
        const idsToUpdate = assetsToPrint.map(a => a.id);
        await supabase.from('ativos').update({ has_label: true }).in('id', idsToUpdate);
        setSelectedAssetsIds(new Set());
        fetchAssets();
    };

    const handlePrintLabel = () => {
        if (!selectedAsset) return;
        handlePrintBulkLabels([selectedAsset]);
    };

    // Filter Logic
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.ip_address && asset.ip_address.includes(searchTerm)) ||
            (asset.mac_address && asset.mac_address.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === "" || asset.category === selectedCategory;

        let matchesLabelState = true;
        if (filterHasLabel === "yes") matchesLabelState = asset.has_label === true;
        if (filterHasLabel === "no") matchesLabelState = asset.has_label !== true; // Handles false or null

        return matchesSearch && matchesCategory && matchesLabelState;
    });

    const toggleAssetSelection = (id: string, e: any) => {
        e.stopPropagation();
        const newSet = new Set(selectedAssetsIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedAssetsIds(newSet);
    };

    const toggleAllSelection = () => {
        if (selectedAssetsIds.size === filteredAssets.length) {
            setSelectedAssetsIds(new Set());
        } else {
            setSelectedAssetsIds(new Set(filteredAssets.map(a => a.id)));
        }
    };

    return (
        <div className="p-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Server className="text-indigo-500" />
                        Inventário de Ativos
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Gestão de Hardware, Modelos e Conservação</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportReport}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
                    >
                        <FileText size={18} />
                        Exportar Relatório
                    </button>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', category: 'Computador', brand: '', model: '', mac_address: '', ip_address: '', condition: 'Novo', location: '', responsible_user: '', has_label: false, quantity: 1 });
                            setIsAddModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] flex items-center gap-2 transform hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Cadastrar Ativo
                    </button>
                </div>
            </div>

            {/* BULK ACTIONS */}
            {selectedAssetsIds.size > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-2">
                    <span className="text-indigo-800 font-semibold text-sm">
                        {selectedAssetsIds.size} ativo(s) selecionado(s)
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={toggleAllSelection}
                            className="px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition"
                        >
                            Limpar Seleção
                        </button>
                        <button
                            onClick={() => {
                                const assetsToPrint = assets.filter(a => selectedAssetsIds.has(a.id));
                                handlePrintBulkLabels(assetsToPrint);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm"
                        >
                            <QrCode size={16} />
                            Imprimir {selectedAssetsIds.size} Etiqueta(s)
                        </button>
                    </div>
                </div>
            )}

            {/* FILTERS */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 mb-6 relative z-10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, IP, MAC ou Endereço..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterHasLabel}
                        onChange={(e) => setFilterHasLabel(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium cursor-pointer"
                    >
                        <option value="all">Todas as Etiquetas</option>
                        <option value="yes">Com Etiqueta Impressa</option>
                        <option value="no">Sem Etiqueta (Pendente)</option>
                    </select>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium cursor-pointer"
                    >
                        <option value="">Todas as Categorias</option>
                        {dynamicCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex gap-6 items-start">
                {/* TABLE LIST */}
                <div className={`flex-1 glass-panel rounded-2xl overflow-hidden transition-all duration-300 relative z-0 ${selectedAsset ? 'hidden lg:block' : 'block'}`}>
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-3xl -z-10 rounded-full pointer-events-none"></div>
                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold w-12 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                            checked={filteredAssets.length > 0 && selectedAssetsIds.size === filteredAssets.length}
                                            onChange={toggleAllSelection}
                                        />
                                    </th>
                                    <th className="px-6 py-4 font-semibold">Equipamento</th>
                                    <th className="px-6 py-4 font-semibold">Rede</th>
                                    <th className="px-6 py-4 font-semibold">Etiqueta</th>
                                    <th className="px-6 py-4 font-semibold">Localização</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            <Loader2 size={24} className="animate-spin mx-auto text-indigo-500 mb-2" />
                                            Carregando ativos do Supabase...
                                        </td>
                                    </tr>
                                ) : filteredAssets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            Nenhum ativo encontrado.
                                        </td>
                                    </tr>
                                ) : filteredAssets.map((asset) => (
                                    <tr
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className="hover:bg-indigo-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                                checked={selectedAssetsIds.has(asset.id)}
                                                onChange={(e) => toggleAssetSelection(asset.id, e)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                    {getCategoryIcon(asset.category)}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold transition-colors ${selectedAsset?.id === asset.id ? 'text-indigo-600' : 'text-slate-800'}`}>{asset.name}</p>
                                                    <p className="text-xs text-slate-500">{asset.brand} {asset.model}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-700">{asset.ip_address || '-'}</p>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{asset.mac_address}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {asset.has_label ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                    <QrCode size={12} /> Impressa
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                                    Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-700">{asset.location}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColors(asset.status || 'Ativo')}`}>
                                                {asset.status || 'Ativo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SIDE DETAILS PANEL */}
                {selectedAsset && (
                    <div className="w-full lg:w-[400px] glass-panel rounded-2xl flex flex-col animate-in slide-in-from-right duration-300 relative overflow-hidden">
                        <div className="p-5 border-b border-slate-200/50 flex justify-between items-center bg-white/50 rounded-t-2xl">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <HardDrive size={18} className="text-indigo-500" /> Detalhes do Ativo
                            </h2>
                            <button onClick={() => setSelectedAsset(null)} className="p-1 hover:bg-slate-200 rounded-md text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">

                            <div className="text-center pb-4 border-b border-slate-100 relative">
                                <div className="absolute right-0 top-0 opacity-20 pointer-events-none grayscale">
                                    <QRCodeSVG value={`itsm://asset/${selectedAsset.id}`} size={64} />
                                </div>
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-600 shadow-inner">
                                    {getCategoryIcon(selectedAsset.category)}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedAsset.name}</h3>
                                <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColors(selectedAsset.status)}`}>
                                    {selectedAsset.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Especificações</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Categoria" value={selectedAsset.category} />
                                    <DetailItem label="Marca" value={selectedAsset.brand} />
                                    <DetailItem label="Modelo" value={selectedAsset.model} />
                                    <DetailItem label="Responsável Atual" value={selectedAsset.responsible_user || 'Não Atribuído'} />
                                    <DetailItem label="IP" value={selectedAsset.ip_address} />
                                    <DetailItem label="MAC" value={selectedAsset.mac_address} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ciclo de Vida</h4>
                                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Local Atual</span>
                                        <span className="font-medium text-slate-800">{selectedAsset.location}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Conservação</span>
                                        <span className="font-medium text-slate-800">{selectedAsset.condition}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Última Review</span>
                                        <span className="font-medium text-slate-800">{selectedAsset.last_maintenance || 'Sem registro'}</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrintLabel}
                                    className="flex-1 bg-white border border-slate-300 text-slate-700 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <QrCode size={16} /> Print Etiqueta
                                </button>
                                <button
                                    onClick={() => router.push(`/chamados?asset_id=${selectedAsset.id}&asset_name=${encodeURIComponent(selectedAsset.name)}`)}
                                    className="flex-1 bg-rose-50 border border-rose-200 text-rose-700 py-2 rounded-xl text-sm font-semibold hover:bg-rose-100 hover:border-rose-300 transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Ticket size={16} /> Abrir Chamado
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingId(selectedAsset.id);
                                        const standardCategories = ['Computador', 'Switch', 'Nobreak', 'Coletor', 'Impressora'];
                                        const isCustom = !standardCategories.includes(selectedAsset.category);

                                        setFormData({
                                            name: selectedAsset.name,
                                            category: isCustom ? 'Outra (Digitar)' : (selectedAsset.category || 'Computador'),
                                            brand: selectedAsset.brand || '',
                                            model: selectedAsset.model || '',
                                            mac_address: selectedAsset.mac_address || '',
                                            ip_address: selectedAsset.ip_address || '',
                                            condition: selectedAsset.condition || 'Novo',
                                            location: selectedAsset.location || '',
                                            responsible_user: selectedAsset.responsible_user || '',
                                            has_label: selectedAsset.has_label || false,
                                            quantity: 1
                                        });
                                        if (isCustom) setCustomCategory(selectedAsset.category);
                                        setIsAddModalOpen(true);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md"
                                >
                                    Editar Info
                                </button>
                                <button
                                    onClick={() => handleDeleteAsset(selectedAsset.id)}
                                    disabled={isSaving}
                                    className="px-3 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition shadow-sm flex items-center justify-center"
                                    title="Excluir Ativo permanentemente"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <button
                                onClick={() => router.push(`/checkout?asset_id=${selectedAsset.id}&asset_name=${encodeURIComponent(selectedAsset.name)}`)}
                                className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition flex items-center justify-center gap-2 mt-1"
                            >
                                <ExternalLink size={16} /> Realizar Empréstimo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL NOVO ATIVO */}
            {
                isAddModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h2 className="text-lg font-bold text-slate-800">
                                    {editingId ? 'Editar Hardware' : 'Cadastro de Hardware'}
                                </h2>
                                <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Hostname / Nome Base</label>
                                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Ex: PC-PROD" />
                                    </div>

                                    {!editingId ? (
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-indigo-700 flex items-center justify-between">
                                                Quantidade a Cadastrar
                                                <span className="text-xs bg-indigo-100 px-2 py-0.5 rounded text-indigo-600 font-medium">Lote Automático</span>
                                            </label>
                                            <input
                                                value={formData.quantity}
                                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                                type="number"
                                                min="1"
                                                max="100"
                                                className="w-full p-2.5 border border-indigo-200 bg-indigo-50/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-indigo-900"
                                            />
                                            {formData.quantity > 1 && (
                                                <p className="text-xs text-indigo-500 font-medium mt-1">
                                                    Serão criados: {formData.name}-01 até {formData.name}-{String(formData.quantity).padStart(2, '0')}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5"></div>
                                    )}

                                    <div className="space-y-1.5 flex flex-col justify-start">
                                        <label className="text-sm font-medium text-slate-700">Categoria</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                            <option value="Computador">Computador / Notebook</option>
                                            <option value="Switch">Switch / Roteador</option>
                                            <option value="Nobreak">Nobreak / UPS</option>
                                            <option value="Coletor">Coletor de Dados</option>
                                            <option value="Impressora">Impressora</option>
                                            <option value="Outra (Digitar)">Outra (Digitar manualmente...)</option>
                                        </select>
                                        {formData.category === 'Outra (Digitar)' && (
                                            <input
                                                value={customCategory}
                                                onChange={e => setCustomCategory(e.target.value)}
                                                type="text"
                                                className="w-full mt-2 p-2.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none animate-in fade-in slide-in-from-top-2"
                                                placeholder="Digite a nova categoria..."
                                                autoFocus
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Marca</label>
                                        <input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Dell" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Modelo Exato</label>
                                        <input value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Optiplex 3080" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">MAC Address</label>
                                        <input value={formData.mac_address} onChange={e => setFormData({ ...formData, mac_address: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm" placeholder="00:00:00:00:00:00" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">IP (Fixo se houver)</label>
                                        <input value={formData.ip_address} onChange={e => setFormData({ ...formData, ip_address: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="192.168.x.x" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Estado de Conservação</label>
                                        <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                            <option value="Novo">Novo (Na caixa)</option>
                                            <option value="Bom">Bom (Uso diário leve)</option>
                                            <option value="Marcas de Uso">Marcas de Uso / Desgastado</option>
                                            <option value="Danificado">Danificado (Para sucata/peças)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 flex flex-col justify-end">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5"><User size={14} className="text-slate-400" />Usuário / Responsável Atual</label>
                                        <input value={formData.responsible_user} onChange={e => setFormData({ ...formData, responsible_user: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: João (Contabilidade)" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Setor/Localização</label>
                                        <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Recebimento Doca 1" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                                <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">Cancelar</button>
                                <button
                                    onClick={handleSaveAsset}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 text-white font-medium rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                                    Salvar Ativo
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}

// === Funções Auxiliares ===

const DetailItem = ({ label, value }: { label: string, value: string }) => (
    <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-800 break-all">{value || '-'}</p>
    </div>
);

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'Computador': return <Monitor size={20} />;
        case 'Switch': return <Server size={20} />;
        case 'Nobreak': return <Activity size={20} />;
        case 'Impressora': return <Printer size={20} />;
        default: return <Cpu size={20} />;
    }
};

const getStatusColors = (status: string) => {
    switch (status.toLowerCase()) {
        case 'ativo': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        case 'estoque': return 'bg-slate-100 text-slate-700 border border-slate-200';
        case 'manutenção': return 'bg-amber-100 text-amber-700 border border-amber-200';
        case 'sucata': return 'bg-rose-100 text-rose-700 border border-rose-200';
        default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
};
