// ARQUIVO: frontend/src/components/Dashboard.jsx
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, Users, Target, DollarSign, Clock, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Dashboard = ({ leads }) => {
  const safeLeads = leads || [];

  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const initial = {
      NOVO: { total: 0, month: 0, day: 0, yesterday: 0 },
      NEGOCIACAO: { total: 0, month: 0, day: 0, yesterday: 0 },
      FECHADO: { total: 0, month: 0, day: 0, yesterday: 0 },
      PERDIDO: { total: 0, month: 0, day: 0, yesterday: 0 },
    };

    return safeLeads.reduce((acc, lead) => {
      const status = lead.status || 'NOVO';
      const leadDate = new Date(lead.criadoEm);

      if (!acc[status]) acc[status] = { total: 0, month: 0, day: 0, yesterday: 0 };
      acc[status].total += 1;

      if (leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear) {
        acc[status].month += 1;
      }
      if (leadDate.toDateString() === today.toDateString()) {
        acc[status].day += 1;
      }
      if (leadDate.toDateString() === yesterday.toDateString()) {
        acc[status].yesterday += 1;
      }
      return acc;
    }, initial);
  }, [safeLeads]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalLeads = safeLeads.length;
    const closedLeads = stats.FECHADO.total;
    const lostLeads = stats.PERDIDO.total;
    const activeLeads = stats.NOVO.total + stats.NEGOCIACAO.total;
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Trend calculation (comparing today vs yesterday)
    const todayTotal = stats.NOVO.day + stats.NEGOCIACAO.day + stats.FECHADO.day;
    const yesterdayTotal = stats.NOVO.yesterday + stats.NEGOCIACAO.yesterday + stats.FECHADO.yesterday;
    const dayTrend = yesterdayTotal > 0 ? (((todayTotal - yesterdayTotal) / yesterdayTotal) * 100).toFixed(0) : 0;

    return {
      totalLeads,
      closedLeads,
      activeLeads,
      conversionRate,
      todayLeads: todayTotal,
      dayTrend: Number(dayTrend)
    };
  }, [safeLeads, stats]);

  const chartData = [
    { name: 'Novos', value: stats.NOVO.total, mensal: stats.NOVO.month, color: '#3b82f6' },
    { name: 'Negociação', value: stats.NEGOCIACAO.total, mensal: stats.NEGOCIACAO.month, color: '#f59e0b' },
    { name: 'Fechados', value: stats.FECHADO.total, mensal: stats.FECHADO.month, color: '#10b981' },
    { name: 'Perdidos', value: stats.PERDIDO.total, mensal: stats.PERDIDO.month, color: '#ef4444' },
  ];

  // Pie chart data
  const pieData = chartData.filter(d => d.value > 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor('#667eea');
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Relatório de Performance - CRM Seguros', 14, 20);

    const tableData = chartData.map(d => [d.name, d.mensal, d.value]);
    autoTable(doc, {
      head: [['Status', 'Este Mês', 'Total']],
      body: tableData,
      startY: 40,
      headStyles: { fillColor: '#667eea' }
    });

    // Add KPIs
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setTextColor(50);
    doc.setFontSize(12);
    doc.text(`Taxa de Conversão: ${kpis.conversionRate}%`, 14, finalY);
    doc.text(`Leads Ativos: ${kpis.activeLeads}`, 14, finalY + 8);
    doc.text(`Vendas Fechadas: ${kpis.closedLeads}`, 14, finalY + 16);

    doc.save('relatorio-crm.pdf');
  };

  // KPI Card Component
  const KPICard = ({ icon: Icon, title, value, subtitle, trend, color, delay }) => (
    <div
      className={`kpi-card group opacity-0 animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-white" size={22} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="kpi-value mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          title="Total de Leads"
          value={kpis.totalLeads}
          subtitle="Todos os registros"
          color="from-blue-500 to-blue-600"
          delay={0}
        />
        <KPICard
          icon={Zap}
          title="Leads Ativos"
          value={kpis.activeLeads}
          subtitle="Em prospecção"
          color="from-amber-500 to-orange-500"
          delay={100}
        />
        <KPICard
          icon={Target}
          title="Vendas Fechadas"
          value={kpis.closedLeads}
          subtitle="Conversões realizadas"
          trend={kpis.dayTrend}
          color="from-emerald-500 to-green-600"
          delay={200}
        />
        <KPICard
          icon={TrendingUp}
          title="Taxa de Conversão"
          value={`${kpis.conversionRate}%`}
          subtitle="Leads → Vendas"
          color="from-purple-500 to-indigo-600"
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Panorama de Vendas</h3>
              <p className="text-sm text-slate-500">Performance por status</p>
            </div>
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-crm-500 to-accent-purple text-white text-sm font-bold rounded-xl hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5"
            >
              <Download size={16} /> Exportar PDF
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend />
                <Bar dataKey="mensal" name="Este Mês" fill="url(#barGradient1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="value" name="Total" fill="url(#barGradient2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card rounded-2xl p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Distribuição</h3>
            <p className="text-sm text-slate-500">Por status atual</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-4">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;