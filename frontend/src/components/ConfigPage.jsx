import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Palette, Building } from 'lucide-react';
import { getConfig, saveConfig } from '../services/api';

const ConfigPage = ({ onConfigUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [config, setConfig] = useState({ 
    promo_folder_link: '', 
    message_header: '',
    broker_name: '',
    primary_color: '#0f172a',
    logo_url: ''
  });

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
      alert('Configurações salvas e aplicadas!');
      // Atualiza o estado global no App.jsx se a função for passada
      if(onConfigUpdate) onConfigUpdate(config); 
    } catch (error) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="text-crm-600"/> Personalização & Sistema
            </h2>
        </div>

        <div className="p-8 space-y-8">
            
            {/* TAREFA 4: Personalização Visual */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Palette size={20}/> Identidade Visual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-bold text-slate-600">Nome da Corretora</label>
                        <input type="text" value={config.broker_name || ''} 
                            onChange={(e) => setConfig({...config, broker_name: e.target.value})}
                            className="w-full p-2 border rounded mt-1" placeholder="Ex: Top Seguros" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-600">Cor Principal (Hex)</label>
                        <div className="flex gap-2">
                            <input type="color" value={config.primary_color || '#0f172a'} 
                                onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                                className="h-10 w-10 border rounded cursor-pointer" />
                            <input type="text" value={config.primary_color || ''} 
                                onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                                className="flex-1 p-2 border rounded" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-bold text-slate-600">URL da Logo (Opcional)</label>
                        <input type="text" value={config.logo_url || ''} 
                            onChange={(e) => setConfig({...config, logo_url: e.target.value})}
                            className="w-full p-2 border rounded mt-1" placeholder="https://..." />
                        <p className="text-xs text-slate-400 mt-1">Cole o link direto da imagem da sua logo.</p>
                    </div>
                </div>
            </div>

            <hr className="border-slate-100"/>

            {/* Configurações de Mensagem e Pasta */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle size={20}/> Operacional
                </h3>
                <div>
                    <label className="text-sm font-bold text-slate-600">Link da Pasta de Promoções (Nuvem)</label>
                    <input type="text" value={config.promo_folder_link || ''}
                        onChange={(e) => setConfig({...config, promo_folder_link: e.target.value})}
                        className="w-full p-2 border rounded mt-1" />
                </div>
                <div>
                    <label className="text-sm font-bold text-slate-600">Cabeçalho Padrão (WhatsApp)</label>
                    <textarea rows="3" value={config.message_header || ''}
                        onChange={(e) => setConfig({...config, message_header: e.target.value})}
                        className="w-full p-2 border rounded mt-1" />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2">
                {saving ? 'Salvando...' : <><Save size={20}/> Salvar Alterações</>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
export default ConfigPage;