import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/logo.png';

const LoginPage = ({ onNavigateToRegister }) => {
    const { login, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!email || !password) {
            setLocalError('Preencha todos os campos');
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (!result.success) {
            setLocalError(result.error);
        }
    };

    const features = [
        { icon: Users, text: 'Gestão de Leads' },
        { icon: Zap, text: 'Automação WhatsApp' },
        { icon: BarChart3, text: 'Dashboard Analytics' },
    ];

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-crm-900">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-crm-600/20 via-transparent to-purple-600/20" />
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(42, 171, 228, 0.15) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-crm-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 py-12">
                    {/* Logo Large */}
                    <div className="mb-12">
                        <div className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                            <img
                                src={logoImg}
                                alt="CRM Seguros"
                                className="h-20 w-auto"
                            />
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Gerencie sua corretora <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-crm-400 to-cyan-400">
                            de forma inteligente
                        </span>
                    </h2>

                    <p className="text-xl text-slate-300 mb-10 max-w-md">
                        O CRM completo para corretoras de seguros. Automatize processos e feche mais negócios.
                    </p>

                    {/* Features */}
                    <div className="space-y-4">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 max-w-sm"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-crm-500 to-cyan-500 rounded-xl flex items-center justify-center shrink-0">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-white font-medium">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 mt-12">
                        <div>
                            <p className="text-3xl font-bold text-white">500+</p>
                            <p className="text-slate-400 text-sm">Corretoras</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">50k+</p>
                            <p className="text-slate-400 text-sm">Leads gerenciados</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">98%</p>
                            <p className="text-slate-400 text-sm">Satisfação</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-block bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                            <img
                                src={logoImg}
                                alt="CRM Seguros"
                                className="h-12 w-auto"
                            />
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
                        <p className="text-slate-400">Faça login para acessar seu painel</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="text-right">
                                <button type="button" className="text-sm text-crm-400 hover:text-crm-300 transition-colors">
                                    Esqueceu a senha?
                                </button>
                            </div>

                            {/* Erro */}
                            {(localError || error) && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
                                    <p className="text-red-400 text-sm">{localError || error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-crm-500 to-crm-600 text-white font-semibold rounded-xl shadow-lg shadow-crm-500/25 hover:shadow-xl hover:shadow-crm-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Entrar
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-slate-800/50 text-slate-500 text-sm">ou</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <button
                            onClick={onNavigateToRegister}
                            className="w-full py-4 border border-slate-600 text-slate-300 font-medium rounded-xl hover:bg-slate-700/50 hover:border-crm-500/50 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Criar nova conta
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            © 2026 CRM Seguros. Todos os direitos reservados.
                        </p>
                        <div className="flex items-center justify-center gap-4 mt-3">
                            <a href="#" className="text-slate-400 hover:text-crm-400 text-sm transition-colors">Termos</a>
                            <span className="text-slate-600">•</span>
                            <a href="#" className="text-slate-400 hover:text-crm-400 text-sm transition-colors">Privacidade</a>
                            <span className="text-slate-600">•</span>
                            <a href="#" className="text-slate-400 hover:text-crm-400 text-sm transition-colors">Suporte</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
