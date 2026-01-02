import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Cloud, Image as ImageIcon, Users, Check } from 'lucide-react';
import { getConfig } from '../services/api';

const WhatsAppModal = ({ leads, onClose }) => { // Recebe 'leads' (array) agora
  if (!leads || leads.length === 0) return null;

  const [message, setMessage] = useState('');
  const [header, setHeader] = useState('');
  const [promoLink, setPromoLink] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Controle de envio em massa
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
        else {
            navigator.clipboard.writeText(promoLink);
            alert('Link copiado!');
        }
    } else {
        alert('Pasta de promoções não configurada.');
    }
  };

  const handleSendOne = (lead) => {
    const cleanPhone = getCleanPhone(lead.whatsapp);
    if (!cleanPhone || cleanPhone.length < 10) {
        alert(`Número inválido para ${lead.nome}`);
        return;
    }

    const fullMsg = `${header}\n\nOlá ${lead.nome},\n${message}`;
    const encoded = encodeURIComponent(fullMsg);
    const url = `https://wa.me/55${cleanPhone}?text=${encoded}`;
    
    window.open(url, '_blank');
    
    // Marca como enviado visualmente
    if(!sentIds.includes(lead.id)) setSentIds([...sentIds, lead.id]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-green-600 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {leads.length > 1 ? <Users size={24}/> : <ImageIcon size={24}/>} 
            {leads.length > 1 ? `Disparo em Massa (${leads.length})` : 'Disparo Promocional'}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? <p>Carregando...</p> : (
            <div className="space-y-4">
               
               {/* Configuração da Mensagem */}
               <div className="bg-slate-50 p-3 rounded border">
                    <label className="text-xs font-bold text-slate-500 uppercase">Cabeçalho</label>
                    <p className="text-xs text-slate-700 italic mb-2">{header || '(Vazio)'}</p>
                    
                    <label className="text-xs font-bold text-slate-500 uppercase">Sua Mensagem</label>
                    <textarea 
                        className="w-full border p-2 rounded text-sm" 
                        rows="3"
                        placeholder="Escreva o conteúdo da campanha..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />
               </div>

               <button onClick={handleOpenFolder} className="w-full py-2 bg-blue-50 text-blue-700 rounded font-bold text-sm flex items-center justify-center gap-2 border border-blue-200 hover:bg-blue-100">
                    <Cloud size={16}/> Abrir Pasta de Imagens (Nuvem)
               </button>

               <hr />

               {/* Lista de Disparo (Tarefa 1) */}
               <div className="space-y-2">
                    <h3 className="font-bold text-slate-700 text-sm">Lista de Envio:</h3>
                    <div className="max-h-60 overflow-y-auto border rounded divide-y">
                        {leads.map(lead => {
                            const isSent = sentIds.includes(lead.id);
                            return (
                                <div key={lead.id} className={`flex justify-between items-center p-3 ${isSent ? 'bg-green-50' : 'bg-white'}`}>
                                    <div className="truncate pr-2">
                                        <p className="font-bold text-sm text-slate-800">{lead.nome}</p>
                                        <p className="text-xs text-slate-500">{lead.whatsapp}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleSendOne(lead)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition
                                            ${isSent ? 'bg-slate-200 text-slate-500' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                        {isSent ? <><Check size={12}/> Enviado</> : <><ExternalLink size={12}/> Enviar</>}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
               </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default WhatsAppModal;