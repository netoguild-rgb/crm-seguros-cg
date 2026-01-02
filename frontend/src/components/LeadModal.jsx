import React, { useState } from 'react';
import { X, Phone, Calendar, User, FileText, Trash2, ExternalLink, FolderOpen, Edit, Save, FileDown } from 'lucide-react';
import { updateLead } from '../services/api';
import jsPDF from 'jspdf'; // Certifique-se de que está instalado

const LeadModal = ({ lead, onClose, onDelete, onUpdate }) => {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState('detalhes');
  const [pastaLink, setPastaLink] = useState(lead.link_pasta || '');
  const [isEditingLink, setIsEditingLink] = useState(!lead.link_pasta);
  
  // --- TAREFA 3: GERAR PDF ---
  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Ficha do Cliente", 105, 25, null, null, "center");
    
    // Conteúdo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    let y = 50;
    const addLine = (label, value) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, 20, y);
        doc.setFont(undefined, 'normal');
        doc.text(value || '---', 70, y);
        y += 10;
    };

    addLine("Nome", lead.nome);
    addLine("WhatsApp", lead.whatsapp);
    addLine("Email", lead.email);
    addLine("CPF", lead.cpf);
    y += 5;
    addLine("Seguro", lead.tipo_seguro);
    addLine("Veículo", lead.modelo_veiculo);
    addLine("Placa", lead.placa);
    addLine("Status", lead.status);

    // Rodapé
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Gerado em ${new Date().toLocaleDateString()}`, 20, 280);

    doc.save(`Ficha_${lead.nome}.pdf`);
  };
  // ---------------------------

  const handleSaveLink = async () => {
    try {
      await updateLead(lead.id, { link_pasta: pastaLink });
      lead.link_pasta = pastaLink;
      setIsEditingLink(false);
      if(onUpdate) onUpdate();
      alert('Pasta salva!');
    } catch (error) { alert('Erro ao salvar.'); }
  };

  let extraData = {};
  try { extraData = typeof lead.dados_extras === 'string' ? JSON.parse(lead.dados_extras) : lead.dados_extras || {}; } catch (e) {}
  const displayData = { ...extraData, ...lead };
  const ignoredKeys = ['id', 'dados_extras', 'criadoEm', 'updatedAt', 'status', 'nome', 'whatsapp', 'email', 'cpf', 'tipo_seguro', 'modelo_veiculo', 'link_pasta'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        
        <div className="bg-slate-900 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-2xl font-bold">{lead.nome || 'Lead Sem Nome'}</h2>
            <div className="flex gap-4 mt-2 text-slate-300 text-sm">
              <span className="flex items-center gap-1"><User size={14}/> {lead.id}</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(lead.criadoEm).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X size={20}/></button>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50">
            <button onClick={() => setActiveTab('detalhes')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'detalhes' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500'}`}>Detalhes</button>
            <button onClick={() => setActiveTab('arquivos')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'arquivos' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500'}`}>Pasta Cliente</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {activeTab === 'detalhes' && (
            <div className="animate-fade-in">
                <div className="flex gap-2 mb-6 flex-wrap sm:flex-nowrap">
                    <a href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md">
                      <Phone size={20}/> WhatsApp
                    </a>

                    {/* TAREFA 3: Botão PDF no lugar de Promoção */}
                    <button onClick={handleGeneratePDF} className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md">
                        <FileDown size={20}/> Gerar PDF
                    </button>

                    <button onClick={() => { if(confirm('Excluir?')) onDelete(lead.id); }} className="px-4 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg">
                      <Trash2 size={20}/>
                    </button>
                </div>

                <div className="space-y-3">
                    {Object.entries(displayData).map(([key, value]) => {
                        if (ignoredKeys.includes(key) || !value) return null;
                        return (
                            <div key={key} className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
                                <span className="font-medium text-slate-500 text-sm uppercase">{key.replace(/_/g, ' ')}</span>
                                <span className="text-slate-900 font-semibold text-sm">{value.toString()}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
          )}
          {activeTab === 'arquivos' && (
             <div className="text-center space-y-4">
                <FolderOpen size={48} className="mx-auto text-slate-300"/>
                {!isEditingLink && lead.link_pasta ? (
                    <div className="space-y-2">
                        <p className="text-sm bg-white p-2 rounded border">{lead.link_pasta}</p>
                        <a href={lead.link_pasta} target="_blank" rel="noreferrer" className="block w-full bg-blue-600 text-white py-2 rounded font-bold">Abrir Pasta</a>
                        <button onClick={() => setIsEditingLink(true)} className="text-xs underline text-slate-500">Alterar</button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input value={pastaLink} onChange={e => setPastaLink(e.target.value)} placeholder="Link da Pasta..." className="flex-1 p-2 border rounded"/>
                        <button onClick={handleSaveLink} className="bg-blue-600 text-white px-4 rounded"><Save size={16}/></button>
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