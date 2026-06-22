import { useState, useEffect } from 'react';
import { ReceiptData } from '../types';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';

interface Props {
  onBack: () => void;
  onEdit: (id: string) => void;
}

export function ReceiptHistory({ onBack, onEdit }: Props) {
  const [history, setHistory] = useState<ReceiptData[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem('receiptsHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const deleteReceipt = (id: string) => {
    if (window.confirm('کیا آپ واقعی یہ رسید حذف کرنا چاہتے ہیں؟')) {
      const newHistory = history.filter(h => h.id !== id);
      localStorage.setItem('receiptsHistory', JSON.stringify(newHistory));
      setHistory(newHistory);
    }
  };

  const clearAllHistory = () => {
    if (window.confirm('کیا آپ واقعی تمام رسیدوں کی ہسٹری صاف کرنا چاہتے ہیں؟ (Are you sure you want to clear all history?)')) {
      localStorage.removeItem('receiptsHistory');
      setHistory([]);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-2">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            واپس جائیں
          </button>
          <h2 className="text-2xl font-bold text-gray-800">رسیدوں کی ہسٹری</h2>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium w-full sm:w-auto justify-center cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear All History
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            کوئی رسید نہیں ملی
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <tr>
                  <th className="p-4 rounded-tr-xl font-medium">رسید نمبر</th>
                  <th className="p-4 font-medium">تاريخ</th>
                  <th className="p-4 font-medium">کسٹمر کا نام</th>
                  <th className="p-4 font-medium">رقم</th>
                  <th className="p-4 rounded-tl-xl font-medium" dir="ltr">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {history.sort((a, b) => b.createdAt - a.createdAt).map((receipt) => {
                  const totalAmount = receipt.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                  const totalBalance = totalAmount + (parseFloat(receipt.previousBalance) || 0) - (parseFloat(receipt.received) || 0);
                  
                  return (
                    <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono font-medium text-emerald-700">{receipt.receiptNo}</td>
                      <td className="p-4" dir="ltr">{receipt.date || new Date(receipt.createdAt).toLocaleDateString('ur-PK')}</td>
                      <td className="p-4 font-medium">{receipt.customerName || 'N/A'}</td>
                      <td className="p-4 font-mono font-medium" dir="ltr">{totalBalance}</td>
                      <td className="p-4" dir="ltr">
                        <div className="flex items-center gap-2">
                          <button onClick={() => onEdit(receipt.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteReceipt(receipt.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
