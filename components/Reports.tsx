
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { SaleRecord } from '../types';

interface ReportsProps {
  sales: SaleRecord[];
  currencySymbol: string;
}

const Reports: React.FC<ReportsProps> = ({ sales, currencySymbol }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalPrice, 0);
    const totalSales = sales.reduce((acc, sale) => acc + sale.quantity, 0);
    
    // Group sales by day for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const dailyRevenue = last7Days.map(day => {
      const daySales = sales.filter(s => {
        const saleDay = new Date(s.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
        return saleDay === day;
      });
      return {
        name: day,
        revenue: daySales.reduce((acc, s) => acc + s.totalPrice, 0)
      };
    });

    // Top selling products
    const productCounts: Record<string, number> = {};
    sales.forEach(s => {
      productCounts[s.shoeName] = (productCounts[s.shoeName] || 0) + s.quantity;
    });
    
    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalRevenue, totalSales, dailyRevenue, topProducts };
  }, [sales]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sales Intelligence</h1>
        <p className="text-slate-500">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900">{currencySymbol}{stats.totalRevenue.toLocaleString()}</p>
          <div className="mt-2 text-xs text-green-500 font-bold flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            +12.5% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-400 mb-1">Shoes Sold</p>
          <p className="text-3xl font-bold text-slate-900">{stats.totalSales}</p>
          <div className="mt-2 text-xs text-indigo-500 font-bold">Units distributed</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-400 mb-1">Average Order Value</p>
          <p className="text-3xl font-bold text-slate-900">
            {currencySymbol}{sales.length ? Math.round(stats.totalRevenue / sales.length) : 0}
          </p>
          <div className="mt-2 text-xs text-slate-500">Per transaction</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend (7D)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  formatter={(value: any) => [`${currencySymbol}${value}`, 'Revenue']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Performers</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} width={100} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {stats.topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
