// ARQUIVO: frontend/src/components/WhatsAppModal.jsx
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Folder, Settings, ExternalLink, Save, Cloud } from 'lucide-react';
import { getConfig, saveConfig } from '../services/api';

const WhatsAppModal = ({ lead, onClose }) => {
  if (!lead) return null;

  const [message, setMessage] = useState('');
  const [promoLink, setPromoLink] = useState(''); // Link Global (Promoções)
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isEditingPromo, setIsEditingPromo] = useState(false);
  
  // Estado para saber qual pasta o usuário quer usar
  const [selectedFolderType, setSelectedFolderType] = useState('promo'); // 'promo' ou 'client'

  // Carregar configuração global ao abrir
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await getConfig();
        if (data && data.promo_folder_link) {
          setPromoLink(data.promo_folder_link);
        } else {
          setIsEditingPromo(true); // Se não tem link, já abre modo edição
        }
      } catch (error) {
        console.error("Erro ao carregar config", error);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSavePromoLink = async () => {
    try {
      await saveConfig({ promo_folder_link: promoLink });
      setIsEditingPromo(false);
      alert('Link da pasta de promoções salvo!');
    } catch (error) {
      alert('Erro ao salvar configuração.');
    }
  };

  const handleSend = () => {
    // 1. Monta link do WhatsApp
    const textEncoded = encodeURIComponent(message);
    const waLink = `https://wa.me/55${lead.whatsapp}?text=${textEncoded}`;
    
    // 2. Abre a Pasta Escolhida (se selecionada)
    let folderToOpen = null;
    if (selectedFolderType === 'promo') folderToOpen = promoLink;
    if (selectedFolderType === 'client') folderToOpen = lead.link_pasta;

    if (folderToOpen) {
        if (folderToOpen.startsWith('http')) {
            // Abre pasta nuvem em nova aba
            window.open(folderToOpen, '_blank');
        } else {
            // Se for local, copia
            navigator.clipboard.writeText(folderToOpen);
            alert('Caminho da pasta copiado! Cole no Explorer para pegar os arquivos.');
        }
    }

    // 3. Abre WhatsApp (com pequeno delay para garantir que a pasta abriu antes)
    setTimeout(() => {
        window.open(waLink, '_blank');
        onClose(); // Fecha modal
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="bg-crm-900 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Cloud size={24}/> Disparo de Arquivos
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* SEÇÃO 1: Escolha da Fonte de Arquivos */}
          <div className="space-y-3">
             <label className="text-xs font-bold text-slate-500 uppercase">1. De onde virão os arquivos?</label>
             
             {/* Opção A: Pasta de Promoções (Global) */}
             <div className={`border p-3 rounded-lg transition ${selectedFolderType === 'promo' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <input 
                        type="radio" 
                        name="folderType" 
                        checked={selectedFolderType === 'promo'} 
                        onChange={() => setSelectedFolderType('promo')}
                        className="accent-green-600 w-4 h-4"
                    />
                    <span className="font-bold text-slate-700">Pasta de Campanhas / Promoções</span>
                </div>

                {/* Área de Configuração do Link Promo */}
                {selectedFolderType === 'promo' && (
                    <div className="ml-6">
                        {isEditingPromo ? (
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={promoLink}
                                    onChange={(e) => setPromoLink(e.target.value)}
                                    placeholder="Cole o link do Drive/OneDrive..."
                                    className="flex-1 p-2 border text-sm rounded outline-none focus:border-crm-500"
                                />
                                <button onClick={handleSavePromoLink} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                                    <Save size={16}/>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-white p-2 border rounded text-sm text-slate-600">
                                <span className="truncate max-w-[200px] font-medium">{promoLink || 'Nenhum link configurado'}</span>
                                <button onClick={() => setIsEditingPromo(true)} className="text-blue-500 hover:text-blue-700 text-xs font-bold flex gap-1 items-center">
                                    <Settings size={12}/> Alterar
                                </button>
                            </div>
                        )}
                    </div>
                )}
             </div>

             {/* Opção B: Pasta do Cliente */}
             <div className={`border p-3 rounded-lg transition ${selectedFolderType === 'client' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <input 
                        type="radio" 
                        name="folderType" 
                        checked={selectedFolderType === 'client'} 
                        onChange={() => setSelectedFolderType('client')}
                        disabled={!lead.link_pasta}
                        className="accent-green-600 w-4 h-4"
                    />
                    <div className="flex flex-col">
                        <span className={`font-bold ${!lead.link_pasta ? 'text-slate-400' : 'text-slate-700'}`}>
                            Pasta Específica do Cliente
                        </span>
                        {!lead.link_pasta && <span className="text-[10px] text-red-400"> (Não configurada neste lead)</span>}
                    </div>
                </div>
             </div>
          </div>

          {/* SEÇÃO 2: Mensagem Opcional */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">2. Mensagem (Opcional)</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              rows="3"
              placeholder="Olá, seguem os arquivos conforme conversamos..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>

          <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 border border-blue-100 flex gap-2">
            <span>💡</span>
            <span>Ao clicar, abriremos a <b>Pasta Escolhida</b> e o <b>WhatsApp Web</b>. Basta arrastar os arquivos da pasta para a conversa.</span>
          </div>

          <button 
            onClick={handleSend}
            disabled={selectedFolderType === 'promo' && !promoLink}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink size={20}/> Abrir Pasta & WhatsApp
          </button>

        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;