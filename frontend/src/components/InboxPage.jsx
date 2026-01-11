import React, { useState, useEffect } from 'react';
import {
    Inbox,
    Search,
    Phone,
    Video,
    MoreVertical,
    Send,
    Paperclip,
    Smile,
    Check,
    CheckCheck,
    Circle,
    Archive,
    Star,
    Clock,
    MessageCircle,
    RefreshCw,
    Lock,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { getConversations, getConversation, sendMessage as apiSendMessage, markConversationAsRead } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Mock data para fallback quando API vazia
const mockConversations = [
    { id: 1, name: 'João Silva', phone: '11999887766', lastMessage: 'Preciso de um orçamento para seguro auto', lastMessageAt: new Date(), unreadCount: 3, isOnline: true },
    { id: 2, name: 'Maria Fernandes', phone: '11988776655', lastMessage: 'Obrigada pelo atendimento!', lastMessageAt: new Date(), unreadCount: 0, isOnline: false },
    { id: 3, name: 'Pedro Santos', phone: '11977665544', lastMessage: 'Qual o valor do seguro residencial?', lastMessageAt: new Date(Date.now() - 86400000), unreadCount: 1, isOnline: true },
    { id: 4, name: 'Ana Costa', phone: '11966554433', lastMessage: 'Vou analisar a proposta', lastMessageAt: new Date(Date.now() - 86400000), unreadCount: 0, isOnline: false },
];

const mockMessages = {
    1: [
        { id: 1, text: 'Olá, boa tarde!', isFromMe: false, timestamp: new Date(), status: 'read' },
        { id: 2, text: 'Boa tarde! Como posso ajudar?', isFromMe: true, timestamp: new Date(), status: 'read' },
        { id: 3, text: 'Preciso de um orçamento para seguro auto', isFromMe: false, timestamp: new Date(), status: 'read' },
    ],
    2: [
        { id: 1, text: 'Bom dia! Seu seguro está pronto', isFromMe: true, timestamp: new Date(), status: 'read' },
        { id: 2, text: 'Obrigada pelo atendimento!', isFromMe: false, timestamp: new Date(), status: 'read' },
    ],
    3: [{ id: 1, text: 'Qual o valor do seguro residencial?', isFromMe: false, timestamp: new Date(), status: 'delivered' }],
    4: [{ id: 1, text: 'Vou analisar a proposta', isFromMe: false, timestamp: new Date(), status: 'read' }],
};

function InboxPage({ onNavigateToPricing }) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [useMock, setUseMock] = useState(false);

    // Verifica se usuário tem plano pago (basic, pro, enterprise)
    const userPlan = user?.subscription?.plan || 'free';
    const hasPaidPlan = ['basic', 'pro', 'enterprise'].includes(userPlan);

    // Carregar conversas da API
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setLoading(true);
        try {
            const { data } = await getConversations();
            if (data && data.length > 0) {
                setConversations(data);
                setSelectedConversation(data[0]);
                setUseMock(false);
            } else {
                // Usa mock se API retornar vazio
                setConversations(mockConversations);
                setSelectedConversation(mockConversations[0]);
                setMessages(mockMessages);
                setUseMock(true);
            }
        } catch (error) {
            console.error('Erro ao carregar conversas, usando mock:', error);
            setConversations(mockConversations);
            setSelectedConversation(mockConversations[0]);
            setMessages(mockMessages);
            setUseMock(true);
        }
        setLoading(false);
    };

    // Carregar mensagens quando seleciona conversa
    useEffect(() => {
        if (selectedConversation && !useMock) {
            loadMessages(selectedConversation.id);
        }
    }, [selectedConversation, useMock]);

    const loadMessages = async (convId) => {
        try {
            const { data } = await getConversation(convId);
            if (data?.messages) {
                setMessages(prev => ({ ...prev, [convId]: data.messages }));
            }
            // Marcar como lida
            await markConversationAsRead(convId);
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = (conv.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (conv.phone || '').includes(searchTerm);
        const matchesFilter = filter === 'all' ||
            (filter === 'unread' && conv.unreadCount > 0);
        return matchesSearch && matchesFilter;
    });

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !hasPaidPlan) return;

        const newMsg = {
            id: Date.now(),
            text: newMessage,
            isFromMe: true,
            timestamp: new Date(),
            status: 'sent'
        };

        // Atualiza UI imediatamente
        setMessages(prev => ({
            ...prev,
            [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMsg]
        }));
        setNewMessage('');

        // Envia para API se não estiver usando mock
        if (!useMock) {
            try {
                await apiSendMessage({
                    conversationId: selectedConversation.id,
                    text: newMessage,
                    isFromMe: true
                });
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        if (diff < 86400000) {
            return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        if (diff < 172800000) return 'Ontem';
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'read':
                return <CheckCheck size={14} className="text-blue-500" />;
            case 'delivered':
                return <CheckCheck size={14} className="text-slate-400" />;
            default:
                return <Check size={14} className="text-slate-400" />;
        }
    };

    return (
        <div className="h-full flex flex-col animate-fade-in relative">
            {/* Overlay para plano free */}
            {!hasPaidPlan && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                    {/* Blur background */}
                    <div className="absolute inset-0 backdrop-blur-md bg-slate-900/40"></div>

                    {/* Content */}
                    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center animate-fade-in">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Lock size={36} className="text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-3">
                            Recurso Premium
                        </h2>

                        <p className="text-slate-600 mb-6">
                            O <strong>Agente Autônomo de WhatsApp</strong> está disponível a partir do plano <span className="text-purple-600 font-semibold">Basic</span>.
                            Automatize o atendimento e capture leads 24/7!
                        </p>

                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 mb-6 border border-purple-100">
                            <div className="flex items-center gap-3 text-left">
                                <Sparkles className="w-8 h-8 text-purple-500 shrink-0" />
                                <div>
                                    <p className="font-semibold text-slate-800">Plano Basic - R$ 129/mês</p>
                                    <p className="text-sm text-slate-600">Agente + Website + 50 leads/mês</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onNavigateToPricing}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            Ver Planos
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className={`mb-6 ${!hasPaidPlan ? 'pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                            <Inbox size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Inbox</h1>
                            <p className="text-sm text-slate-500">Gerenciar conversas Evolution API</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold">
                            <Circle size={8} className="fill-green-500 text-green-500" />
                            Evolution Conectado
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className={`flex-1 glass-card rounded-2xl overflow-hidden flex min-h-0 ${!hasPaidPlan ? 'pointer-events-none' : ''}`}>
                {/* Conversations List */}
                <div className="w-80 border-r border-slate-200/50 flex flex-col bg-white/50">
                    {/* Search & Filters */}
                    <div className="p-4 border-b border-slate-200/50">
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar conversa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 rounded-xl text-sm focus:ring-2 focus:ring-crm-500/50 border-0"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'unread'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f
                                        ? 'bg-crm-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {f === 'all' ? 'Todas' : 'Não lidas'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 cursor-pointer transition-all border-b border-slate-100 hover:bg-slate-50 ${selectedConversation?.id === conv.id ? 'bg-gradient-to-r from-crm-50 to-blue-50 border-l-4 border-l-crm-500' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-crm-400 to-crm-600 flex items-center justify-center text-white font-bold text-sm">
                                            {getInitials(conv.name)}
                                        </div>
                                        {conv.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-slate-800 truncate">{conv.name || 'Sem nome'}</h3>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{formatTime(conv.lastMessageAt)}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
                                    </div>

                                    {/* Unread Badge */}
                                    {conv.unreadCount > 0 && (
                                        <div className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 bg-white/80 backdrop-blur border-b border-slate-200/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-crm-400 to-crm-600 flex items-center justify-center text-white font-bold text-sm">
                                            {getInitials(selectedConversation.name)}
                                        </div>
                                        {selectedConversation.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{selectedConversation.name || 'Sem nome'}</h3>
                                        <p className="text-xs text-slate-500">
                                            {selectedConversation.isOnline ? 'Online agora' : 'Última vez ' + formatTime(selectedConversation.lastMessageAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                        <Phone size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                        <Video size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                        <Star size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                        <Archive size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {(messages[selectedConversation.id] || []).map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.isFromMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${msg.isFromMe
                                                ? 'bg-gradient-to-r from-crm-500 to-crm-600 text-white rounded-br-md'
                                                : 'bg-white text-slate-700 rounded-bl-md shadow-sm'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.text}</p>
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isFromMe ? 'text-white/70' : 'text-slate-400'}`}>
                                                <span className="text-xs">{formatTime(msg.timestamp)}</span>
                                                {msg.isFromMe && getStatusIcon(msg.status)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white/80 backdrop-blur border-t border-slate-200/50">
                                <div className="flex items-center gap-3">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                        <Smile size={22} />
                                    </button>
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                                        <Paperclip size={22} />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Digite sua mensagem..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-crm-500/50 border-0"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                    <MessageCircle size={40} className="text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-600">Selecione uma conversa</h3>
                                <p className="text-sm text-slate-400">Escolha uma conversa para começar a enviar mensagens</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InboxPage;
