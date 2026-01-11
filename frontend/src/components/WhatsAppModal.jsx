import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Cloud, Users, CheckCircle, MessageCircle, Send, Sparkles } from 'lucide-react';
import { getConfig } from '../services/api';

const WhatsAppModal = ({ leads, onClose }) => {
  if (!leads || leads.length === 0) return null;

  const [message, setMessage] = useState('');
  const [header, setHeader] = useState('');
  const [promoLink, setPromoLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [sentIds, setSentIds] = useState([]);

  useEffect(() => {
    getConfig().then(res => {
      if (res.data) {
        setHeader(res.data.message_header || '');
        setPromoLink(res.data.promo_folder_link || '');
      }
      setLoading(false);
    });
  }, []);

  const getCleanPhone = (phone) => phone ? phone.replace(/\D/g, '') : '';

  const handleOpenFolder = () => {
    if (promoLink) {
      if (promoLink.startsWith('http')) window.open(promoLink, '_blank');
      else navigator.clipboard.writeText(promoLink);
    }
  };

  const handleSendOne = (lead) => {
    const cleanPhone = getCleanPhone(lead.whatsapp);
    if (!cleanPhone || cleanPhone.length < 10) return;

    const fullMsg = `${header}\n\nOlá ${lead.nome},\n${message}`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(fullMsg)}`;
    window.open(url, '_blank');
    if (!sentIds.includes(lead.id)) setSentIds([...sentIds, lead.id]);
  };

  const sentCount = sentIds.length;
  const totalCount = leads.length;
  const progress = (sentCount / totalCount) * 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-lg flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                <MessageCircle size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Disparo WhatsApp</h2>
                <p className="text-white/70 text-sm">{totalCount} destinatário{totalCount > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded-xl text-white/80 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {sentCount > 0 && (
          <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-emerald-700">Progresso</span>
              <span className="text-sm font-bold text-emerald-700">{sentCount}/{totalCount}</span>
            </div>
            <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1 bg-gradient-to-b from-slate-50 to-white space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="loading-spinner" />
            </div>
          ) : (
            <>
              {/* Message Input */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Sparkles size={16} className="text-crm-500" />
                  <span className="text-sm font-bold uppercase tracking-wide">Sua Mensagem</span>
                </div>
                <textarea
                  className="w-full border border-slate-200 p-4 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-none transition-all hover:border-slate-300 shadow-sm"
                  rows="4"
                  placeholder="Digite o conteúdo da sua mensagem..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                {promoLink && (
                  <button
                    onClick={handleOpenFolder}
                    className="text-sm font-bold text-crm-600 flex items-center gap-2 hover:text-crm-700 bg-crm-50 px-4 py-2 rounded-xl hover:bg-crm-100 transition-all"
                  >
                    <Cloud size={16} /> Acessar Pasta de Imagens
                  </button>
                )}
              </div>

              {/* Recipients */}
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-3 px-1">
                  <Users size={16} className="text-slate-400" />
                  <span className="text-sm font-bold uppercase tracking-wide">Destinatários</span>
                </div>
                <div className="glass-card rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                  {leads.map(lead => {
                    const isSent = sentIds.includes(lead.id);
                    return (
                      <div
                        key={lead.id}
                        className={`flex justify-between items-center p-4 border-b border-slate-100 last:border-0 transition-all ${isSent ? 'bg-emerald-50' : 'hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {isSent && (
                            <div className="bg-emerald-100 p-1.5 rounded-full">
                              <CheckCircle size={14} className="text-emerald-600" />
                            </div>
                          )}
                          <div className="truncate">
                            <p className={`font-bold text-sm ${isSent ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {lead.nome}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">{lead.whatsapp}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendOne(lead)}
                          disabled={!message.trim()}
                          className={`
                                          px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm
                                          ${isSent
                              ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                              : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed'
                            }
                                        `}
                        >
                          {isSent ? (
                            <>
                              <CheckCircle size={14} /> Enviado
                            </>
                          ) : (
                            <>
                              <Send size={14} /> Enviar
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {sentCount === totalCount && totalCount > 0 && (
          <div className="p-5 bg-gradient-to-r from-emerald-500 to-green-500 text-center">
            <div className="flex items-center justify-center gap-2 text-white font-bold">
              <CheckCircle size={20} />
              Todos os {totalCount} envios realizados!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppModal;