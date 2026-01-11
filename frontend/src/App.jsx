import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Plus, Search, Menu, RefreshCw, Send, Settings, Globe, ExternalLink, Filter, FileDown, X, MessageCircle, Sparkles, Inbox, Megaphone, Briefcase } from 'lucide-react';
import { getLeads, updateLeadStatus, deleteLead, getConfig } from './services/api';

// --- COMPONENTES ---
import KanbanBoard from './components/KanbanBoard';
import LeadModal from './components/LeadModal';
import NewLeadModal from './components/NewLeadModal';
import WhatsAppModal from './components/WhatsAppModal';
import Dashboard from './components/Dashboard';
import ConfigPage from './components/ConfigPage';
import Logo from './components/Logo';
import InboxPage from './components/InboxPage';
import MarketingPage from './components/MarketingPage';
import ServicesPage from './components/ServicesPage';
import { ToastProvider, useToast } from './components/Toast';

// --- UTILITÁRIOS ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from './assets/logo.png';

function AppContent() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('kanban');
  const [selectedLead, setSelectedLead] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const DEFAULT_LOGO = logoImg;

  // Configuração Visual
  const [appConfig, setAppConfig] = useState({
    broker_name: 'CRM Seguros',
    primary_color: '#667eea',
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
      if (data) {
        setAppConfig({
          broker_name: data.broker_name || 'CRM Seguros',
          primary_color: data.primary_color || '#667eea',
          logo_url: (data.logo_url && data.logo_url.trim() !== '') ? data.logo_url : DEFAULT_LOGO
        });
      }
    } catch (e) { console.error("Erro config", e); }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await getLeads();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      setLeads([]);
      toast.error('Falha ao carregar leads', 'Erro de Conexão');
    }
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
    doc.setFillColor('#667eea');
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
      headStyles: { fillColor: '#667eea' }
    });
    doc.save(`${lead.nome}_ficha.pdf`);
    toast.success('PDF gerado com sucesso!');
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
    try {
      await updateLeadStatus(draggableId, newStatus);
      toast.success(`Lead movido para ${newStatus}`);
    }
    catch (error) {
      setLeads(oldLeads);
      toast.error('Falha ao atualizar status');
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      await deleteLead(id);
      fetchLeads();
      setSelectedLead(null);
      toast.success('Lead removido com sucesso');
    } catch (error) {
      toast.error('Falha ao remover lead');
    }
  };

  const handleNewLeadSuccess = () => {
    fetchLeads();
    setIsNewLeadModalOpen(false);
    toast.success('Novo lead criado!', 'Sucesso');
  };

  const MenuItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button
      onClick={onClick}
      className={`
        sidebar-item w-full flex items-center gap-3 px-4 py-3.5 my-1 transition-all duration-200 rounded-lg mx-2
        ${active
          ? 'active bg-white/10 text-white font-semibold'
          : 'text-white/70 hover:text-white hover:bg-white/5'
        }
      `}
      style={{ width: 'calc(100% - 16px)' }}
    >
      <Icon size={20} className={`transition-all duration-300 ${active ? 'text-white' : 'group-hover:scale-110'}`} />
      {!collapsed && <span className="text-sm tracking-wide">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-crm-50 overflow-hidden font-sans text-slate-700">

      {/* SIDEBAR PREMIUM */}
      <aside
        className={`sidebar-premium relative flex flex-col z-30 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-48' : 'w-20'}`}
      >
        <div className="flex flex-col h-full z-10 relative">

          {/* Logo Area - Logo ultrapassa a borda */}
          <div className="sidebar-logo-area h-40 py-4 flex items-center justify-center shrink-0 relative overflow-visible z-10">
            <Logo collapsed={!sidebarOpen} />
          </div>

          {/* Menu */}
          <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
            <MenuItem icon={LayoutDashboard} label="Visão Geral" active={view === 'kanban'} onClick={() => setView('kanban')} collapsed={!sidebarOpen} />
            <MenuItem icon={Users} label="Lista de Leads" active={view === 'list'} onClick={() => setView('list')} collapsed={!sidebarOpen} />
            <MenuItem icon={Inbox} label="Inbox" active={view === 'inbox'} onClick={() => setView('inbox')} collapsed={!sidebarOpen} />

            {/* Divider */}
            <div className="my-3 mx-4 border-t border-white/10"></div>

            <MenuItem icon={Megaphone} label="Marketing" active={view === 'marketing'} onClick={() => setView('marketing')} collapsed={!sidebarOpen} />
            <MenuItem icon={Briefcase} label="Serviços" active={view === 'services'} onClick={() => setView('services')} collapsed={!sidebarOpen} />

            {/* Divider */}
            <div className="my-3 mx-4 border-t border-white/10"></div>

            <MenuItem icon={Settings} label="Configurações" active={view === 'config'} onClick={() => setView('config')} collapsed={!sidebarOpen} />
          </nav>

          {/* Footer Sidebar - Mais profissional */}
          <div className="p-4 text-center border-t border-crm-500/20 overflow-hidden whitespace-nowrap bg-gradient-to-t from-black/20 to-transparent">
            {sidebarOpen && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-crm-400" />
                  <small className="text-white/70 text-xs font-semibold tracking-wide">{appConfig.broker_name}</small>
                </div>
                <small className="text-white/40 text-[10px]">v2.0 Premium</small>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-crm-50 via-white to-crm-100 relative">

        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-all duration-200 hover:scale-105"
            >
              <Menu size={20} />
            </button>
            {view !== 'config' && (
              <div className="relative hidden md:block w-96 animate-fade-in">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar leads e oportunidades..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-100/80 border border-transparent rounded-xl focus:ring-2 focus:ring-crm-500/50 focus:bg-white focus:border-crm-500 text-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeads}
              className={`p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-crm-600 transition-all duration-200 ${loading ? 'animate-spin text-crm-600' : ''}`}
              title="Atualizar Dados"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setIsNewLeadModalOpen(true)}
              className="bg-gradient-to-r from-crm-500 to-accent-purple hover:shadow-glow text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} /> Novo Lead
            </button>
          </div>
        </header >

        {/* Filter Bar */}
        {
          (view === 'kanban' || view === 'list') && (
            <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/50 px-6 py-3 flex gap-3 items-center overflow-x-auto z-10">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mr-2">
                <Filter size={14} />
                <span className="hidden sm:inline">Filtros</span>
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-4 py-2 focus:border-crm-500 focus:ring-2 focus:ring-crm-500/20 outline-none text-slate-600 cursor-pointer shadow-sm hover:border-slate-300 transition-all"
              >
                <option value="">Status: Todos</option>
                <option value="NOVO">Novo</option>
                <option value="NEGOCIACAO">Em Negociação</option>
                <option value="FECHADO">Fechado</option>
                <option value="PERDIDO">Perdido</option>
              </select>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-4 py-2 focus:border-crm-500 focus:ring-2 focus:ring-crm-500/20 outline-none text-slate-600 cursor-pointer shadow-sm hover:border-slate-300 transition-all"
              >
                <option value="">Tipo: Todos</option>
                <option value="Seguro Auto">Auto</option>
                <option value="Seguro Vida">Vida</option>
                <option value="Residencial">Residencial</option>
                <option value="Plano de Saúde">Saúde</option>
              </select>

              {selectedLeadsIds.length > 0 && view === 'list' && (
                <div className="ml-auto flex items-center gap-3 animate-fade-in bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200 shadow-sm">
                  <span className="text-xs font-bold text-blue-800">{selectedLeadsIds.length} selecionados</span>
                  <button onClick={() => setSelectedLeadsIds([])} className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-800 transition-colors"><X size={14} /></button>
                  <div className="h-5 w-px bg-blue-200"></div>
                  <button onClick={() => setIsWhatsAppModalOpen(true)} className="flex items-center gap-1.5 text-green-700 hover:text-green-800 text-xs font-bold bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-all">
                    <Send size={12} /> Enviar WhatsApp
                  </button>
                </div>
              )}
            </div>
          )
        }

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {view === 'config' && <ConfigPage onConfigUpdate={setAppConfig} />}

          {view === 'kanban' && (
            <div className="max-w-[1600px] mx-auto">
              {/* Integration Banner */}
              <div className="mb-6 flex justify-between items-center bg-gradient-to-r from-slate-800 via-slate-900 to-crm-900 rounded-2xl p-5 text-white shadow-float animate-fade-in overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-crm-500/10 to-accent-purple/10" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl shadow-lg">
                    <Globe size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">Integração Online</h2>
                    <p className="text-lg font-bold">Agente Digital Ativo</p>
                  </div>
                </div>
                <a
                  href="https://netoguild-rgb.github.io/Agente-cg-corretora/"
                  target="_blank"
                  rel="noreferrer"
                  className="relative z-10 bg-white text-slate-900 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Acessar Página <ExternalLink size={14} />
                </a>
              </div>

              <Dashboard leads={safeLeads} />
              <div className="h-full pb-10"><KanbanBoard leads={filtered} onDragEnd={onDragEnd} onCardClick={setSelectedLead} /></div>
            </div>
          )}

          {view === 'list' && (
            <div className="glass-card rounded-2xl overflow-hidden max-w-[1600px] mx-auto animate-fade-in">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={selectedLeadsIds.length === filtered.length && filtered.length > 0}
                        className="rounded border-slate-300 text-crm-600 focus:ring-crm-500 w-4 h-4"
                      />
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Lead</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Interesse</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map((lead, index) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 transition-all cursor-pointer group"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLeadsIds.includes(lead.id)}
                          onChange={() => toggleSelectLead(lead.id)}
                          className="rounded border-slate-300 text-crm-600 focus:ring-crm-500 w-4 h-4"
                        />
                      </td>
                      <td className="p-4 font-semibold text-crm-600 group-hover:text-crm-700">{lead.nome}</td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{lead.whatsapp}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs border border-slate-200 font-medium">
                          {lead.tipo_seguro}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold inline-block ${lead.status === 'FECHADO' ? 'badge-closed' :
                          lead.status === 'PERDIDO' ? 'badge-lost' :
                            lead.status === 'NEGOCIACAO' ? 'badge-negotiation' :
                              'badge-new'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => quickPdf(lead, e)}
                          className="text-slate-400 hover:text-crm-600 p-2 rounded-lg hover:bg-slate-100 transition-all"
                          title="Baixar Ficha"
                        >
                          <FileDown size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-16 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-slate-400 text-lg">Nenhum lead encontrado</p>
                  <p className="text-slate-300 text-sm mt-1">Tente ajustar os filtros ou criar um novo lead</p>
                </div>
              )}
            </div>
          )}

          {view === 'inbox' && <InboxPage />}
          {view === 'marketing' && <MarketingPage />}
          {view === 'services' && <ServicesPage />}
        </div>
      </main >

      {selectedLead && <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} onDelete={handleDeleteLead} onUpdate={fetchLeads} />
      }
      {isNewLeadModalOpen && <NewLeadModal onClose={() => setIsNewLeadModalOpen(false)} onSuccess={handleNewLeadSuccess} />}
      {isWhatsAppModalOpen && <WhatsAppModal leads={leads.filter(l => selectedLeadsIds.includes(l.id))} onClose={() => setIsWhatsAppModalOpen(false)} />}
    </div >
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;