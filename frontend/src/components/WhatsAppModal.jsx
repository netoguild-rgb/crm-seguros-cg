import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Cloud, Image as ImageIcon, Users, Check, MessageCircle } from 'lucide-react';
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
        if(res.data) {
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
    } else alert('Pasta não configurada.');
  };

  const handleSendOne = (lead) => {
    const cleanPhone = getCleanPhone(lead.whatsapp);
    if (!cleanPhone || cleanPhone.length < 10) return alert('Número inválido');

    const fullMsg = `${header}\n\nOlá ${lead.nome},\n${message}`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(fullMsg)}`;
    window.open(url, '_blank');
    if(!sentIds.includes(lead.id)) setSentIds([...sentIds, lead.id]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-float w-full max-w-lg animate-fade-in overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        
        <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <div className="bg-green-500 text-white p-1.5 rounded"><MessageCircle size={18}/></div>
             Disparo WhatsApp
          </h2>
          <button onClick={onClose} className="hover:bg-slate-100 p-2 rounded text-slate-500"><X size={18}/></button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 bg-crm-50/50 space-y-4">
          {loading ? <p className="text-center text-slate-500">Carregando...</p> : (
            <>
               <div className="bg-white p-4 rounded border border-slate-200 shadow-sm space-y-3">
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase">Mensagem Personalizada</label>
                        <textarea 
                            className="w-full border border-slate-300 p-2 rounded text-sm mt-1 focus:ring-1 focus:ring-green-500 outline-none" 
                            rows="3"
                            placeholder="Digite o conteúdo da campanha..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>
                    {promoLink && (
                        <button onClick={handleOpenFolder} className="text-xs font-bold text-crm-600 flex items-center gap-1 hover:underline">
                            <Cloud size={12}/> Acessar Pasta de Imagens (Nuvem)
                        </button>
                    )}
               </div>

               <div>
                    <h3 className="font-bold text-slate-700 text-sm mb-2 px-1">Destinatários ({leads.length})</h3>
                    <div className="bg-white border border-slate-200 rounded overflow-hidden max-h-60 overflow-y-auto">
                        {leads.map(lead => {
                            const isSent = sentIds.includes(lead.id);
                            return (
                                <div key={lead.id} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                    <div className="truncate pr-2">
                                        <p className="font-bold text-sm text-slate-700">{lead.nome}</p>
                                        <p className="text-xs text-slate-400">{lead.whatsapp}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleSendOne(lead)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition shadow-sm
                                            ${isSent ? 'bg-slate-100 text-slate-400 border' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                        {isSent ? 'Enviado' : 'Enviar'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
               </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default WhatsAppModal;