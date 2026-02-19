// components/AddTransactionModal.tsx
"use client";
import { useState } from "react";
import { X, Landmark, Loader2 } from "lucide-react";
import { Transaction } from "@prisma/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Partial<Transaction>) => Promise<void>; // Ubah jadi Promise
}

export default function AddTransactionModal({ isOpen, onClose, onAdd }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      date: formData.get("date"),
      type: formData.get("type"),
      amount: parseFloat(formData.get("amount") as string),
      note: formData.get("note"),
    };

    try {
      await onAdd(data);
      form.reset();
      onClose();
    } catch (error) {
      // Error ditangani di parent (app/page.tsx) melalui alert
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Log Transaksi Dana</h2>
            <p className="text-[10px] text-gray-500">Deposit atau Penarikan (WD)</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Tipe Transaksi</label>
            <select name="type" required className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-xs outline-none">
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal (WD)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Tanggal</label>
            <input name="date" type="date" required className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-xs outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Jumlah ($)</label>
            <input name="amount" type="number" step="0.01" required min="0.01" placeholder="0.00" className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-xs outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1">Catatan (Opsional)</label>
            <input name="note" placeholder="Contoh: Profit WD, Modal Tambahan" className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-xs outline-none" />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Landmark size={14} /> Simpan Transaksi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
