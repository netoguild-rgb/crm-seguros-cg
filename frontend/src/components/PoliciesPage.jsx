import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    X,
    Check,
    AlertTriangle,
    Clock,
    DollarSign,
    Shield,
    Car,
    Home,
    Heart,
    Building,
    Users,
    Calendar,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    Download,
    Lock,
    Crown,
    ArrowRight,
    Sparkles,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPolicies, getPoliciesStats, createPolicy, updatePolicy, deletePolicy } from '../services/api';

// Tipos de seguro com ícones
const policyTypes = {
    'Auto': { icon: Car, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-500' },
    'Vida': { icon: Heart, color: 'from-red-500 to-pink-500', bgColor: 'bg-red-500/10', textColor: 'text-red-500' },
    'Residencial': { icon: Home, color: 'from-emerald-500 to-green-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-500' },
    'Saúde': { icon: Users, color: 'from-purple-500 to-indigo-500', bgColor: 'bg-purple-500/10', textColor: 'text-purple-500' },
    'Empresarial': { icon: Building, color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-500/10', textColor: 'text-amber-500' }
};

// Status com cores
const statusConfig = {
    'active': { label: 'Ativa', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    'pending': { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    'expired': { label: 'Vencida', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    'cancelled': { label: 'Cancelada', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' }
};

function PoliciesPage({ onNavigateToPricing }) {
    const { user } = useAuth();
    const userPlan = user?.subscription?.plan || 'free';
    const isEnterprise = userPlan === 'enterprise';

    const [policies, setPolicies] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        if (isEnterprise) {
            fetchPolicies();
            fetchStats();
        }
    }, [isEnterprise, page, filterStatus, filterType, searchTerm]);

    const fetchPolicies = async () => {
        try {
            const { data } = await getPolicies({
                page,
                status: filterStatus || undefined,
                type: filterType || undefined,
                search: searchTerm || undefined
            });
            setPolicies(data.policies || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Erro ao buscar apólices:', error);
            // Mock data para demo
            setPolicies([
                {
                    id: 1,
                    policyNumber: 'APL-2026-000001',
                    holderName: 'João Silva',
                    holderCpf: '123.456.789-00',
                    holderPhone: '(11) 99999-8888',
                    type: 'Auto',
                    status: 'active',
                    insurerName: 'Porto Seguro',
                    premium: 250.00,
                    coverage: 80000.00,
                    startDate: '2026-01-01',
                    endDate: '2027-01-01',
                    vehiclePlate: 'ABC-1234',
                    vehicleModel: 'Toyota Corolla 2024'
                },
                {
                    id: 2,
                    policyNumber: 'APL-2026-000002',
                    holderName: 'Maria Santos',
                    holderCpf: '987.654.321-00',
                    holderPhone: '(11) 98888-7777',
                    type: 'Residencial',
                    status: 'active',
                    insurerName: 'Bradesco Seguros',
                    premium: 89.90,
                    coverage: 200000.00,
                    startDate: '2026-01-15',
                    endDate: '2027-01-15',
                    propertyAddress: 'Rua das Flores, 123'
                },
                {
                    id: 3,
                    policyNumber: 'APL-2026-000003',
                    holderName: 'Carlos Oliveira',
                    holderCpf: '456.789.123-00',
                    holderPhone: '(11) 97777-6666',
                    type: 'Vida',
                    status: 'pending',
                    insurerName: 'SulAmérica',
                    premium: 150.00,
                    coverage: 500000.00,
                    startDate: '2026-02-01',
                    endDate: '2027-02-01'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await getPoliciesStats();
            setStats(data);
        } catch (error) {
            // Mock stats
            setStats({
                active: 156,
                pending: 12,
                expired: 8,
                expiringSoon: 23,
                totalPremium: 45680.00
            });
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    // Modal de upgrade para não-Enterprise
    if (!isEnterprise) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="relative max-w-lg w-full">
                    {/* Background blur */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl rounded-full" />

                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                            <Lock size={36} className="text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                            Recurso Exclusivo Enterprise
                        </h2>

                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            A <strong>Gestão de Apólices</strong> é um recurso exclusivo do plano <span className="text-amber-500 font-semibold">Enterprise</span>.
                            Gerencie todas as suas apólices de seguros em um só lugar!
                        </p>

                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-4 mb-6 border border-amber-100 dark:border-amber-500/30">
                            <div className="flex items-center gap-3 text-left">
                                <Crown className="w-8 h-8 text-amber-500 shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">Plano Enterprise - R$ 399/mês</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Apólices ilimitadas + todos os recursos</p>
                                </div>
                            </div>
                        </div>

                        <ul className="text-left space-y-2 mb-6">
                            {[
                                'Gestão completa de apólices',
                                'Dashboard com métricas avançadas',
                                'Alertas de vencimento automáticos',
                                'Relatórios personalizados',
                                'Integração com seguradoras'
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <Check className="w-5 h-5 text-green-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={onNavigateToPricing}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={20} />
                            Fazer Upgrade
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Interface principal para Enterprise
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl shadow-lg">
                        <FileText size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Apólices</h1>
                        <p className="text-slate-500 dark:text-slate-400">Gestão completa de apólices de seguros</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nova Apólice
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Apólices Ativas', value: stats?.active || 0, icon: Shield, color: 'from-green-500 to-emerald-500' },
                    { label: 'Prêmio Total/Mês', value: formatCurrency(stats?.totalPremium), icon: DollarSign, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Vencendo em 30 dias', value: stats?.expiringSoon || 0, icon: Clock, color: 'from-amber-500 to-orange-500' },
                    { label: 'Pendentes', value: stats?.pending || 0, icon: AlertTriangle, color: 'from-red-500 to-pink-500' }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                                <kpi.icon size={20} className="text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, CPF ou nº apólice..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500/50"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                    <option value="">Todos os Status</option>
                    <option value="active">Ativa</option>
                    <option value="pending">Pendente</option>
                    <option value="expired">Vencida</option>
                    <option value="cancelled">Cancelada</option>
                </select>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                    <option value="">Todos os Tipos</option>
                    {Object.keys(policyTypes).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <button
                    onClick={fetchPolicies}
                    className="p-2.5 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <RefreshCw size={18} className="text-slate-500" />
                </button>
            </div>

            {/* Tabela de Apólices */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Nº Apólice</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Segurado</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Seguradora</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Vigência</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Prêmio</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                                        Carregando...
                                    </td>
                                </tr>
                            ) : policies.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        Nenhuma apólice encontrada
                                    </td>
                                </tr>
                            ) : policies.map((policy) => {
                                const typeConfig = policyTypes[policy.type] || policyTypes['Auto'];
                                const TypeIcon = typeConfig.icon;
                                const status = statusConfig[policy.status] || statusConfig['active'];

                                return (
                                    <tr key={policy.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-semibold text-slate-800 dark:text-white">
                                                {policy.policyNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-white">{policy.holderName}</p>
                                                <p className="text-xs text-slate-500">{policy.holderCpf}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg ${typeConfig.bgColor} flex items-center justify-center`}>
                                                    <TypeIcon size={16} className={typeConfig.textColor} />
                                                </div>
                                                <span className="text-slate-700 dark:text-slate-300">{policy.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {policy.insurerName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-slate-800 dark:text-white">
                                                {formatCurrency(policy.premium)}
                                            </span>
                                            <span className="text-xs text-slate-500">/mês</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => { setSelectedPolicy(policy); setIsDetailModalOpen(true); }}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                    title="Ver detalhes"
                                                >
                                                    <Eye size={16} className="text-slate-500" />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} className="text-slate-500" />
                                                </button>
                                                <button
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

                {/* Paginação */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">
                        Mostrando página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Detalhes */}
            {isDetailModalOpen && selectedPolicy && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedPolicy.policyNumber}</h2>
                                <p className="text-slate-500">{selectedPolicy.holderName}</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Tipo</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedPolicy.type}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Seguradora</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedPolicy.insurerName}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">CPF</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedPolicy.holderCpf}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Telefone</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedPolicy.holderPhone}</p>
                                </div>
                            </div>

                            {/* Valores */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Prêmio Mensal</p>
                                        <p className="text-2xl font-bold text-amber-600">{formatCurrency(selectedPolicy.premium)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Cobertura</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(selectedPolicy.coverage)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-1">Vigência</p>
                                        <p className="text-lg font-bold text-slate-800 dark:text-white">{formatDate(selectedPolicy.endDate)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Veículo ou Imóvel */}
                            {selectedPolicy.vehiclePlate && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-blue-600 uppercase font-semibold mb-2">Veículo Segurado</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedPolicy.vehicleModel}</p>
                                    <p className="text-slate-600 dark:text-slate-400">Placa: {selectedPolicy.vehiclePlate}</p>
                                </div>
                            )}

                            {selectedPolicy.propertyAddress && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-xs text-emerald-600 uppercase font-semibold mb-2">Imóvel Segurado</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedPolicy.propertyAddress}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                            <button className="flex-1 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                <Download size={18} />
                                Baixar PDF
                            </button>
                            <button className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                                <Edit size={18} />
                                Editar Apólice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nova Apólice */}
            {isNewModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsNewModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nova Apólice</h2>
                            <button onClick={() => setIsNewModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Segurado *</label>
                                    <input type="text" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CPF *</label>
                                    <input type="text" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone *</label>
                                    <input type="text" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Seguro *</label>
                                    <select className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white">
                                        {Object.keys(policyTypes).map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seguradora *</label>
                                    <input type="text" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prêmio Mensal (R$) *</label>
                                    <input type="number" step="0.01" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor de Cobertura (R$) *</label>
                                    <input type="number" step="0.01" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Início da Vigência *</label>
                                    <input type="date" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fim da Vigência *</label>
                                    <input type="date" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                            <button onClick={() => setIsNewModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                Cancelar
                            </button>
                            <button className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
                                <Plus size={18} />
                                Criar Apólice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PoliciesPage;
