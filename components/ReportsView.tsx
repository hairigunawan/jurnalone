// components/ReportsView.tsx
"use client";
import { FileText, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Trade } from "@prisma/client";

interface Props {
  trades: Trade[];
}

interface MonthlyStat {
  pnl: number;
  wins: number;
  losses: number;
  total: number;
}

export default function ReportsView({ trades }: Props) {
  // Logic grouping by month
  const monthlyStats: Record<string, MonthlyStat> = {};
  trades.forEach(t => {
    const month = t.dateEntry.substring(0, 7); // YYYY-MM
    if (!monthlyStats[month]) {
      monthlyStats[month] = { pnl: 0, wins: 0, losses: 0, total: 0 };
    }
    monthlyStats[month].pnl += t.pnl;
    monthlyStats[month].total += 1;
    if (t.result === 'Win') monthlyStats[month].wins += 1;
    else monthlyStats[month].losses += 1;
  });

  const months = Object.keys(monthlyStats).sort().reverse();

  const exportToCSV = (tradesToExport: Trade[], fileName: string) => {
    const headers = ["Date Entry", "Date Exit", "Instrument", "Position", "Status", "Entry", "Exit", "Lot", "Fees", "PnL", "Rate", "Result", "Setup", "Notes"];
    const rows = tradesToExport.map(t => [
      t.dateEntry,
      t.dateExit || "-",
      t.instrument,
      t.position,
      t.status,
      t.entry,
      t.exit || "-",
      t.lot,
      t.fees,
      t.pnl,
      t.rate,
      t.result,
      t.setup || "-",
      t.notes || "-"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header - Outside the loop */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="text-blue-600" size={20} /> Monthly Reports
        </h2>
        <button 
          onClick={() => exportToCSV(trades, "all-trades-report")}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors"
        >
          <Download size={14} /> Export All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {months.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
            Belum ada data untuk laporan.
          </div>
        ) : (
          months.map(month => {
            const stat = monthlyStats[month];
            const winRate = ((stat.wins / stat.total) * 100).toFixed(1);
            const date = new Date(month + "-01");
            const tradesInMonth = trades.filter(t => t.dateEntry.startsWith(month));
            
            return (
              <div key={month} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:border-blue-400 transition-all">
                
                {/* Left Side: Month Info */}
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                    <span className="text-[10px] uppercase font-black leading-none">{date.toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-sm font-bold">{date.getFullYear()}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white">
                      {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className="font-bold text-blue-600">{stat.total}</span> Trades Executed
                    </p>
                  </div>
                </div>

                {/* Right Side: Stats */}
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Win Rate</p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{winRate}%</span>
                      <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${winRate}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Net P/L</p>
                    <p className={`text-base font-black ${stat.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.pnl >= 0 ? '+' : ''}${stat.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <button 
                    onClick={() => exportToCSV(tradesInMonth, `report-${month}`)}
                    className="p-2.5 bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
