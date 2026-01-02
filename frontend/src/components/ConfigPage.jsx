// ARQUIVO: frontend/src/components/ConfigPage.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { getConfig, saveConfig } from '../services/api';

const ConfigPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({ promo_folder_link: '', message_header: '' });

  useEffect(() => {
    getConfig().then(res => {
      setConfig(res.data || {});
      setLoading(false);
    }).catch(err => {
        console.error(err);
        setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig(config);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-slate-500">Carregando configurações...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
        
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header da Página */}
        <div className="bg-slate-50 p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="text-crm-600"/> Configurações do Sistema
            </h2>
            <p className="text-slate-500 text-sm mt-1">Gerencie links de campanhas e padrões de mensagens.</p>
        </div>

        <div className="p-8 space-y-8">
            
            {/* Bloco 1: Campanhas */}
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Save size={24} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-base font-bold text-slate-800 mb-2">
                            Pasta de Promoções / Campanhas (Nuvem)
                        </label>
                        <p className="text-sm text-slate-500 mb-3">
                            Cole aqui o link da pasta (Google Drive, Dropbox) onde ficam as imagens das suas promoções atuais.
                            Ao clicar no botão "Promoções" no lead, esse link será aberto.
                        </p>
                        <input 
                            type="text" 
                            value={config.promo_folder_link || ''}
                            onChange={(e) => setConfig({...config, promo_folder_link: e.target.value})}
                            placeholder="Ex: https://drive.google.com/drive/folders/..."
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-crm-500 outline-none text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-slate-100"/>

            {/* Bloco 2: Mensagem Padrão */}
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-base font-bold text-slate-800 mb-2">
                            Cabeçalho Padrão (WhatsApp)
                        </label>
                        <p className="text-sm text-slate-500 mb-3">
                            Este texto aparecerá automaticamente no topo de todas as mensagens enviadas pela função "Disparo Promoções".
                        </p>
                        <textarea 
                            rows="5"
                            value={config.message_header || ''}
                            onChange={(e) => setConfig({...config, message_header: e.target.value})}
                            placeholder="Ex: Olá! Aqui é da Seguros CG. Gostaria de apresentar nossas novas ofertas..."
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-crm-500 outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Footer com Botão */}
            <div className="pt-4 flex justify-end">
                <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-crm-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                {saving ? 'Salvando...' : <><Save size={20}/> Salvar Alterações</>}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ConfigPage;