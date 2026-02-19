// components/HoldingTimeView.tsx
"use client";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Activity } from "lucide-react";
import { Trade } from "@prisma/client";

interface Props {
  trades: Trade[];
}

export default function HoldingTimeView({ trades }: Props) {
  // Calculate holding time in hours (simplified)
  const data = trades
    .filter(t => t.dateEntry && t.dateExit) // Only for closed trades
    .map(t => {
      const entry = new Date(t.dateEntry);
      const exit = new Date(t.dateExit!);
      const hours = Math.max(0.5, (exit.getTime() - entry.getTime()) / (1000 * 60 * 60)); // min 0.5h for visualization
      return {
        hours: parseFloat(hours.toFixed(1)),
        pnl: t.pnl,
        instrument: t.instrument,
        id: t.id
      };
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><Activity size={20}/></div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Holding Time Analysis</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-6">PnL vs Duration (Hours)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="hours" name="Duration" unit="h" label={{ value: 'Hours Held', position: 'bottom', offset: 0 }} />
              <YAxis type="number" dataKey="pnl" name="Profit/Loss" unit="$" label={{ value: 'P/L ($)', angle: -90, position: 'insideLeft' }} />
              <ZAxis type="category" dataKey="instrument" name="Instrument" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Trades" data={data} fill="#3B82F6">
                {data.map((entry, index) => (
                  <circle key={`cell-${index}`} cx={0} cy={0} r={4} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Avg Holding Time</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            {(data.reduce((acc, curr) => acc + curr.hours, 0) / (data.length || 1)).toFixed(1)} Hours
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Most Profitable Duration</p>
          <p className="text-xl font-bold text-green-600">
            {data.length > 0 ? data.sort((a,b) => b.pnl - a.pnl)[0].hours : 0} Hours
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Shortest Trade</p>
          <p className="text-xl font-bold text-blue-600">
            {data.length > 0 ? Math.min(...data.map(d => d.hours)) : 0} Hours
          </p>
        </div>
      </div>
    </div>
  );
}
