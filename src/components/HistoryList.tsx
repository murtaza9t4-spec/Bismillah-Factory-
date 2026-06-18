import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Share2, Loader2 } from 'lucide-react';
import { ReceiptData } from '../types';
import { domToPng } from 'modern-screenshot';
import { ReceiptTemplate } from './ReceiptTemplate';

export function HistoryList({ onEdit }: { onEdit: (id: string) => void }) {
  const [history, setHistory] = useState<ReceiptData[]>([]);
  const [sharingReceipt, setSharingReceipt] = useState<ReceiptData | null>(null);
  const [readyToShare, setReadyToShare] = useState<{ receipt: ReceiptData, file: File, fileBlob: Blob } | null>(null);
  const hiddenReceiptRef = useRef<HTMLDivElement>(null);

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

  const prepareShare = async (receipt: ReceiptData) => {
    setSharingReceipt(receipt);
    
    // Wait for the hidden template to render and fonts to load
    setTimeout(async () => {
      try {
        await document.fonts.ready;
        if (!hiddenReceiptRef.current) return;
        
        const imgData = await domToPng(hiddenReceiptRef.current, {
          scale: 2, // Scale 2 is enough for high quality images on phones
          backgroundColor: '#fffcf0',
          font: {
             cssText: `@import url('https://fonts.googleapis.com/css2?family=Lateef:wght@400;500;600;700;800&family=Great+Vibes&display=swap');`
          }
        });

        // Convert dataUrl to blob
        const res = await fetch(imgData);
        const imgBlob = await res.blob();
        const file = new File([imgBlob], `Receipt_${receipt.receiptNo}.png`, { type: 'image/png' });
        
        setReadyToShare({ receipt, file, fileBlob: imgBlob });
      } catch (error) {
        console.error('Error preparing receipt:', error);
        alert('Failed to prepare the receipt. Please try again.');
      } finally {
        setSharingReceipt(null);
      }
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Hidden Container for Generation */}
      {sharingReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, opacity: 0.01, pointerEvents: 'none', zIndex: -1 }}>
           <ReceiptTemplate ref={hiddenReceiptRef} data={sharingReceipt} />
        </div>
      )}

      {/* Share Modal */}
      {readyToShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" dir="rtl">
            <h3 className="text-xl font-bold text-emerald-900 mb-4 border-b border-emerald-100 pb-2">رسید تیار ہے</h3>
            <p className="text-gray-600 mb-6 font-medium">
              کسٹمر <strong>{readyToShare.receipt.customerName}</strong> کی رسید شیئر کرنے کے لیے تیار ہے۔
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={async () => {
                  try {
                    if (navigator.canShare && navigator.canShare({ files: [readyToShare.file] })) {
                      await navigator.share({
                        title: `Receipt ${readyToShare.receipt.receiptNo}`,
                        text: `Receipt from Bismillah Ice Factory for ${readyToShare.receipt.customerName}`,
                        files: [readyToShare.file]
                      });
                    } else {
                      // Fallback: download and open wa.me
                      const url = URL.createObjectURL(readyToShare.fileBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Receipt_${readyToShare.receipt.receiptNo}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      const msg = encodeURIComponent(`Please find the downloaded receipt ${readyToShare.receipt.receiptNo} for ${readyToShare.receipt.customerName}.`);
                      window.open(`https://wa.me/?text=${msg}`, '_blank');
                    }
                  } catch (e: any) {
                    if (e.name !== 'AbortError') {
                      console.error('Share error:', e);
                    }
                  } finally {
                    setReadyToShare(null);
                  }
                }}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                dir="ltr"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Send via WhatsApp
              </button>
              
              <button 
                onClick={() => setReadyToShare(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-colors"
                dir="ltr"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
              const isSharing = sharingReceipt?.id === receipt.id;
              
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
                        onClick={() => prepareShare(receipt)}
                        disabled={isSharing}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-green-100 disabled:opacity-50"
                        title="Share on WhatsApp"
                      >
                        {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                        )}
                      </button>
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
