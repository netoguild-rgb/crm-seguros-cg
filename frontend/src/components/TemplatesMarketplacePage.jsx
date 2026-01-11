import React, { useState } from 'react';
import {
    Palette,
    ArrowLeft,
    Search,
    Filter,
    Star,
    Download,
    Lock,
    Crown,
    Zap,
    Check,
    Eye,
    ShoppingCart,
    Sparkles,
    Gift,
    Package,
    ArrowRight,
    Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Mock templates data
const templatesData = {
    'auto': {
        name: 'Seguro Auto',
        icon: '🚗',
        color: 'from-blue-500 to-cyan-500',
        description: 'Templates para campanhas de seguro automotivo',
        templates: [
            { id: 1, name: 'Proteção Total', preview: 'linear-gradient(135deg, #0ea5e9, #2563eb)', isFree: true, downloads: 1240, rating: 4.8 },
            { id: 2, name: 'Promoção Black Friday', preview: 'linear-gradient(135deg, #1a1a2e, #16213e)', isFree: false, price: 29.90, downloads: 890, rating: 4.9 },
            { id: 3, name: 'Renovação Fácil', preview: 'linear-gradient(135deg, #059669, #10b981)', isFree: false, price: 19.90, downloads: 654, rating: 4.7 },
            { id: 4, name: 'Carro Novo', preview: 'linear-gradient(135deg, #7c3aed, #a855f7)', isFree: false, price: 24.90, downloads: 432, rating: 4.6 },
            { id: 5, name: 'Seguro Premium', preview: 'linear-gradient(135deg, #f59e0b, #d97706)', isFree: false, price: 34.90, downloads: 321, rating: 4.9 },
            { id: 6, name: 'Família Protegida', preview: 'linear-gradient(135deg, #ec4899, #db2777)', isFree: false, price: 29.90, downloads: 567, rating: 4.8 },
        ]
    },
    'vida': {
        name: 'Seguro Vida',
        icon: '❤️',
        color: 'from-red-500 to-pink-500',
        description: 'Templates para campanhas de seguro de vida',
        templates: [
            { id: 7, name: 'Proteção Familiar', preview: 'linear-gradient(135deg, #ef4444, #dc2626)', isFree: true, downloads: 980, rating: 4.7 },
            { id: 8, name: 'Futuro Seguro', preview: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', isFree: false, price: 24.90, downloads: 654, rating: 4.8 },
            { id: 9, name: 'Tranquilidade Total', preview: 'linear-gradient(135deg, #06b6d4, #0891b2)', isFree: false, price: 29.90, downloads: 432, rating: 4.6 },
            { id: 10, name: 'Herança Protegida', preview: 'linear-gradient(135deg, #f97316, #ea580c)', isFree: false, price: 34.90, downloads: 321, rating: 4.9 },
        ]
    },
    'residencial': {
        name: 'Seguro Residencial',
        icon: '🏠',
        color: 'from-emerald-500 to-green-500',
        description: 'Templates para campanhas de seguro residencial',
        templates: [
            { id: 11, name: 'Lar Seguro', preview: 'linear-gradient(135deg, #10b981, #059669)', isFree: true, downloads: 876, rating: 4.8 },
            { id: 12, name: 'Proteção 24h', preview: 'linear-gradient(135deg, #3b82f6, #2563eb)', isFree: false, price: 19.90, downloads: 543, rating: 4.7 },
            { id: 13, name: 'Casa Nova', preview: 'linear-gradient(135deg, #f59e0b, #d97706)', isFree: false, price: 24.90, downloads: 432, rating: 4.6 },
        ]
    },
    'saude': {
        name: 'Plano de Saúde',
        icon: '💊',
        color: 'from-purple-500 to-indigo-500',
        description: 'Templates para campanhas de planos de saúde',
        templates: [
            { id: 14, name: 'Saúde em Dia', preview: 'linear-gradient(135deg, #8b5cf6, #6366f1)', isFree: true, downloads: 1120, rating: 4.9 },
            { id: 15, name: 'Família Saudável', preview: 'linear-gradient(135deg, #ec4899, #db2777)', isFree: false, price: 29.90, downloads: 765, rating: 4.8 },
            { id: 16, name: 'Check-up Grátis', preview: 'linear-gradient(135deg, #14b8a6, #0d9488)', isFree: false, price: 24.90, downloads: 543, rating: 4.7 },
        ]
    },
    'social': {
        name: 'Redes Sociais',
        icon: '📱',
        color: 'from-pink-500 to-rose-500',
        description: 'Templates para Stories e Posts em redes sociais',
        templates: [
            { id: 17, name: 'Story Promo', preview: 'linear-gradient(135deg, #ec4899, #f43f5e)', isFree: true, downloads: 2340, rating: 4.9 },
            { id: 18, name: 'Post Carrossel', preview: 'linear-gradient(135deg, #8b5cf6, #a855f7)', isFree: false, price: 19.90, downloads: 1890, rating: 4.8 },
            { id: 19, name: 'Reels Template', preview: 'linear-gradient(135deg, #06b6d4, #0ea5e9)', isFree: false, price: 34.90, downloads: 1234, rating: 4.9 },
            { id: 20, name: 'Feed Harmonico', preview: 'linear-gradient(135deg, #f59e0b, #f97316)', isFree: false, price: 49.90, downloads: 876, rating: 4.7 },
        ]
    },
    'especial': {
        name: 'Datas Comemorativas',
        icon: '🎉',
        color: 'from-amber-500 to-orange-500',
        description: 'Templates para datas especiais e comemorativas',
        templates: [
            { id: 21, name: 'Natal Seguro', preview: 'linear-gradient(135deg, #dc2626, #16a34a)', isFree: true, downloads: 3210, rating: 4.9 },
            { id: 22, name: 'Ano Novo', preview: 'linear-gradient(135deg, #f59e0b, #facc15)', isFree: false, price: 19.90, downloads: 2890, rating: 4.8 },
            { id: 23, name: 'Dia das Mães', preview: 'linear-gradient(135deg, #ec4899, #f472b6)', isFree: false, price: 24.90, downloads: 1654, rating: 4.7 },
            { id: 24, name: 'Black Friday', preview: 'linear-gradient(135deg, #1f2937, #111827)', isFree: false, price: 29.90, downloads: 4320, rating: 4.9 },
        ]
    }
};

// Pacotes por plano
const planPackages = [
    {
        id: 'basic-pack',
        name: 'Pacote Starter',
        plan: 'basic',
        planName: 'Basic',
        price: 79.90,
        originalPrice: 149.90,
        templates: 10,
        description: '10 templates premium para começar',
        color: 'from-blue-500 to-cyan-500',
        features: ['10 Templates Premium', 'Uso ilimitado', 'Arquivos editáveis', 'Suporte por email']
    },
    {
        id: 'pro-pack',
        name: 'Pacote Pro',
        plan: 'pro',
        planName: 'Pro',
        price: 149.90,
        originalPrice: 299.90,
        templates: 30,
        description: '30 templates + acesso a novos lançamentos',
        color: 'from-purple-500 to-pink-500',
        features: ['30 Templates Premium', 'Novos templates mensais', 'Arquivos fonte', 'Suporte prioritário'],
        popular: true
    },
    {
        id: 'enterprise-pack',
        name: 'Pacote Ilimitado',
        plan: 'enterprise',
        planName: 'Enterprise',
        price: 249.90,
        originalPrice: 499.90,
        templates: 'Todos',
        description: 'Acesso a todos os templates + exclusivos',
        color: 'from-amber-500 to-orange-500',
        features: ['Todos os Templates', 'Templates exclusivos', 'White-label', 'Suporte dedicado']
    }
];

function TemplatesMarketplacePage({ onBack, initialCategory = null }) {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, free, paid
    const [previewTemplate, setPreviewTemplate] = useState(null);

    const userPlan = user?.subscription?.plan || 'free';
    const hasPaidPlan = ['basic', 'pro', 'enterprise'].includes(userPlan);

    // Categoria selecionada
    const categoryData = selectedCategory ? templatesData[selectedCategory] : null;

    // Filtrar templates
    const filteredTemplates = categoryData?.templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'free' && t.isFree) || (filter === 'paid' && !t.isFree);
        return matchesSearch && matchesFilter;
    }) || [];

    // Se não há categoria selecionada, mostra o menu de categorias
    if (!selectedCategory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Voltar ao Marketing
                    </button>

                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-6">
                            <Palette className="w-4 h-4" />
                            Marketplace de Templates
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Templates Profissionais
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Escolha entre centenas de templates prontos para suas campanhas de marketing
                        </p>
                    </div>
                </div>

                {/* Categorias Grid */}
                <div className="max-w-5xl mx-auto mb-16">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Categorias
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(templatesData).map(([key, cat]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`bg-gradient-to-br ${cat.color} p-6 rounded-2xl text-left transition-all hover:scale-105 hover:shadow-xl group`}
                            >
                                <span className="text-4xl mb-3 block">{cat.icon}</span>
                                <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                                <p className="text-white/70 text-sm mb-3">{cat.templates.length} templates</p>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                                        {cat.templates.filter(t => t.isFree).length} grátis
                                    </span>
                                    <ArrowRight size={16} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pacotes por Plano */}
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                            <Package className="w-6 h-6 text-amber-400" />
                            Pacotes Especiais
                        </h2>
                        <p className="text-slate-400">Economize até 50% com nossos pacotes por plano</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {planPackages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`relative bg-slate-800/50 backdrop-blur-xl rounded-2xl border p-6 transition-all hover:scale-105 ${pkg.popular ? 'border-purple-500/50 shadow-xl shadow-purple-500/10' : 'border-slate-700/50'
                                    }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold">
                                            Mais Vendido
                                        </span>
                                    </div>
                                )}

                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${pkg.color} mb-4`}>
                                    <Gift className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                                <p className="text-slate-400 text-sm mb-4">{pkg.description}</p>

                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-bold text-white">R$ {pkg.price.toFixed(2)}</span>
                                    <span className="text-slate-500 line-through text-sm">R$ {pkg.originalPrice.toFixed(2)}</span>
                                </div>

                                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4">
                                    <span className="text-green-400 text-sm font-semibold">
                                        Economia de {Math.round((1 - pkg.price / pkg.originalPrice) * 100)}%
                                    </span>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                                            <Check className="w-4 h-4 text-green-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center gap-2 mb-4 text-xs text-slate-400">
                                    <Crown className="w-4 h-4" />
                                    Requer plano {pkg.planName} ou superior
                                </div>

                                <button
                                    className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${userPlan === pkg.plan || (userPlan === 'enterprise') || (userPlan === 'pro' && pkg.plan === 'basic')
                                            ? `bg-gradient-to-r ${pkg.color} text-white shadow-lg hover:shadow-xl`
                                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        }`}
                                    disabled={!(userPlan === pkg.plan || userPlan === 'enterprise' || (userPlan === 'pro' && pkg.plan === 'basic'))}
                                >
                                    <ShoppingCart size={18} />
                                    {userPlan === 'free' ? 'Upgrade Necessário' : 'Adquirir Pacote'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {userPlan === 'free' && (
                        <div className="mt-8 text-center">
                            <p className="text-slate-400 mb-4">Faça upgrade do seu plano para acessar pacotes com desconto</p>
                            <button
                                onClick={onBack}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                            >
                                Ver Planos
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Mostra os templates da categoria selecionada
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Voltar às Categorias
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`bg-gradient-to-br ${categoryData.color} p-4 rounded-2xl`}>
                            <span className="text-4xl">{categoryData.icon}</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{categoryData.name}</h1>
                            <p className="text-slate-400">{categoryData.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar template..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 w-64"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex bg-slate-800 rounded-xl p-1">
                            {['all', 'free', 'paid'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                            ? 'bg-purple-500 text-white'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {f === 'all' ? 'Todos' : f === 'free' ? 'Grátis' : 'Premium'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="group cursor-pointer"
                            onClick={() => setPreviewTemplate(template)}
                        >
                            <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-3">
                                <div
                                    className="absolute inset-0 transition-transform duration-300 group-hover:scale-110"
                                    style={{ background: template.preview }}
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button className="px-4 py-2 bg-white text-slate-900 rounded-xl font-semibold flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform">
                                        <Eye size={18} />
                                        Preview
                                    </button>
                                </div>

                                {/* Badge */}
                                {template.isFree ? (
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                                        <Gift size={12} />
                                        GRÁTIS
                                    </div>
                                ) : (
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                                        <Crown size={12} />
                                        PREMIUM
                                    </div>
                                )}

                                {/* Like button */}
                                <button className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100">
                                    <Heart size={16} />
                                </button>
                            </div>

                            <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    <span>{template.rating}</span>
                                    <span>•</span>
                                    <Download size={14} />
                                    <span>{template.downloads}</span>
                                </div>
                                {!template.isFree && (
                                    <span className="text-purple-400 font-bold">R$ {template.price.toFixed(2)}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-slate-400 text-lg">Nenhum template encontrado</p>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPreviewTemplate(null)}>
                    <div className="bg-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Preview Image */}
                        <div
                            className="h-64 relative"
                            style={{ background: previewTemplate.preview }}
                        >
                            {previewTemplate.isFree ? (
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-lg flex items-center gap-1">
                                    <Gift size={14} />
                                    GRÁTIS
                                </div>
                            ) : (
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-500 text-white text-sm font-bold rounded-lg flex items-center gap-1">
                                    <Crown size={14} />
                                    PREMIUM
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-2">{previewTemplate.name}</h2>

                            <div className="flex items-center gap-4 text-slate-400 mb-6">
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-amber-400 fill-amber-400" />
                                    <span>{previewTemplate.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Download size={16} />
                                    <span>{previewTemplate.downloads} downloads</span>
                                </div>
                            </div>

                            {previewTemplate.isFree ? (
                                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                                    <p className="text-green-400 font-semibold">Template gratuito! Baixe agora mesmo.</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 mb-6">
                                    <div>
                                        <p className="text-slate-400 text-sm">Preço</p>
                                        <p className="text-2xl font-bold text-white">R$ {previewTemplate.price.toFixed(2)}</p>
                                    </div>
                                    {!hasPaidPlan && (
                                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                                            <Lock size={16} />
                                            Requer plano pago
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPreviewTemplate(null)}
                                    className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${previewTemplate.isFree || hasPaidPlan
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        }`}
                                    disabled={!previewTemplate.isFree && !hasPaidPlan}
                                >
                                    {previewTemplate.isFree ? (
                                        <>
                                            <Download size={18} />
                                            Baixar Grátis
                                        </>
                                    ) : hasPaidPlan ? (
                                        <>
                                            <ShoppingCart size={18} />
                                            Comprar
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            Fazer Upgrade
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TemplatesMarketplacePage;
