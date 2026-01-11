import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, Phone, Flame, Calendar } from 'lucide-react';

const columns = {
  NOVO: {
    title: 'Novos Leads',
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50/30',
    borderColor: 'border-blue-400',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  NEGOCIACAO: {
    title: 'Em Negociação',
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50/30',
    borderColor: 'border-amber-400',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  FECHADO: {
    title: 'Venda Fechada',
    gradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50/30',
    borderColor: 'border-emerald-400',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  PERDIDO: {
    title: 'Perdido',
    gradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50/30',
    borderColor: 'border-red-400',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  }
};

// Check if lead is "hot" (created within last 24h)
const isHotLead = (criadoEm) => {
  const created = new Date(criadoEm);
  const now = new Date();
  const hoursDiff = (now - created) / (1000 * 60 * 60);
  return hoursDiff <= 24;
};

// Get time ago string
const getTimeAgo = (date) => {
  const now = new Date();
  const created = new Date(date);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const KanbanBoard = ({ leads, onDragEnd, onCardClick }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-5 overflow-x-auto pb-4 px-1">
        {Object.entries(columns).map(([statusKey, config], columnIndex) => {
          const columnLeads = leads.filter(l => (l.status || 'NOVO') === statusKey);

          return (
            <div
              key={statusKey}
              className="flex-shrink-0 w-80 flex flex-col h-full rounded-2xl bg-white/50 backdrop-blur-sm border border-slate-200/60 shadow-card overflow-hidden opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${columnIndex * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Column Header */}
              <div className={`p-4 bg-gradient-to-r ${config.gradient} flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide">{config.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-bold border border-white/30">
                    {columnLeads.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={statusKey}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 transition-all duration-300 overflow-y-auto ${snapshot.isDraggingOver
                        ? `${config.bgLight} ring-2 ring-inset ring-slate-300`
                        : ''
                      }`}
                  >
                    {columnLeads.length === 0 && !snapshot.isDraggingOver && (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-slate-400 text-sm text-center py-8">
                          Arraste leads para cá
                        </p>
                      </div>
                    )}

                    {columnLeads.map((lead, index) => {
                      const isHot = isHotLead(lead.criadoEm) && statusKey === 'NOVO';

                      return (
                        <Draggable key={lead.id.toString()} draggableId={lead.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onCardClick(lead)}
                              className={`
                                relative bg-white p-4 rounded-xl mb-3 cursor-grab
                                border border-slate-200/80
                                transition-all duration-300 ease-out
                                hover:shadow-card-hover hover:-translate-y-1
                                group
                                ${snapshot.isDragging
                                  ? 'rotate-2 shadow-float ring-2 ring-crm-500 z-50 scale-105'
                                  : 'shadow-card'
                                }
                                ${isHot ? 'ring-2 ring-amber-400/50' : ''}
                              `}
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              {/* Hot Lead Indicator */}
                              {isHot && (
                                <div className="absolute -top-2 -right-2 animate-bounce-subtle">
                                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <Flame size={12} /> HOT
                                  </div>
                                </div>
                              )}

                              {/* Card Header */}
                              <div className="flex justify-between items-start mb-3">
                                <span className={`${config.iconBg} ${config.iconColor} text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide`}>
                                  {lead.tipo_seguro || 'Geral'}
                                </span>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Clock size={12} />
                                  <small className="text-[10px] font-medium">{getTimeAgo(lead.criadoEm)}</small>
                                </div>
                              </div>

                              {/* Lead Name */}
                              <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-crm-600 transition-colors">
                                {lead.nome || 'Sem Nome'}
                              </h4>

                              {/* Vehicle Info */}
                              <p className="text-xs text-slate-500 truncate mb-3">
                                {lead.modelo_veiculo || 'Veículo não informado'}
                              </p>

                              {/* Card Footer */}
                              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                <span className="text-xs text-crm-600 font-semibold group-hover:underline flex items-center gap-1">
                                  Ver detalhes
                                </span>
                                <div className="flex items-center gap-2">
                                  {lead.whatsapp && (
                                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                      <Phone size={10} />
                                      <span className="text-[10px] font-bold">OK</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Hover Gradient Line */}
                              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl`} />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
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