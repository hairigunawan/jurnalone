// components/OverviewView.tsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Target, Zap, ShieldAlert, Award } from "lucide-react";
import { Trade } from "@prisma/client";

interface Props {
  trades: Trade[];
}

export default function OverviewView({ trades }: Props) {
  // Statistics Logic
  const total = trades.length;
  const wins = trades.filter(t => t.result === 'Win');
  const losses = trades.filter(t => t.result === 'Loss');
  
  const longs = trades.filter(t => t.position === 'Long');
  const shorts = trades.filter(t => t.position === 'Short');
  
  const longWinRate = longs.length > 0 ? (longs.filter(t => t.result === 'Win').length / longs.length * 100).toFixed(1) : 0;
  const shortWinRate = shorts.length > 0 ? (shorts.filter(t => t.result === 'Win').length / shorts.length * 100).toFixed(1) : 0;

  const bestTrade = Math.max(...trades.map(t => t.pnl), 0);
  const worstTrade = Math.min(...trades.map(t => t.pnl), 0);

  const instrumentDistribution = trades.reduce((acc: Record<string, number>, t) => {
    acc[t.instrument] = (acc[t.instrument] || 0) + 1;
    return acc;
  }, {});

  interface DistributionData {
    name: string;
    value: number;
  }

  const distributionData: DistributionData[] = Object.keys(instrumentDistribution).map(key => ({
    name: key,
    value: instrumentDistribution[key]
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Account Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg"><Target size={16}/></div>
            <p className="text-xs font-bold text-gray-500 uppercase">Long Win Rate</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{longWinRate}%</p>
          <p className="text-[10px] text-gray-400 mt-1">{longs.length} total long trades</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Zap size={16}/></div>
            <p className="text-xs font-bold text-gray-500 uppercase">Short Win Rate</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{shortWinRate}%</p>
          <p className="text-[10px] text-gray-400 mt-1">{shorts.length} total short trades</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-lg"><Award size={16}/></div>
            <p className="text-xs font-bold text-gray-500 uppercase">Best Trade</p>
          </div>
          <p className="text-2xl font-bold text-green-600">+${bestTrade.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 mt-1">Single highest profit</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg"><ShieldAlert size={16}/></div>
            <p className="text-xs font-bold text-gray-500 uppercase">Worst Trade</p>
          </div>
          <p className="text-2xl font-bold text-red-600">${worstTrade.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 mt-1">Single highest loss</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-6">Trade Distribution by Asset</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {distributionData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-6">Profit/Loss by Position</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Long', pnl: longs.reduce((acc, t) => acc + t.pnl, 0) },
                { name: 'Short', pnl: shorts.reduce((acc, t) => acc + t.pnl, 0) }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  <Cell fill="#10B981" />
                  <Cell fill="#3B82F6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
