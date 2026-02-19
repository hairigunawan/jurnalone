// components/TradesView.tsx
"use client";
import { useState, useMemo } from "react";
import { ArrowUpDown, TrendingUp, TrendingDown, Trash, Pencil, Eye, X, Calendar, Clock, Target, ShieldAlert, Award, FileText } from "lucide-react";
import { Trade } from "@prisma/client";

interface TradeUI extends Trade {
  akumulasi?: number;
}

interface Props {
  trades: Trade[];
  onDelete: (id: number) => void;
  onEdit: (trade: Trade) => void;
}

export default function TradesView({ trades, onDelete, onEdit }: Props) {
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);

  // Formatters
  const formatDate = (dateStr?: string | null) => {
    try {
      if (!dateStr) return "-";
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr || "-";
    }
  };

  const formatTime = (dateStr?: string | null) => {
    try {
      if (!dateStr || !dateStr.includes('T')) return "-";
      return dateStr.split('T')[1].substring(0, 5);
    } catch {
      return "-";
    }
  };

  const formatPrice = (val?: number | null) => {
    if (val === undefined || val === null) return "-";
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 });
  };

  // Hitung akumulasi berdasarkan urutan tanggal entry menggunakan useMemo
  const tradesWithAccumulation = useMemo(() => {
    const sorted = [...trades].sort((a, b) => {
        const dateA = new Date(a.dateEntry).getTime();
        const dateB = new Date(b.dateEntry).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.id - b.id;
    });

    const result: TradeUI[] = [];
    let running = 0;
    sorted.forEach(t => {
        running += t.pnl;
        result.push({ ...t, akumulasi: running });
    });
    
    return result.reverse();
  }, [trades]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-130px)]">
      
      {/* Table Header Info */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Riwayat Trading 
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">{trades.length}</span>
          </h2>
          <p className="text-[10px] text-gray-300 mt-0.5">Data jurnal lengkap dengan kalkulasi performa</p>
        </div>
        <div className="flex gap-2">
           <button className="px-2.5 py-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300">Export CSV</button>
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-300 text-[9px] uppercase font-bold tracking-wider sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center">ID</th>
              <th className="px-3 py-2 border-b dark:border-gray-700">Status</th>
              <th className="px-3 py-2 border-b dark:border-gray-700">Tgl Entry</th>
              <th className="px-3 py-2 border-b dark:border-gray-700">Instrumen</th>
              <th className="px-3 py-2 border-b dark:border-gray-700">Posisi</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center">Entry</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center text-green-600">TP</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center text-red-600">SL</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center">Exit</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center">Lot</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center">P/L ($)</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center">Setup</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">Akumulasi</th>
              <th className="px-3 py-2 border-b dark:border-gray-700 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-[11px]">
            {tradesWithAccumulation.map((trade) => (
              <tr key={trade.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                <td className="px-3 py-2 text-gray-400">#{trade.id.toString().slice(-4)}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase ${
                    trade.status === 'Closed'
                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      : trade.status === 'Running'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {trade.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(trade.dateEntry)}
                  {trade.status === 'Closed' && trade.dateExit && (
                    <span className="block text-[8px] text-gray-400">Exit: {formatDate(trade.dateExit)}</span>
                  )}
                </td>
                <td className="px-3 py-2 font-bold text-gray-800 dark:text-gray-300 uppercase">
                  {trade.instrument}
                  {trade.timeframe && <span className="ml-1 text-[8px] font-normal text-gray-400">{trade.timeframe}</span>}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    trade.position === 'Long'
                      ? 'text-green-600/70 dark:text-green-700'
                      : ' text-red-600/70 dark:text-red-700'
                  }`}>
                    {trade.position}
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{formatPrice(trade.entry)}</td>
                <td className="px-3 py-2 text-center text-green-600/70">{formatPrice(trade.tp)}</td>
                <td className="px-3 py-2 text-center text-red-600/70">{formatPrice(trade.sl)}</td>
                <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{formatPrice(trade.exit)}</td>
                <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">{trade.lot}</td>
                
                {/* P/L Column */}
                <td className={`px-3 py-2 text-center font-bold ${trade.status === 'Closed' ? (trade.pnl >= 0 ? 'text-green-600/70 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-gray-400'}`}>
                  {trade.status === 'Closed' ? (
                    <>{trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}</>
                  ) : (
                    <span className="italic text-[9px] font-normal">{trade.status}</span>
                  )}
                </td>

                <td className="px-3 py-2 text-center text-gray-300">
                  {trade.setup || "-"}
                </td>

                {/* Akumulasi Column (Highlight) */}
                <td className="px-3 py-2 text-center font-bold bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 border-l border-blue-100 dark:border-blue-900/30">
                  {trade.akumulasi?.toFixed(2)}
                </td>

                {/* Action Column */}
                <td className="px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => setViewingTrade(trade)}
                      className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500 rounded transition-colors"
                      title="Detail"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={() => onEdit(trade)}
                      className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(trade.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Hapus"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {viewingTrade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${viewingTrade.pnl >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {viewingTrade.pnl >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider">Detail Jurnal #{viewingTrade.id.toString().slice(-4)}</h3>
                  <p className="text-[10px] text-gray-500">{viewingTrade.instrument} • {viewingTrade.position}</p>
                </div>
              </div>
              <button onClick={() => setViewingTrade(null)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={18}/></button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Calendar size={16}/></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Waktu Eksekusi</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-white">Entry: {formatDate(viewingTrade.dateEntry)} {formatTime(viewingTrade.dateEntry)}</p>
                    <p className="text-xs text-gray-500">Exit: {formatDate(viewingTrade.dateExit)} {formatTime(viewingTrade.dateExit)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Target size={16}/></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Harga & Target</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-white">Entry: {formatPrice(viewingTrade.entry)}</p>
                    <p className="text-xs text-green-600">TP: {formatPrice(viewingTrade.tp)}</p>
                    <p className="text-xs text-red-600">SL: {formatPrice(viewingTrade.sl)}</p>
                    <p className="text-xs text-gray-500">Exit: {formatPrice(viewingTrade.exit)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Award size={16}/></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Performa</p>
                    <p className={`text-sm font-black ${viewingTrade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      PnL: {viewingTrade.pnl >= 0 ? '+' : ''}${viewingTrade.pnl.toFixed(2)} ({viewingTrade.rate}%)
                    </p>
                    <p className="text-xs text-gray-500">Lot: {viewingTrade.lot} • Fees: ${viewingTrade.fees}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><FileText size={16}/></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Setup & Catatan</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-white">Setup: {viewingTrade.setup || "-"}</p>
                    <p className="text-xs text-gray-500 italic whitespace-pre-wrap">{viewingTrade.notes || "Tidak ada catatan."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2">
              <button 
                onClick={() => {
                  onEdit(viewingTrade);
                  setViewingTrade(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Edit Jurnal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
