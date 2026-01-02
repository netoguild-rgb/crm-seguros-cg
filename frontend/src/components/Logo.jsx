import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Logo = ({ collapsed }) => {
  return (
    <div className="flex items-center justify-center gap-2 py-4 overflow-hidden whitespace-nowrap">
      <div className="bg-gradient-to-tr from-crm-600 to-orange-400 p-2 rounded-xl shadow-lg shadow-orange-500/20">
        <ShieldCheck size={28} className="text-white" strokeWidth={2.5} />
      </div>
      
      {!collapsed && (
        <div className="flex flex-col animate-fade-in">
          <span className="font-bold text-xl tracking-tight leading-none text-white">
            CRM <span className="text-crm-500">Seguros</span>
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Corretora
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;