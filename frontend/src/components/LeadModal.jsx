// ARQUIVO: frontend/src/components/LeadModal.jsx
import React, { useState } from 'react';
import { X, Phone, Calendar, User, FileText, Trash2, ExternalLink, Folder, FolderOpen, Save, Edit } from 'lucide-react';
import { updateLead } from '../services/api'; 

const LeadModal = ({ lead, onClose, onDelete, onUpdate }) => {
  if (!lead) return null;

  // Estado das Abas
  const [activeTab, setActiveTab] = useState('detalhes'); // 'detalhes' ou 'arquivos'

  // Estados para Edição do Link da Pasta
  const [pastaLink, setPastaLink] = useState(lead.link_pasta || '');
  const [isEditingLink, setIsEditingLink] = useState(!lead.link_pasta); // Se não tem link, já abre editando
  const [loadingLink, setLoadingLink] = useState(false);

  // Função para salvar o link no banco
  const handleSaveLink = async () => {
    setLoadingLink(true);
    try {
      await updateLead(lead.id, { link_pasta: pastaLink });
      
      // Atualiza o objeto localmente para refletir na tela sem recarregar tudo
      lead.link_pasta = pastaLink;
      setIsEditingLink(false);
      
      if(onUpdate) onUpdate(); // Avisa o componente pai se necessário
      alert('Local dos arquivos salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar o link da pasta.');
    } finally {
      setLoadingLink(false);
    }
  };

  // Parser seguro do JSON (dados_extras)
  let extraData = {};
  try {
    extraData = typeof lead.dados_extras === 'string' 
      ? JSON.parse(lead.dados_extras) 
      : lead.dados_extras || {};
  } catch (e) { console.error("Erro parser", e); }

  const displayData = { ...extraData, ...lead };
  
  // Chaves que não queremos exibir na lista genérica
  const ignoredKeys = ['id', 'dados_extras', 'criadoEm', 'updatedAt', 'status', 'nome', 'whatsapp', 'email', 'cpf', 'tipo_seguro', 'modelo_veiculo', 'link_pasta'];

  const isUrl = (string) => {
    try { return Boolean(new URL(string)); } catch(e){ return false; }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-200 bg-slate-50">
            <button 
                onClick={() => setActiveTab('detalhes')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition
                ${activeTab === 'detalhes' ? 'border-crm-600 text-crm-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <FileText size={18}/> Detalhes
            </button>
            <button 
                onClick={() => setActiveTab('arquivos')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition
                ${activeTab === 'arquivos' ? 'border-crm-600 text-crm-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <FolderOpen size={18}/> Arquivos / Pasta
            </button>
        </div>

        {/* Body do Modal */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">

          {/* === ABA 1: DETALHES === */}
          {activeTab === 'detalhes' && (
            <div className="animate-fade-in">
                <div className="flex gap-3 mb-6">
                    <a href={`https://wa.me/55${lead.whatsapp}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition">
                      <Phone size={20}/> WhatsApp
                    </a>
                    <button onClick={() => { if(confirm('Excluir este lead?')) onDelete(lead.id); }} className="px-4 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg transition font-medium">
                      <Trash2 size={20}/>
                    </button>
                </div>

                {/* Cards Resumo */}
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

                {/* Lista de Campos Extras */}
                <div className="space-y-3">
                    {Object.entries(displayData).map(([key, value]) => {
                        if (ignoredKeys.includes(key) || !value) return null;
                        
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const isLink = typeof value === 'string' && (value.startsWith('http') || isUrl(value));

                        return (
                            <div key={key} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-crm-500/30 transition">
                                <span className="font-medium text-slate-500 mb-1 sm:mb-0 text-sm">{label}</span>
                                {isLink ? (
                                    <a href={value} target="_blank" rel="noreferrer" className="text-crm-600 hover:underline flex items-center gap-1 font-medium bg-crm-100 px-3 py-1 rounded-full text-xs w-fit">
                                        <ExternalLink size={14}/> Abrir Link
                                    </a>
                                ) : (
                                    <span className="text-slate-900 font-semibold text-right break-words max-w-[60%] text-sm">{value.toString()}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
          )}

          {/* === ABA 2: ARQUIVOS (PASTA) === */}
          {activeTab === 'arquivos' && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
                
                <div className="bg-crm-100 p-6 rounded-full text-crm-600">
                    <Folder size={64} />
                </div>

                <div className="max-w-md">
                    <h3 className="text-xl font-bold text-slate-800">Local dos Arquivos</h3>
                    <p className="text-slate-500 text-sm mt-2">
                        Gerencie onde os documentos deste cliente estão salvos (Google Drive, Dropbox ou Rede Local).
                    </p>
                </div>

                {/* MODO VISUALIZAÇÃO (Se já tiver link salvo e não estiver editando) */}
                {!isEditingLink && lead.link_pasta && (
                    <div className="w-full space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <div className="text-left">
                            <label className="text-xs font-bold text-slate-400 uppercase">Pasta Vinculada</label>
                            <div className="flex items-center gap-2 mt-1 break-all bg-slate-50 p-2 rounded border border-slate-100 text-slate-600 text-sm">
                                <Folder size={16} className="shrink-0"/> {lead.link_pasta}
                            </div>
                         </div>

                        <a 
                            href={lead.link_pasta} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition transform hover:-translate-y-1"
                            onClick={(e) => {
                                // Se for caminho local (não começa com http), o navegador não abre.
                                // Avisamos o usuário para copiar.
                                if(!lead.link_pasta.startsWith('http')) {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(lead.link_pasta);
                                    alert('Caminho Local copiado! Cole no seu Explorador de Arquivos.');
                                }
                            }}
                        >
                            <ExternalLink size={20}/> Abrir Pasta
                        </a>

                        <button 
                            onClick={() => setIsEditingLink(true)} 
                            className="text-slate-500 hover:text-crm-600 underline text-sm flex items-center justify-center gap-1 w-full mt-2"
                        >
                            <Edit size={14}/> Alterar pasta
                        </button>
                    </div>
                )}

                {/* MODO EDIÇÃO (Se não tiver link ou clicou em alterar) */}
                {isEditingLink && (
                    <div className="w-full bg-white p-5 rounded-xl border-2 border-dashed border-slate-300 shadow-sm animate-fade-in text-left">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                            Cole o Link ou Caminho da Pasta
                        </label>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={pastaLink}
                                onChange={(e) => setPastaLink(e.target.value)}
                                placeholder="Ex: https://drive.google.com/..."
                                className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-crm-500 text-sm"
                            />
                            <button 
                                onClick={handleSaveLink}
                                disabled={loadingLink}
                                className="bg-crm-600 text-white px-4 rounded-lg font-bold hover:bg-crm-700 transition flex items-center gap-2"
                            >
                                {loadingLink ? '...' : <><Save size={18} /> Salvar</>}
                            </button>
                        </div>
                        
                        <p className="text-xs text-slate-400 mt-3 flex items-start gap-1">
                            ℹ️ <b>Dica:</b> Vá até a pasta no seu computador ou no Google Drive, copie o endereço e cole aqui.
                        </p>
                    </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LeadModal;