import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Clock, Calendar, BarChart2, ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown } from "lucide-react";
import { Trade } from "@prisma/client";

interface Props {
  trades: Trade[];
  type: "Hourly" | "Weekly" | "Monthly";
}

interface ChartData {
  name: string;
  value: number;
}

export default function TemporalView({ trades, type }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ date: string, trades: Trade[] } | null>(null);

  // Logic for Calendar (Weekly tab)
  const calendarData = useMemo(() => {
    if (type !== "Weekly") return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Padding for start of week (Sunday start)
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const calendarDays = [];
    
    // Add padding from prev month
    for (let i = 0; i < startPadding; i++) {
      calendarDays.push({ day: null, dateStr: null, pnl: 0, count: 0 });
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const dayTrades = trades.filter(t => t.dateEntry === dateStr);
      const pnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
      calendarDays.push({ 
        day: i, 
        dateStr, 
        pnl, 
        count: dayTrades.length,
        trades: dayTrades 
      });
    }
    
    return calendarDays;
  }, [trades, type, currentDate]);

  let data: ChartData[] = [];
  let title = "";
  let Icon = Clock;

  if (type === "Hourly") {
    title = "Hourly Performance";
    Icon = Clock;
    const hours: Record<string, number> = {};
    for (let i = 0; i < 24; i++) hours[i.toString().padStart(2, '0')] = 0;
    
    trades.forEach(t => {
      const hour = "12"; // Placeholder
      hours[hour] += t.pnl;
    });
    data = Object.keys(hours).map(h => ({ name: h + ":00", value: hours[h] }));
  } else if (type === "Monthly") {
    title = "Monthly Performance";
    Icon = BarChart2;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const stats: Record<string, number> = {};
    months.forEach(m => stats[m] = 0);

    trades.forEach(t => {
      const dateObj = new Date(t.dateEntry);
      if (!isNaN(dateObj.getTime())) {
        const month = months[dateObj.getMonth()];
        stats[month] += t.pnl;
      }
    });
    data = months.map(m => ({ name: m, value: stats[m] }));
  } else if (type === "Weekly") {
    title = "Calendar Performance";
    Icon = Calendar;
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Icon size={20}/></div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
        </div>
        
        {type === "Weekly" && (
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
            <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500"><ChevronLeft size={18}/></button>
            <span className="text-xs font-bold text-gray-800 dark:text-white min-w-[120px] text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-500"><ChevronRight size={18}/></button>
          </div>
        )}
      </div>

      {type === "Weekly" ? (
        /* Calendar View */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
              <div key={d} className="py-3 text-center text-[10px] font-black text-gray-400 tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarData?.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => item.day && setSelectedDayTrades({ date: item.dateStr!, trades: item.trades! })}
                className={`min-h-[100px] p-2 border-b border-r border-gray-50 dark:border-gray-700 transition-all ${item.day ? 'hover:bg-blue-50/50 dark:hover:bg-gray-700/30 cursor-pointer' : ''}`}
              >
                {item.day && (
                  <>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold ${item.pnl !== 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{item.day}</span>
                      {item.count > 0 && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] font-bold px-1 rounded">
                          {item.count} TRADES
                        </span>
                      )}
                    </div>
                    {item.pnl !== 0 && (
                      <div className={`text-[11px] font-black mt-2 ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Chart View (Hourly/Monthly) */
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detail Overlay for Calendar */}
      {selectedDayTrades && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <div>
                <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider">Trades on {new Date(selectedDayTrades.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                <p className="text-[10px] text-gray-500">Detail transaksi harian</p>
              </div>
              <button onClick={() => setSelectedDayTrades(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={18}/></button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {selectedDayTrades.trades.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-xs italic">Tidak ada transaksi pada hari ini.</p>
              ) : (
                selectedDayTrades.trades.map(t => (
                  <div key={t.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${t.pnl >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.pnl >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-gray-800 dark:text-white uppercase">{t.instrument} <span className="text-[9px] text-gray-400 font-normal ml-1">{t.position}</span></p>
                        <p className="text-[9px] text-gray-400">Entry: {t.entry} • Lot: {t.lot}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black ${t.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}</p>
                      <p className="text-[9px] text-gray-400">{t.rate}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {type !== "Weekly" && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.filter(d => d.value !== 0).map((d, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{d.name}</p>
              <p className={`text-sm font-bold ${d.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${d.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
