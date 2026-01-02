// ARQUIVO: frontend/src/components/LeadModal.jsx
import React, { useState } from 'react';
import { X, Phone, Calendar, User, FileText, Trash2, ExternalLink, FolderOpen, Cloud, Edit, Save } from 'lucide-react';
import { updateLead } from '../services/api';
import WhatsAppModal from './WhatsAppModal'; // Importe o Modal Novo

const LeadModal = ({ lead, onClose, onDelete, onUpdate }) => {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState('detalhes');
  const [showWaModal, setShowWaModal] = useState(false); // Controle do Modal de Disparo

  // ... (Estados do link da pasta individual - MANTIDOS IGUAIS) ...
  const [pastaLink, setPastaLink] = useState(lead.link_pasta || '');
  const [isEditingLink, setIsEditingLink] = useState(!lead.link_pasta);
  const [loadingLink, setLoadingLink] = useState(false);

  const handleSaveLink = async () => {
    setLoadingLink(true);
    try {
      await updateLead(lead.id, { link_pasta: pastaLink });
      lead.link_pasta = pastaLink;
      setIsEditingLink(false);
      if(onUpdate) onUpdate();
      alert('Local dos arquivos salvo com sucesso!');
    } catch (error) { alert('Erro ao salvar.'); } finally { setLoadingLink(false); }
  };

  // Parser do JSON
  let extraData = {};
  try { extraData = typeof lead.dados_extras === 'string' ? JSON.parse(lead.dados_extras) : lead.dados_extras || {}; } catch (e) {}
  const displayData = { ...extraData, ...lead };
  const ignoredKeys = ['id', 'dados_extras', 'criadoEm', 'updatedAt', 'status', 'nome', 'whatsapp', 'email', 'cpf', 'tipo_seguro', 'modelo_veiculo', 'link_pasta'];
  const isUrl = (s) => { try { return Boolean(new URL(s)); } catch(e){ return false; } }

  return (
    <>
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="bg-crm-900 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-2xl font-bold">{lead.nome || 'Lead Sem Nome'}</h2>
            <div className="flex gap-4 mt-2 text-slate-300 text-sm">
              <span className="flex items-center gap-1"><User size={14}/> {lead.id}</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(lead.criadoEm).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X size={20}/></button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 bg-slate-50">
            <button onClick={() => setActiveTab('detalhes')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'detalhes' ? 'border-crm-600 text-crm-600 bg-white' : 'border-transparent text-slate-500'}`}>
                <FileText size={18}/> Detalhes
            </button>
            <button onClick={() => setActiveTab('arquivos')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'arquivos' ? 'border-crm-600 text-crm-600 bg-white' : 'border-transparent text-slate-500'}`}>
                <FolderOpen size={18}/> Pasta Cliente
            </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {activeTab === 'detalhes' && (
            <div className="animate-fade-in">
                {/* BOTÕES DE AÇÃO - ATUALIZADO */}
                <div className="flex gap-2 mb-6 flex-wrap sm:flex-nowrap">
                    {/* Botão WhatsApp Comum */}
                    <a href={`https://wa.me/55${lead.whatsapp}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition">
                      <Phone size={20}/> WhatsApp
                    </a>

                    {/* NOVO BOTÃO: Disparo Nuvem */}
                    <button 
                        onClick={() => setShowWaModal(true)} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition"
                    >
                        <Cloud size={20}/> Disparo Nuvem
                    </button>

                    <button onClick={() => { if(confirm('Excluir?')) onDelete(lead.id); }} className="px-4 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={20}/>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Seguro</span>
                        <p className="font-semibold text-slate-800 text-lg">{lead.tipo_seguro || 'Geral'}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase">Veículo</span>
                        <p className="font-semibold text-slate-800 text-lg">{lead.modelo_veiculo || '---'}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {Object.entries(displayData).map(([key, value]) => {
                        if (ignoredKeys.includes(key) || !value) return null;
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const isLink = typeof value === 'string' && (value.startsWith('http') || isUrl(value));
                        return (
                            <div key={key} className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
                                <span className="font-medium text-slate-500 text-sm">{label}</span>
                                {isLink ? (
                                    <a href={value} target="_blank" rel="noreferrer" className="text-crm-600 hover:underline text-xs flex items-center gap-1 bg-crm-100 px-2 py-1 rounded-full"><ExternalLink size={12}/> Link</a>
                                ) : (
                                    <span className="text-slate-900 font-semibold text-sm">{value.toString()}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
          )}

          {activeTab === 'arquivos' && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
                <div className="bg-crm-100 p-6 rounded-full text-crm-600"><FolderOpen size={64} /></div>
                <div className="max-w-md">
                    <h3 className="text-xl font-bold text-slate-800">Pasta do Cliente</h3>
                    <p className="text-slate-500 text-sm mt-2">Arquivos específicos deste lead.</p>
                </div>

                {!isEditingLink && lead.link_pasta && (
                    <div className="w-full space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100 text-slate-600 text-sm break-all justify-center">
                            {lead.link_pasta}
                        </div>
                        <a href={lead.link_pasta} target="_blank" rel="noreferrer" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition">
                            <ExternalLink size={20}/> Abrir Pasta
                        </a>
                        <button onClick={() => setIsEditingLink(true)} className="text-slate-500 underline text-sm flex items-center justify-center gap-1 w-full"><Edit size={14}/> Alterar</button>
                    </div>
                )}

                {isEditingLink && (
                    <div className="w-full bg-white p-5 rounded-xl border-2 border-dashed border-slate-300 shadow-sm text-left">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Link ou Caminho</label>
                        <div className="flex gap-2">
                            <input type="text" value={pastaLink} onChange={(e) => setPastaLink(e.target.value)} placeholder="Ex: https://drive.google.com/..." className="flex-1 p-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-crm-500"/>
                            <button onClick={handleSaveLink} disabled={loadingLink} className="bg-crm-600 text-white px-4 rounded-lg"><Save size={18}/></button>
                        </div>
                    </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
    
    {/* MODAL DE DISPARO (Renderizado condicionalmente) */}
    {showWaModal && <WhatsAppModal lead={lead} onClose={() => setShowWaModal(false)} />}
    </>
  );
};

export default LeadModal;