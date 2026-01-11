import React, { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight, Sparkles, Clock, Globe, Bot, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import planosBg from '../assets/planos.png';

const PricingPage = ({ onNavigateToBilling }) => {
    const { user, isAuthenticated, refreshUser } = useAuth();
    const [loading, setLoading] = useState(null);
    const [showImplantationModal, setShowImplantationModal] = useState(false);
    const [upgradedPlan, setUpgradedPlan] = useState('');

    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 129,
            icon: Star,
            color: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/25',
            features: [
                { text: '50 leads por mês', icon: Users },
                { text: 'Website profissional com manutenção', icon: Globe },
                { text: 'Agente autônomo captador de leads', icon: Bot },
                { text: 'Inbox WhatsApp (Evolution)', icon: Sparkles },
                { text: 'Dashboard de métricas', icon: null },
                { text: 'Suporte por email', icon: null }
            ],
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 259,
            icon: Zap,
            color: 'from-purple-500 to-pink-500',
            shadowColor: 'shadow-purple-500/25',
            features: [
                { text: '150 leads por mês', icon: Users },
                { text: 'Website + Landing Pages ilimitadas', icon: Globe },
                { text: 'Agente autônomo avançado', icon: Bot },
                { text: 'Inbox completo + automações', icon: Sparkles },
                { text: 'Até 3 usuários', icon: null },
                { text: 'Marketing (Campanhas)', icon: null },
                { text: 'Integrações (Canva, Meta Ads)', icon: null },
                { text: 'Relatórios avançados', icon: null },
                { text: 'Suporte prioritário', icon: null }
            ],
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 399,
            icon: Crown,
            color: 'from-amber-500 to-orange-500',
            shadowColor: 'shadow-amber-500/25',
            features: [
                { text: 'Leads ilimitados', icon: Users },
                { text: 'Websites + Apps ilimitados', icon: Globe },
                { text: 'Agente IA personalizado', icon: Bot },
                { text: 'Todas as automações', icon: Sparkles },
                { text: 'Usuários ilimitados', icon: null },
                { text: 'API completa', icon: null },
                { text: 'White-label disponível', icon: null },
                { text: 'Gerente de conta dedicado', icon: null },
                { text: 'SLA garantido 99.9%', icon: null },
                { text: 'Treinamento incluso', icon: null }
            ],
            popular: false
        }
    ];

    const handleSubscribe = async (planId) => {
        if (!isAuthenticated) {
            return;
        }

        setLoading(planId);

        try {
            const response = await api.post('/stripe/create-checkout-session', { plan: planId });

            if (response.data.demo) {
                // Modo demo - simula upgrade
                await api.post('/stripe/demo-upgrade', { plan: planId });
                await refreshUser();

                // Mostra modal de implantação
                setUpgradedPlan(planId);
                setShowImplantationModal(true);
            } else if (response.data.url) {
                // Redireciona para Stripe Checkout
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Erro ao iniciar checkout:', error);
        } finally {
            setLoading(null);
        }
    };

    const currentPlan = user?.subscription?.plan || 'free';

    const getPlanName = (id) => {
        const plan = plans.find(p => p.id === id);
        return plan?.name || id;
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${planosBg})` }}
            />

            {/* Gradient Overlay - Creates harmony */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-purple-900/90" />

            {/* Animated floating orbs for depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-purple-300 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Escolha seu plano
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                            Potencialize sua Corretora
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            Website, Agente Autônomo e CRM completo em um só lugar. Sem taxas ocultas.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => {
                            const Icon = plan.icon;
                            const isCurrentPlan = currentPlan === plan.id;

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative bg-white/10 backdrop-blur-xl rounded-3xl border p-8 transition-all duration-300 hover:scale-105 hover:bg-white/15 ${plan.popular
                                            ? 'border-purple-400/50 shadow-2xl shadow-purple-500/20'
                                            : 'border-white/20'
                                        }`}
                                >
                                    {/* Popular Badge */}
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <div className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-semibold shadow-lg shadow-purple-500/25">
                                                Mais Popular
                                            </div>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.color} ${plan.shadowColor} shadow-lg mb-6`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Name & Price */}
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                                        <span className="text-slate-300">/mês</span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className={`p-1 rounded-full bg-gradient-to-br ${plan.color} shrink-0`}>
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-slate-200 text-sm">
                                                    {feature.icon && <feature.icon className="inline w-4 h-4 mr-1.5 text-slate-400" />}
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={loading === plan.id || isCurrentPlan}
                                        className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isCurrentPlan
                                                ? 'bg-white/20 text-slate-400 cursor-not-allowed'
                                                : plan.popular
                                                    ? `bg-gradient-to-r ${plan.color} text-white ${plan.shadowColor} shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
                                                    : 'bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm'
                                            }`}
                                    >
                                        {loading === plan.id ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : isCurrentPlan ? (
                                            'Plano Atual'
                                        ) : (
                                            <>
                                                Assinar {plan.name}
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Garantia */}
                    <div className="mt-16 text-center">
                        <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-medium">Garantia de 7 dias</p>
                                <p className="text-slate-300 text-sm">Não ficou satisfeito? Devolvemos seu dinheiro.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Implantação */}
            {showImplantationModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 p-8 max-w-md w-full shadow-2xl animate-fade-in">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 animate-bounce">
                                <Check className="w-10 h-10 text-white" />
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Parabéns! 🎉
                            </h2>
                            <p className="text-lg text-slate-300 mb-6">
                                Você assinou o plano <span className="text-purple-400 font-semibold">{getPlanName(upgradedPlan)}</span>
                            </p>

                            {/* Implantation Notice */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Clock className="w-6 h-6 text-amber-500" />
                                    <h3 className="font-semibold text-amber-400">Implantação em Andamento</h3>
                                </div>
                                <p className="text-slate-300 text-sm text-left">
                                    Nossa equipe está configurando seu <strong>website</strong> e <strong>agente autônomo</strong>.
                                    O processo leva até <span className="text-amber-400 font-semibold">48 horas úteis</span>.
                                </p>
                                <p className="text-slate-400 text-sm mt-2 text-left">
                                    Você receberá um email quando tudo estiver pronto!
                                </p>
                            </div>

                            {/* Button */}
                            <button
                                onClick={() => {
                                    setShowImplantationModal(false);
                                    onNavigateToBilling?.();
                                }}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Entendido, obrigado!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingPage;
