import { useState } from 'react';
import { CreateReceipt } from './components/CreateReceipt';
import { ReceiptHistory } from './components/ReceiptHistory';
import { InstallPWA } from './components/InstallPWA';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ReloadPrompt } from './components/ReloadPrompt';
import { History, Plus } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'create' | 'history'>('create');
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingReceiptId(id);
    setCurrentView('create');
  };

  const handleCreateNew = () => {
    setEditingReceiptId(null);
    setCurrentView('create');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      <OfflineIndicator />
      <ReloadPrompt />
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 z-50 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h2 className="font-bold text-xl text-gray-900 tracking-tight ml-2">نیو بسم اللہ آئس فیکٹری - رسید</h2>
              
              <div className="hidden sm:flex items-center gap-2 mr-4">
                 <button 
                  onClick={handleCreateNew}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'create' && !editingReceiptId ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:bg-gray-100'}`}
                 >
                   <Plus className="w-4 h-4" />
                   نئی رسید
                 </button>
                 <button 
                  onClick={() => setCurrentView('history')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'history' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:bg-gray-100'}`}
                 >
                   <History className="w-4 h-4" />
                   ہسٹری
                 </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="sm:hidden flex items-center gap-1 ml-2">
                 <button 
                  onClick={() => setCurrentView('history')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="History"
                 >
                   <History className="w-5 h-5" />
                 </button>
              </div>
              <InstallPWA />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentView === 'create' ? (
            <CreateReceipt 
               editReceiptId={editingReceiptId} 
               onSaved={() => {}} 
            />
          ) : (
            <ReceiptHistory 
               onBack={handleCreateNew}
               onEdit={handleEdit}
            />
          )}
        </div>
      </main>
    </div>
  );
}
