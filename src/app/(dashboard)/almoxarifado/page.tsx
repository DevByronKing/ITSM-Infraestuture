"use client";

import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Archive, History, Filter, ArrowDownRight, ArrowUpRight, Loader2, X, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AlmoxarifadoPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modals
    const [isNewItemOpen, setIsNewItemOpen] = useState(false);
    const [isTxOpen, setIsTxOpen] = useState(false);
    const [txType, setTxType] = useState<'in' | 'out'>('in');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Forms
    const [newItem, setNewItem] = useState({
        item_name: '', category: 'Periféricos', quantity: 0, min_quantity: 5, unit: 'Und', cost_per_unit: 0
    });
    const [txData, setTxData] = useState({ quantity: 1, user_responsible: '', notes: '' });

    const fetchData = async () => {
        setIsLoading(true);
        // Fetch Items
        const { data: itemsData, error: itemsError } = await supabase
            .from('almoxarifado')
            .select('*')
            .order('item_name', { ascending: true });

        if (!itemsError && itemsData) setItems(itemsData);

        // Fetch Transactions with Item Names
        const { data: txData, error: txError } = await supabase
            .from('almoxarifado_transactions')
            .select(`
                *,
                almoxarifado (item_name)
            `)
            .order('transaction_date', { ascending: false })
            .limit(20);

        if (!txError && txData) {
            const mapped = txData.map(t => {
                const date = new Date(t.transaction_date);
                const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                return { ...t, formattedDate: formatter.format(date) };
            });
            setTransactions(mapped);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateItem = async () => {
        if (!newItem.item_name) return;
        setIsSaving(true);
        const { error } = await supabase.from('almoxarifado').insert([{
            item_name: newItem.item_name,
            category: newItem.category,
            quantity: newItem.quantity,
            min_quantity: newItem.min_quantity,
            unit: newItem.unit,
            cost_per_unit: newItem.cost_per_unit,
            status: newItem.quantity <= newItem.min_quantity ? 'low' : 'ok'
        }]);

        if (!error) {
            setNewItem({ item_name: '', category: 'Periféricos', quantity: 0, min_quantity: 5, unit: 'Und', cost_per_unit: 0 });
            setIsNewItemOpen(false);
            fetchData();
        }
        setIsSaving(false);
    };

    const handleTransaction = async () => {
        if (!selectedItem || txData.quantity <= 0) return;
        setIsSaving(true);

        const newQty = txType === 'in'
            ? selectedItem.quantity + txData.quantity
            : selectedItem.quantity - txData.quantity;

        // Insert Tx
        const { error: txErr } = await supabase.from('almoxarifado_transactions').insert([{
            almoxarifado_id: selectedItem.id,
            transaction_type: txType,
            quantity: txData.quantity,
            user_responsible: txData.user_responsible || 'Admin Local',
            notes: txData.notes
        }]);

        if (!txErr) {
            // Update Item
            await supabase.from('almoxarifado').update({
                quantity: newQty,
                status: newQty <= selectedItem.min_quantity ? 'low' : 'ok'
            }).eq('id', selectedItem.id);

            setIsTxOpen(false);
            setTxData({ quantity: 1, user_responsible: '', notes: '' });
            fetchData();
        }
        setIsSaving(false);
    };

    const openTxModal = (item: any, type: 'in' | 'out') => {
        setSelectedItem(item);
        setTxType(type);
        setIsTxOpen(true);
    };

    return (
        <div className="p-8 space-y-8 h-full">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Archive className="text-indigo-500" />
                        Almoxarifado de TI
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Controle de Insumos, Cabos, Toners e Periféricos</p>
                </div>
                <button
                    onClick={() => setIsNewItemOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Novo Insumo
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Table Area */}
                <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -z-10 rounded-full"></div>

                    <div className="p-4 border-b border-slate-100/50 flex flex-col md:flex-row gap-4 items-center bg-white/50 relative z-10">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar itens do estoque..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium text-sm transition shrink-0">
                            <Filter size={16} /> Filtros
                        </button>
                    </div>

                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Insumo</th>
                                    <th className="px-6 py-4 font-semibold">Categoria</th>
                                    <th className="px-6 py-4 font-semibold text-right">Estoque</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
                                                Carregando estoque...
                                            </div>
                                        </td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            Nenhum insumo encontrado.
                                        </td>
                                    </tr>
                                ) : items.filter(i => i.item_name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                                    <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{item.item_name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Custo Ref: R$ {Number(item.cost_per_unit || 0).toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold uppercase">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-black text-slate-800">{item.quantity}</span>
                                            <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.status === 'ok' ? (
                                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold w-full inline-block">Normal</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-bold w-full inline-block animate-pulse">Baixo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openTxModal(item, 'out')} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded transition border border-rose-200" title="Retirar do Estoque">
                                                    <ArrowDownRight size={16} />
                                                </button>
                                                <button onClick={() => openTxModal(item, 'in')} className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded transition border border-emerald-200" title="Entrada no Estoque">
                                                    <ArrowUpRight size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Log Area */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl h-full pb-8 relative">
                        <div className="flex items-center gap-2 mb-6">
                            <History size={18} className="text-slate-400" />
                            <h3 className="font-bold text-slate-800">Últimas Movimentações</h3>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <p className="text-sm text-center text-slate-500 py-4">Carregando...</p>
                            ) : transactions.length === 0 ? (
                                <p className="text-sm text-center text-slate-500 py-4">Nenhuma movimentação registrada.</p>
                            ) : transactions.map((tx) => (
                                <div key={tx.id} className="relative pl-6">
                                    <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${tx.transaction_type === 'in' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                    <div className="absolute left-[3px] top-4 bottom-[-16px] w-[2px] bg-slate-100"></div>

                                    <p className="text-xs font-bold text-slate-500">{tx.formattedDate}</p>
                                    <p className="text-sm font-semibold text-slate-800 mt-1">
                                        {tx.transaction_type === 'in' ? 'Entrada' : 'Baixa'} de {tx.quantity}x
                                    </p>
                                    <p className="text-xs font-medium text-indigo-600">{tx.almoxarifado?.item_name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Por {tx.user_responsible} {tx.notes ? `- ${tx.notes}` : ''}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* MODAL NOVO INSUMO */}
            {isNewItemOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Cadastrar Insumo</h2>
                            <button onClick={() => setIsNewItemOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome do Insumo</label>
                                <input value={newItem.item_name} onChange={e => setNewItem({ ...newItem, item_name: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Ex: Cartucho Toner HP 85A" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Categoria</label>
                                    <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                        <option value="Periféricos">Periféricos</option>
                                        <option value="Cabeamento">Cabeamento</option>
                                        <option value="Impressão">Impressão / Toners</option>
                                        <option value="Diversos">Diversos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Unidade de Medida</label>
                                    <select value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white">
                                        <option value="Und">Unidade (Und)</option>
                                        <option value="Caixa">Caixa</option>
                                        <option value="Metros">Metros</option>
                                        <option value="Pacote">Pacote</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Qtd. Inicial</label>
                                    <input value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })} type="number" min="0" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Qtd. Mínima</label>
                                    <input value={newItem.min_quantity} onChange={e => setNewItem({ ...newItem, min_quantity: Number(e.target.value) })} type="number" min="0" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Custo (R$)</label>
                                    <input value={newItem.cost_per_unit} onChange={e => setNewItem({ ...newItem, cost_per_unit: Number(e.target.value) })} type="number" step="0.01" min="0" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsNewItemOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">Cancelar</button>
                            <button
                                onClick={handleCreateItem}
                                disabled={isSaving || !newItem.item_name}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition flex gap-2 items-center disabled:opacity-70"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Salvar Insumo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ENTRADA / SAÍDA */}
            {isTxOpen && selectedItem && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center ${txType === 'in' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                            <h2 className={`text-lg font-bold flex items-center gap-2 ${txType === 'in' ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {txType === 'in' ? <><ArrowUpRight size={20} /> Entrada de Estoque</> : <><ArrowDownRight size={20} /> Baixa de Estoque</>}
                            </h2>
                            <button onClick={() => setIsTxOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Insumo Selecionado</p>
                                <p className="font-bold text-slate-900 text-lg">{selectedItem.item_name}</p>
                                <p className="text-sm font-semibold text-slate-500 mt-1">Saldo atual: {selectedItem.quantity} {selectedItem.unit}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Quantidade ({txType === 'in' ? 'Entrando' : 'Saindo'})</label>
                                <input value={txData.quantity} onChange={e => setTxData({ ...txData, quantity: Number(e.target.value) })} type="number" min="1" max={txType === 'out' ? selectedItem.quantity : undefined} className="w-full p-2.5 text-center text-xl font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nome do Responsável / Solicitante</label>
                                <input value={txData.user_responsible} onChange={e => setTxData({ ...txData, user_responsible: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Ex: João (Técnico)" />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Motivo / OS / Obs</label>
                                <input value={txData.notes} onChange={e => setTxData({ ...txData, notes: e.target.value })} type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" placeholder="Ex: Compra NF 1234 / Troca Setor RH" />
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsTxOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">Cancelar</button>
                            <button
                                onClick={handleTransaction}
                                disabled={isSaving || txData.quantity <= 0 || (txType === 'out' && txData.quantity > selectedItem.quantity)}
                                className={`px-4 py-2 text-white font-medium rounded-lg transition flex gap-2 items-center disabled:opacity-50 ${txType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                Confirmar {txType === 'in' ? 'Entrada' : 'Baixa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
