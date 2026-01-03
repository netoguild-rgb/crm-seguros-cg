import React, { useState, useEffect } from 'react';
import { Settings, Save, Palette, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { getConfig, saveConfig } from '../services/api';

const ConfigPage = ({ onConfigUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({});

  useEffect(() => {
    getConfig().then(res => { setConfig(res.data || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig(config);
      if(onConfigUpdate) onConfigUpdate(config);
      alert('Salvo com sucesso!');
    } catch (error) { alert('Erro ao salvar'); } finally { setSaving(false); }
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg shadow-card border border-slate-200 mb-6 overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                <Icon size={16} className="text-crm-500"/> {title}
            </h3>
        </div>
        <div className="p-6 space-y-4">{children}</div>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando configurações...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
        <p className="text-slate-500">Personalize a aparência e comportamentos do CRM.</p>
      </div>

      <Section title="Identidade Visual" icon={Palette}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome da Corretora</label>
                <input type="text" value={config.broker_name || ''} 
                    onChange={(e) => setConfig({...config, broker_name: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-crm-500 outline-none" />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Cor Principal (Hex)</label>
                <div className="flex gap-2">
                    <input type="color" value={config.primary_color || '#0176D3'} 
                        onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                        className="h-9 w-9 border rounded cursor-pointer" />
                    <input type="text" value={config.primary_color || ''} 
                        onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                        className="flex-1 p-2 border border-slate-300 rounded text-sm uppercase" />
                </div>
            </div>
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">URL da Logo (Opcional)</label>
                <input type="text" value={config.logo_url || ''} 
                    onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-crm-500 outline-none" placeholder="https://..." />
            </div>
         </div>
      </Section>

      <Section title="Automação & Links" icon={LinkIcon}>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Link da Pasta de Promoções (Nuvem)</label>
            <input type="text" value={config.promo_folder_link || ''}
                onChange={(e) => setConfig({...config, promo_folder_link: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-crm-500 outline-none" placeholder="Link do Google Drive ou Dropbox" />
         </div>
      </Section>

      <Section title="WhatsApp Padrão" icon={MessageSquare}>
         <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Cabeçalho da Mensagem</label>
            <textarea rows="3" value={config.message_header || ''}
                onChange={(e) => setConfig({...config, message_header: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-crm-500 outline-none" 
                placeholder="Ex: Olá, somos da Corretora X..." />
         </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="bg-crm-500 hover:bg-crm-600 text-white font-bold py-3 px-8 rounded shadow-lg flex items-center gap-2 transition transform hover:-translate-y-0.5">
           {saving ? 'Salvando...' : <><Save size={18}/> Salvar Alterações</>}
        </button>
      </div>
    </div>
  );
};
export default ConfigPage;