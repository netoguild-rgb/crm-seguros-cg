import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Conta criada com sucesso!</h2>
                    <p className="text-slate-400">Redirecionando para o login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg shadow-purple-500/25 mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
                    <p className="text-slate-400">Comece a gerenciar seus leads agora</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Erro */}
                        {(localError || error) && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-red-400 text-sm">{localError || error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Criar conta'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <button
                        onClick={onNavigateToLogin}
                        className="w-full mt-6 py-4 border border-slate-600 text-slate-300 font-medium rounded-xl hover:bg-slate-700/50 hover:border-slate-500 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar ao login
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-8">
                    Ao criar uma conta, você aceita nossos Termos de Serviço.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
