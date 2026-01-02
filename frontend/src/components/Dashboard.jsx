// ARQUIVO: frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import { Settings, Layout, Save } from 'lucide-react';
import { getConfig, saveConfig } from '../services/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' ou 'config'

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Header / Navegação */}
      <header className="bg-crm-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            CRM Seguros 🚀
          </h1>
          
          <div className="flex bg-crm-800 rounded-lg p-1 gap-1">
            <button 
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'kanban' ? 'bg-white text-crm-900 font-bold shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <Layout size={18} /> Leads (Kanban)
            </button>
            <button 
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'config' ? 'bg-white text-crm-900 font-bold shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <Settings size={18} /> Configurações
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 overflow-hidden">
        {activeTab === 'kanban' ? <KanbanBoard /> : <SettingsTab />}
      </main>
    </div>
  );
};

// Componente Interno da Aba de Configurações
const SettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({ promo_folder_link: '', message_header: '' });

  useEffect(() => {
    getConfig().then(res => {
      setConfig(res.data || {});
      setLoading(false);
    }).catch(err => console.error(err));
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

  if (loading) return <div className="text-center p-10">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Settings className="text-crm-600"/> Configurações de Disparo
      </h2>

      <div className="space-y-6">
        {/* Config 1: Pasta de Promoções */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Link da Pasta de Promoções / Campanhas (Nuvem)
          </label>
          <input 
            type="text" 
            value={config.promo_folder_link || ''}
            onChange={(e) => setConfig({...config, promo_folder_link: e.target.value})}
            placeholder="Ex: https://drive.google.com/drive/folders/..."
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-crm-500 outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Ao clicar em "Disparo Promoções", esta pasta será aberta para você pegar as imagens.
          </p>
        </div>

        {/* Config 2: Cabeçalho Padrão */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Cabeçalho Padrão da Mensagem WhatsApp
          </label>
          <textarea 
            rows="4"
            value={config.message_header || ''}
            onChange={(e) => setConfig({...config, message_header: e.target.value})}
            placeholder="Ex: Olá! Aqui é da Seguros CG. Temos uma novidade para você..."
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-crm-500 outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Este texto aparecerá automaticamente no topo de toda mensagem enviada via "Disparo Promoções".
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition hover:shadow-lg"
        >
          {saving ? 'Salvando...' : <><Save size={20}/> Salvar Alterações</>}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;