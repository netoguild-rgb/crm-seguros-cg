import React from 'react';
import { X, Phone, Calendar, User, FileText, Trash2, ExternalLink, Download } from 'lucide-react';

const LeadModal = ({ lead, onClose, onDelete }) => {
  if (!lead) return null;

  // Parser seguro do JSON
  let extraData = {};
  try {
    extraData = typeof lead.dados_extras === 'string' 
      ? JSON.parse(lead.dados_extras) 
      : lead.dados_extras || {};
  } catch (e) { console.error("Erro parser", e); }

  const displayData = { ...extraData, ...lead };
  // Campos que já mostramos no header ou que são técnicos
  const ignoredKeys = ['id', 'dados_extras', 'criadoEm', 'updatedAt', 'status', 'nome', 'whatsapp', 'email', 'cpf'];

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

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="flex gap-3 mb-6">
            <a href={`https://wa.me/55${lead.whatsapp}`} target="_blank" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition">
              <Phone size={20}/> WhatsApp
            </a>
            <button onClick={() => { if(confirm('Excluir este lead?')) onDelete(lead.id); }} className="px-4 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg transition font-medium">
              <Trash2 size={20}/>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Seguro/Interesse</span>
                <p className="font-semibold text-slate-800 text-lg">{lead.tipo_seguro || 'Geral'}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Veículo</span>
                <p className="font-semibold text-slate-800 text-lg">{lead.modelo_veiculo || '---'}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-200">
            <FileText size={20} className="text-crm-500"/> Detalhes & Arquivos
          </h3>
          
          <div className="space-y-3">
            {Object.entries(displayData).map(([key, value]) => {
                if (ignoredKeys.includes(key) || !value) return null;
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const isLink = typeof value === 'string' && (value.startsWith('http') || isUrl(value));

                return (
                    <div key={key} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-white rounded-lg border border-slate-100 hover:border-crm-500/30 transition">
                        <span className="font-medium text-slate-500 mb-1 sm:mb-0">{label}</span>
                        {isLink ? (
                            <a href={value} target="_blank" rel="noreferrer" className="text-crm-600 hover:underline flex items-center gap-1 font-medium bg-crm-100 px-3 py-1 rounded-full text-sm w-fit">
                                <ExternalLink size={14}/> Abrir Link / Arquivo
                            </a>
                        ) : (
                            <span className="text-slate-900 font-semibold text-right break-words max-w-[60%]">{value.toString()}</span>
                        )}
                    </div>
                )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadModal;