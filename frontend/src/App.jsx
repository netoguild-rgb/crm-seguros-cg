import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Plus, Search, Menu, RefreshCw, Send, Settings, Globe, ExternalLink, Filter, FileDown, ChevronRight } from 'lucide-react';
import { getLeads, updateLeadStatus, deleteLead, getConfig } from './services/api';

// --- COMPONENTES ---
import KanbanBoard from './components/KanbanBoard';
import LeadModal from './components/LeadModal';
import NewLeadModal from './components/NewLeadModal';
import WhatsAppModal from './components/WhatsAppModal';
import Dashboard from './components/Dashboard';
import ConfigPage from './components/ConfigPage';
// IMPORT DO LOGO DO SISTEMA
import Logo from './components/Logo'; 

// --- UTILITÁRIOS ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- IMPORT DA IMAGEM LOCAL (LOGO DA CORRETORA) ---
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

  // DEFININDO A LOGO PADRÃO
  const DEFAULT_LOGO = logoImg;

  // Configuração Visual
  const [appConfig, setAppConfig] = useState({ 
    broker_name: 'CRM Seguros', 
    primary_color: '#0f172a', 
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
                primary_color: data.primary_color || '#0f172a',
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

  // Função PDF Rápido
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

  // Componente auxiliar para item do menu (apenas visual)
  const MenuItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button 
      onClick={onClick} 
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
        ${active 
          ? 'bg-white/20 text-white shadow-lg border border-white/20 backdrop-blur-sm' 
          : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
        }
      `}
    >
      <Icon size={22} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      
      {!collapsed && (
        <span className={`font-medium tracking-wide flex-1 text-left transition-all ${active ? 'font-bold' : ''}`}>
          {label}
        </span>
      )}
      
      {/* Indicador sutil de ativo */}
      {active && !collapsed && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar Modernizada */}
      <aside 
        style={{ backgroundColor: appConfig.primary_color }} 
        className={`
          relative flex flex-col shadow-2xl z-30 transition-all duration-500 ease-in-out
          ${sidebarOpen ? 'w-72' : 'w-24'}
        `}
      >
        {/* Overlay de Gradiente para dar profundidade e textura moderna */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30 pointer-events-none" />

        {/* Conteúdo da Sidebar (Z-Index garante que fique acima do gradiente) */}
        <div className="flex flex-col h-full z-10 relative">
            
            {/* A. LOGO DO SISTEMA */}
            <div className="pt-6 pb-4 flex justify-center items-center w-full px-2">
                <Logo collapsed={!sidebarOpen} />
            </div>

            {/* Divisória sutil */}
            <div className="px-6 py-2">
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* B. LOGO DO CLIENTE (Container com design Glass) */}
            <div className={`
                mx-4 my-2 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center justify-center p-4 transition-all duration-500
                ${sidebarOpen ? 'min-h-[120px]' : 'min-h-[70px] bg-transparent border-none'}
            `}>
               {appConfig.logo_url ? (
                 <img 
                   src={appConfig.logo_url} 
                   alt="Logo Corretora" 
                   className={`object-contain transition-all duration-500 filter drop-shadow-md ${sidebarOpen ? 'h-20 max-w-full' : 'h-10 w-10'}`} 
                 />
               ) : (
                 !sidebarOpen ? null : (
                     <h1 className="font-bold text-center leading-tight text-white text-lg animate-fade-in drop-shadow-md">
                        {appConfig.broker_name}
                     </h1>
                 )
               )}
            </div>

            {/* C. MENU DE NAVEGAÇÃO */}
            <nav className="flex-1 py-6 px-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
               <MenuItem 
                 icon={LayoutDashboard} 
                 label="Funil de Vendas" 
                 active={view === 'kanban'} 
                 onClick={() => setView('kanban')} 
                 collapsed={!sidebarOpen}
               />
               
               <MenuItem 
                 icon={Users} 
                 label="Todos os Leads" 
                 active={view === 'list'} 
                 onClick={() => setView('list')} 
                 collapsed={!sidebarOpen}
               />

               <div className="pt-4 pb-2">
                 <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
               </div>

               <MenuItem 
                 icon={Settings} 
                 label="Configurações" 
                 active={view === 'config'} 
                 onClick={() => setView('config')} 
                 collapsed={!sidebarOpen}
               />
            </nav>

            {/* Footer da Sidebar (Opcional) */}
            <div className="p-4 text-center text-xs text-white/40 font-medium">
               {sidebarOpen && <span>v2.5.0</span>}
            </div>
        </div>
      </aside>

      {/* Main Content (Mantido igual) */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                <Menu size={20}/>
             </button>
             {view !== 'config' && (
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                    <input 
                      type="text" 
                      placeholder="Buscar lead..." 
                      className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:ring-2 focus:ring-blue-500/50 focus:bg-white w-64 outline-none transition-all border border-transparent focus:border-blue-200"
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
             )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchLeads} className={`p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-blue-600 transition-all ${loading ? 'animate-spin text-blue-600' : ''}`} title="Atualizar">
                <RefreshCw size={20}/>
            </button>
            <button onClick={() => setIsNewLeadModalOpen(true)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold flex gap-2 shadow-lg shadow-slate-900/20 hover:bg-black hover:scale-105 active:scale-95 transition-all items-center">
                <Plus size={18}/> Novo Lead
            </button>
          </div>
        </header>

        {/* Filtros e Conteúdo Principal (Mantido) */}
        {view !== 'config' && (
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex gap-4 items-center overflow-x-auto">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <Filter size={14}/> Filtros:
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-blue-300 focus:border-blue-500 transition-colors text-slate-700">
                    <option value="">Todos Status</option>
                    <option value="NOVO">Novo</option>
                    <option value="NEGOCIACAO">Negociação</option>
                    <option value="FECHADO">Fechado</option>
                    <option value="PERDIDO">Perdido</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-blue-300 focus:border-blue-500 transition-colors text-slate-700">
                    <option value="">Todos Seguros</option>
                    <option value="Seguro Auto">Auto</option>
                    <option value="Seguro Vida">Vida</option>
                    <option value="Residencial">Residencial</option>
                    <option value="Plano de Saúde">Saúde</option>
                </select>
            </div>
        )}

        {selectedLeadsIds.length > 0 && view === 'list' && (
           <div className="bg-blue-50 border-b border-blue-200 p-3 px-6 flex items-center justify-between animate-fade-in">
              <span className="font-bold text-blue-800 text-sm flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> {selectedLeadsIds.length} selecionados</span>
              <div className="flex gap-2">
                 <button onClick={() => setSelectedLeadsIds([])} className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded transition">Cancelar</button>
                 <button onClick={() => setIsWhatsAppModalOpen(true)} className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm transition transform active:scale-95">
                    <Send size={14}/> DISPARAR WHATSAPP
                 </button>
              </div>
           </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 relative">
            {view === 'config' && <ConfigPage onConfigUpdate={setAppConfig} />}

            {view === 'kanban' && (
                <>
                  <div className="mb-6 animate-fade-in">
                    <div style={{ background: `linear-gradient(135deg, ${appConfig.primary_color}, #1e293b)` }} className="p-5 text-white rounded-2xl shadow-xl flex justify-between items-center border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
                        
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="bg-white/10 p-3.5 rounded-xl backdrop-blur-sm border border-white/10 shadow-inner">
                                <Globe size={32} className="text-blue-200"/>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Agente Digital</h2>
                                <p className="text-sm text-blue-100/80 flex items-center gap-2 mt-1">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                    Sistema Online • Capturando Leads
                                </p>
                            </div>
                        </div>
                        
                        <a 
                            href="https://netoguild-rgb.github.io/Agente-cg-corretora/" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="bg-white text-slate-900 hover:bg-blue-50 transition-all px-6 py-3 rounded-xl text-sm font-bold flex gap-2 items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative z-10"
                        >
                            Acessar Página <ExternalLink size={16}/>
                        </a>
                    </div>
                  </div>
                  <Dashboard leads={safeLeads} />
                  <div className="h-full pb-10"><KanbanBoard leads={filtered} onDragEnd={onDragEnd} onCardClick={setSelectedLead} /></div>
                </>
            )}

            {view === 'list' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-auto">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                              <tr>
                                <th className="p-4 w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selectedLeadsIds.length === filtered.length && filtered.length > 0} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/></th>
                                <th className="p-4">Nome</th>
                                <th className="p-4">WhatsApp</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ação</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                              {filtered.map(lead => (
                                  <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                                      <td className="p-4" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" checked={selectedLeadsIds.includes(lead.id)} onChange={() => toggleSelectLead(lead.id)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                                      </td>
                                      <td className="p-4 font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{lead.nome}</td>
                                      <td className="p-4 font-mono text-slate-500">{lead.whatsapp}</td>
                                      <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">{lead.tipo_seguro}</span></td>
                                      <td className="p-4">
                                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${
                                              lead.status==='FECHADO'?'bg-green-100 text-green-700 border-green-200':
                                              lead.status==='PERDIDO'?'bg-red-100 text-red-700 border-red-200':
                                              'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                              <span className={`w-1.5 h-1.5 rounded-full ${
                                                  lead.status==='FECHADO'?'bg-green-500':
                                                  lead.status==='PERDIDO'?'bg-red-500':
                                                  'bg-blue-500'
                                              }`}></span>
                                              {lead.status}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right">
                                        <button onClick={(e) => quickPdf(lead, e)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all" title="Baixar PDF"><FileDown size={18}/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                    </div>
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