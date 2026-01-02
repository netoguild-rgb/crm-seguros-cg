// ARQUIVO: frontend/src/components/Dashboard.jsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = ({ leads }) => {
  // Se leads não vier (undefined), usa array vazio para não quebrar
  const safeLeads = leads || [];

  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const initial = {
      NOVO: { total: 0, month: 0, day: 0 },
      NEGOCIACAO: { total: 0, month: 0, day: 0 },
      FECHADO: { total: 0, month: 0, day: 0 },
      PERDIDO: { total: 0, month: 0, day: 0 },
    };

    return safeLeads.reduce((acc, lead) => {
      const status = lead.status || 'NOVO';
      const leadDate = new Date(lead.criadoEm);
      
      if (!acc[status]) acc[status] = { total: 0, month: 0, day: 0 };
      acc[status].total += 1; 
      
      if (leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear) {
        acc[status].month += 1;
      }
      if (leadDate.toDateString() === today.toDateString()) {
        acc[status].day += 1;
      }
      return acc;
    }, initial);
  }, [safeLeads]);

  const chartData = [
    { name: 'Novos', Status: stats.NOVO.total, Mensal: stats.NOVO.month, Diario: stats.NOVO.day },
    { name: 'Negociação', Status: stats.NEGOCIACAO.total, Mensal: stats.NEGOCIACAO.month, Diario: stats.NEGOCIACAO.day },
    { name: 'Fechados', Status: stats.FECHADO.total, Mensal: stats.FECHADO.month, Diario: stats.FECHADO.day },
    { name: 'Perdidos', Status: stats.PERDIDO.total, Mensal: stats.PERDIDO.month, Diario: stats.PERDIDO.day },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Resultados - CRM Seguros', 14, 20);
    const tableData = chartData.map(d => [d.name, d.Diario, d.Mensal, d.Status]);
    autoTable(doc, {
      head: [['Fase', 'Hoje', 'Mês', 'Total']],
      body: tableData,
      startY: 30,
    });
    doc.save('relatorio.pdf');
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
         <h3 className="text-sm font-bold text-slate-500 uppercase">Panorama de Vendas</h3>
         <button onClick={generatePDF} className="flex items-center gap-2 px-3 py-1.5 bg-crm-50 text-crm-700 text-xs font-bold rounded hover:bg-crm-100 transition">
            <Download size={14} /> Baixar Relatório
         </button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Diario" name="Hoje" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Mensal" name="Mês" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;