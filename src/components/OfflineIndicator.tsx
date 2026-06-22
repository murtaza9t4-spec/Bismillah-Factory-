import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-100 text-amber-900 px-4 py-3 text-sm font-bold text-center flex items-center justify-center gap-2 print:hidden z-50 shadow-md border-b border-amber-200">
      <WifiOff className="w-5 h-5 text-amber-600" />
      آف لائن موڈ (Offline Mode): آپ بغیر انٹرنیٹ کے کام کر رہے ہیں۔ رسیدیں آپ کے آلے پر محفوظ ہیں۔
    </div>
  );
}
