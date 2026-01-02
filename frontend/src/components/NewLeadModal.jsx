// ARQUIVO: frontend/src/components/NewLeadModal.jsx
import React, { useState } from 'react';
import { X, Save, User, Car, Shield, FileText, FolderPlus } from 'lucide-react';
import { createLead } from '../services/api';

const NewLeadModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoal'); 

  const [formData, setFormData] = useState({
    // Pessoais Basicos
    nome: '', 
    whatsapp: '',
    email: '',
    cpf: '',
    profissao: '',
    
    // Veículo
    modelo_veiculo: '',
    placa: '',
    ano_do_veiculo: '',
    renavan: '',
    uso_veiculo: '',
    
    // Seguro
    tipo_seguro: 'Seguro Auto', 
    cobertura_terceiros: '',
    cobertura_roubo: '',
    carro_reserva: '',
    km_guincho: '',
    
    // Vida / Saúde
    plano_saude: '',
    motivo_vida: '',
    capital_vida: '',
    preferencia_rede: '',
    idades_saude: '',

    // Arquivos e Obs
    link_pasta: '', // <--- Novo Campo
    obs_final: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead({ ...formData, status: 'NOVO' });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Erro ao criar lead. Verifique o console.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ label, name, type = "text", placeholder, required = false }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-500 uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input 
        required={required}
        type={type} 
        name={name} 
        value={formData[name]} 
        onChange={handleChange}
        placeholder={placeholder}
        className="p-2 border border-slate-300 rounded focus:ring-2 focus:ring-crm-500 outline-none text-sm transition"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-crm-900 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User size={20}/> Novo Lead Manual
          </h2>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X size={20}/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {[
            { id: 'pessoal', label: 'Dados Pessoais', icon: User },
            { id: 'veiculo', label: 'Veículo', icon: Car },
            { id: 'seguro', label: 'Coberturas', icon: Shield },
            { id: 'extra', label: 'Extra & Arquivos', icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors
                ${activeTab === tab.id ? 'border-crm-500 text-crm-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={16}/> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 bg-white">
          
          {activeTab === 'pessoal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <Input label="Nome Completo" name="nome" placeholder="Ex: João da Silva" required />
              <Input label="WhatsApp" name="whatsapp" placeholder="Ex: 83999999999" required />
              <Input label="E-mail" name="email" type="email" />
              <Input label="CPF" name="cpf" />
              <Input label="Profissão" name="profissao" />
            </div>
          )}

          {activeTab === 'veiculo' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <Input label="Modelo do Veículo" name="modelo_veiculo" />
              <Input label="Placa" name="placa" />
              <Input label="Ano do Veículo" name="ano_do_veiculo" />
              <Input label="Renavam" name="renavan" />
              <div className="sm:col-span-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Uso do Veículo</label>
                 <select name="uso_veiculo" value={formData.uso_veiculo} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded mt-1 text-sm bg-white">
                    <option value="">Selecione...</option>
                    <option value="Passeio">Passeio</option>
                    <option value="Aplicativo">Aplicativo (Uber)</option>
                    <option value="Comercial">Comercial</option>
                 </select>
              </div>
            </div>
          )}

          {activeTab === 'seguro' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
               <div className="sm:col-span-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Seguro</label>
                 <select name="tipo_seguro" value={formData.tipo_seguro} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded mt-1 font-bold text-crm-900 bg-white">
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
            <div className="space-y-6 animate-fade-in">
              
              {/* CAMPO NOVO: PASTA DE ARQUIVOS */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <h4 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2">
                    <FolderPlus size={18}/> Organização de Arquivos
                </h4>
                <Input 
                    label="Link da Pasta (Drive, Dropbox ou Local)" 
                    name="link_pasta" 
                    placeholder="Cole aqui o link ou caminho da pasta..."
                />
                <p className="text-[10px] text-blue-400 mt-1">Opcional: Você pode adicionar isso depois.</p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <Input label="Observações Finais" name="obs_final" placeholder="Detalhes adicionais..." />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition font-medium">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-crm-600 hover:bg-crm-700 text-white rounded-lg shadow-lg flex items-center gap-2 font-bold transition">
            {loading ? 'Salvando...' : <><Save size={18}/> Salvar Lead</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewLeadModal;