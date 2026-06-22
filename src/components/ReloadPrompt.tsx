import { useRegisterSW } from 'virtual:pwa-register/react';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 border border-emerald-200 rounded-xl shadow-xl bg-white text-emerald-900" dir="rtl">
      <div className="mb-3">
        {offlineReady
          ? <span className="font-bold">ایپ آف لائن استعمال کے لیے تیار ہے!</span>
          : <span className="font-bold">نیا ورژن دستیاب ہے۔ اپ ڈیٹ کرنے کے لیے ریفریش کریں۔</span>}
      </div>
      <div className="flex gap-2">
        {needRefresh && (
          <button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors" 
            onClick={() => updateServiceWorker(true)}
          >
            اپ ڈیٹ کریں (Update)
          </button>
        )}
        <button 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors" 
          onClick={() => close()}
        >
          بند کریں (Close)
        </button>
      </div>
    </div>
  )
}
