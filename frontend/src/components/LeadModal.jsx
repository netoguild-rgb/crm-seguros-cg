import React, { useState } from 'react';
import { X, Phone, Calendar, User, FileText, Trash2, ExternalLink, FolderOpen, Edit, Save, FileDown, MessageCircle, Copy, Check } from 'lucide-react';
import { updateLead, getConfig } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LeadModal = ({ lead, onClose, onDelete, onUpdate }) => {
    if (!lead) return null;

    const [activeTab, setActiveTab] = useState('detalhes');
    const [pastaLink, setPastaLink] = useState(lead.link_pasta || '');
    const [isEditingLink, setIsEditingLink] = useState(!lead.link_pasta);
    const [loadingLink, setLoadingLink] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(false);

    // Parse dos dados extras
    let extraData = {};
    try {
        if (typeof lead.dados_extras === 'string') {
            extraData = JSON.parse(lead.dados_extras);
        } else if (lead.dados_extras && typeof lead.dados_extras === 'object') {
            extraData = lead.dados_extras;
        }
    } catch (e) { console.error("Erro parsing JSON", e); }

    const mergedData = { ...extraData, ...lead };

    const handleGeneratePDF = async () => {
        let config = { broker_name: 'CRM Seguros', primary_color: '#667eea' };

        try {
            const { data } = await getConfig();
            if (data) config = {
                broker_name: data.broker_name || config.broker_name,
                primary_color: data.primary_color || config.primary_color
            };
        } catch (e) { }

        const doc = new jsPDF();

        // Header with gradient effect
        doc.setFillColor('#667eea');
        doc.rect(0, 0, 210, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(config.broker_name.toUpperCase(), 14, 20);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text("FICHA CADASTRAL", 170, 20);

        const tableRows = [
            ['Nome Completo', lead.nome],
            ['Telefone / WhatsApp', lead.whatsapp],
            ['Email', lead.email || '-'],
            ['CPF', lead.cpf || '-'],
            ['Status do Lead', lead.status],
            ['Tipo de Seguro', lead.tipo_seguro || '-'],
            ['Modelo Veículo', lead.modelo_veiculo || '-'],
            ['Placa', lead.placa || '-'],
            ['Ano', lead.ano_veiculo || '-'],
            ['Uso', lead.uso_veiculo || '-'],
        ];

        const ignoreKeys = ['id', 'criadoEm', 'updatedAt', 'nome', 'whatsapp', 'email', 'cpf', 'status', 'tipo_seguro', 'modelo_veiculo', 'placa', 'ano_veiculo', 'uso_veiculo', 'link_pasta', 'dados_extras'];

        Object.entries(mergedData).forEach(([key, value]) => {
            if (!ignoreKeys.includes(key) && value && typeof value !== 'object') {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                tableRows.push([label, value.toString()]);
            }
        });

        autoTable(doc, {
            startY: 40,
            head: [['CAMPO', 'INFORMAÇÃO']],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: '#667eea',
                textColor: 255,
                fontStyle: 'bold',
                halign: 'left'
            },
            styles: {
                fontSize: 10,
                cellPadding: 4,
                textColor: 50
            },
            columnStyles: {
                0: { fontStyle: 'bold', width: 70, fillColor: [248, 250, 252] },
            }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Documento gerado em ${new Date().toLocaleString()}`, 14, finalY);

        doc.save(`Ficha_${lead.nome}.pdf`);
    };

    const handleSaveLink = async () => {
        setLoadingLink(true);
        try {
            await updateLead(lead.id, { link_pasta: pastaLink });
            lead.link_pasta = pastaLink;
            setIsEditingLink(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Erro ao salvar');
        } finally {
            setLoadingLink(false);
        }
    };

    const copyPhoneToClipboard = () => {
        navigator.clipboard.writeText(lead.whatsapp);
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    const technicalKeys = ['id', 'dados_extras', 'criadoEm', 'updatedAt', 'link_pasta'];
    const formatKey = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'FECHADO': return 'badge-closed';
            case 'PERDIDO': return 'badge-lost';
            case 'NEGOCIACAO': return 'badge-negotiation';
            default: return 'badge-new';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content w-full max-w-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >

                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-crm-900 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-crm-500/10 to-accent-purple/10" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{lead.nome || 'Lead Sem Nome'}</h2>
                            <div className="flex flex-wrap gap-3 text-slate-300 text-sm">
                                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                                    <User size={14} /> ID #{lead.id}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
                                    <Calendar size={14} /> {new Date(lead.criadoEm).toLocaleDateString('pt-BR')}
                                </span>
                                <span className={getStatusBadgeClass(lead.status)}>
                                    {lead.status}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="hover:bg-white/10 p-2 rounded-xl transition-all text-white/70 hover:text-white"
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white">
                    <button
                        onClick={() => setActiveTab('detalhes')}
                        className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'detalhes'
                                ? 'text-crm-600'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Detalhes
                        {activeTab === 'detalhes' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-crm-500 to-accent-purple" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('arquivos')}
                        className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'arquivos'
                                ? 'text-crm-600'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Pasta Cliente
                        {activeTab === 'arquivos' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-crm-500 to-accent-purple" />
                        )}
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-slate-50 to-white max-h-[60vh]">

                    {/* TAB DETALHES */}
                    {activeTab === 'detalhes' && (
                        <div className="animate-fade-in space-y-6">
                            {/* Action Buttons */}
                            <div className="flex gap-3 flex-wrap">
                                <a
                                    href={`https://wa.me/55${lead.whatsapp ? lead.whatsapp.replace(/\D/g, '') : ''}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 min-w-[140px] bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-success"
                                >
                                    <MessageCircle size={20} /> WhatsApp
                                </a>

                                <button
                                    onClick={handleGeneratePDF}
                                    className="flex-1 min-w-[140px] bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <FileDown size={20} /> Gerar PDF
                                </button>

                                <button
                                    onClick={() => { if (confirm('Tem certeza que deseja excluir este lead?')) onDelete(lead.id); }}
                                    className="px-4 border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 rounded-xl transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {/* Quick Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-4 rounded-xl">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Status Atual</span>
                                    <p className="font-bold text-slate-800 text-xl mt-1">{lead.status}</p>
                                </div>
                                <div className="glass-card p-4 rounded-xl">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Tipo Seguro</span>
                                    <p className="font-bold text-slate-800 text-xl mt-1">{lead.tipo_seguro || '-'}</p>
                                </div>
                            </div>

                            {/* Phone with Copy */}
                            <div className="glass-card p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Telefone/WhatsApp</span>
                                    <p className="font-bold text-slate-800 text-lg font-mono mt-1">{lead.whatsapp}</p>
                                </div>
                                <button
                                    onClick={copyPhoneToClipboard}
                                    className={`p-3 rounded-xl transition-all ${copiedPhone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    {copiedPhone ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>

                            {/* Full Data List */}
                            <div className="glass-card rounded-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-5 py-3 border-b border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                                        <FileText size={16} className="text-crm-500" /> Dados Cadastrais
                                    </h3>
                                </div>
                                <div className="p-4 space-y-1">
                                    {Object.entries(mergedData).map(([key, value]) => {
                                        if (technicalKeys.includes(key)) return null;
                                        if (value === null || typeof value === 'object') return null;

                                        const isLink = typeof value === 'string' && value.startsWith('http');

                                        return (
                                            <div
                                                key={key}
                                                className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-3 rounded-lg transition-colors"
                                            >
                                                <span className="font-medium text-slate-500 text-sm">{formatKey(key)}</span>
                                                {isLink ? (
                                                    <a
                                                        href={value}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-crm-600 hover:text-crm-700 text-xs flex items-center gap-1.5 bg-crm-50 px-3 py-1.5 rounded-lg font-bold hover:bg-crm-100 transition-colors"
                                                    >
                                                        <ExternalLink size={12} /> Abrir Link
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-800 font-semibold text-sm text-right break-words max-w-[60%]">
                                                        {value.toString()}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB ARQUIVOS */}
                    {activeTab === 'arquivos' && (
                        <div className="text-center space-y-6 h-full flex flex-col justify-center animate-fade-in py-8">
                            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto text-crm-500 shadow-lg">
                                <FolderOpen size={44} />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Arquivos na Nuvem</h3>
                                <p className="text-slate-500 text-sm mt-1">Gerencie os documentos deste cliente</p>
                            </div>

                            {!isEditingLink && lead.link_pasta ? (
                                <div className="space-y-4 w-full glass-card p-6 rounded-2xl">
                                    <div className="bg-slate-100 p-4 rounded-xl text-sm break-all text-slate-600 border border-slate-200 flex items-center gap-3 justify-center">
                                        <ExternalLink size={16} className="shrink-0 text-crm-500" />
                                        <span className="truncate">{lead.link_pasta}</span>
                                    </div>
                                    <a
                                        href={lead.link_pasta}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block w-full bg-gradient-to-r from-crm-500 to-accent-purple hover:from-crm-600 hover:to-purple-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-glow hover:-translate-y-0.5"
                                    >
                                        Acessar Pasta Agora
                                    </a>
                                    <button
                                        onClick={() => setIsEditingLink(true)}
                                        className="text-sm text-slate-400 hover:text-crm-600 underline mt-2 flex items-center justify-center gap-1.5 w-full"
                                    >
                                        <Edit size={14} /> Alterar Link da Pasta
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full glass-card p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-crm-400 transition-colors">
                                    <label className="block text-left text-xs font-bold text-slate-500 uppercase mb-3">
                                        Cole o Link da Pasta (Google Drive/Dropbox)
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            value={pastaLink}
                                            onChange={e => setPastaLink(e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1 p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-crm-500 focus:border-crm-500 text-sm shadow-sm"
                                        />
                                        <button
                                            onClick={handleSaveLink}
                                            disabled={loadingLink}
                                            className="bg-gradient-to-r from-crm-500 to-accent-purple text-white px-6 rounded-xl hover:shadow-glow transition-all font-bold shadow-lg disabled:opacity-50"
                                        >
                                            {loadingLink ? '...' : <Save size={22} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadModal;