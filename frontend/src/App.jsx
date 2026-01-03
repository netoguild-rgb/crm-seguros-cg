import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Plus, Search, Menu, RefreshCw, Send, Settings, Globe, ExternalLink, Filter, FileDown, X, MessageCircle } from 'lucide-react';
import { getLeads, updateLeadStatus, deleteLead, getConfig } from './services/api';

// --- COMPONENTES ---
import KanbanBoard from './components/KanbanBoard';
import LeadModal from './components/LeadModal';
import NewLeadModal from './components/NewLeadModal';
import WhatsAppModal from './components/WhatsAppModal';
import Dashboard from './components/Dashboard';
import ConfigPage from './components/ConfigPage';
import Logo from './components/Logo'; 

// --- UTILITÁRIOS ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from './assets/logo.png';

function App() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('kanban'); 
  const [selectedLead, setSelectedLead] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const DEFAULT_LOGO = logoImg;

  // Configuração Visual (Padrão Azul Salesforce)
  const [appConfig, setAppConfig] = useState({ 
    broker_name: 'CRM Seguros', 
    primary_color: '#0176D3', 
    logo_url: DEFAULT_LOGO 
  });

  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedLeadsIds, setSelectedLeadsIds] = useState([]);

  useEffect(() => { 
    fetchLeads(); 
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
        const { data } = await getConfig();
        if(data) {
            setAppConfig({
                broker_name: data.broker_name || 'CRM Seguros',
                primary_color: data.primary_color || '#0176D3',
                logo_url: (data.logo_url && data.logo_url.trim() !== '') ? data.logo_url : DEFAULT_LOGO 
            });
        }
    } catch(e) { console.error("Erro config", e); }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await getLeads();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) { setLeads([]); } 
    finally { setLoading(false); }
  };

  const safeLeads = leads || [];
  const filtered = safeLeads.filter(l => {
    const matchesSearch = (l.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (l.whatsapp?.includes(searchTerm));
    const matchesStatus = filterStatus ? l.status === filterStatus : true;
    const matchesType = filterType ? l.tipo_seguro === filterType : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const quickPdf = (lead, e) => {
    e.stopPropagation();
    const doc = new jsPDF();
    doc.setFillColor(appConfig.primary_color);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(appConfig.broker_name, 14, 15);
    doc.setFontSize(10);
    doc.text("Ficha Rápida", 180, 15);
    
    autoTable(doc, {
      startY: 30,
      head: [['Campo', 'Informação']],
      body: [
        ['Nome', lead.nome],
        ['WhatsApp', lead.whatsapp],
        ['Status', lead.status],
        ['Tipo', lead.tipo_seguro],
        ['Veículo', lead.modelo_veiculo || '-']
      ],
      theme: 'grid',
      headStyles: { fillColor: appConfig.primary_color }
    });
    doc.save(`${lead.nome}_ficha.pdf`);
  };

  const toggleSelectAll = () => {
    if (selectedLeadsIds.length === filtered.length) setSelectedLeadsIds([]);
    else setSelectedLeadsIds(filtered.map(l => l.id));
  };

  const toggleSelectLead = (id) => {
    if (selectedLeadsIds.includes(id)) setSelectedLeadsIds(selectedLeadsIds.filter(lid => lid !== id));
    else setSelectedLeadsIds([...selectedLeadsIds, id]);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const oldLeads = [...leads];
    setLeads(prev => prev.map(l => l.id == draggableId ? { ...l, status: newStatus } : l));
    try { await updateLeadStatus(draggableId, newStatus); } 
    catch (error) { setLeads(oldLeads); }
  };

  const MenuItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button 
      onClick={onClick} 
      className={`
        w-full flex items-center gap-3 px-4 py-3 my-1 transition-all duration-200 border-l-4 group
        ${active 
          ? 'bg-black/20 border-white/50 text-white font-semibold' 
          : 'border-transparent text-white/70 hover:text-white hover:bg-white/10'
        }
      `}
    >
      <Icon size={20} className={`transition-transform duration-300 ${active ? 'text-white scale-110' : 'group-hover:scale-110'}`} />
      {!collapsed && <span className="text-sm tracking-wide">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-crm-50 overflow-hidden font-sans text-slate-700">
      
      {/* SIDEBAR */}
      <aside 
        style={{ backgroundColor: appConfig.primary_color }} 
        className={`relative flex flex-col shadow-xl z-30 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex flex-col h-full z-10 relative">
            
            {/* Logo Area - CORRIGIDO: Sem margens, aproveitando 100% do espaço */}
            <div className="h-16 flex items-center justify-center border-b border-white/10 shrink-0 bg-white/5">
                 <Logo collapsed={!sidebarOpen} />
            </div>

            {/* Menu */}
            <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
               <MenuItem icon={LayoutDashboard} label="Visão Geral" active={view === 'kanban'} onClick={() => setView('kanban')} collapsed={!sidebarOpen} />
               <MenuItem icon={Users} label="Lista de Leads" active={view === 'list'} onClick={() => setView('list')} collapsed={!sidebarOpen} />
               <MenuItem icon={Settings} label="Configurações" active={view === 'config'} onClick={() => setView('config')} collapsed={!sidebarOpen} />
            </nav>

            {/* Footer Sidebar */}
            <div className="p-4 text-center border-t border-white/10 overflow-hidden whitespace-nowrap">
               {sidebarOpen && <small className="text-white/40 text-xs font-medium tracking-wider uppercase">{appConfig.broker_name}</small>}
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-crm-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded text-slate-500 transition-colors">
                <Menu size={20}/>
             </button>
             {view !== 'config' && (
                <div className="relative hidden md:block w-96 animate-fade-in">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                      type="text" 
                      placeholder="Pesquisar leads e oportunidades..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded focus:ring-2 focus:ring-crm-500 focus:bg-white text-sm transition-all"
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
             )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchLeads} className={`p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-crm-600 transition ${loading ? 'animate-spin text-crm-600' : ''}`} title="Atualizar Dados">
                <RefreshCw size={18}/>
            </button>
            <button onClick={() => setIsNewLeadModalOpen(true)} className="bg-crm-500 hover:bg-crm-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm transition flex items-center gap-2 transform active:scale-95">
                <Plus size={16}/> Novo Lead
            </button>
          </div>
        </header>

        {view !== 'config' && (
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-3 items-center overflow-x-auto shadow-[0_2px_3px_-1px_rgba(0,0,0,0.05)] z-10">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mr-2">
                    <Filter size={12}/>
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs font-semibold bg-white border border-slate-300 rounded px-3 py-1.5 focus:border-crm-500 focus:ring-1 focus:ring-crm-500 outline-none text-slate-600 cursor-pointer">
                    <option value="">Status: Todos</option>
                    <option value="NOVO">Novo</option>
                    <option value="NEGOCIACAO">Em Negociação</option>
                    <option value="FECHADO">Fechado</option>
                    <option value="PERDIDO">Perdido</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-xs font-semibold bg-white border border-slate-300 rounded px-3 py-1.5 focus:border-crm-500 focus:ring-1 focus:ring-crm-500 outline-none text-slate-600 cursor-pointer">
                    <option value="">Tipo: Todos</option>
                    <option value="Seguro Auto">Auto</option>
                    <option value="Seguro Vida">Vida</option>
                    <option value="Residencial">Residencial</option>
                    <option value="Plano de Saúde">Saúde</option>
                </select>
                
                {selectedLeadsIds.length > 0 && view === 'list' && (
                    <div className="ml-auto flex items-center gap-3 animate-fade-in bg-blue-50 px-3 py-1 rounded border border-blue-100">
                        <span className="text-xs font-bold text-blue-800">{selectedLeadsIds.length} selecionados</span>
                        <button onClick={() => setSelectedLeadsIds([])} className="p-1 hover:bg-blue-100 rounded text-blue-800"><X size={14}/></button>
                        <div className="h-4 w-px bg-blue-200"></div>
                        <button onClick={() => setIsWhatsAppModalOpen(true)} className="flex items-center gap-1 text-green-700 hover:text-green-800 text-xs font-bold">
                            <Send size={12}/> Enviar WhatsApp
                        </button>
                    </div>
                )}
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {view === 'config' && <ConfigPage onConfigUpdate={setAppConfig} />}

            {view === 'kanban' && (
                <div className="max-w-[1600px] mx-auto">
                  <div className="mb-6 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-4 text-white shadow-card animate-fade-in">
                      <div className="flex items-center gap-4">
                          <div className="bg-white/10 p-2 rounded-lg"><Globe size={24} className="text-blue-300"/></div>
                          <div>
                              <h2 className="text-sm font-bold uppercase tracking-wide text-blue-200">Integração Online</h2>
                              <p className="text-lg font-bold">Agente Digital Ativo</p>
                          </div>
                      </div>
                      <a href="https://netoguild-rgb.github.io/Agente-cg-corretora/" target="_blank" rel="noreferrer" className="bg-white text-slate-900 hover:bg-blue-50 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition">
                          Acessar Página <ExternalLink size={14}/>
                      </a>
                  </div>

                  <Dashboard leads={safeLeads} />
                  <div className="h-full pb-10"><KanbanBoard leads={filtered} onDragEnd={onDragEnd} onCardClick={setSelectedLead} /></div>
                </div>
            )}

            {view === 'list' && (
                <div className="bg-white rounded-lg shadow-card border border-slate-200 overflow-hidden max-w-[1600px] mx-auto animate-fade-in">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="p-3 w-10 text-center"><input type="checkbox" onChange={toggleSelectAll} checked={selectedLeadsIds.length === filtered.length && filtered.length > 0} className="rounded border-slate-300 text-crm-600 focus:ring-crm-500"/></th>
                              <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Lead</th>
                              <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                              <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Interesse</th>
                              <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="p-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filtered.map(lead => (
                                <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                                      <input type="checkbox" checked={selectedLeadsIds.includes(lead.id)} onChange={() => toggleSelectLead(lead.id)} className="rounded border-slate-300 text-crm-600 focus:ring-crm-500"/>
                                    </td>
                                    <td className="p-3 font-semibold text-crm-600 group-hover:underline">{lead.nome}</td>
                                    <td className="p-3 text-slate-500">{lead.whatsapp}</td>
                                    <td className="p-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">{lead.tipo_seguro}</span></td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold inline-block border ${
                                            lead.status==='FECHADO'?'bg-green-50 text-green-700 border-green-200':
                                            lead.status==='PERDIDO'?'bg-red-50 text-red-700 border-red-200':
                                            'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                      <button onClick={(e) => quickPdf(lead, e)} className="text-slate-400 hover:text-crm-600 p-1 rounded transition" title="Baixar Ficha"><FileDown size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="p-10 text-center text-slate-400">Nenhum lead encontrado.</div>}
                </div>
            )}
        </div>
      </main>

      {selectedLead && <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} onDelete={async (id) => { await deleteLead(id); fetchLeads(); onClose(); }} onUpdate={fetchLeads} />}
      {isNewLeadModalOpen && <NewLeadModal onClose={() => setIsNewLeadModalOpen(false)} onSuccess={fetchLeads} />}
      {isWhatsAppModalOpen && <WhatsAppModal leads={leads.filter(l => selectedLeadsIds.includes(l.id))} onClose={() => setIsWhatsAppModalOpen(false)} />}
    </div>
  );
}
export default App;