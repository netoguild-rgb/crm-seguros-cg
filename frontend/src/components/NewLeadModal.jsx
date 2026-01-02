import React, { useState } from 'react';
import { X, Save, User, Car, Shield, FileText } from 'lucide-react';
import { createLead } from '../services/api';

const NewLeadModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoal'); // pessoal, veiculo, seguro, extra

  // Estado inicial com TODOS os campos solicitados
  const [formData, setFormData] = useState({
    // Pessoais Basicos
    nome: '', // Corresponde a Nome_completo
    whatsapp: '',
    email: '',
    cpf: '',
    profissao: '',
    
    // Condutor
    condutor_principal: '',
    idade_do_condutor: '',

    // Veículo
    modelo_veiculo: '',
    placa: '',
    ano_do_veiculo: '',
    renavan: '',
    uso_veiculo: '',
    
    // Seguro Geral / Coberturas
    tipo_seguro: 'Seguro Auto', // Valor padrão
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

    // Obs
    obs_final: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Envia tudo para o backend. 
      // O backend vai salvar nome, whats, tipo_seguro nas colunas certas 
      // e o resto (renavan, profissao, etc) vai para o JSON dados_extras.
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

  // Componente auxiliar de Input
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

        {/* Tabs de Navegação */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {[
            { id: 'pessoal', label: 'Dados Pessoais', icon: User },
            { id: 'veiculo', label: 'Veículo', icon: Car },
            { id: 'seguro', label: 'Coberturas', icon: Shield },
            { id: 'extra', label: 'Vida/Saúde & Obs', icon: FileText },
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
              <Input label="Idade Condutor" name="idade_do_condutor" />
              <div className="sm:col-span-2">
                <Input label="Nome do Condutor Principal" name="condutor_principal" placeholder="Se for diferente do segurado" />
              </div>
            </div>
          )}

          {activeTab === 'veiculo' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <Input label="Modelo do Veículo" name="modelo_veiculo" placeholder="Ex: Corolla XEi 2.0" />
              <Input label="Placa" name="placa" />
              <Input label="Ano do Veículo" name="ano_do_veiculo" placeholder="Ex: 2020/2021" />
              <Input label="Renavam" name="renavan" />
              <div className="sm:col-span-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Uso do Veículo</label>
                 <select name="uso_veiculo" value={formData.uso_veiculo} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded mt-1 text-sm bg-white">
                    <option value="">Selecione...</option>
                    <option value="Passeio">Passeio / Ida e volta ao trabalho</option>
                    <option value="Aplicativo">Motorista de Aplicativo (Uber/99)</option>
                    <option value="Comercial">Uso Comercial / Visitas</option>
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
              <Input label="Cobertura Terceiros (R$)" name="cobertura_terceiros" placeholder="Ex: 100.000" />
              <Input label="Cobertura Roubo" name="cobertura_roubo" placeholder="Ex: 100% FIPE" />
              <Input label="Carro Reserva" name="carro_reserva" placeholder="Ex: 7 dias, 15 dias..." />
              <Input label="KM Guincho" name="km_guincho" placeholder="Ex: 400km, Ilimitado..." />
            </div>
          )}

          {activeTab === 'extra' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="sm:col-span-2 font-bold text-slate-700 border-b pb-2 mb-2">Vida & Saúde</h3>
                <Input label="Plano de Saúde Atual" name="plano_saude" />
                <Input label="Preferencia de Rede" name="preferencia_rede" />
                <Input label="Idades (p/ Saúde)" name="idades_saude" placeholder="Ex: 30, 28, 5" />
                <Input label="Capital Vida (R$)" name="capital_vida" />
                <div className="sm:col-span-2">
                   <Input label="Motivo do Seguro de Vida" name="motivo_vida" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Observações Finais</label>
                <textarea 
                  name="obs_final" 
                  value={formData.obs_final} 
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-slate-300 rounded mt-1 text-sm outline-none focus:ring-2 focus:ring-crm-500"
                  placeholder="Cole aqui qualquer outra informação relevante..."
                ></textarea>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition font-medium">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-crm-600 hover:bg-crm-700 text-white rounded-lg shadow-lg flex items-center gap-2 font-bold transition transform hover:-translate-y-0.5">
            {loading ? 'Salvando...' : <><Save size={18}/> Salvar Lead</>}
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewLeadModal;