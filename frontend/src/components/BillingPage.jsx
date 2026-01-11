import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle2, XCircle, Crown, Star, Zap, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const BillingPage = ({ onBack }) => {
    const { user, refreshUser } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const planDetails = {
        free: { name: 'Gratuito', icon: Star, color: 'from-slate-500 to-slate-600', price: 0 },
        basic: { name: 'Basic', icon: Star, color: 'from-blue-500 to-cyan-500', price: 49 },
        pro: { name: 'Pro', icon: Zap, color: 'from-purple-500 to-pink-500', price: 99 },
        enterprise: { name: 'Enterprise', icon: Crown, color: 'from-amber-500 to-orange-500', price: 199 }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const response = await api.get('/stripe/subscription');
            setSubscription(response.data);
        } catch (error) {
            console.error('Erro ao buscar assinatura:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setCanceling(true);
        try {
            await api.post('/stripe/cancel');
            await fetchSubscription();
            await refreshUser();
            setShowCancelConfirm(false);
        } catch (error) {
            console.error('Erro ao cancelar:', error);
        } finally {
            setCanceling(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const currentPlan = subscription?.plan || 'free';
    const planInfo = planDetails[currentPlan] || planDetails.free;
    const Icon = planInfo.icon;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Ativo
                    </span>
                );
            case 'canceled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Cancelado
                    </span>
                );
            case 'past_due':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Pagamento Pendente
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-500/10 text-slate-400 rounded-full text-sm font-medium">
                        Inativo
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Faturamento</h1>
                        <p className="text-slate-400">Gerencie sua assinatura e pagamentos</p>
                    </div>
                </div>

                {/* Current Plan Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${planInfo.color} shadow-lg`}>
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{planInfo.name}</h2>
                                <p className="text-slate-400">Seu plano atual</p>
                            </div>
                        </div>
                        {getStatusBadge(subscription?.status)}
                    </div>

                    {/* Plan Details */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="p-4 bg-slate-700/30 rounded-2xl">
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                <CreditCard className="w-4 h-4" />
                                Valor mensal
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {planInfo.price > 0 ? `R$ ${planInfo.price}` : 'Grátis'}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-700/30 rounded-2xl">
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                <Calendar className="w-4 h-4" />
                                Início do período
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {formatDate(subscription?.currentPeriodStart)}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-700/30 rounded-2xl">
                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                <RefreshCw className="w-4 h-4" />
                                Próxima renovação
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {formatDate(subscription?.currentPeriodEnd)}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4">
                        {currentPlan !== 'free' && subscription?.status === 'active' && (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="px-6 py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
                            >
                                Cancelar assinatura
                            </button>
                        )}

                        {currentPlan !== 'enterprise' && (
                            <button
                                onClick={onBack}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                {currentPlan === 'free' ? 'Escolher um plano' : 'Fazer upgrade'}
                            </button>
                        )}
                    </div>
                </div>

                {/* User Info */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Informações da Conta</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between py-3 border-b border-slate-700/50">
                            <span className="text-slate-400">Nome</span>
                            <span className="text-white font-medium">{user?.name}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-700/50">
                            <span className="text-slate-400">Email</span>
                            <span className="text-white font-medium">{user?.email}</span>
                        </div>
                        <div className="flex justify-between py-3">
                            <span className="text-slate-400">Membro desde</span>
                            <span className="text-white font-medium">{formatDate(user?.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 max-w-md w-full">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Cancelar assinatura?</h3>
                                <p className="text-slate-400">
                                    Você perderá acesso aos recursos premium ao final do período atual.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 py-3 border border-slate-600 text-white rounded-xl hover:bg-slate-700/50 transition-colors"
                                >
                                    Manter plano
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={canceling}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center"
                                >
                                    {canceling ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Sim, cancelar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingPage;
