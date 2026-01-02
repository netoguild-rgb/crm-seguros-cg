import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Plus, Search, Menu, RefreshCw, Send, Trash2 } from 'lucide-react';
import { getLeads, updateLeadStatus, deleteLead } from './services/api';
import KanbanBoard from './components/KanbanBoard';
import LeadModal from './components/LeadModal';
import NewLeadModal from './components/NewLeadModal';
import WhatsAppModal from './components/WhatsAppModal';
import Logo from './components/Logo'; // NOVO COMPONENTE

function App() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('kanban'); 
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Controle dos Modais
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  // Estado para Seleção Múltipla (Para o disparo em massa)
  const [selectedLeadsIds, setSelectedLeadsIds] = useState([]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await getLeads();
      setLeads(data);
    } catch (error) { console.error("Erro conexão", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleNewLead = () => setIsNewLeadModalOpen(true);

  // Lógica de Seleção (Checkbox)
  const toggleSelectLead = (id) => {
    if (selectedLeadsIds.includes(id)) {
      setSelectedLeadsIds(selectedLeadsIds.filter(lid => lid !== id));
    } else {
      setSelectedLeadsIds([...selectedLeadsIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeadsIds.length === filtered.length) {
      setSelectedLeadsIds([]);
    } else {
      setSelectedLeadsIds(filtered.map(l => l.id));
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    const oldLeads = [...leads];
    setLeads(prev => prev.map(l => l.id == draggableId ? { ...l, status: newStatus } : l));

    try { await updateLeadStatus(draggableId, newStatus); } 
    catch (error) { setLeads(oldLeads); alert("Erro ao salvar"); }
  };

  const filtered = leads.filter(l => 
    (l.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (l.whatsapp?.includes(searchTerm))
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-crm-900 text-white transition-all duration-300 flex flex-col shadow-2xl z-30`}>
        {/* LOGO MODERNA */}
        <div className="h-20 flex items-center justify-center border-b border-white/10 relative">
           <Logo collapsed={!sidebarOpen} />
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <button onClick={() => setView('kanban')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'kanban' ? 'bg-gradient-to-r from-crm-600 to-crm-500 text-white shadow-lg shadow-crm-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={20}/> {sidebarOpen && <span className="font-medium">Funil de Vendas</span>}
          </button>
          <button onClick={() => setView('list')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'list' ? 'bg-gradient-to-r from-crm-600 to-crm-500 text-white shadow-lg shadow-crm-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Users size={20}/> {sidebarOpen && <span className="font-medium">Todos os Leads</span>}
          </button>
          
          {/* Menu de Atalho Rápido para Marketing */}
          {sidebarOpen && (
            <div className="mt-8 px-4">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Marketing</p>
               <button onClick={() => { setView('list'); alert('Selecione os leads na lista para disparar.'); }} className="w-full flex items-center gap-3 px-2 py-2 text-slate-300 hover:text-white transition">
                  <Send size={16}/> Campanhas WhatsApp
               </button>
            </div>
          )}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Menu size={20}/></button>
             <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-crm-500 transition" size={18}/>
                <input type="text" placeholder="Buscar clientes..." className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-crm-500 w-64 transition-all outline-none"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchLeads} className={`p-2 text-slate-500 hover:bg-crm-50 hover:text-crm-600 rounded-full transition ${loading ? 'animate-spin' : ''}`}><RefreshCw size={20}/></button>
            <button onClick={handleNewLead} className="bg-crm-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition transform hover:-translate-y-0.5">
                <Plus size={18}/> <span className="hidden sm:inline">Novo Lead</span>
            </button>
          </div>
        </header>

        {/* Barra de Ação em Massa (Aparece quando seleciona leads) */}
        {selectedLeadsIds.length > 0 && view === 'list' && (
           <div className="bg-crm-100 border-b border-crm-200 p-3 px-6 flex items-center justify-between animate-fade-in">
              <span className="font-bold text-crm-800 text-sm">{selectedLeadsIds.length} leads selecionados</span>
              <div className="flex gap-2">
                 <button onClick={() => setSelectedLeadsIds([])} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">Cancelar</button>
                 <button 
                    onClick={() => setIsWhatsAppModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 transition"
                 >
                    <Send size={14}/> DISPARAR WHATSAPP
                 </button>
              </div>
           </div>
        )}

        <div className="flex-1 overflow-hidden p-6 relative">
            {view === 'kanban' ? (
                <KanbanBoard leads={filtered} onDragEnd={onDragEnd} onCardClick={setSelectedLead} />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in h-full flex flex-col">
                    <div className="overflow-auto flex-1">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                              <tr>
                                <th className="p-4 w-10">
                                  <input type="checkbox" 
                                    onChange={toggleSelectAll} 
                                    checked={selectedLeadsIds.length === filtered.length && filtered.length > 0}
                                    className="rounded border-slate-300 text-crm-600 focus:ring-crm-500"
                                  />
                                </th>
                                <th className="p-4">Nome / Data</th>
                                <th className="p-4">WhatsApp</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ação</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                              {filtered.map(lead => (
                                  <tr key={lead.id} className={`hover:bg-slate-50 transition ${selectedLeadsIds.includes(lead.id) ? 'bg-crm-50' : ''}`}>
                                      <td className="p-4">
                                        <input type="checkbox" 
                                          checked={selectedLeadsIds.includes(lead.id)}
                                          onChange={() => toggleSelectLead(lead.id)}
                                          className="rounded border-slate-300 text-crm-600 focus:ring-crm-500 cursor-pointer"
                                        />
                                      </td>
                                      <td className="p-4 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                          <div className="font-bold text-slate-800">{lead.nome}</div>
                                          <div className="text-slate-400 text-xs">{new Date(lead.criadoEm).toLocaleDateString()}</div>
                                      </td>
                                      <td className="p-4 font-mono text-slate-600">{lead.whatsapp}</td>
                                      <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border">{lead.tipo_seguro}</span></td>
                                      <td className="p-4">
                                          <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                              ${lead.status==='FECHADO'?'bg-green-100 text-green-700':lead.status==='PERDIDO'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
                                              {lead.status}
                                          </span>
                                      </td>
                                      <td className="p-4 text-right">
                                        <button onClick={() => setSelectedLead(lead)} className="text-crm-600 font-bold text-xs hover:underline">ABRIR</button>
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

      {/* MODAIS */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} 
            onDelete={async (id) => { await deleteLead(id); fetchLeads(); onClose(); }} />
      )}

      {isNewLeadModalOpen && (
        <NewLeadModal 
            onClose={() => setIsNewLeadModalOpen(false)}
            onSuccess={() => { fetchLeads(); }}
        />
      )}

      {/* NOVO MODAL DE WHATSAPP */}
      {isWhatsAppModalOpen && (
        <WhatsAppModal 
          leads={leads.filter(l => selectedLeadsIds.includes(l.id))} 
          onClose={() => setIsWhatsAppModalOpen(false)} 
        />
      )}
    </div>
  );
}
export default App;