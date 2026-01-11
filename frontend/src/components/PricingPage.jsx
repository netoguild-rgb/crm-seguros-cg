import React, { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const PricingPage = ({ onNavigateToBilling }) => {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(null);

    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 49,
            icon: Star,
            color: 'from-blue-500 to-cyan-500',
            shadowColor: 'shadow-blue-500/25',
            features: [
                '100 leads por mês',
                '1 usuário',
                'Inbox básico (WhatsApp)',
                'Dashboard de métricas',
                'Suporte por email'
            ],
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 99,
            icon: Zap,
            color: 'from-purple-500 to-pink-500',
            shadowColor: 'shadow-purple-500/25',
            features: [
                '500 leads por mês',
                'Até 3 usuários',
                'Inbox completo',
                'Marketing (Campanhas)',
                'Integrações (Canva, Meta)',
                'Relatórios avançados',
                'Suporte prioritário'
            ],
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 199,
            icon: Crown,
            color: 'from-amber-500 to-orange-500',
            shadowColor: 'shadow-amber-500/25',
            features: [
                'Leads ilimitados',
                'Usuários ilimitados',
                'Todas as funcionalidades',
                'API completa',
                'White-label disponível',
                'Gerente de conta dedicado',
                'SLA garantido',
                'Treinamento incluso'
            ],
            popular: false
        }
    ];

    const handleSubscribe = async (planId) => {
        if (!isAuthenticated) {
            // Redireciona para login
            return;
        }

        setLoading(planId);

        try {
            const response = await api.post('/stripe/create-checkout-session', { plan: planId });

            if (response.data.demo) {
                // Modo demo - simula upgrade
                await api.post('/stripe/demo-upgrade', { plan: planId });
                onNavigateToBilling?.();
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        Escolha seu plano
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Preços simples e transparentes
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Escolha o plano ideal para o tamanho da sua corretora. Sem taxas ocultas.
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
                                className={`relative bg-slate-800/50 backdrop-blur-xl rounded-3xl border p-8 transition-all duration-300 hover:scale-105 ${plan.popular
                                        ? 'border-purple-500/50 shadow-2xl shadow-purple-500/10'
                                        : 'border-slate-700/50'
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
                                    <span className="text-slate-400">/mês</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className={`p-1 rounded-full bg-gradient-to-br ${plan.color}`}>
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-slate-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loading === plan.id || isCurrentPlan}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isCurrentPlan
                                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                            : plan.popular
                                                ? `bg-gradient-to-r ${plan.color} text-white ${plan.shadowColor} shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
                                                : 'border border-slate-600 text-white hover:bg-slate-700/50'
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

                {/* FAQ / Garantia */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-white font-medium">Garantia de 7 dias</p>
                            <p className="text-slate-400 text-sm">Não ficou satisfeito? Devolvemos seu dinheiro.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
