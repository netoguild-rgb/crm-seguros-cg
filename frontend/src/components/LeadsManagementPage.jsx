import React, { useState, useMemo } from 'react';
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Phone,
    Mail,
    Car,
    Heart,
    Home,
    Building,
    Shield,
    Eye,
    Edit,
    Trash2,
    Send,
    FileDown,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    AlertCircle,
    Flame,
    Star,
    Calendar,
    MapPin,
    RefreshCw,
    Download,
    Upload,
    BarChart3
} from 'lucide-react';

// Configuração de status
const statusConfig = {
    'NOVO': {
        label: 'Novo',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: Star,
        bgGradient: 'from-blue-500 to-cyan-500'
    },
    'NEGOCIACAO': {
        label: 'Negociando',
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        icon: TrendingUp,
        bgGradient: 'from-amber-500 to-orange-500'
    },
    'FECHADO': {
        label: 'Fechado',
        color: 'bg-green-500/10 text-green-600 border-green-500/20',
        icon: CheckCircle2,
        bgGradient: 'from-green-500 to-emerald-500'
    },
    'PERDIDO': {
        label: 'Perdido',
        color: 'bg-red-500/10 text-red-600 border-red-500/20',
        icon: XCircle,
        bgGradient: 'from-red-500 to-rose-500'
    }
};

// Tipos de seguro
const insuranceTypes = {
    'Seguro Auto': { icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'Seguro Vida': { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
    'Residencial': { icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    'Plano de Saúde': { icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    'Empresarial': { icon: Building, color: 'text-amber-500', bg: 'bg-amber-500/10' }
};

function LeadsManagementPage({
    leads = [],
    onOpenLead,
    onNewLead,
    onDeleteLead,
    onUpdateStatus,
    onWhatsApp,
    onExportPDF,
    loading = false,
    onRefresh
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [sortField, setSortField] = useState('criadoEm');
    const [sortDirection, setSortDirection] = useState('desc');
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Estatísticas
    const stats = useMemo(() => {
        return {
            total: leads.length,
            novos: leads.filter(l => l.status === 'NOVO').length,
            negociando: leads.filter(l => l.status === 'NEGOCIACAO').length,
            fechados: leads.filter(l => l.status === 'FECHADO').length,
            perdidos: leads.filter(l => l.status === 'PERDIDO').length,
            taxaConversao: leads.length > 0
                ? ((leads.filter(l => l.status === 'FECHADO').length / leads.length) * 100).toFixed(1)
                : 0
        };
    }, [leads]);

    // Filtrar e ordenar
    const filteredLeads = useMemo(() => {
        let result = [...leads];

        // Busca
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(l =>
                l.nome?.toLowerCase().includes(term) ||
                l.whatsapp?.includes(term) ||
                l.email?.toLowerCase().includes(term) ||
                l.cpf?.includes(term)
            );
        }

        // Filtros
        if (filterStatus) result = result.filter(l => l.status === filterStatus);
        if (filterType) result = result.filter(l => l.tipo_seguro === filterType);

        // Ordenação
        result.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === 'criadoEm') {
                aVal = new Date(aVal || 0);
                bVal = new Date(bVal || 0);
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [leads, searchTerm, filterStatus, filterType, sortField, sortDirection]);

    // Toggle seleção
    const toggleSelect = (id) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedLeads.length === filteredLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(filteredLeads.map(l => l.id));
        }
    };

    // Ordenar por coluna
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-400" />;
        return sortDirection === 'asc'
            ? <ChevronUp size={14} className="text-crm-500" />
            : <ChevronDown size={14} className="text-crm-500" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-crm-500 to-crm-600 p-3 rounded-xl shadow-lg shadow-crm-500/25">
                        <Users size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestão de Leads</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {stats.total} leads • {stats.taxaConversao}% taxa de conversão
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onRefresh}
                        className="p-2.5 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => onExportPDF && onExportPDF(filteredLeads)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                        onClick={onNewLead}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-crm-500 to-crm-600 text-white font-semibold rounded-xl shadow-lg shadow-crm-500/25 hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Plus size={18} />
                        Novo Lead
                    </button>
                </div>
            </div>

            {/* KPIs Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Users, gradient: 'from-slate-500 to-slate-600' },
                    { label: 'Novos', value: stats.novos, icon: Star, gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'Negociando', value: stats.negociando, icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
                    { label: 'Fechados', value: stats.fechados, icon: CheckCircle2, gradient: 'from-green-500 to-emerald-500' },
                    { label: 'Perdidos', value: stats.perdidos, icon: XCircle, gradient: 'from-red-500 to-rose-500' }
                ].map((kpi, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setFilterStatus(kpi.label === 'Total' ? '' :
                            kpi.label === 'Novos' ? 'NOVO' :
                                kpi.label === 'Negociando' ? 'NEGOCIACAO' :
                                    kpi.label === 'Fechados' ? 'FECHADO' : 'PERDIDO'
                        )}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center`}>
                                <kpi.icon size={18} className="text-white" />
                            </div>
                            {filterStatus === (kpi.label === 'Total' ? '' :
                                kpi.label === 'Novos' ? 'NOVO' :
                                    kpi.label === 'Negociando' ? 'NEGOCIACAO' :
                                        kpi.label === 'Fechados' ? 'FECHADO' : 'PERDIDO') && (
                                    <span className="w-2 h-2 rounded-full bg-crm-500 animate-pulse"></span>
                                )}
                        </div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Search & Filters Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-4 flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, telefone, email ou CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 focus:bg-white dark:focus:bg-slate-600 transition-all"
                        />
                    </div>

                    {/* Quick Filters */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-medium cursor-pointer hover:border-crm-500 transition-colors"
                    >
                        <option value="">Todos os Status</option>
                        <option value="NOVO">🌟 Novos</option>
                        <option value="NEGOCIACAO">📈 Negociando</option>
                        <option value="FECHADO">✅ Fechados</option>
                        <option value="PERDIDO">❌ Perdidos</option>
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-medium cursor-pointer hover:border-crm-500 transition-colors"
                    >
                        <option value="">Todos os Tipos</option>
                        <option value="Seguro Auto">🚗 Seguro Auto</option>
                        <option value="Seguro Vida">❤️ Seguro Vida</option>
                        <option value="Residencial">🏠 Residencial</option>
                        <option value="Plano de Saúde">💊 Plano de Saúde</option>
                    </select>

                    {(filterStatus || filterType || searchTerm) && (
                        <button
                            onClick={() => { setFilterStatus(''); setFilterType(''); setSearchTerm(''); }}
                            className="px-4 py-3 text-crm-600 hover:text-crm-700 font-medium flex items-center gap-2"
                        >
                            <XCircle size={16} />
                            Limpar
                        </button>
                    )}
                </div>

                {/* Bulk Actions */}
                {selectedLeads.length > 0 && (
                    <div className="px-4 pb-4 flex items-center gap-4 animate-fade-in">
                        <div className="flex items-center gap-2 bg-crm-50 dark:bg-crm-900/30 px-4 py-2 rounded-xl">
                            <CheckCircle2 size={16} className="text-crm-600" />
                            <span className="font-semibold text-crm-700 dark:text-crm-400">{selectedLeads.length} selecionados</span>
                        </div>
                        <button
                            onClick={() => onWhatsApp && onWhatsApp(leads.filter(l => selectedLeads.includes(l.id)))}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                        >
                            <Send size={16} />
                            Enviar WhatsApp
                        </button>
                        <button
                            onClick={() => setSelectedLeads([])}
                            className="px-4 py-2 text-slate-500 hover:text-slate-700"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="w-12 px-4 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-crm-600 focus:ring-crm-500"
                                    />
                                </th>
                                <th
                                    className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase cursor-pointer hover:text-slate-700 transition-colors"
                                    onClick={() => handleSort('nome')}
                                >
                                    <div className="flex items-center gap-2">
                                        Lead <SortIcon field="nome" />
                                    </div>
                                </th>
                                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Contato</th>
                                <th className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
                                <th
                                    className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase cursor-pointer hover:text-slate-700 transition-colors"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-2">
                                        Status <SortIcon field="status" />
                                    </div>
                                </th>
                                <th
                                    className="text-left px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase cursor-pointer hover:text-slate-700 transition-colors"
                                    onClick={() => handleSort('criadoEm')}
                                >
                                    <div className="flex items-center gap-2">
                                        Data <SortIcon field="criadoEm" />
                                    </div>
                                </th>
                                <th className="text-center px-4 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <RefreshCw className="w-8 h-8 mx-auto mb-3 text-crm-500 animate-spin" />
                                        <p className="text-slate-500">Carregando leads...</p>
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p className="text-slate-500 font-medium">Nenhum lead encontrado</p>
                                        <p className="text-slate-400 text-sm mt-1">Tente ajustar os filtros ou adicione um novo lead</p>
                                    </td>
                                </tr>
                            ) : filteredLeads.map((lead, index) => {
                                const status = statusConfig[lead.status] || statusConfig['NOVO'];
                                const StatusIcon = status.icon;
                                const typeConfig = insuranceTypes[lead.tipo_seguro] || insuranceTypes['Seguro Auto'];
                                const TypeIcon = typeConfig.icon;

                                return (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                                        style={{ animationDelay: `${index * 20}ms` }}
                                    >
                                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.includes(lead.id)}
                                                onChange={() => toggleSelect(lead.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-crm-600 focus:ring-crm-500"
                                            />
                                        </td>
                                        <td className="px-4 py-4" onClick={() => onOpenLead && onOpenLead(lead)}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${status.bgGradient} flex items-center justify-center text-white font-bold text-sm`}>
                                                    {lead.nome?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-white group-hover:text-crm-600 transition-colors">
                                                        {lead.nome}
                                                    </p>
                                                    {lead.cpf && (
                                                        <p className="text-xs text-slate-400">{lead.cpf}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4" onClick={() => onOpenLead && onOpenLead(lead)}>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {lead.whatsapp}
                                                </div>
                                                {lead.email && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <Mail size={12} />
                                                        {lead.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4" onClick={() => onOpenLead && onOpenLead(lead)}>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${typeConfig.bg}`}>
                                                <TypeIcon size={14} className={typeConfig.color} />
                                                <span className={`text-sm font-medium ${typeConfig.color}`}>
                                                    {lead.tipo_seguro?.replace('Seguro ', '')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4" onClick={() => onOpenLead && onOpenLead(lead)}>
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${status.color}`}>
                                                <StatusIcon size={14} />
                                                <span className="text-sm font-medium">{status.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500" onClick={() => onOpenLead && onOpenLead(lead)}>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatDate(lead.criadoEm)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onOpenLead && onOpenLead(lead); }}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                    title="Ver detalhes"
                                                >
                                                    <Eye size={16} className="text-slate-500" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onWhatsApp && onWhatsApp([lead]); }}
                                                    className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <Send size={16} className="text-green-500" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onExportPDF && onExportPDF([lead]); }}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                    title="Exportar PDF"
                                                >
                                                    <FileDown size={16} className="text-slate-500" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); if (confirm('Excluir este lead?')) onDeleteLead && onDeleteLead(lead.id); }}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer com info */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Mostrando <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredLeads.length}</span> de <span className="font-semibold text-slate-700 dark:text-slate-300">{leads.length}</span> leads
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <BarChart3 size={14} />
                        Taxa de conversão: <span className="font-semibold text-green-600">{stats.taxaConversao}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeadsManagementPage;
