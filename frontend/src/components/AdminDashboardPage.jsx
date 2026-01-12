import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Shield,
    Crown,
    TrendingUp,
    DollarSign,
    UserPlus,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X,
    Check,
    AlertTriangle,
    BarChart3,
    PieChart,
    Calendar,
    Mail,
    Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAdminStats, getAdminUsers, updateUserPlan, updateUserRole, deleteAdminUser } from '../services/api';

// Configuração de planos
const planConfig = {
    free: { label: 'Free', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20', price: 0 },
    basic: { label: 'Basic', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', price: 129 },
    pro: { label: 'Pro', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', price: 249 },
    enterprise: { label: 'Enterprise', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', price: 399 }
};

const statusConfig = {
    active: { label: 'Ativo', color: 'bg-green-500/10 text-green-600' },
    inactive: { label: 'Inativo', color: 'bg-slate-500/10 text-slate-600' },
    canceled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-600' }
};

function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Verificar se é superadmin
    const isSuperadmin = user?.role === 'superadmin';

    useEffect(() => {
        if (isSuperadmin) {
            fetchStats();
            fetchUsers();
        }
    }, [isSuperadmin, page, filterPlan, searchTerm]);

    const fetchStats = async () => {
        try {
            const { data } = await getAdminStats();
            setStats(data);
        } catch (error) {
            console.error('Erro ao buscar stats:', error);
            // Mock para demo
            setStats({
                totalUsers: 156,
                activeSubscriptions: 89,
                mrr: 17910,
                newUsersThisMonth: 23,
                planDistribution: { free: 67, basic: 45, pro: 32, enterprise: 12 }
            });
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await getAdminUsers({
                page,
                plan: filterPlan || undefined,
                search: searchTerm || undefined
            });
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            // Mock para demo
            setUsers([
                { id: 1, name: 'João Silva', email: 'joao@email.com', plan: 'enterprise', status: 'active', leadsCount: 234, policiesCount: 45, createdAt: '2026-01-01' },
                { id: 2, name: 'Maria Santos', email: 'maria@email.com', plan: 'pro', status: 'active', leadsCount: 156, policiesCount: 0, createdAt: '2026-01-05' },
                { id: 3, name: 'Carlos Oliveira', email: 'carlos@email.com', plan: 'basic', status: 'active', leadsCount: 45, policiesCount: 0, createdAt: '2026-01-10' },
                { id: 4, name: 'Ana Costa', email: 'ana@email.com', plan: 'free', status: 'inactive', leadsCount: 12, policiesCount: 0, createdAt: '2026-01-12' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePlan = async (userId, newPlan) => {
        try {
            await updateUserPlan(userId, newPlan);
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Erro ao alterar plano:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) return;

        try {
            await deleteAdminUser(userId);
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    // Acesso negado para não-superadmin
    if (!isSuperadmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Acesso Restrito</h2>
                    <p className="text-slate-600 dark:text-slate-400">Esta área é exclusiva para administradores.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-3 rounded-xl shadow-lg">
                        <Settings size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">Gerenciamento de clientes SaaS</p>
                    </div>
                </div>
                <button
                    onClick={() => { fetchStats(); fetchUsers(); }}
                    className="p-2.5 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Usuários', value: stats?.totalUsers || 0, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'Assinaturas Ativas', value: stats?.activeSubscriptions || 0, icon: Crown, gradient: 'from-amber-500 to-orange-500' },
                    { label: 'MRR', value: formatCurrency(stats?.mrr), icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
                    { label: 'Novos (30 dias)', value: stats?.newUsersThisMonth || 0, icon: UserPlus, gradient: 'from-purple-500 to-pink-500' }
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center`}>
                                <kpi.icon size={20} className="text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Distribuição por Planos */}
            {stats?.planDistribution && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart size={18} />
                        Distribuição por Plano
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {Object.entries(stats.planDistribution).map(([plan, count]) => (
                            <div key={plan} className="text-center">
                                <div className={`text-3xl font-bold ${planConfig[plan]?.color.split(' ')[1]}`}>
                                    {count}
                                </div>
                                <div className="text-sm text-slate-500 capitalize">{planConfig[plan]?.label || plan}</div>
                                <div className="text-xs text-slate-400">{formatCurrency(planConfig[plan]?.price || 0)}/mês</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filtros e Busca */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500/50"
                    />
                </div>

                <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                    <option value="">Todos os Planos</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                </select>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Usuário</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Plano</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Leads</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Apólices</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Cadastro</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <RefreshCw className="w-8 h-8 mx-auto mb-2 text-violet-500 animate-spin" />
                                        <p className="text-slate-500">Carregando...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                        <p className="text-slate-500">Nenhum usuário encontrado</p>
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white">{u.name}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={u.plan}
                                            onChange={(e) => handleChangePlan(u.id, e.target.value)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${planConfig[u.plan]?.color}`}
                                        >
                                            <option value="free">Free</option>
                                            <option value="basic">Basic</option>
                                            <option value="pro">Pro</option>
                                            <option value="enterprise">Enterprise</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${statusConfig[u.status]?.color}`}>
                                            {statusConfig[u.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{u.leadsCount}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{u.policiesCount}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {formatDate(u.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                title="Ver detalhes"
                                            >
                                                <Eye size={16} className="text-slate-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">
                        Página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg disabled:opacity-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Detalhes */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Detalhes do Usuário</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                                    {selectedUser.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-800 dark:text-white">{selectedUser.name}</p>
                                    <p className="text-slate-500">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Plano</p>
                                    <p className="font-semibold text-slate-800 dark:text-white capitalize">{selectedUser.plan}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                                    <p className="font-semibold text-slate-800 dark:text-white capitalize">{selectedUser.status}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Leads</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedUser.leadsCount}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Apólices</p>
                                    <p className="font-semibold text-slate-800 dark:text-white">{selectedUser.policiesCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={() => setIsModalOpen(false)} className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboardPage;
