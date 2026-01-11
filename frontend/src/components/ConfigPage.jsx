import React, { useState, useEffect } from 'react';
import { Settings, Save, Palette, Link as LinkIcon, MessageSquare, CheckCircle, Loader2, Eye } from 'lucide-react';
import { getConfig, saveConfig } from '../services/api';

const ConfigPage = ({ onConfigUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({});

  useEffect(() => {
    getConfig().then(res => { setConfig(res.data || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig(config);
      if (onConfigUpdate) onConfigUpdate(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title, icon: Icon, children, description }) => (
    <div className="glass-card rounded-2xl overflow-hidden mb-6 hover-lift">
      <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200 flex items-start gap-4">
        <div className="bg-gradient-to-br from-crm-500 to-accent-purple p-3 rounded-xl text-white shadow-lg">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );

  const InputLabel = ({ children, required }) => (
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block flex items-center gap-1">
      {children}
      {required && <span className="text-red-500">*</span>}
    </label>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-slate-500">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-crm-500 to-accent-purple p-3 rounded-xl text-white shadow-lg">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
            <p className="text-slate-500">Personalize a aparência e comportamentos do CRM</p>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="glass-card rounded-2xl p-6 mb-6 border-2 border-dashed border-crm-200 bg-gradient-to-r from-crm-50 to-indigo-50">
        <div className="flex items-center gap-2 text-crm-600 mb-4">
          <Eye size={18} />
          <span className="text-sm font-bold uppercase tracking-wide">Preview</span>
        </div>
        <div
          className="rounded-xl p-4 text-white font-bold text-lg shadow-lg transition-all duration-300"
          style={{ backgroundColor: config.primary_color || '#667eea' }}
        >
          {config.broker_name || 'Nome da Corretora'}
        </div>
      </div>

      <Section
        title="Identidade Visual"
        icon={Palette}
        description="Configure a marca e cores do seu CRM"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputLabel>Nome da Corretora</InputLabel>
            <input
              type="text"
              value={config.broker_name || ''}
              onChange={(e) => setConfig({ ...config, broker_name: e.target.value })}
              placeholder="Ex: CG Corretora de Seguros"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 outline-none transition-all hover:border-slate-300 shadow-sm"
            />
          </div>
          <div>
            <InputLabel>Cor Principal</InputLabel>
            <div className="flex gap-3">
              <div
                className="w-14 h-12 rounded-xl cursor-pointer shadow-lg hover:scale-105 transition-transform border-2 border-white"
                style={{ backgroundColor: config.primary_color || '#667eea' }}
                onClick={() => document.getElementById('colorPicker').click()}
              />
              <input
                type="color"
                id="colorPicker"
                value={config.primary_color || '#667eea'}
                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                className="sr-only"
              />
              <input
                type="text"
                value={config.primary_color || ''}
                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                placeholder="#667eea"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm uppercase font-mono focus:ring-2 focus:ring-crm-500/50 outline-none hover:border-slate-300 shadow-sm transition-all"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <InputLabel>URL da Logo (Opcional)</InputLabel>
            <input
              type="text"
              value={config.logo_url || ''}
              onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
              placeholder="https://exemplo.com/logo.png"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 outline-none transition-all hover:border-slate-300 shadow-sm"
            />
            <p className="text-xs text-slate-400 mt-2">Recomendado: PNG transparente, 200x200px mínimo</p>
          </div>
        </div>
      </Section>

      <Section
        title="Automação & Links"
        icon={LinkIcon}
        description="Configure links de pastas compartilhadas"
      >
        <div>
          <InputLabel>Link da Pasta de Promoções (Nuvem)</InputLabel>
          <input
            type="text"
            value={config.promo_folder_link || ''}
            onChange={(e) => setConfig({ ...config, promo_folder_link: e.target.value })}
            placeholder="https://drive.google.com/..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 outline-none transition-all hover:border-slate-300 shadow-sm"
          />
          <p className="text-xs text-slate-400 mt-2">Este link será usado para acessar materiais promocionais</p>
        </div>
      </Section>

      <Section
        title="Mensagens WhatsApp"
        icon={MessageSquare}
        description="Personalize as mensagens enviadas aos clientes"
      >
        <div>
          <InputLabel>Cabeçalho Padrão da Mensagem</InputLabel>
          <textarea
            rows="4"
            value={config.message_header || ''}
            onChange={(e) => setConfig({ ...config, message_header: e.target.value })}
            placeholder="Ex: Olá! Somos da [Nome da Corretora] e estamos entrando em contato para..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 outline-none resize-none transition-all hover:border-slate-300 shadow-sm"
          />
          <p className="text-xs text-slate-400 mt-2">Esta mensagem será incluída no início de todos os envios em massa</p>
        </div>
      </Section>

      {/* Save Button */}
      <div className="flex justify-end sticky bottom-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            px-8 py-4 rounded-2xl text-white font-bold text-base shadow-float 
            flex items-center gap-3 transition-all duration-300 
            hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed
            ${saved
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-glow-success'
              : 'bg-gradient-to-r from-crm-500 to-accent-purple hover:shadow-glow'
            }
          `}
        >
          {saving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <CheckCircle size={20} />
              Salvo com Sucesso!
            </>
          ) : (
            <>
              <Save size={20} />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfigPage;