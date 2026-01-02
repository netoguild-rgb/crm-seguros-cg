import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const columns = {
  NOVO: { title: 'Novos Leads', color: 'border-blue-500', bg: 'bg-blue-50/50' },
  NEGOCIACAO: { title: 'Em Negociação', color: 'border-yellow-500', bg: 'bg-yellow-50/50' },
  FECHADO: { title: 'Venda Fechada', color: 'border-green-500', bg: 'bg-green-50/50' },
  PERDIDO: { title: 'Perdido', color: 'border-red-500', bg: 'bg-red-50/50' }
};

const KanbanBoard = ({ leads, onDragEnd, onCardClick }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-6 overflow-x-auto pb-4 px-2">
        {Object.entries(columns).map(([statusKey, config]) => {
          const columnLeads = leads.filter(l => (l.status || 'NOVO') === statusKey);
          
          return (
            <div key={statusKey} className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-slate-100/50 border border-slate-200/60">
              <div className={`p-4 rounded-t-xl bg-white border-t-4 shadow-sm flex justify-between items-center ${config.color} mb-1`}>
                <h3 className="font-bold text-slate-700 uppercase tracking-wide text-xs">{config.title}</h3>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold border">{columnLeads.length}</span>
              </div>

              <Droppable droppableId={statusKey}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}
                    className={`flex-1 p-2 transition-colors overflow-y-auto ${snapshot.isDraggingOver ? config.bg : ''}`}>
                    {columnLeads.map((lead, index) => (
                      <Draggable key={lead.id.toString()} draggableId={lead.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            onClick={() => onCardClick(lead)}
                            className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-3 cursor-grab hover:shadow-md transition group
                              ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-crm-500 z-50' : ''}`}>
                            
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-1 rounded border border-slate-100 uppercase">
                                    {lead.tipo_seguro || 'Geral'}
                                </span>
                                <small className="text-[10px] text-slate-400">{new Date(lead.criadoEm).toLocaleDateString()}</small>
                            </div>
                            
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{lead.nome || 'Sem Nome'}</h4>
                            <p className="text-xs text-slate-500 truncate">{lead.modelo_veiculo || 'Veículo não informado'}</p>
                            
                            <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-xs text-crm-600 font-semibold group-hover:underline">Detalhes</span>
                                {lead.whatsapp && <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm" title="WhatsApp OK"></div>}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
export default KanbanBoard;