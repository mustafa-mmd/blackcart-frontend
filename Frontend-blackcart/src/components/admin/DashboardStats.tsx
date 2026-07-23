import React from 'react';
import { Users, ShoppingCart, DollarSign, AlertTriangle, Package, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardStatsProps { stats: { overview: any } }

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const overview = stats?.overview || {};
  const currency = (value: number) => `PKR ${Number(value || 0).toLocaleString()}`;
  const cards = [
    { label: 'Total Revenue', value: currency(overview.totalRevenue), note: `${overview.revenueChange >= 0 ? '+' : ''}${Number(overview.revenueChange || 0).toFixed(1)}% from last 7 days`, icon: DollarSign, tone: 'text-emerald-600 bg-emerald-50', positive: overview.revenueChange >= 0 },
    { label: 'Total Orders', value: Number(overview.totalOrders || 0).toLocaleString(), note: `${overview.orderChange >= 0 ? '+' : ''}${Number(overview.orderChange || 0).toFixed(1)}% from last 7 days`, icon: ShoppingCart, tone: 'text-blue-600 bg-blue-50', positive: overview.orderChange >= 0 },
    { label: 'Total Customers', value: Number(overview.totalUsers || 0).toLocaleString(), note: 'Registered customers', icon: Users, tone: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Orders', value: Number(overview.pendingOrders || 0).toLocaleString(), note: 'Need attention', icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50' },
    { label: 'Low Stock Items', value: Number(overview.lowStockProducts || 0).toLocaleString(), note: 'Review inventory', icon: Package, tone: 'text-red-600 bg-red-50' },
    { label: 'Total Payouts', value: currency(overview.totalPayouts || 0), note: 'This week', icon: Wallet, tone: 'text-indigo-600 bg-indigo-50' },
  ];
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
    {cards.map((card) => <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-500">{card.label}</p><p className="mt-2 truncate text-xl font-bold tracking-tight text-slate-950">{card.value}</p><div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">{card.positive !== undefined && (card.positive ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-red-500" />)}<span className={card.positive === true ? 'text-emerald-600' : card.positive === false ? 'text-red-600' : ''}>{card.note}</span></div></div><div className={`rounded-lg p-2.5 ${card.tone}`}><card.icon className="h-5 w-5" /></div></div>
    </div>)}
  </div>;
};
export default DashboardStats;
