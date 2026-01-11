import React, { useState } from 'react';
import {
    Briefcase,
    FileText,
    Megaphone,
    Target,
    BarChart3,
    TrendingUp,
    DollarSign,
    Users,
    Eye,
    MousePointer,
    ChevronRight,
    Plus,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Zap,
    Sparkles,
    PenTool,
    Send,
    Image,
    Video,
    Share2
} from 'lucide-react';

// Mock data para posts recentes
const recentPosts = [
    { id: 1, title: 'Seguro Auto - Promoção Janeiro', platform: 'Instagram', status: 'published', date: '2026-01-10', views: 1250 },
    { id: 2, title: 'Dicas de Proteção Residencial', platform: 'Facebook', status: 'scheduled', date: '2026-01-12', views: 0 },
    { id: 3, title: 'Seguro Viagem - Férias 2026', platform: 'Instagram', status: 'draft', date: '-', views: 0 },
];

// Mock data para tráfego pago
const trafficData = {
    google: { spend: 2500, clicks: 1890, impressions: 45000, ctr: 4.2, conversions: 32 },
    meta: { spend: 1800, clicks: 2340, impressions: 62000, ctr: 3.8, conversions: 28 }
};

// Mock atividade recente
const recentActivity = [
    { id: 1, action: 'Post "Seguro Auto" publicado', time: '2 horas atrás', icon: 'send', color: 'text-green-600' },
    { id: 2, action: 'Campanha "Black Friday" atingiu 1k views', time: '5 horas atrás', icon: 'eye', color: 'text-blue-600' },
    { id: 3, action: 'Novo lead via Google Ads', time: '8 horas atrás', icon: 'user', color: 'text-purple-600' },
    { id: 4, action: 'Post agendado para amanhã', time: '1 dia atrás', icon: 'calendar', color: 'text-amber-600' },
];

function ServicesPage() {
    const [activeSection, setActiveSection] = useState(null);

    const ServiceCard = ({ icon: Icon, title, description, color, gradient, onClick }) => (
        <div
            onClick={onClick}
            className="glass-card rounded-2xl p-6 cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 mb-4">{description}</p>
            <button className={`flex items-center gap-1 text-sm font-semibold ${color} group-hover:gap-2 transition-all`}>
                Acessar <ChevronRight size={16} />
            </button>
        </div>
    );

    const getStatusBadge = (status) => {
        const config = {
            published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicado' },
            scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Agendado' },
            draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Rascunho' }
        };
        const c = config[status];
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
    };

    const getPlatformIcon = (platform) => {
        if (platform === 'Instagram') return '📸';
        if (platform === 'Facebook') return '📘';
        return '📱';
    };

    return (
        <div className="h-full flex flex-col animate-fade-in overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl shadow-lg">
                        <Briefcase size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Serviços</h1>
                        <p className="text-sm text-slate-500">Gerencie posts, campanhas e tráfego pago</p>
                    </div>
                </div>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <ServiceCard
                    icon={PenTool}
                    title="Posts"
                    description="Crie conteúdo para redes sociais"
                    color="text-blue-600"
                    gradient="from-blue-500 to-cyan-500"
                />
                <ServiceCard
                    icon={Megaphone}
                    title="Campanhas"
                    description="Gerenciar campanhas ativas"
                    color="text-purple-600"
                    gradient="from-purple-500 to-pink-500"
                />
                <ServiceCard
                    icon={Target}
                    title="Tráfego Pago"
                    description="Google & Meta Ads Dashboard"
                    color="text-green-600"
                    gradient="from-green-500 to-emerald-500"
                />
                <ServiceCard
                    icon={BarChart3}
                    title="Relatórios"
                    description="Performance das campanhas"
                    color="text-amber-600"
                    gradient="from-amber-500 to-orange-500"
                />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Posts Recentes */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-slate-600" />
                            <h2 className="text-lg font-bold text-slate-800">Posts Recentes</h2>
                        </div>
                        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all">
                            <Plus size={16} /> Criar Post
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentPosts.map((post) => (
                            <div
                                key={post.id}
                                className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-slate-200/50 hover:shadow-sm transition-all"
                            >
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                                    {getPlatformIcon(post.platform)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-800 truncate">{post.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>{post.platform}</span>
                                        {post.date !== '-' && (
                                            <>
                                                <span>•</span>
                                                <span>{post.date}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {post.views > 0 && (
                                        <span className="text-sm text-slate-500 flex items-center gap-1">
                                            <Eye size={14} /> {post.views.toLocaleString()}
                                        </span>
                                    )}
                                    {getStatusBadge(post.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Atividade Recente */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock size={20} className="text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-800">Atividade Recente</h2>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ${activity.color}`}>
                                    {activity.icon === 'send' && <Send size={14} />}
                                    {activity.icon === 'eye' && <Eye size={14} />}
                                    {activity.icon === 'user' && <Users size={14} />}
                                    {activity.icon === 'calendar' && <Calendar size={14} />}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-700">{activity.action}</p>
                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tráfego Pago Dashboard */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Target size={20} className="text-slate-600" />
                        <h2 className="text-lg font-bold text-slate-800">Tráfego Pago - Resumo</h2>
                    </div>
                    <button className="text-sm text-crm-600 hover:text-crm-700 font-semibold flex items-center gap-1">
                        Ver detalhes <ExternalLink size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Google Ads */}
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-xl">🔍</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Google Ads</h3>
                                <p className="text-xs text-slate-500">Últimos 30 dias</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-2xl font-bold text-slate-800">R$ {trafficData.google.spend.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Investimento</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{trafficData.google.clicks.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Cliques</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{trafficData.google.conversions}</p>
                                <p className="text-xs text-slate-500">Conversões</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-blue-200/50 flex items-center gap-4 text-sm">
                            <span className="text-slate-600">CTR: <strong className="text-slate-800">{trafficData.google.ctr}%</strong></span>
                            <span className="text-slate-600">Impressões: <strong className="text-slate-800">{(trafficData.google.impressions / 1000).toFixed(1)}k</strong></span>
                        </div>
                    </div>

                    {/* Meta Ads */}
                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-5 border border-indigo-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-xl">📘</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Meta Ads</h3>
                                <p className="text-xs text-slate-500">Últimos 30 dias</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-2xl font-bold text-slate-800">R$ {trafficData.meta.spend.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Investimento</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-indigo-600">{trafficData.meta.clicks.toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Cliques</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{trafficData.meta.conversions}</p>
                                <p className="text-xs text-slate-500">Conversões</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-indigo-200/50 flex items-center gap-4 text-sm">
                            <span className="text-slate-600">CTR: <strong className="text-slate-800">{trafficData.meta.ctr}%</strong></span>
                            <span className="text-slate-600">Impressões: <strong className="text-slate-800">{(trafficData.meta.impressions / 1000).toFixed(1)}k</strong></span>
                        </div>
                    </div>
                </div>

                {/* Total Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-crm-500/10 to-purple-500/10 rounded-xl border border-crm-200/50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Zap size={20} className="text-crm-600" />
                            <span className="font-semibold text-slate-700">Totais Combinados</span>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-800">R$ {(trafficData.google.spend + trafficData.meta.spend).toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Investimento Total</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-crm-600">{(trafficData.google.clicks + trafficData.meta.clicks).toLocaleString()}</p>
                                <p className="text-xs text-slate-500">Cliques Totais</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-600">{trafficData.google.conversions + trafficData.meta.conversions}</p>
                                <p className="text-xs text-slate-500">Conversões Totais</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-purple-600">R$ {Math.round((trafficData.google.spend + trafficData.meta.spend) / (trafficData.google.conversions + trafficData.meta.conversions))}</p>
                                <p className="text-xs text-slate-500">Custo/Conversão</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServicesPage;
