
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

  if (sales.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales Intelligence</h1>
          <p className="text-slate-500 font-medium">Business analytics will appear here after your first sale.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Sales Data Available Yet</p>
          <p className="text-slate-400 text-xs mt-2">Complete a transaction in the gallery or AI billing to see reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales Intelligence</h1>
        <p className="text-slate-500 font-medium">Overview of your store performance and trending stock</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-slate-900">{currencySymbol}{stats.totalRevenue.toLocaleString()}</p>
          <div className="mt-3 text-[10px] text-green-500 font-black uppercase tracking-wider flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            Active Growth
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pairs Sold</p>
          <p className="text-3xl font-black text-slate-900">{stats.totalSales.toLocaleString()}</p>
          <div className="mt-3 text-[10px] text-indigo-500 font-black uppercase tracking-wider">Units Delivered</div>
        </div>
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl group hover:shadow-indigo-500/20 transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Order Value</p>
          <p className="text-3xl font-black">{currencySymbol}{sales.length ? Math.round(stats.totalRevenue / sales.length).toLocaleString() : 0}</p>
          <div className="mt-3 text-[10px] text-indigo-400 font-black uppercase tracking-wider">Per Customer Visit</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 min-w-0">
          <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight">Revenue Trend (Last 7 Days)</h3>
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                />
                <Tooltip 
                  formatter={(value: any) => [`${currencySymbol}${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 min-w-0">
          <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight">Top Performing Models</h3>
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 30, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                />
                <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={32} animationDuration={1500}>
                  {stats.topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'][index % 5]} />
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
