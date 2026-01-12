// ARQUIVO: frontend/src/components/NewLeadModal.jsx
import React, { useState } from 'react';
import { X, Save, User, Car, Shield, FileText, FolderPlus, CheckCircle, ChevronRight } from 'lucide-react';
import { createLead } from '../services/api';

// Componente Input FORA do NewLeadModal para evitar perda de foco
const FormInput = ({ label, name, type = "text", placeholder, required = false, value, onChange }) => (
  <div className="flex flex-col gap-1.5 mb-3">
    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      required={required}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 outline-none transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-white hover:border-slate-300 dark:hover:border-slate-500 shadow-sm placeholder-slate-400 dark:placeholder-slate-400"
    />
  </div>
);

const NewLeadModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoal');

  const [formData, setFormData] = useState({
    nome: '', whatsapp: '', email: '', cpf: '', profissao: '',
    modelo_veiculo: '', placa: '', ano_do_veiculo: '', renavan: '', uso_veiculo: '',
    tipo_seguro: 'Seguro Auto', cobertura_terceiros: '', cobertura_roubo: '', carro_reserva: '', km_guincho: '',
    plano_saude: '', motivo_vida: '', capital_vida: '', preferencia_rede: '', idades_saude: '',
    link_pasta: '', obs_final: ''
  });

  const tabs = [
    { id: 'pessoal', label: 'Pessoal', icon: User },
    { id: 'veiculo', label: 'Veículo', icon: Car },
    { id: 'seguro', label: 'Coberturas', icon: Shield },
    { id: 'extra', label: 'Extras', icon: FileText },
  ];

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await createLead({ ...formData, status: 'NOVO' });
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTab = () => {
    const nextIndex = currentTabIndex + 1;
    if (nextIndex < tabs.length) {
      setActiveTab(tabs[nextIndex].id);
    }
  };

  const prevTab = () => {
    const prevIndex = currentTabIndex - 1;
    if (prevIndex >= 0) {
      setActiveTab(tabs[prevIndex].id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-3xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-crm-500 to-accent-purple p-3 rounded-xl text-white shadow-lg">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">Novo Lead</h2>
              <p className="text-sm text-slate-500">Preencha os dados para criar um novo registro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2.5 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              const isCompleted = index < currentTabIndex;

              return (
                <React.Fragment key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-gradient-to-r from-crm-500 to-accent-purple text-white shadow-lg'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Icon size={18} />
                    )}
                    <span className="text-sm font-bold hidden sm:inline">{tab.label}</span>
                  </button>
                  {index < tabs.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 rounded-full transition-colors duration-300 ${index < currentTabIndex ? 'bg-emerald-400' : 'bg-slate-200'
                      }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-slate-50 to-white max-h-[50vh]">

          {activeTab === 'pessoal' && (
            <div className="glass-card p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="sm:col-span-2">
                <FormInput label="Nome Completo" name="nome" placeholder="Ex: João da Silva" required value={formData.nome} onChange={handleChange} />
              </div>
              <FormInput label="WhatsApp" name="whatsapp" placeholder="Ex: 83999999999" required value={formData.whatsapp} onChange={handleChange} />
              <FormInput label="E-mail" name="email" type="email" placeholder="email@exemplo.com" value={formData.email} onChange={handleChange} />
              <FormInput label="CPF" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} />
              <FormInput label="Profissão" name="profissao" placeholder="Ex: Empresário" value={formData.profissao} onChange={handleChange} />
            </div>
          )}

          {activeTab === 'veiculo' && (
            <div className="glass-card p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <FormInput label="Modelo do Veículo" name="modelo_veiculo" placeholder="Ex: Honda Civic 2023" value={formData.modelo_veiculo} onChange={handleChange} />
              <FormInput label="Placa" name="placa" placeholder="ABC-1234" value={formData.placa} onChange={handleChange} />
              <FormInput label="Ano do Veículo" name="ano_do_veiculo" placeholder="2023" value={formData.ano_do_veiculo} onChange={handleChange} />
              <FormInput label="Renavam" name="renavan" placeholder="00000000000" value={formData.renavan} onChange={handleChange} />
              <div className="sm:col-span-2 flex flex-col gap-1.5 mb-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Uso do Veículo</label>
                <select
                  name="uso_veiculo"
                  value={formData.uso_veiculo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 shadow-sm transition-all"
                >
                  <option value="">Selecione...</option>
                  <option value="Passeio">Passeio</option>
                  <option value="Aplicativo">Aplicativo (Uber)</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'seguro' && (
            <div className="glass-card p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div className="sm:col-span-2 flex flex-col gap-1.5 mb-3">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tipo de Seguro</label>
                <select
                  name="tipo_seguro"
                  value={formData.tipo_seguro}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 font-bold text-crm-600 dark:text-crm-400 focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 shadow-sm transition-all"
                >
                  <option value="Seguro Auto">🚗 Seguro Auto</option>
                  <option value="Seguro Moto">🏍️ Seguro Moto</option>
                  <option value="Seguro Vida">❤️ Seguro Vida</option>
                  <option value="Plano de Saúde">🏥 Plano de Saúde</option>
                  <option value="Residencial">🏠 Residencial</option>
                </select>
              </div>
              <FormInput label="Cobertura Terceiros (R$)" name="cobertura_terceiros" placeholder="Ex: R$ 100.000" value={formData.cobertura_terceiros} onChange={handleChange} />
              <FormInput label="Cobertura Roubo" name="cobertura_roubo" placeholder="Sim/Não" value={formData.cobertura_roubo} onChange={handleChange} />
            </div>
          )}

          {activeTab === 'extra' && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-card p-5 rounded-2xl">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
                  <FolderPlus size={18} className="text-crm-500" /> Link Externo (Drive/Dropbox)
                </h4>
                <FormInput name="link_pasta" label="URL" placeholder="https://drive.google.com/..." value={formData.link_pasta} onChange={handleChange} />
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Observações Finais</label>
                <textarea
                  name="obs_final"
                  value={formData.obs_final}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-crm-500/50 focus:border-crm-500 outline-none h-28 resize-none hover:border-slate-300 dark:hover:border-slate-500 shadow-sm transition-all placeholder-slate-400"
                  placeholder="Detalhes adicionais sobre o lead..."
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3">
          <div>
            {currentTabIndex > 0 && (
              <button
                type="button"
                onClick={prevTab}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all"
              >
                ← Voltar
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all"
            >
              Cancelar
            </button>
            {currentTabIndex < tabs.length - 1 ? (
              <button
                type="button"
                onClick={nextTab}
                className="px-6 py-2.5 bg-gradient-to-r from-crm-500 to-accent-purple hover:shadow-glow text-white rounded-xl text-sm shadow-lg flex items-center gap-2 font-bold transition-all hover:-translate-y-0.5"
              >
                Próximo <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-glow-success text-white rounded-xl text-sm shadow-lg flex items-center gap-2 font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner w-4 h-4 border-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Criar Lead
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewLeadModal;