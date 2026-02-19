// components/DashboardView.tsx
"use client";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Calendar } from "lucide-react";
import { Trade, Transaction } from "@prisma/client";

interface Props {
  trades: Trade[];
  transactions: Transaction[];
  onOpenTransactionModal: () => void;
}

export default function DashboardView({ trades, transactions, onOpenTransactionModal }: Props) {
  
  // --- LOGIC PERHITUNGAN STATISTIK OTOMATIS ---
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === 'Win').length;
  const losses = trades.filter(t => t.result === 'Loss').length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;
  
  const grossProfit = trades.filter(t => t.pnl > 0).reduce((acc, curr) => acc + curr.pnl, 0);
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, curr) => acc + curr.pnl, 0));
  const netProfit = grossProfit - grossLoss;

  const totalDeposit = transactions.filter(tr => tr.type === 'Deposit').reduce((acc, curr) => acc + curr.amount, 0);
  const totalWithdrawal = transactions.filter(tr => tr.type === 'Withdrawal').reduce((acc, curr) => acc + curr.amount, 0);
  const currentEquity = totalDeposit - totalWithdrawal + netProfit;

  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit.toFixed(2);
  
  const avgWin = wins > 0 ? (grossProfit / wins).toFixed(2) : 0;
  const avgLoss = losses > 0 ? (grossLoss / losses).toFixed(2) : 0;

  // --- DATA UNTUK CHART ---
  
  // 1. Equity Curve (Akumulasi Profit per Trade)
  interface EquityData {
    name: string;
    balance: number;
    pnl: number;
  }
  
  const equityData = trades.reduce((acc: EquityData[], trade, index) => {
    const prevBalance = index > 0 ? acc[index - 1].balance : 0;
    const currentBalance = prevBalance + trade.pnl;
    acc.push({
      name: `Trade ${index + 1}`,
      balance: currentBalance,
      pnl: trade.pnl
    });
    return acc;
  }, []);

  // 2. Performance per Instrumen
  const instrumentStats: Record<string, number> = {};
  trades.forEach(t => {
    if (!instrumentStats[t.instrument]) instrumentStats[t.instrument] = 0;
    instrumentStats[t.instrument] += t.pnl;
  });
  
  interface ChartData {
    name: string;
    value: number;
  }
  
  const instrumentData: ChartData[] = Object.keys(instrumentStats).map(key => ({
    name: key,
    value: instrumentStats[key]
  })).sort((a, b) => b.value - a.value); // Sort by highest profit

  // 3. Win/Loss Pie Data
  const pieData = [
    { name: 'Wins', value: wins, color: '#10B981' },
    { name: 'Losses', value: losses, color: '#EF4444' }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      
      {/* 1. KEY METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={40} className={netProfit >= 0 ? "text-green-500" : "text-red-500"} />
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Net Profit</p>
          <h3 className={`text-xl font-bold mt-1 ${netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            ${netProfit.toFixed(2)}
          </h3>
          <div className="mt-2 flex items-center text-[10px]">
            <span className="text-gray-400">Profit Factor: </span>
            <span className="font-bold ml-1 text-gray-700 dark:text-gray-300">{profitFactor}</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Win Rate</p>
              <h3 className="text-xl font-bold mt-1 text-gray-800 dark:text-white">{winRate}%</h3>
            </div>
            <div className={`p-1.5 rounded-lg ${Number(winRate) > 50 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Target size={16} />
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1">
            <div className={`h-1 rounded-full ${Number(winRate) > 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${winRate}%` }}></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">{wins} Wins / {losses} Losses</p>
        </div>

        {/* Avg Win/Loss */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Avg Win / Loss</p>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-lg font-bold text-green-600 dark:text-green-400">+${avgWin}</span>
            <span className="text-xs text-gray-400 mb-0.5">/</span>
            <span className="text-lg font-bold text-red-600 dark:text-red-400">-${avgLoss}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Risk Reward 1:{(Number(avgWin)/Number(avgLoss)).toFixed(1)}</p>
        </div>

        {/* Current Balance (Equity) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Current Balance</p>
              <h3 className="text-xl font-bold mt-1 text-gray-800 dark:text-white">${currentEquity.toFixed(2)}</h3>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Total Trades: {totalTrades}</p>
        </div>
      </div>

      {/* Deposit & WD Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Deposit</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">${totalDeposit.toFixed(2)}</p>
            </div>
          </div>
          <button onClick={onOpenTransactionModal} className="text-[10px] font-bold text-blue-600 hover:underline">Add Deposit</button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
              <TrendingDown size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Withdrawal</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">${totalWithdrawal.toFixed(2)}</p>
            </div>
          </div>
          <button onClick={onOpenTransactionModal} className="text-[10px] font-bold text-red-600 hover:underline">Withdraw</button>
        </div>
      </div>

      {/* 2. MAIN CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Equity Curve (Large) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Equity Curve</h3>
            <select className="text-[10px] border-none bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-0.5 outline-none text-gray-600 dark:text-gray-300">
              <option>All Time</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                  itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win/Loss Distribution (Small) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">Performance</h3>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-gray-800 dark:text-white">{winRate}%</span>
              <span className="text-[10px] text-gray-400">Success</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-center">
            <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-[10px] text-green-600 dark:text-green-400 font-bold">Wins</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{wins}</p>
            </div>
            <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">Losses</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{losses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Instruments & Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Top Instruments */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Top Instruments
          </h3>
          <div className="space-y-3">
            {instrumentData.slice(0, 5).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.value >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                      style={{ width: `${Math.min(Math.abs(item.value) * 2, 100)}%` }}
                    ></div>
                  </div>
                  <span className={`font-bold text-[10px] w-16 text-right ${item.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${item.value.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity / Monthly Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-purple-500" /> Monthly P/L
          </h3>
          <div className="h-40">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={instrumentData.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '10px' }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {instrumentData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}