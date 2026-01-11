import React, { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    Eye,
    Heart,
    Share2,
    Calendar,
    TrendingUp,
    Users,
    Target,
    Image,
    Palette,
    Layout,
    Sparkles,
    Play,
    Pause,
    MoreHorizontal,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    BarChart3,
    Zap,
    RefreshCw,
    ShoppingBag
} from 'lucide-react';
import { getCampaigns, createCampaign, getTemplates } from '../services/api';

// Mock data para fallback
const mockCampaigns = [
    { id: 1, name: 'Black Friday Seguros', status: 'active', type: 'Promoção', views: 2340, engagement: 45, leads: 28, startDate: '2026-01-05', endDate: '2026-01-31', imageUrl: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
    { id: 2, name: 'Seguro Auto 2026', status: 'active', type: 'Institucional', views: 1890, engagement: 38, leads: 15, startDate: '2026-01-01', endDate: '2026-02-28', imageUrl: 'linear-gradient(135deg, #0a4d68, #088395)' },
    { id: 3, name: 'Campanha Vida', status: 'paused', type: 'Seguro Vida', views: 890, engagement: 22, leads: 8, startDate: '2025-12-01', endDate: '2025-12-31', imageUrl: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    { id: 4, name: 'Residencial Premium', status: 'ended', type: 'Seguro Residencial', views: 3200, engagement: 52, leads: 45, startDate: '2025-11-01', endDate: '2025-11-30', imageUrl: 'linear-gradient(135deg, #059669, #10b981)' }
];

const mockTemplates = [
    { id: 1, name: 'Promoção Veículo', icon: '🚗', gradient: 'from-blue-500 to-cyan-500', category: 'Auto', key: 'auto' },
    { id: 2, name: 'Seguro Vida', icon: '❤️', gradient: 'from-red-500 to-pink-500', category: 'Vida', key: 'vida' },
    { id: 3, name: 'Datas Comemorativas', icon: '🎉', gradient: 'from-amber-500 to-orange-500', category: 'Especial', key: 'especial' },
    { id: 4, name: 'Residencial', icon: '🏠', gradient: 'from-emerald-500 to-green-500', category: 'Residencial', key: 'residencial' },
    { id: 5, name: 'Saúde', icon: '💊', gradient: 'from-purple-500 to-indigo-500', category: 'Saúde', key: 'saude' },
    { id: 6, name: 'Stories', icon: '📱', gradient: 'from-pink-500 to-rose-500', category: 'Social', key: 'social' },
];

function MarketingPage({ onNavigateToMarketplace }) {
    const [campaigns, setCampaigns] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newCampaign, setNewCampaign] = useState({ name: '', type: 'Promoção', startDate: '', endDate: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, templatesRes] = await Promise.all([getCampaigns(), getTemplates()]);
            setCampaigns(campaignsRes.data?.length > 0 ? campaignsRes.data : mockCampaigns);
            setTemplates(templatesRes.data?.length > 0 ? templatesRes.data : mockTemplates);
        } catch (error) {
            console.error('Erro ao carregar dados, usando mock:', error);
            setCampaigns(mockCampaigns);
            setTemplates(mockTemplates);
        }
        setLoading(false);
    };

    const handleCreateCampaign = async () => {
        if (!newCampaign.name || !newCampaign.startDate) return;
        try {
            await createCampaign(newCampaign);
            setShowNewCampaignModal(false);
            setNewCampaign({ name: '', type: 'Promoção', startDate: '', endDate: '' });
            loadData();
        } catch (error) {
            console.error('Erro ao criar campanha:', error);
        }
    };

    // Métricas gerais
    const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
    const totalLeads = campaigns.reduce((acc, c) => acc + (c.leads || 0), 0);
    const avgEngagement = campaigns.length > 0 ? Math.round(campaigns.reduce((acc, c) => acc + (c.engagement || 0), 0) / campaigns.length) : 0;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    const filteredCampaigns = selectedFilter === 'all'
        ? campaigns
        : campaigns.filter(c => c.status === selectedFilter);

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { bg: 'bg-green-100', text: 'text-green-700', icon: <Play size={12} />, label: 'Ativa' },
            paused: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Pause size={12} />, label: 'Pausada' },
            ended: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <CheckCircle size={12} />, label: 'Encerrada' }
        };
        const config = statusConfig[status];
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                            <Megaphone size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Marketing</h1>
                            <p className="text-sm text-slate-500">Gerencie campanhas e crie posts profissionais</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNewCampaignModal(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:shadow-lg text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
                    >
                        <Plus size={18} /> Nova Campanha
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="kpi-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye size={20} className="text-blue-600" />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+12%</span>
                    </div>
                    <p className="kpi-value">{totalViews.toLocaleString()}</p>
                    <p className="text-sm text-slate-500 mt-1">Visualizações</p>
                </div>

                <div className="kpi-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                            <Heart size={20} className="text-pink-600" />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+8%</span>
                    </div>
                    <p className="kpi-value">{avgEngagement}%</p>
                    <p className="text-sm text-slate-500 mt-1">Engajamento Médio</p>
                </div>

                <div className="kpi-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users size={20} className="text-green-600" />
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+25%</span>
                    </div>
                    <p className="kpi-value">{totalLeads}</p>
                    <p className="text-sm text-slate-500 mt-1">Leads Gerados</p>
                </div>

                <div className="kpi-card">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Target size={20} className="text-purple-600" />
                        </div>
                    </div>
                    <p className="kpi-value">{activeCampaigns}</p>
                    <p className="text-sm text-slate-500 mt-1">Campanhas Ativas</p>
                </div>
            </div>

            {/* Templates Section */}
            <div className="glass-card rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Palette size={20} className="text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-800">Templates Prontos</h2>
                    </div>
                    <button
                        onClick={() => onNavigateToMarketplace?.()}
                        className="text-sm text-crm-600 hover:text-crm-700 font-semibold flex items-center gap-1 px-3 py-1.5 bg-crm-50 hover:bg-crm-100 rounded-lg transition-colors"
                    >
                        <ShoppingBag size={14} />
                        Ver Marketplace <ChevronRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => onNavigateToMarketplace?.(template.key)}
                            className="group cursor-pointer"
                        >
                            <div className={`aspect-square bg-gradient-to-br ${template.gradient || template.color} rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}>
                                <span className="text-4xl mb-2">{template.icon}</span>
                                <span className="text-white text-xs font-semibold text-center">{template.name}</span>
                            </div>
                            <p className="text-xs text-slate-500 text-center mt-2">{template.category}</p>
                        </div>
                    ))}

                    {/* Add New Template - Marketplace Button */}
                    <div
                        onClick={() => onNavigateToMarketplace?.()}
                        className="group cursor-pointer"
                    >
                        <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex flex-col items-center justify-center p-4 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                            <ShoppingBag size={32} className="text-white/80 mb-2" />
                            <span className="text-white text-xs font-semibold text-center">Marketplace</span>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-2">Ver todos</p>
                    </div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="glass-card rounded-2xl p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <BarChart3 size={20} className="text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-800">Campanhas</h2>
                    </div>
                    <div className="flex gap-2">
                        {['all', 'active', 'paused', 'ended'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedFilter === filter
                                    ? 'bg-crm-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {filter === 'all' ? 'Todas' : filter === 'active' ? 'Ativas' : filter === 'paused' ? 'Pausadas' : 'Encerradas'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredCampaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-slate-200/50 hover:shadow-md transition-all group"
                        >
                            {/* Campaign Image */}
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                style={{ background: campaign.imageUrl || campaign.image || 'linear-gradient(135deg, #667eea, #764ba2)' }}
                            >
                                <Megaphone size={24} className="text-white/80" />
                            </div>

                            {/* Campaign Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-slate-800 truncate">{campaign.name}</h3>
                                    {getStatusBadge(campaign.status)}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} /> {campaign.startDate} - {campaign.endDate}
                                    </span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-full">{campaign.type}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="hidden md:flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-slate-800">{campaign.views.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">Views</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-slate-800">{campaign.engagement}%</p>
                                    <p className="text-xs text-slate-500">Engajamento</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-green-600">{campaign.leads}</p>
                                    <p className="text-xs text-slate-500">Leads</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 opacity-0 group-hover:opacity-100">
                                    <Eye size={18} />
                                </button>
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCampaigns.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📢</div>
                        <p className="text-slate-500">Nenhuma campanha encontrada</p>
                    </div>
                )}
            </div>

            {/* New Campaign Modal - Simple placeholder */}
            {showNewCampaignModal && (
                <div className="modal-overlay" onClick={() => setShowNewCampaignModal(false)}>
                    <div className="modal-content w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Sparkles className="text-purple-500" /> Nova Campanha
                        </h2>
                        <p className="text-slate-500 mb-6">Configure sua nova campanha de marketing</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da Campanha</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Promoção de Verão"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-crm-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                                <select
                                    value={newCampaign.type}
                                    onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-crm-500/50"
                                >
                                    <option>Promoção</option>
                                    <option>Institucional</option>
                                    <option>Seguro Auto</option>
                                    <option>Seguro Vida</option>
                                    <option>Seguro Residencial</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Data Início</label>
                                    <input
                                        type="date"
                                        value={newCampaign.startDate}
                                        onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Data Fim</label>
                                    <input
                                        type="date"
                                        value={newCampaign.endDate}
                                        onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowNewCampaignModal(false)}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateCampaign}
                                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Criar Campanha
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MarketingPage;
