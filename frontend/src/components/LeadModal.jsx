import React, { useState } from 'react';
import { X, Phone, Calendar, User, FileText, Trash2, ExternalLink, FolderOpen, Edit, Save, FileDown } from 'lucide-react';
import { updateLead, getConfig } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LeadModal = ({ lead, onClose, onDelete, onUpdate }) => {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState('detalhes');
  const [pastaLink, setPastaLink] = useState(lead.link_pasta || '');
  const [isEditingLink, setIsEditingLink] = useState(!lead.link_pasta);
  const [loadingLink, setLoadingLink] = useState(false);

  // Parse dos dados extras garantindo que seja um objeto
  let extraData = {};
  try { 
    if (typeof lead.dados_extras === 'string') {
        extraData = JSON.parse(lead.dados_extras);
    } else if (lead.dados_extras && typeof lead.dados_extras === 'object') {
        extraData = lead.dados_extras;
    }
  } catch (e) { console.error("Erro parsing JSON", e); }

  // Mescla dados principais com extras para exibição
  const mergedData = { ...extraData, ...lead };

  // --- PDF PROFISSIONAL (Layout igual Relatórios) ---
  const handleGeneratePDF = async () => {
    // Configurações padrão
    let config = { broker_name: 'CRM Seguros', primary_color: '#0f172a' };
    
    // Tenta buscar config atualizada
    try {
        const { data } = await getConfig();
        if(data) config = { 
            broker_name: data.broker_name || config.broker_name, 
            primary_color: data.primary_color || config.primary_color 
        };
    } catch(e) {}

    const doc = new jsPDF();

    // 1. Cabeçalho Colorido
    doc.setFillColor(config.primary_color);
    doc.rect(0, 0, 210, 30, 'F');
    
    // 2. Textos do Cabeçalho
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(config.broker_name.toUpperCase(), 14, 20); // Nome da Corretora
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("FICHA CADASTRAL", 170, 20);

    // 3. Preparar Linhas da Tabela
    // Adiciona campos principais manualmente para garantir ordem
    const tableRows = [
        ['Nome Completo', lead.nome],
        ['Telefone / WhatsApp', lead.whatsapp],
        ['Email', lead.email || '-'],
        ['CPF', lead.cpf || '-'],
        ['Status do Lead', lead.status],
        ['Tipo de Seguro', lead.tipo_seguro || '-'],
        ['Modelo Veículo', lead.modelo_veiculo || '-'],
        ['Placa', lead.placa || '-'],
        ['Ano', lead.ano_veiculo || '-'],
        ['Uso', lead.uso_veiculo || '-'],
    ];

    // Adiciona todos os outros campos dos dados extras
    const ignoreKeys = ['id', 'criadoEm', 'updatedAt', 'nome', 'whatsapp', 'email', 'cpf', 'status', 'tipo_seguro', 'modelo_veiculo', 'placa', 'ano_veiculo', 'uso_veiculo', 'link_pasta', 'dados_extras'];
    
    Object.entries(mergedData).forEach(([key, value]) => {
        if (!ignoreKeys.includes(key) && value && typeof value !== 'object') {
            // Formata a chave (ex: data_nascimento -> Data Nascimento)
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            tableRows.push([label, value.toString()]);
        }
    });

    // 4. Gerar Tabela com autotable
    autoTable(doc, {
        startY: 40,
        head: [['CAMPO', 'INFORMAÇÃO']],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
            fillColor: config.primary_color,
            textColor: 255,
            fontStyle: 'bold',
            halign: 'left'
        },
        styles: { 
            fontSize: 10, 
            cellPadding: 4,
            textColor: 50
        },
        columnStyles: {
            0: { fontStyle: 'bold', width: 70, fillColor: [248, 250, 252] }, // Coluna 1 cinza claro
        }
    });

    // 5. Rodapé
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Documento gerado em ${new Date().toLocaleString()}`, 14, finalY);

    doc.save(`Ficha_${lead.nome}.pdf`);
  };

  const handleSaveLink = async () => {
    setLoadingLink(true);
    try {
      await updateLead(lead.id, { link_pasta: pastaLink });
      lead.link_pasta = pastaLink;
      setIsEditingLink(false);
      if(onUpdate) onUpdate();
      alert('Link da pasta salvo!');
    } catch (error) { alert('Erro ao salvar.'); } finally { setLoadingLink(false); }
  };

  // Campos que não devem aparecer na lista de detalhes visual (mas aparecem no PDF)
  const technicalKeys = ['id', 'dados_extras', 'criadoEm', 'updatedAt', 'link_pasta'];

  const formatKey = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        
        {/* Header Escuro */}
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

        {/* Abas */}
        <div className="flex border-b border-slate-200 bg-slate-50">
            <button onClick={() => setActiveTab('detalhes')} className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'detalhes' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>Detalhes</button>
            <button onClick={() => setActiveTab('arquivos')} className={`flex-1 py-3 text-sm font-bold transition ${activeTab === 'arquivos' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:bg-slate-100'}`}>Pasta Cliente</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {/* ABA DETALHES */}
          {activeTab === 'detalhes' && (
            <div className="animate-fade-in">
                {/* Botões de Ação */}
                <div className="flex gap-2 mb-6 flex-wrap sm:flex-nowrap">
                    <a href={`https://wa.me/55${lead.whatsapp ? lead.whatsapp.replace(/\D/g, '') : ''}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition transform hover:-translate-y-0.5">
                      <Phone size={20}/> WhatsApp
                    </a>

                    <button onClick={handleGeneratePDF} className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition transform hover:-translate-y-0.5">
                        <FileDown size={20}/> Gerar PDF
                    </button>

                    <button onClick={() => { if(confirm('Tem certeza que deseja excluir?')) onDelete(lead.id); }} className="px-4 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={20}/>
                    </button>
                </div>

                {/* Cards Resumo */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                        <span className="text-xs text-slate-400 font-bold uppercase">Status Atual</span>
                        <p className="font-bold text-slate-800 text-lg">{lead.status}</p>
                     </div>
                     <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                        <span className="text-xs text-slate-400 font-bold uppercase">Tipo Seguro</span>
                        <p className="font-bold text-slate-800 text-lg">{lead.tipo_seguro || '-'}</p>
                     </div>
                </div>

                {/* Lista Completa de Dados (CORRIGIDA) */}
                <div className="space-y-1 bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase border-b pb-2 flex items-center gap-2"><FileText size={16}/> Dados Cadastrais</h3>
                    
                    {Object.entries(mergedData).map(([key, value]) => {
                        // Lógica de Filtro Aprimorada: Exibe tudo exceto chaves técnicas
                        if (technicalKeys.includes(key)) return null;
                        
                        // Não exibe se for objeto complexo ou nulo (mas exibe 0 ou string vazia se necessário)
                        if (value === null || typeof value === 'object') return null;

                        const isLink = typeof value === 'string' && value.startsWith('http');

                        return (
                            <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded transition">
                                <span className="font-medium text-slate-500 text-sm">{formatKey(key)}</span>
                                {isLink ? (
                                    <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 bg-blue-50 px-2 py-1 rounded font-bold"><ExternalLink size={12}/> Abrir Link</a>
                                ) : (
                                    <span className="text-slate-900 font-semibold text-sm text-right break-words max-w-[60%]">{value.toString()}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
          )}

          {/* ABA ARQUIVOS */}
          {activeTab === 'arquivos' && (
             <div className="text-center space-y-6 h-full flex flex-col justify-center animate-fade-in">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-blue-500 shadow-sm">
                    <FolderOpen size={40}/>
                </div>
                
                <div>
                    <h3 className="text-lg font-bold text-slate-700">Arquivos na Nuvem</h3>
                    <p className="text-slate-400 text-sm">Gerencie os documentos deste cliente.</p>
                </div>
                
                {!isEditingLink && lead.link_pasta ? (
                    <div className="space-y-3 w-full bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="bg-slate-50 p-3 rounded text-sm break-all text-slate-600 border border-slate-100 flex items-center gap-2 justify-center">
                            <ExternalLink size={14} className="shrink-0"/> {lead.link_pasta}
                        </div>
                        <a href={lead.link_pasta} target="_blank" rel="noreferrer" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition shadow-md transform hover:-translate-y-0.5">
                            Acessar Pasta Agora
                        </a>
                        <button onClick={() => setIsEditingLink(true)} className="text-xs text-slate-400 hover:text-blue-600 underline mt-2 flex items-center justify-center gap-1 w-full">
                            <Edit size={12}/> Alterar Link da Pasta
                        </button>
                    </div>
                ) : (
                    <div className="w-full bg-white p-6 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 transition">
                        <label className="block text-left text-xs font-bold text-slate-500 uppercase mb-2">Cole o Link da Pasta (Google Drive/Dropbox)</label>
                        <div className="flex gap-2">
                            <input value={pastaLink} onChange={e => setPastaLink(e.target.value)} placeholder="https://..." className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"/>
                            <button onClick={handleSaveLink} disabled={loadingLink} className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition font-bold shadow-md">
                                {loadingLink ? '...' : <Save size={20}/>}
                            </button>
                        </div>
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