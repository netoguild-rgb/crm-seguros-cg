// ARQUIVO: frontend/src/components/WhatsAppModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Cloud, Image as ImageIcon } from 'lucide-react';
import { getConfig } from '../services/api';

const WhatsAppModal = ({ lead, onClose }) => {
  if (!lead) return null;

  const [customMessage, setCustomMessage] = useState('');
  const [header, setHeader] = useState('');
  const [promoLink, setPromoLink] = useState('');
  const [loading, setLoading] = useState(true);

  // Carrega as configurações ao abrir o modal
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await getConfig();
        if (data) {
          setHeader(data.message_header || '');
          setPromoLink(data.promo_folder_link || '');
        }
      } catch (error) {
        console.error("Erro config", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSend = () => {
    // 1. Limpeza do número (Remove tudo que não for dígito)
    // Se o número no banco for (83) 9999-9999, vira 8399999999
    const cleanPhone = lead.whatsapp ? lead.whatsapp.replace(/\D/g, '') : '';
    
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Este lead não tem um número de WhatsApp válido.');
      return;
    }

    // 2. Monta a Mensagem Final (Cabeçalho + Mensagem Personalizada)
    // Se não tiver mensagem personalizada, manda só o cabeçalho.
    const messageParts = [];
    if (header) messageParts.push(header);
    if (customMessage) messageParts.push(customMessage);
    
    const finalMessage = messageParts.join('\n\n');
    const encodedText = encodeURIComponent(finalMessage);
    
    // 3. Link do WhatsApp Web
    const waUrl = `https://wa.me/55${cleanPhone}?text=${encodedText}`;

    // 4. Lógica de "Anexar Imagem Nuvem"
    if (promoLink) {
        if (promoLink.startsWith('http')) {
            window.open(promoLink, '_blank'); // Abre pasta em nova aba
        } else {
            // Se for local
            navigator.clipboard.writeText(promoLink);
            alert('Link da pasta copiado! Cole no Explorer.');
        }
    } else {
        alert('Atenção: Nenhuma pasta de promoções configurada na aba Configurações.');
    }

    // 5. Abre o WhatsApp (com pequeno delay para o navegador não bloquear popups múltiplos)
    setTimeout(() => {
        window.open(waUrl, '_blank');
        onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
        
        {/* Header Verde */}
        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ImageIcon size={24}/> Disparo de Promoções
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full"><X size={20}/></button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center py-4 text-slate-500">Carregando configurações...</p>
          ) : (
            <div className="space-y-4">
              
              {/* Preview do Cabeçalho */}
              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                <label className="text-xs font-bold text-slate-500 uppercase">Cabeçalho (Fixo)</label>
                <p className="text-sm text-slate-700 italic whitespace-pre-wrap mt-1">
                  {header || "(Nenhum cabeçalho configurado na aba Configurações)"}
                </p>
              </div>

              {/* Mensagem Personalizada */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Mensagem Adicional</label>
                <textarea
                  className="w-full mt-1 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  rows="4"
                  placeholder="Digite detalhes específicos para este cliente..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                ></textarea>
              </div>

              {/* Aviso sobre Imagem */}
              <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                <Cloud size={16} className="shrink-0 mt-0.5"/>
                <span>
                  Ao enviar, abriremos a <b>Pasta de Promoções</b> e o <b>WhatsApp</b>. 
                  Basta arrastar a imagem da pasta para a conversa.
                </span>
              </div>

              <button 
                onClick={handleSend}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <ExternalLink size={20}/> Abrir Pasta & Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;