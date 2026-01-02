import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = ({ leads }) => {
  
  // 1. Lógica de Cálculo (Diário vs Mensal)
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

    return leads.reduce((acc, lead) => {
      const status = lead.status || 'NOVO';
      const leadDate = new Date(lead.criadoEm);
      
      if (!acc[status]) acc[status] = { total: 0, month: 0, day: 0 };
      acc[status].total += 1; // Total Geral
      
      // Mensal
      if (leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear) {
        acc[status].month += 1;
      }
      // Diário
      if (leadDate.toDateString() === today.toDateString()) {
        acc[status].day += 1;
      }
      return acc;
    }, initial);
  }, [leads]);

  // 2. Dados para o Gráfico
  const chartData = [
    { name: 'Novos', Status: stats.NOVO.total, Mensal: stats.NOVO.month, Diario: stats.NOVO.day },
    { name: 'Negociação', Status: stats.NEGOCIACAO.total, Mensal: stats.NEGOCIACAO.month, Diario: stats.NEGOCIACAO.day },
    { name: 'Fechados', Status: stats.FECHADO.total, Mensal: stats.FECHADO.month, Diario: stats.FECHADO.day },
    { name: 'Perdidos', Status: stats.PERDIDO.total, Mensal: stats.PERDIDO.month, Diario: stats.PERDIDO.day },
  ];

  // 3. Gerar PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Relatório de Resultados - CRM Seguros', 14, 22);
    doc.setFontSize(11);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = [
      ['Novos Leads', stats.NOVO.day, stats.NOVO.month, stats.NOVO.total],
      ['Em Negociação', stats.NEGOCIACAO.day, stats.NEGOCIACAO.month, stats.NEGOCIACAO.total],
      ['Vendas Fechadas', stats.FECHADO.day, stats.FECHADO.month, stats.FECHADO.total],
      ['Perdidos', stats.PERDIDO.day, stats.PERDIDO.month, stats.PERDIDO.total],
    ];

    autoTable(doc, {
      head: [['Categoria', 'Hoje', 'Este Mês', 'Total Geral']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] },
    });
    doc.save('relatorio-resultados.pdf');
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
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f1f5f9'}} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="Diario" name="Hoje" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
            <Bar dataKey="Mensal" name="Mês Atual" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;