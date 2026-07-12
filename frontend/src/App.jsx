import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Activity, Target } from 'lucide-react';

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    axios.get(`${apiUrl}/api/companies`)
      .then(res => {
        setCompanies(res.data.companies);
        setSelectedCompany(res.data.companies[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prepare data for charts
  const revenueChartData = companies.map(c => ({
    name: c.ticker,
    revenue24: c.revenue_2024,
    revenue25: c.revenue_2025
  }));

  const metricsChartData = companies.map(c => ({
    name: c.ticker,
    margin: c.net_profit_margin,
    roe: c.roe
  }));

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans">
      {/* Header */}
      <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            FinanceIQ 2026
          </h1>
          <p className="text-gray-400 text-lg">Top 10 Financial Institutions Dashboard</p>
        </div>
        <div className="glass-panel px-6 py-3 flex gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wider">Market Cap</p>
            <p className="text-xl font-bold text-white">
              ${(companies.reduce((acc, c) => acc + c.market_cap, 0) / 1000).toFixed(2)}T
            </p>
          </div>
          <div className="w-px bg-white/10"></div>
          <div className="text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wider">Total Assets</p>
            <p className="text-xl font-bold text-white">
              ${(companies.reduce((acc, c) => acc + c.total_assets, 0) / 1000).toFixed(2)}T
            </p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Company List */}
        <div className="lg:col-span-1 glass-panel p-6 flex flex-col h-[800px]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Institutions
          </h2>
          <div className="overflow-y-auto flex-1 pr-2 space-y-3">
            {companies.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCompany(c)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${selectedCompany?.id === c.id ? 'bg-primary/20 border border-primary/50' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{c.ticker}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{c.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">${c.stock_price.toFixed(2)}</p>
                    <p className={`text-xs flex items-center justify-end gap-1 ${c.upside_pct >= 0 ? 'text-accent' : 'text-red-400'}`}>
                      {c.upside_pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(c.upside_pct).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Charts */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Detail Cards */}
          {selectedCompany && (
            <div className="glass-panel p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-1">{selectedCompany.name}</h2>
                  <p className="text-primary font-medium">{selectedCompany.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Analyst Rating</p>
                  <p className="text-lg font-bold text-accent">{selectedCompany.analyst_rating}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Revenue '25" value={`$${selectedCompany.total_revenue}B`} icon={<DollarSign className="w-5 h-5 text-blue-400" />} />
                <MetricCard title="Net Income" value={`$${selectedCompany.net_income}B`} icon={<Activity className="w-5 h-5 text-purple-400" />} />
                <MetricCard title="Profit Margin" value={`${selectedCompany.net_profit_margin}%`} icon={<Target className="w-5 h-5 text-green-400" />} />
                <MetricCard title="P/E Ratio" value={`${selectedCompany.pe_ratio}x`} icon={<TrendingUp className="w-5 h-5 text-yellow-400" />} />
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-6 h-[350px] flex flex-col">
              <h3 className="text-lg font-bold mb-4">Revenue Growth (2024 vs 2025)</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff80" tick={{fontSize: 12}} />
                    <YAxis stroke="#ffffff80" tick={{fontSize: 12}} tickFormatter={(v) => `$${v}B`} />
                    <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="revenue24" name="FY 2024" fill="#8b5cf6" radius={[4,4,0,0]} />
                    <Bar dataKey="revenue25" name="FY 2025" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-6 h-[350px] flex flex-col">
              <h3 className="text-lg font-bold mb-4">Profitability: Margin & ROE (%)</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff80" tick={{fontSize: 12}} />
                    <YAxis stroke="#ffffff80" tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px'}} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="margin" name="Net Margin %" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="roe" name="ROE %" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Full Data Table */}
          <div className="glass-panel p-6 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold mb-4">Comprehensive Balance Sheet (USD Billions)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="p-3 font-semibold rounded-tl-lg">Ticker</th>
                    <th className="p-3 font-semibold">Total Assets</th>
                    <th className="p-3 font-semibold">Total Liabilities</th>
                    <th className="p-3 font-semibold">Equity</th>
                    <th className="p-3 font-semibold">Net Loans</th>
                    <th className="p-3 font-semibold">Deposits</th>
                    <th className="p-3 font-semibold rounded-tr-lg">Debt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companies.map(c => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold">{c.ticker}</td>
                      <td className="p-3">${c.total_assets.toFixed(1)}B</td>
                      <td className="p-3">${c.total_liabilities.toFixed(1)}B</td>
                      <td className="p-3">${c.shareholders_equity.toFixed(1)}B</td>
                      <td className="p-3">{c.net_loans ? `$${c.net_loans.toFixed(1)}B` : 'N/A'}</td>
                      <td className="p-3">{c.total_deposits ? `$${c.total_deposits.toFixed(1)}B` : 'N/A'}</td>
                      <td className="p-3">${c.total_debt.toFixed(1)}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
