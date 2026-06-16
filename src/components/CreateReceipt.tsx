import { Printer, Download, Image as ImageIcon, Save } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { domToPng } from 'modern-screenshot';
import { ReceiptData } from '../types';

interface Props {
  editReceiptId?: string | null;
  onSaved?: () => void;
}

export function CreateReceipt({ editReceiptId, onSaved }: Props) {
  const [receiptNo, setReceiptNo] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('ur-PK') || new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState(Array.from({ length: 3 }, () => ({ date: '', qty: '', rate: '', amount: '' })));
  
  const [previousBalance, setPreviousBalance] = useState('');
  const [received, setReceived] = useState('');
  
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editReceiptId) {
      const saved = localStorage.getItem('receiptsHistory');
      if (saved) {
        try {
          const history = JSON.parse(saved) as ReceiptData[];
          const target = history.find(r => r.id === editReceiptId);
          if (target) {
            setReceiptNo(target.receiptNo);
            setDate(target.date);
            setCustomerName(target.customerName);
            setItems(target.items);
            setPreviousBalance(target.previousBalance);
            setReceived(target.received);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      const saved = localStorage.getItem('receiptsHistory');
      let nextNo = 1;
      if (saved) {
        try {
          const history = JSON.parse(saved) as ReceiptData[];
          if (history.length > 0) {
            const maxNo = Math.max(...history.map(r => {
              const num = parseInt(r.receiptNo, 10);
              return isNaN(num) ? 0 : num;
            }));
            nextNo = maxNo > 0 ? maxNo + 1 : history.length + 1;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setReceiptNo(nextNo.toString().padStart(4, '0'));
    }
  }, [editReceiptId]);

  const saveReceipt = () => {
    const saved = localStorage.getItem('receiptsHistory');
    let history: ReceiptData[] = saved ? JSON.parse(saved) : [];
    
    const newReceipt: ReceiptData = {
      id: editReceiptId || Date.now().toString(),
      createdAt: editReceiptId ? Date.now() : Date.now(), // keep simple
      receiptNo,
      date,
      customerName,
      items,
      previousBalance,
      received
    };
    
    if (editReceiptId) {
       history = history.map(r => r.id === editReceiptId ? newReceipt : r);
    } else {
       history.push(newReceipt);
    }
    
    localStorage.setItem('receiptsHistory', JSON.stringify(history));
    if (onSaved) onSaved();
  };

  const downloadImage = async () => {
    if (!receiptRef.current) return;
    
    try {
      // Temporarily add a class to hide "system only" columns during image generation
      receiptRef.current.classList.add('pdf-generating');
      
      const imgData = await domToPng(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        onCloneNode: (clonedNode) => {
          if ('tagName' in clonedNode && clonedNode.tagName === 'INPUT') {
            const el = clonedNode as HTMLInputElement;
            // Retain values in clones
            el.setAttribute('value', el.value);
            el.defaultValue = el.value;
          }
        }
      });
      
      receiptRef.current.classList.remove('pdf-generating');
      
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `receipt-${receiptNo || 'new'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating Image:', error);
      alert('Image download failed. Please try again.');
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'qty' || field === 'rate') {
      const q = parseFloat(item.qty);
      const r = parseFloat(item.rate);
      if (!isNaN(q) && !isNaN(r)) {
        item.amount = (q * r).toString();
      } else if (item.qty === '' || item.rate === '') {
         item.amount = '';
      }
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalBalance = totalAmount + (parseFloat(previousBalance) || 0) - (parseFloat(received) || 0);

  const clearForm = () => {
    if (window.confirm("کیا آپ واقعی رسید صاف کرنا چاہتے ہیں؟ (Are you sure you want to clear?)")) {
      let nextNoStr = '';
      if (!editReceiptId) {
        const saved = localStorage.getItem('receiptsHistory');
        let nextNo = 1;
        if (saved) {
          try {
            const history = JSON.parse(saved) as ReceiptData[];
            if (history.length > 0) {
              const maxNo = Math.max(...history.map(r => {
                const num = parseInt(r.receiptNo, 10);
                return isNaN(num) ? 0 : num;
              }));
              nextNo = maxNo > 0 ? maxNo + 1 : history.length + 1;
            }
          } catch (e) {
            console.error(e);
          }
        }
        nextNoStr = nextNo.toString().padStart(4, '0');
      }
      setReceiptNo(nextNoStr);
      setCustomerName('');
      setItems(Array.from({ length: 3 }, () => ({ date: '', qty: '', rate: '', amount: '' })));
      setPreviousBalance('');
      setReceived('');
    }
  };

  const inputClass = "bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-inherit placeholder-gray-300 font-inherit print:placeholder-transparent";

  return (
    <div className="flex flex-col items-center px-1 sm:px-4 py-2 sm:py-4 w-full">
      {/* Action Bar (Hidden on Print) */}
      <div className="mb-4 sm:mb-6 print:hidden w-full max-w-[800px] flex flex-col sm:flex-row gap-3 justify-between mx-auto">
        <button onClick={clearForm} className="text-red-600 hover:bg-red-50 py-3 sm:py-2 px-4 rounded-xl font-medium transition-colors w-full sm:w-auto text-center border border-red-200 sm:border-transparent">
          صاف کریں (Clear)
        </button>
        <div className="flex flex-col sm:flex-row h-full sm:h-auto gap-3 w-full sm:w-auto">
          <button onClick={saveReceipt} className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-5 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm transition-colors print:hidden w-full sm:w-auto text-left" dir="ltr">
            <Save className="w-5 h-5" />
            Save History
          </button>
          <button onClick={() => {
            setTimeout(() => window.print(), 100);
          }} className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm transition-colors print:hidden w-full sm:w-auto" title="Browser Print">
            <Printer className="w-5 h-5" />
            Print
          </button>
          <button onClick={downloadImage} className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm transition-colors print:hidden text-left w-full sm:w-auto" dir="ltr">
            <ImageIcon className="w-5 h-5" />
            Download Image
          </button>
        </div>
      </div>

      {/* Preview Column (The Bill Book format) */}
      <div className="w-full shrink-0 flex justify-center print:block print:w-full mx-auto" ref={receiptRef}>
         <div 
          className="bg-amber-50 border border-gray-200 p-3 sm:p-10 pb-6 sm:pb-10 w-full max-w-[800px] text-emerald-950 print:p-12 print:pb-12 print:shadow-none mx-auto shadow-lg relative overflow-hidden"
          dir="rtl"
         >
            {/* Pad Binding (Visual only) */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-red-700 border-b border-red-800 shadow-sm"></div>

            {/* Header */}
            <div className="text-center border-b-2 border-emerald-800 pb-3 sm:pb-4 mb-4 sm:mb-6 mt-2">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 tracking-tight text-emerald-800 whitespace-nowrap" style={{ fontWeight: 800 }}>بسم اللّه آئيس فيڪٽري</h1>
              <p className="text-lg sm:text-xl font-medium text-emerald-900">رستم ضلع شڪارپور</p>
              <p className="text-base sm:text-lg mt-1 font-bold text-emerald-700" dir="ltr">📞 0302-3934191</p>
            </div>

            {/* Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-4 sm:mb-6 text-sm sm:text-base font-bold text-emerald-900">
              <div className="flex items-center justify-start gap-2">
                <span className="whitespace-nowrap">رسيد نمبر:</span>
                <input type="text" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className={`${inputClass} border-b border-emerald-800/50 min-w-[80px] w-24 text-center text-red-600`} />
              </div>
              <div className="flex items-center justify-start gap-2">
                <span className="whitespace-nowrap">تاريخ:</span>
                <input type="text" value={date} onChange={e => setDate(e.target.value)} className={`${inputClass} border-b border-emerald-800/50 min-w-[100px] w-32 text-center text-indigo-700`} dir="ltr" />
              </div>
            </div>

            <div className="flex items-center mb-6 sm:mb-8 text-lg sm:text-xl text-emerald-900">
              <span className="font-bold whitespace-nowrap ml-2 sm:ml-3">نالو:</span> 
              <input 
                type="text" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)}
                className={`${inputClass} flex-1 border-b-2 border-emerald-800 pb-1 px-1 sm:px-2 font-medium min-h-[30px] w-full text-indigo-900`} 
              />
            </div>

            {/* Table */}
            <table className="w-full mb-6 border-collapse border-2 border-emerald-800 text-sm sm:text-base">
              <thead>
                <tr className="bg-emerald-100/50 border-b-2 border-emerald-800 text-emerald-900">
                  <th className="border-l border-emerald-800 p-2 sm:p-3 text-center w-1/3 sm:w-1/4 print:w-1/3 whitespace-nowrap">تاريخ</th>
                  <th className="border-l border-emerald-800 p-2 sm:p-3 text-center w-1/3 sm:w-1/4 print:w-1/3 whitespace-nowrap">تعداد</th>
                  <th className="border-l border-emerald-800 p-2 sm:p-3 text-center hidden sm:table-cell w-1/4 print:hidden bg-emerald-200/50 text-xs sm:text-sm" title="Only visible to you">ريٽ (صرف سسٽم)</th>
                  <th className="p-2 sm:p-3 text-center w-1/3 sm:w-1/4 print:w-1/3">رقم</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-emerald-800/60 h-8 sm:h-10 hover:bg-emerald-50 transition-colors">
                    <td className="border-l border-emerald-800/60 p-0">
                      <input 
                        type="text" 
                        value={item.date} 
                        onChange={e => updateItem(i, 'date', e.target.value)}
                        className={`${inputClass} w-full h-8 sm:h-10 text-center font-mono hover:bg-emerald-100/30 text-indigo-900 text-xs sm:text-base`} 
                        dir="ltr"
                      />
                    </td>
                    <td className="border-l border-emerald-800/60 p-0">
                      <input 
                        type="text" 
                        value={item.qty} 
                        onChange={e => updateItem(i, 'qty', e.target.value)}
                        className={`${inputClass} w-full h-8 sm:h-10 text-center font-mono font-bold hover:bg-emerald-100/30 text-indigo-900 text-sm sm:text-base`} 
                        dir="ltr"
                      />
                    </td>
                    <td className="border-l border-emerald-800/60 p-0 hidden sm:table-cell print:hidden bg-emerald-50/50">
                      <input 
                        type="text" 
                        value={item.rate} 
                        onChange={e => updateItem(i, 'rate', e.target.value)}
                        className={`${inputClass} w-full h-8 sm:h-10 text-center font-mono hover:bg-emerald-100/50 text-indigo-900 text-sm sm:text-base`} 
                        title="هي ريٽ پرنٽ نه ٿيندو"
                        dir="ltr"
                      />
                    </td>
                    <td className="p-0">
                      <input 
                        type="text" 
                        value={item.amount} 
                        onChange={e => updateItem(i, 'amount', e.target.value)}
                        className={`${inputClass} w-full h-8 sm:h-10 text-center font-mono font-bold hover:bg-emerald-100/30 text-indigo-900 text-sm sm:text-base`} 
                        dir="ltr"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8 sm:mb-12">
              <table className="w-full sm:w-64 border-collapse border-2 border-emerald-800 text-sm sm:text-base" dir="rtl">
                 <tbody>
                    <tr className="border-b border-emerald-800 h-10">
                      <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-100/50 text-emerald-900 text-right w-1/2">اڳ جي بقايہ</td>
                      <td className="p-0">
                        <input 
                          type="text" 
                          value={previousBalance} 
                          onChange={e => setPreviousBalance(e.target.value)}
                          className={`${inputClass} w-full h-10 text-center font-mono bg-transparent hover:bg-emerald-50 text-indigo-900`}
                          dir="ltr"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-emerald-800 h-10">
                      <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-100/50 text-emerald-900 text-right">ٽوٽل بقايہ</td>
                      <td className="p-2 text-center font-mono font-bold text-indigo-900" dir="ltr">
                        {(totalAmount + (parseFloat(previousBalance) || 0)) || ''}
                      </td>
                    </tr>
                    <tr className="border-b border-emerald-800 h-10">
                      <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-100/50 text-emerald-900 text-right">مليل رقم</td>
                      <td className="p-0">
                        <input 
                          type="text" 
                          value={received} 
                          onChange={e => setReceived(e.target.value)}
                          className={`${inputClass} w-full h-10 text-center font-mono hover:bg-emerald-50 text-indigo-900`}
                          dir="ltr"
                        />
                      </td>
                    </tr>
                    <tr className="h-10">
                      <td className="border-l border-emerald-800 p-2 font-bold bg-emerald-100/50 text-emerald-900 text-right">بقايہ رقم</td>
                      <td className="p-2 text-center font-mono font-bold text-red-700" dir="ltr">
                        {totalBalance || ''}
                      </td>
                    </tr>
                 </tbody>
               </table>
            </div>

            {/* Signature */}
            <div className="flex justify-start mt-12 pt-8">
               <div className="relative border-t-2 border-emerald-800 w-48 text-center pt-2 font-bold text-lg text-emerald-900 mt-6">
                <div 
                  className="absolute bottom-full left-0 w-full text-center" 
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.5rem', color: '#047857', fontWeight: 'normal', lineHeight: '1' }}
                  dir="ltr"
                >
                  Murtaza
                </div>
                دستخط
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
