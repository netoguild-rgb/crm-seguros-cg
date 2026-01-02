import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Plus, Search, Menu, RefreshCw, Send, Settings, Globe, ExternalLink, Filter, FileDown } from 'lucide-react';
import { getLeads, updateLeadStatus, deleteLead, getConfig } from './services/api';
import KanbanBoard from './components/KanbanBoard';
import LeadModal from './components/LeadModal';
import NewLeadModal from './components/NewLeadModal';
import WhatsAppModal from './components/WhatsAppModal';
import Dashboard from './components/Dashboard';
import ConfigPage from './components/ConfigPage';
import jsPDF from 'jspdf'; // Necessário para o botão PDF da tabela

function App() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('kanban'); 
  const [selectedLead, setSelectedLead] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // TAREFA 2: Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // TAREFA 4: Configuração Visual
  const [appConfig, setAppConfig] = useState({ 
    broker_name: 'CRM Seguros', 
    primary_color: '#0f172a',
    logo_url: '' 
  });

  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedLeadsIds, setSelectedLeadsIds] = useState([]);

  // Carregar dados iniciais
  useEffect(() => { 
    fetchLeads(); 
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
        const { data } = await getConfig();
        if(data) setAppConfig(data);
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

  // Lógica de Filtro Avançada (Tarefa 2)
  const safeLeads = leads || [];
  const filtered = safeLeads.filter(l => {
    const matchesSearch = (l.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (l.whatsapp?.includes(searchTerm));
    const matchesStatus = filterStatus ? l.status === filterStatus : true;
    const matchesType = filterType ? l.tipo_seguro === filterType : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Função PDF Rápido (Tabela)
  const quickPdf = (lead, e) => {
    e.stopPropagation();
    const doc = new jsPDF();
    doc.text(`Ficha: ${lead.nome}`, 10, 10);
    doc.text(`Tel: ${lead.whatsapp}`, 10, 20);
    doc.text(`Status: ${lead.status}`, 10, 30);
    doc.save(`${lead.nome}.pdf`);
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

  // Estilo dinâmico para a Sidebar (Tarefa 4)
  const sidebarStyle = { backgroundColor: appConfig.primary_color };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar Personalizável */}
      <aside style={sidebarStyle} className={`text-white transition-all duration-300 flex flex-col shadow-2xl z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-center border-b border-white/10 p-2">
           {appConfig.logo_url ? (
             <img src={appConfig.logo_url} alt="Logo" className="max-h-12 max-w-full object-contain" />
           ) : (
             <h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-xs'}`}>{sidebarOpen ? appConfig.broker_name : 'CRM'}</h1>
           )}
        </div>
        <nav className="flex-1 py-6 px-3 space-y-2">
          {['kanban', 'list', 'config'].map((v) => (
             <button key={v} onClick={() => setView(v)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === v ? 'bg-white/20 shadow-lg' : 'hover:bg-white/5'}`}>
                {v === 'kanban' && <LayoutDashboard size={20}/>}
                {v === 'list' && <Users size={20}/>}
                {v === 'config' && <Settings size={20}/>}
                {sidebarOpen && <span className="capitalize">{v === 'list' ? 'Todos Leads' : v}</span>}
             </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg"><Menu size={20}/></button>
             {/* Busca */}
             {view !== 'config' && (
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64 outline-none"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
             )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchLeads} className={`p-2 hover:bg-slate-100 rounded-full ${loading ? 'animate-spin' : ''}`}><RefreshCw size={20}/></button>
            <button onClick={() => setIsNewLeadModalOpen(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex gap-2 shadow hover:bg-black"><Plus size={18}/> Novo</button>
          </div>
        </header>

        {/* Barra de Filtros (TAREFA 2) - Só aparece na Lista ou Kanban */}
        {view !== 'config' && (
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-4 items-center overflow-x-auto">
                <Filter size={16} className="text-slate-400"/>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border-none bg-slate-50 rounded px-2 py-1 outline-none">
                    <option value="">Todos Status</option>
                    <option value="NOVO">Novo</option>
                    <option value="NEGOCIACAO">Negociação</option>
                    <option value="FECHADO">Fechado</option>
                    <option value="PERDIDO">Perdido</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border-none bg-slate-50 rounded px-2 py-1 outline-none">
                    <option value="">Todos Seguros</option>
                    <option value="Seguro Auto">Auto</option>
                    <option value="Seguro Vida">Vida</option>
                    <option value="Residencial">Residencial</option>
                    <option value="Plano de Saúde">Saúde</option>
                </select>
            </div>
        )}

        {/* Barra de Ação em Massa (TAREFA 1) */}
        {selectedLeadsIds.length > 0 && view === 'list' && (
           <div className="bg-blue-50 border-b border-blue-200 p-3 px-6 flex items-center justify-between animate-fade-in">
              <span className="font-bold text-blue-800 text-sm">{selectedLeadsIds.length} selecionados</span>
              <div className="flex gap-2">
                 <button onClick={() => setSelectedLeadsIds([])} className="px-3 py-1 text-xs font-bold text-slate-500">Cancelar</button>
                 <button onClick={() => setIsWhatsAppModalOpen(true)} className="flex items-center gap-2 px-4 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
                    <Send size={14}/> DISPARAR EM MASSA
                 </button>
              </div>
           </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 relative">
            {view === 'config' && <ConfigPage onConfigUpdate={setAppConfig} />}

            {view === 'kanban' && (
                <>
                  <div className="mb-6 animate-fade-in">
                    <div style={{ background: `linear-gradient(to right, ${appConfig.primary_color}, #334155)` }} className="p-4 text-white rounded-xl shadow-lg flex justify-between items-center">
                        <div><h2 className="text-lg font-bold">Agente Digital</h2><p className="text-xs opacity-80">Sistema Online</p></div>
                        <a href="https://crm-seguros.onrender.com" target="_blank" className="bg-white/20 px-4 py-2 rounded text-sm font-bold flex gap-2">Acessar <ExternalLink size={16}/></a>
                    </div>
                  </div>
                  <Dashboard leads={safeLeads} />
                  <div className="h-full pb-10"><KanbanBoard leads={filtered} onDragEnd={onDragEnd} onCardClick={setSelectedLead} /></div>
                </>
            )}

            {view === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-auto">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                              <tr>
                                <th className="p-4 w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selectedLeadsIds.length === filtered.length && filtered.length > 0}/></th>
                                <th className="p-4">Nome</th>
                                <th className="p-4">WhatsApp</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ação</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                              {filtered.map(lead => (
                                  <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-slate-50 cursor-pointer">
                                      <td className="p-4" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" checked={selectedLeadsIds.includes(lead.id)} onChange={() => toggleSelectLead(lead.id)}/>
                                      </td>
                                      <td className="p-4 font-bold text-slate-700">{lead.nome}</td>
                                      <td className="p-4 font-mono text-slate-500">{lead.whatsapp}</td>
                                      <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{lead.tipo_seguro}</span></td>
                                      <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{lead.status}</span></td>
                                      <td className="p-4 text-right">
                                        {/* TAREFA 3: Botão PDF na Tabela */}
                                        <button onClick={(e) => quickPdf(lead, e)} className="text-slate-400 hover:text-red-600" title="Baixar PDF"><FileDown size={18}/></button>
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
      {/* Modal agora recebe lista filtrada para envio em massa */}
      {isWhatsAppModalOpen && <WhatsAppModal leads={leads.filter(l => selectedLeadsIds.includes(l.id))} onClose={() => setIsWhatsAppModalOpen(false)} />}
    </div>
  );
}
export default App;