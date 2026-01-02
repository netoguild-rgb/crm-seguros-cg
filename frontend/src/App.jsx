import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Plus, Search, Menu, RefreshCw } from 'lucide-react';
import { getLeads, updateLeadStatus, deleteLead } from './services/api'; // createLead foi movido para o modal
import KanbanBoard from './components/KanbanBoard';
import LeadModal from './components/LeadModal';
import NewLeadModal from './components/NewLeadModal'; // <--- IMPORTANTE

function App() {
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState('kanban'); 
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Controle do Modal de Novo Lead
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await getLeads();
      setLeads(data);
    } catch (error) { console.error("Erro conexão", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  // Agora apenas abre o modal
  const handleNewLead = () => {
    setIsNewLeadModalOpen(true);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    // Atualização Otimista
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
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <span className={`font-bold text-xl tracking-tight ${!sidebarOpen && 'hidden'}`}>CG <span className="text-crm-500">CRM</span></span>
          {!sidebarOpen && <span className="font-bold text-crm-500">CG</span>}
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          <button onClick={() => setView('kanban')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'kanban' ? 'bg-crm-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={20}/> {sidebarOpen && <span>Funil de Vendas</span>}
          </button>
          <button onClick={() => setView('list')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'list' ? 'bg-crm-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Users size={20}/> {sidebarOpen && <span>Todos os Leads</span>}
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Menu size={20}/></button>
             <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-crm-500 transition" size={18}/>
                <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-crm-500 w-64 transition-all outline-none"
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

        <div className="flex-1 overflow-hidden p-6 relative">
            {view === 'kanban' ? (
                <KanbanBoard leads={filtered} onDragEnd={onDragEnd} onCardClick={setSelectedLead} />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold tracking-wider">
                            <tr><th className="p-4">Nome / Data</th><th className="p-4">Tipo</th><th className="p-4">Status</th><th className="p-4 text-right">Ação</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filtered.map(lead => (
                                <tr key={lead.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{lead.nome}</div>
                                        <div className="text-slate-400 text-xs">{new Date(lead.criadoEm).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border">{lead.tipo_seguro}</span></td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                            ${lead.status==='FECHADO'?'bg-green-100 text-green-700':lead.status==='PERDIDO'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right"><span className="text-crm-600 font-bold text-xs hover:underline">ABRIR</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </main>

      {/* Modal de Detalhes (Existente) */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} 
            onDelete={async (id) => { await deleteLead(id); fetchLeads(); onClose(); }} />
      )}

      {/* Modal de Novo Lead (NOVO) */}
      {isNewLeadModalOpen && (
        <NewLeadModal 
            onClose={() => setIsNewLeadModalOpen(false)}
            onSuccess={() => { fetchLeads(); }}
        />
      )}
    </div>
  );
}
export default App;