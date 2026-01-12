import React, { useState } from 'react';
import {
    Briefcase,
    Globe,
    Bot,
    Megaphone,
    Target,
    BarChart3,
    TrendingUp,
    Users,
    Code,
    Palette,
    Smartphone,
    Mail,
    Video,
    Camera,
    FileText,
    Headphones,
    Star,
    Check,
    ArrowRight,
    Crown,
    Zap,
    Gift,
    ShoppingCart,
    Clock,
    Shield,
    Sparkles,
    Package,
    ChevronRight,
    X,
    Play,
    MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Categorias de Serviços
const serviceCategories = [
    { id: 'websites', name: 'Websites', icon: Globe, color: 'from-blue-500 to-cyan-500', description: 'Criação de sites profissionais' },
    { id: 'automacao', name: 'Automação', icon: Bot, color: 'from-purple-500 to-pink-500', description: 'Chatbots e fluxos automáticos' },
    { id: 'marketing', name: 'Marketing', icon: Megaphone, color: 'from-amber-500 to-orange-500', description: 'Campanhas e gestão de tráfego' },
    { id: 'design', name: 'Design', icon: Palette, color: 'from-pink-500 to-rose-500', description: 'Identidade visual e criativos' },
    { id: 'desenvolvimento', name: 'Desenvolvimento', icon: Code, color: 'from-emerald-500 to-green-500', description: 'Apps e sistemas personalizados' },
    { id: 'consultoria', name: 'Consultoria', icon: Headphones, color: 'from-indigo-500 to-violet-500', description: 'Suporte especializado' },
];

// Serviços disponíveis
const servicesData = {
    websites: [
        { id: 1, name: 'Landing Page Simples', description: 'Página de captura de leads otimizada', price: 0, isFree: true, deliveryDays: 3, rating: 4.9, sales: 234, features: ['1 página', 'Design responsivo', 'Formulário de contato', 'SEO básico'] },
        { id: 2, name: 'Site Institucional', description: 'Website profissional para sua corretora', price: 997, isFree: false, deliveryDays: 7, rating: 4.8, sales: 156, features: ['Até 5 páginas', 'Design premium', 'Blog integrado', 'SEO completo', 'Analytics'] },
        { id: 3, name: 'E-commerce de Seguros', description: 'Loja online para venda de seguros', price: 2497, isFree: false, deliveryDays: 15, rating: 4.9, sales: 89, features: ['Catálogo de produtos', 'Cotação online', 'Integração pagamentos', 'Área do cliente', 'Painel admin'] },
        { id: 4, name: 'Portal do Cliente', description: 'Área exclusiva para seus segurados', price: 1997, isFree: false, deliveryDays: 10, rating: 4.7, sales: 67, features: ['Login seguro', 'Visualizar apólices', 'Abrir sinistros', 'Chat suporte', 'Documentos'] },
    ],
    automacao: [
        { id: 5, name: 'Chatbot WhatsApp Básico', description: 'Atendimento automático 24h', price: 0, isFree: true, deliveryDays: 2, rating: 4.8, sales: 345, features: ['Respostas automáticas', 'FAQ integrado', 'Encaminhamento', 'Relatórios'] },
        { id: 6, name: 'Agente IA Captador', description: 'Prospecção ativa de leads via WhatsApp', price: 497, isFree: false, deliveryDays: 5, rating: 4.9, sales: 198, features: ['IA conversacional', 'Qualificação automática', 'Agendamento', 'CRM integrado'] },
        { id: 7, name: 'Fluxo de Nutrição', description: 'Sequências automatizadas por email/WhatsApp', price: 397, isFree: false, deliveryDays: 4, rating: 4.7, sales: 123, features: ['Disparo agendado', 'Segmentação', 'Templates prontos', 'Métricas'] },
        { id: 8, name: 'Automação Completa', description: 'Sistema full de automação personalizado', price: 1497, isFree: false, deliveryDays: 10, rating: 4.9, sales: 56, features: ['Chatbot avançado', 'Email marketing', 'SMS/WhatsApp', 'Integrações API', 'Suporte dedicado'] },
    ],
    marketing: [
        { id: 9, name: 'Pack Redes Sociais', description: '10 artes para suas redes', price: 0, isFree: true, deliveryDays: 3, rating: 4.6, sales: 567, features: ['10 artes', 'Feed + Stories', 'Legendas', 'Hashtags'] },
        { id: 10, name: 'Gestão Meta Ads', description: 'Campanhas Facebook e Instagram', price: 997, isFree: false, deliveryDays: 'Mensal', rating: 4.8, sales: 234, features: ['Configuração', 'Criativos', 'Otimização diária', 'Relatório semanal'] },
        { id: 11, name: 'Gestão Google Ads', description: 'Campanhas de busca e display', price: 1297, isFree: false, deliveryDays: 'Mensal', rating: 4.9, sales: 187, features: ['Pesquisa de keywords', 'Anúncios otimizados', 'Remarketing', 'Relatórios'] },
        { id: 12, name: 'Pack Completo Tráfego', description: 'Google + Meta + Relatórios', price: 1997, isFree: false, deliveryDays: 'Mensal', rating: 4.9, sales: 98, features: ['Google Ads', 'Meta Ads', 'Landing pages', 'Otimização CRO', 'Dashboard em tempo real'] },
    ],
    design: [
        { id: 13, name: 'Logo Simples', description: 'Logotipo para sua corretora', price: 0, isFree: true, deliveryDays: 5, rating: 4.5, sales: 432, features: ['3 propostas', '2 revisões', 'Arquivos PNG/SVG'] },
        { id: 14, name: 'Identidade Visual Completa', description: 'Marca profissional completa', price: 1497, isFree: false, deliveryDays: 10, rating: 4.9, sales: 167, features: ['Logo', 'Manual de marca', 'Papelaria', 'Templates sociais', 'Apresentação'] },
        { id: 15, name: 'Pack Criativos Mensal', description: '30 artes para redes sociais', price: 497, isFree: false, deliveryDays: 'Mensal', rating: 4.8, sales: 289, features: ['30 artes/mês', 'Stories + Feed', 'Carrosséis', 'Revisões ilimitadas'] },
        { id: 16, name: 'Vídeo Motion Graphics', description: 'Vídeo animado para sua marca', price: 797, isFree: false, deliveryDays: 7, rating: 4.7, sales: 112, features: ['Até 60s', 'Motion graphics', 'Trilha sonora', 'Revisões'] },
    ],
    desenvolvimento: [
        { id: 17, name: 'Integração API', description: 'Conecte sistemas externos', price: 497, isFree: false, deliveryDays: 5, rating: 4.8, sales: 145, features: ['Análise técnica', 'Desenvolvimento', 'Testes', 'Documentação'] },
        { id: 18, name: 'App Mobile', description: 'Aplicativo para iOS e Android', price: 4997, isFree: false, deliveryDays: 30, rating: 4.9, sales: 34, features: ['Design UX/UI', 'React Native', 'Publicação lojas', 'Manutenção 30 dias'] },
        { id: 19, name: 'Sistema Personalizado', description: 'Software sob medida', price: 9997, isFree: false, deliveryDays: 60, rating: 4.9, sales: 12, features: ['Análise completa', 'Desenvolvimento', 'Testes', 'Treinamento', 'Suporte 90 dias'] },
    ],
    consultoria: [
        { id: 20, name: 'Análise Gratuita', description: 'Diagnóstico inicial do negócio', price: 0, isFree: true, deliveryDays: 1, rating: 4.9, sales: 789, features: ['1 reunião 30min', 'Diagnóstico', 'Recomendações', 'Follow-up email'] },
        { id: 21, name: 'Mentoria Individual', description: 'Acompanhamento personalizado', price: 997, isFree: false, deliveryDays: 'Mensal', rating: 4.9, sales: 156, features: ['4 reuniões/mês', 'Estratégia', 'Suporte WhatsApp', 'Material exclusivo'] },
        { id: 22, name: 'Consultoria Estratégica', description: 'Planejamento completo', price: 2497, isFree: false, deliveryDays: 15, rating: 4.8, sales: 67, features: ['Análise profunda', 'Plano de ação', 'Implementação', 'KPIs', 'Relatórios'] },
    ],
};

// Pacotes especiais
const specialPackages = [
    {
        id: 'starter',
        name: 'Pack Corretor Iniciante',
        description: 'Tudo para começar sua presença digital',
        price: 1497,
        originalPrice: 2997,
        color: 'from-blue-500 to-cyan-500',
        includes: ['Landing Page', 'Chatbot Básico', 'Pack Redes Sociais', 'Logo Simples'],
        plan: 'basic'
    },
    {
        id: 'growth',
        name: 'Pack Crescimento',
        description: 'Escale sua corretora com marketing digital',
        price: 3497,
        originalPrice: 5997,
        color: 'from-purple-500 to-pink-500',
        includes: ['Site Institucional', 'Agente IA Captador', 'Gestão Meta Ads (1 mês)', 'Identidade Visual'],
        plan: 'pro',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Pack Líder de Mercado',
        description: 'Solução completa para corretoras de sucesso',
        price: 7997,
        originalPrice: 14997,
        color: 'from-amber-500 to-orange-500',
        includes: ['E-commerce de Seguros', 'Automação Completa', 'Pack Completo Tráfego (3 meses)', 'App Mobile', 'Consultoria Estratégica'],
        plan: 'enterprise'
    }
];

function ServicesPage() {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [filter, setFilter] = useState('all');

    const userPlan = user?.subscription?.plan || 'free';

    const filteredServices = selectedCategory
        ? servicesData[selectedCategory]?.filter(s => {
            if (filter === 'free') return s.isFree;
            if (filter === 'paid') return !s.isFree;
            return true;
        }) || []
        : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 animate-fade-in">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6">
                        <Briefcase className="w-4 h-4" />
                        Marketplace de Serviços
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Serviços para sua Corretora
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Websites, automação, marketing e muito mais. Acelere seu crescimento com nossos serviços profissionais.
                    </p>
                </div>

                {/* Categorias Grid */}
                {!selectedCategory && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                            {serviceCategories.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`bg-gradient-to-br ${cat.color} p-5 rounded-2xl text-left transition-all hover:scale-105 hover:shadow-xl group`}
                                    >
                                        <Icon className="w-8 h-8 text-white mb-3" />
                                        <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                                        <p className="text-white/70 text-xs">{cat.description}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pacotes Especiais */}
                        <div className="mb-12">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                    <Package className="w-6 h-6 text-amber-400" />
                                    Pacotes Especiais
                                </h2>
                                <p className="text-slate-400">Economize até 50% com nossos combos exclusivos</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {specialPackages.map((pkg) => (
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
                                            <span className="text-3xl font-bold text-white">R$ {pkg.price.toLocaleString()}</span>
                                            <span className="text-slate-500 line-through text-sm">R$ {pkg.originalPrice.toLocaleString()}</span>
                                        </div>

                                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4">
                                            <span className="text-green-400 text-sm font-semibold">
                                                Economia de {Math.round((1 - pkg.price / pkg.originalPrice) * 100)}%
                                            </span>
                                        </div>

                                        <ul className="space-y-2 mb-6">
                                            {pkg.includes.map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                                                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${pkg.color} text-white shadow-lg hover:shadow-xl`}
                                        >
                                            <ShoppingCart size={18} />
                                            Contratar Pacote
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Serviços em Destaque */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                Serviços Gratuitos para Começar
                            </h2>
                            <div className="grid md:grid-cols-4 gap-4">
                                {Object.values(servicesData).flat().filter(s => s.isFree).slice(0, 4).map((service) => (
                                    <div
                                        key={service.id}
                                        onClick={() => setSelectedService(service)}
                                        className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50 hover:border-green-500/50 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg flex items-center gap-1">
                                                <Gift size={12} />
                                                GRÁTIS
                                            </span>
                                            <div className="flex items-center gap-1 text-amber-400 text-sm">
                                                <Star size={14} className="fill-amber-400" />
                                                {service.rating}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{service.name}</h3>
                                        <p className="text-slate-400 text-sm mb-3">{service.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock size={12} />
                                            {service.deliveryDays} {typeof service.deliveryDays === 'number' ? 'dias' : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Lista de serviços da categoria */}
                {selectedCategory && (
                    <>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowRight className="rotate-180" size={20} />
                            Voltar às Categorias
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                {(() => {
                                    const cat = serviceCategories.find(c => c.id === selectedCategory);
                                    const Icon = cat?.icon || Briefcase;
                                    return (
                                        <>
                                            <div className={`bg-gradient-to-br ${cat?.color} p-4 rounded-2xl`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold text-white">{cat?.name}</h2>
                                                <p className="text-slate-400">{cat?.description}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="flex bg-slate-800 rounded-xl p-1">
                                {['all', 'free', 'paid'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                                ? 'bg-amber-500 text-white'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {f === 'all' ? 'Todos' : f === 'free' ? 'Grátis' : 'Premium'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredServices.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/50 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        {service.isFree ? (
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-lg flex items-center gap-1">
                                                <Gift size={14} />
                                                GRÁTIS
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-bold rounded-lg flex items-center gap-1">
                                                <Crown size={14} />
                                                PREMIUM
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1 text-amber-400 text-sm">
                                            <Star size={14} className="fill-amber-400" />
                                            {service.rating} ({service.sales})
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{service.name}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{service.description}</p>

                                    <ul className="space-y-2 mb-4">
                                        {service.features.slice(0, 3).map((f, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                                                <Check className="w-4 h-4 text-green-400 shrink-0" />
                                                {f}
                                            </li>
                                        ))}
                                        {service.features.length > 3 && (
                                            <li className="text-slate-500 text-sm">+{service.features.length - 3} mais...</li>
                                        )}
                                    </ul>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Clock size={14} />
                                            {service.deliveryDays} {typeof service.deliveryDays === 'number' ? 'dias' : ''}
                                        </div>
                                        {!service.isFree && (
                                            <span className="text-2xl font-bold text-white">R$ {service.price.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal de Detalhes do Serviço */}
            {selectedService && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedService(null)}>
                    <div className="bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                {selectedService.isFree ? (
                                    <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-bold rounded-lg flex items-center gap-1">
                                        <Gift size={14} />
                                        GRÁTIS
                                    </span>
                                ) : (
                                    <span className="px-3 py-1.5 bg-amber-500 text-white text-sm font-bold rounded-lg flex items-center gap-1">
                                        <Crown size={14} />
                                        PREMIUM
                                    </span>
                                )}
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{selectedService.name}</h2>
                            <p className="text-slate-400">{selectedService.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-700">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                                    <Star size={16} className="fill-amber-400" />
                                    <span className="text-xl font-bold">{selectedService.rating}</span>
                                </div>
                                <p className="text-slate-500 text-sm">Avaliação</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-white mb-1">{selectedService.sales}</p>
                                <p className="text-slate-500 text-sm">Vendas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-white mb-1">{selectedService.deliveryDays}</p>
                                <p className="text-slate-500 text-sm">{typeof selectedService.deliveryDays === 'number' ? 'Dias' : ''}</p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="p-6">
                            <h3 className="font-semibold text-white mb-4">O que está incluso:</h3>
                            <ul className="space-y-3 mb-6">
                                {selectedService.features.map((f, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-300">
                                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-green-400" />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* Price */}
                            {!selectedService.isFree && (
                                <div className="bg-slate-700/50 rounded-xl p-4 mb-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">Investimento</p>
                                        <p className="text-3xl font-bold text-white">R$ {selectedService.price.toLocaleString()}</p>
                                    </div>
                                    <div className="text-slate-400 text-sm flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Garantia 7 dias
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                                >
                                    {selectedService.isFree ? (
                                        <>
                                            <MessageCircle size={18} />
                                            Solicitar Grátis
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} />
                                            Contratar Agora
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

export default ServicesPage;
