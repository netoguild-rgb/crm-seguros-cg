import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verifica token salvo ao carregar
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuth(token);
        } else {
            setLoading(false);
        }
    }, []);

    // Verifica autenticação
    const checkAuth = async (token) => {
        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (err) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.erro || 'Erro ao fazer login';
            setError(message);
            return { success: false, error: message };
        }
    };

    // Registro
    const register = async (name, email, password) => {
        try {
            setError(null);
            await api.post('/auth/register', { name, email, password });
            return { success: true };
        } catch (err) {
            const message = err.response?.data?.erro || 'Erro ao criar conta';
            setError(message);
            return { success: false, error: message };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    // Atualiza dados do usuário
    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            await checkAuth(token);
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
