// app/page.tsx
"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import TradesView from "@/components/TradesView";
import AddTradeModal from "@/components/AddTradeModal";
import AddTransactionModal from "@/components/AddTransactionModal";
import ReportsView from "@/components/ReportsView";
import OverviewView from "@/components/OverviewView";
import TemporalView from "@/components/TemporalView";
import HoldingTimeView from "@/components/HoldingTimeView";
import { Plus, Filter, Calendar as CalIcon, Moon, Sun, Search } from "lucide-react";
import { getTrades, getTransactions, addTrade, addTransaction, deleteTrade, updateTrade } from "./actions";
import { Trade, Transaction } from "@prisma/client";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [loadedTrades, loadedTransactions] = await Promise.all([
        getTrades(),
        getTransactions()
      ]);
      setTrades(loadedTrades);
      setTransactions(loadedTransactions);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTrade = async (newTrade: Partial<Trade>) => {
    try {
      if (editingTrade) {
        const updated = await updateTrade(editingTrade.id, newTrade);
        setTrades(trades.map(t => t.id === updated.id ? updated : t));
      } else {
        const savedTrade = await addTrade(newTrade);
        setTrades([savedTrade, ...trades]);
      }
      setIsModalOpen(false);
      setEditingTrade(null);
    } catch (error: unknown) {
      console.error("Failed to save trade:", error);
      const message = error instanceof Error ? error.message : "Gagal menyimpan trade";
      alert(`Error: ${message}`);
      throw error;
    }
  };

  const handleEditClick = (trade: Trade) => {
    setEditingTrade(trade);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTrade(null);
  };

  const handleAddTransaction = async (newTx: Partial<Transaction>) => {
    try {
      const savedTx = await addTransaction(newTx);
      setTransactions([savedTx, ...transactions]);
      setIsTxModalOpen(false);
    } catch (error: unknown) {
      console.error("Failed to add transaction:", error);
      const message = error instanceof Error ? error.message : "Gagal menyimpan transaksi ke database";
      alert(`Error: ${message}`);
      throw error;
    }
  };

  const handleDeleteTrade = async (id: number) => {
    if (!confirm("Yakin ingin menghapus jurnal ini?")) return;
    try {
      await deleteTrade(id);
      setTrades(trades.filter(t => t.id !== id));
    } catch (error) {
      console.error("Failed to delete trade:", error);
      alert("Gagal menghapus trade");
    }
  };

  if (isDarkMode) {
    if (typeof document !== 'undefined') document.documentElement.classList.add('dark');
  } else {
    if (typeof document !== 'undefined') document.documentElement.classList.remove('dark');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 flex-1 p-4 transition-all">
        <header className="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsModalOpen(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 transition-colors">
              <Plus size={18} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 transition-colors">
              <Filter size={18} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 transition-colors">
              <CalIcon size={18} />
            </button>
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg ml-2">
              <Search size={14} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search trades..." className="bg-transparent outline-none text-xs dark:text-white" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-yellow-400 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-[10px]">
              JD
            </div>
          </div>
        </header>

        {activeTab === "Dashboard" ? (
          <DashboardView trades={trades} transactions={transactions} onOpenTransactionModal={() => setIsTxModalOpen(true)} />
        ) : activeTab === "Trades" ? (
          <TradesView trades={trades} onDelete={handleDeleteTrade} onEdit={handleEditClick} />
        ) : activeTab === "Reports" ? (
          <ReportsView trades={trades} />
        ) : activeTab === "Overview" ? (
          <OverviewView trades={trades} />
        ) : activeTab === "Hourly" ? (
          <TemporalView trades={trades} type="Hourly" />
        ) : activeTab === "Weekly" ? (
          <TemporalView trades={trades} type="Weekly" />
        ) : activeTab === "Monthly" ? (
          <TemporalView trades={trades} type="Monthly" />
        ) : activeTab === "Holding Time" ? (
          <HoldingTimeView trades={trades} />
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Work in Progress</h2>
              <p>Halaman {activeTab} sedang dalam pengembangan.</p>
            </div>
          </div>
        )}
      </main>

      <AddTradeModal isOpen={isModalOpen} onClose={handleModalClose} onAdd={handleAddTrade} trade={editingTrade} />
      <AddTransactionModal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} onAdd={handleAddTransaction} />
    </div>
  );
}
