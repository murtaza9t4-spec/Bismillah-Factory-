import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ReceiptData } from '../types';

export function HistoryList({ onEdit }: { onEdit: (id: string) => void }) {
  const [history, setHistory] = useState<ReceiptData[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem('receiptsHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved).sort((a: ReceiptData, b: ReceiptData) => b.createdAt - a.createdAt));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const deleteReceipt = (id: string) => {
    if (window.confirm("کیا آپ واقعی اس رسید کو ڈیلیٹ کرنا چاہتے ہیں؟ (Are you sure you want to delete this receipt?)")) {
      const updated = history.filter(r => r.id !== id);
      setHistory(updated);
      localStorage.setItem('receiptsHistory', JSON.stringify(updated));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <h2 className="text-2xl font-bold text-emerald-900 mb-6 border-b-2 border-emerald-800 pb-2">تاریخ (History)</h2>
      
      {history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">کوئی رسید محفوظ نہیں ہے (No saved receipts)</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {history.map((receipt) => {
              const totalAmount = receipt.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
              const totalBalance = totalAmount + (parseFloat(receipt.previousBalance) || 0) - (parseFloat(receipt.received) || 0);
              
              return (
                <li key={receipt.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg text-emerald-900">{receipt.customerName || 'نامعلوم (Unknown)'}</span>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800" dir="ltr">
                          No. {receipt.receiptNo || '-'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex gap-4">
                        <span dir="ltr">{receipt.date}</span>
                        <span>|</span>
                        <span>بقایہ رقم: <strong>{totalBalance}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEdit(receipt.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-indigo-100"
                        title="ترمیم (Edit)"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteReceipt(receipt.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-red-100"
                        title="ڈیلیٹ (Delete)"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
