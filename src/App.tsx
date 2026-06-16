import { useState } from 'react';
import { CreateReceipt } from './components/CreateReceipt';
import { HistoryList } from './components/HistoryList';

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [editReceiptId, setEditReceiptId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditReceiptId(id);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 z-50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="font-bold text-xl text-gray-900 tracking-tight">نیو بسم اللہ آئس فیکٹری - رسید</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setEditReceiptId(null);
                  setActiveTab('create');
                }}
                className={`font-medium transition-colors ${activeTab === 'create' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                نئی رسید (New Receipt)
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`font-medium transition-colors ${activeTab === 'history' ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ہسٹری (History)
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'create' ? (
            <CreateReceipt editReceiptId={editReceiptId} onSaved={() => setActiveTab('history')} />
          ) : (
            <HistoryList onEdit={handleEdit} />
          )}
        </div>
      </main>
    </div>
  );
}
