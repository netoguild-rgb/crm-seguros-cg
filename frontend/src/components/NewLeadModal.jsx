// ARQUIVO: frontend/src/components/NewLeadModal.jsx
import React, { useState } from 'react';
import { X, Save, User, Car, Shield, FileText, FolderPlus } from 'lucide-react';
import { createLead } from '../services/api';

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead({ ...formData, status: 'NOVO' });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao criar lead.');
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ label, name, type = "text", placeholder, required = false }) => (
    <div className="flex flex-col gap-1 mb-2">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        required={required}
        type={type} 
        name={name} 
        value={formData[name]} 
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-crm-500 focus:border-crm-500 outline-none transition bg-white text-slate-800"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-float w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-slate-200">
        
        {/* Header Style Salesforce */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <div className="bg-crm-500 p-2 rounded text-white"><User size={20}/></div>
             <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">Novo Lead</h2>
                <p className="text-xs text-slate-500">Preencha os dados para criar um novo registro.</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded transition"><X size={20}/></button>
        </div>

        {/* Tabs Underline */}
        <div className="flex px-6 border-b border-slate-200 bg-white">
          {[
            { id: 'pessoal', label: 'Dados Pessoais' },
            { id: 'veiculo', label: 'Veículo' },
            { id: 'seguro', label: 'Coberturas' },
            { id: 'extra', label: 'Arquivos & Obs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors
                ${activeTab === tab.id ? 'border-crm-500 text-crm-500' : 'border-transparent text-slate-500 hover:text-crm-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 bg-crm-50/50">
          
          {activeTab === 'pessoal' && (
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <Input label="Nome Completo" name="nome" placeholder="Ex: João da Silva" required />
              <Input label="WhatsApp" name="whatsapp" placeholder="Ex: 83999999999" required />
              <Input label="E-mail" name="email" type="email" />
              <Input label="CPF" name="cpf" />
              <Input label="Profissão" name="profissao" />
            </div>
          )}

          {activeTab === 'veiculo' && (
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <Input label="Modelo do Veículo" name="modelo_veiculo" />
              <Input label="Placa" name="placa" />
              <Input label="Ano do Veículo" name="ano_do_veiculo" />
              <Input label="Renavam" name="renavan" />
              <div className="sm:col-span-2 flex flex-col gap-1 mb-2">
                 <label className="text-[11px] font-bold text-slate-500 uppercase">Uso do Veículo</label>
                 <select name="uso_veiculo" value={formData.uso_veiculo} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white focus:ring-1 focus:ring-crm-500 outline-none">
                    <option value="">Selecione...</option>
                    <option value="Passeio">Passeio</option>
                    <option value="Aplicativo">Aplicativo (Uber)</option>
                    <option value="Comercial">Comercial</option>
                 </select>
              </div>
            </div>
          )}

          {activeTab === 'seguro' && (
            <div className="bg-white p-4 rounded border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
               <div className="sm:col-span-2 flex flex-col gap-1 mb-2">
                 <label className="text-[11px] font-bold text-slate-500 uppercase">Tipo de Seguro</label>
                 <select name="tipo_seguro" value={formData.tipo_seguro} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-white font-bold text-crm-600 focus:ring-1 focus:ring-crm-500 outline-none">
                    <option value="Seguro Auto">Seguro Auto</option>
                    <option value="Seguro Moto">Seguro Moto</option>
                    <option value="Seguro Vida">Seguro Vida</option>
                    <option value="Plano de Saúde">Plano de Saúde</option>
                    <option value="Residencial">Residencial</option>
                 </select>
              </div>
              <Input label="Cobertura Terceiros (R$)" name="cobertura_terceiros" />
              <Input label="Cobertura Roubo" name="cobertura_roubo" />
            </div>
          )}

          {activeTab === 'extra' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-white border border-slate-200 rounded shadow-sm">
                <h4 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                    <FolderPlus size={16} className="text-crm-500"/> Link Externo (Drive/Dropbox)
                </h4>
                <Input name="link_pasta" placeholder="https://..." />
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded shadow-sm">
                 <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">Observações Finais</label>
                 <textarea 
                    name="obs_final" 
                    value={formData.obs_final} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-crm-500 outline-none h-24 resize-none"
                    placeholder="Detalhes adicionais..."
                 />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded text-sm font-bold transition">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 bg-crm-500 hover:bg-crm-600 text-white rounded text-sm shadow-sm flex items-center gap-2 font-bold transition">
            {loading ? 'Salvando...' : 'Salvar Lead'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewLeadModal;