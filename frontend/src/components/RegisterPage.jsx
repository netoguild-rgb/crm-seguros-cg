import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle2, Sparkles, Gift, Zap, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/logo.png';

const RegisterPage = ({ onNavigateToLogin }) => {
    const { register, error } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!name || !email || !password || !confirmPassword) {
            setLocalError('Preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setLocalError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);
        const result = await register(name, email, password);
        setLoading(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onNavigateToLogin();
            }, 2000);
        } else {
            setLocalError(result.error);
        }
    };

    const benefits = [
        { icon: Gift, text: '7 dias grátis para testar' },
        { icon: Zap, text: 'Sem compromisso' },
        { icon: Shield, text: 'Dados protegidos' },
    ];

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 animate-bounce shadow-lg shadow-green-500/30">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Conta criada com sucesso!</h2>
                    <p className="text-slate-400 text-lg">Redirecionando para o login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-crm-900">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-crm-600/20" />
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(124, 58, 237, 0.15) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Animated Orbs */}
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-crm-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

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
                        Comece sua jornada <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            de sucesso hoje
                        </span>
                    </h2>

                    <p className="text-xl text-slate-300 mb-10 max-w-md">
                        Junte-se a centenas de corretoras que já transformaram seu negócio com o CRM Seguros.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-4">
                        {benefits.map((benefit, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 max-w-sm"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                                    <benefit.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-white font-medium">{benefit.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-w-md">
                        <p className="text-slate-300 italic mb-4">
                            "O CRM Seguros revolucionou nossa corretora. Aumentamos as vendas em 40% no primeiro mês!"
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-crm-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                M
                            </div>
                            <div>
                                <p className="text-white font-medium text-sm">Marcos Silva</p>
                                <p className="text-slate-400 text-xs">Corretora Prime Seguros</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
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
                        <h1 className="text-3xl font-bold text-white mb-2">Criar sua conta</h1>
                        <p className="text-slate-400">Preencha os dados abaixo para começar</p>
                    </div>

                    {/* Register Card */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nome completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    />
                                </div>
                            </div>

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
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
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
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
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

                            {/* Confirmar Senha */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a senha"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    />
                                </div>
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
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Criar conta gratuita
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <button
                            onClick={onNavigateToLogin}
                            className="w-full mt-6 py-4 border border-slate-600 text-slate-300 font-medium rounded-xl hover:bg-slate-700/50 hover:border-purple-500/50 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Já tenho uma conta
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Ao criar uma conta, você aceita nossos{' '}
                            <a href="#" className="text-crm-400 hover:text-crm-300 transition-colors">Termos de Serviço</a>
                            {' '}e{' '}
                            <a href="#" className="text-crm-400 hover:text-crm-300 transition-colors">Política de Privacidade</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
